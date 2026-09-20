"""Upload a validated Chrome ZIP and submit it using Chrome Web Store API v2."""
import argparse
import base64
import hashlib
import json
import os
from pathlib import Path
import re
import time
import urllib.error
import urllib.request
import zipfile

ITEM_ID = 'behhbpbpmailcnfbjagknjngnfdojpko'
BASE = 'https://chromewebstore.googleapis.com'


def validate_zip(path, version):
    with zipfile.ZipFile(path) as archive:
        manifest = json.loads(archive.read('manifest.json'))
        if manifest['version'] != version:
            raise ValueError('ZIP manifest version does not match requested version')
        digest = hashlib.sha256(base64.b64decode(manifest['key'])).hexdigest()[:32]
        extension_id = ''.join(chr(ord('a') + int(c, 16)) for c in digest)
        if extension_id != ITEM_ID:
            raise ValueError('ZIP belongs to a different extension')
        for permission in ('https://*.bsky.network/*', 'https://*.host.bsky.network/*'):
            if permission not in manifest.get('host_permissions', []):
                raise ValueError('ZIP is missing Bluesky OAuth host permissions')
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


class Client:
    def __init__(self, publisher, token):
        if not re.fullmatch(r'[A-Za-z0-9_-]+', publisher):
            raise ValueError('Invalid publisher ID')
        self.resource = f'/v2/publishers/{publisher}/items/{ITEM_ID}'
        self.token = token

    def request(self, action, data=None, content_type='application/json', upload=False):
        url = BASE + ('/upload' if upload else '') + self.resource + ':' + action
        request = urllib.request.Request(url, data=data, headers={
            'Authorization': 'Bearer ' + self.token,
            'Content-Type': content_type,
        })
        try:
            with urllib.request.urlopen(request, timeout=120) as response:
                return json.load(response)
        except urllib.error.HTTPError as error:
            # Do not print request headers, credentials, or arbitrary response bodies.
            raise RuntimeError(f'Chrome Web Store {action}: HTTP {error.code}') from None


def submit(client, path, version, sleep=time.sleep):
    status = client.request('fetchStatus')
    if status.get('takenDown'):
        raise RuntimeError('Item is taken down; inspect the Developer Dashboard')
    submitted = status.get('submittedItemRevisionStatus', {})
    if submitted.get('state') in ('PENDING_REVIEW', 'STAGED'):
        raise RuntimeError('An existing submission is pending; inspect it before replacing it')
    published = status.get('publishedItemRevisionStatus', {})
    versions = [x.get('crxVersion') for x in published.get('distributionChannels', [])]
    if version in versions:
        return 'ALREADY_PUBLISHED'
    result = client.request('upload', Path(path).read_bytes(), 'application/zip', upload=True)
    state = result.get('uploadState')
    for _ in range(30):
        if state not in ('IN_PROGRESS', 'UPLOAD_IN_PROGRESS'):
            break
        sleep(10)
        state = client.request('fetchStatus').get('lastAsyncUploadState')
    if state != 'SUCCEEDED':
        raise RuntimeError(f'Upload did not succeed ({state}); publish was not called')
    if result.get('crxVersion') not in (None, version):
        raise RuntimeError('Uploaded version differs from the validated artifact')
    result = client.request('publish', json.dumps({
        'publishType': 'DEFAULT_PUBLISH', 'skipReview': False, 'blockOnWarnings': True,
    }).encode())
    state = result.get('state')
    if state not in ('PENDING_REVIEW', 'PUBLISHED'):
        raise RuntimeError(f'Unexpected submission state: {state}; inspect the Developer Dashboard')
    return state


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('zip', type=Path)
    parser.add_argument('--version', required=True)
    parser.add_argument('--validate-only', action='store_true')
    args = parser.parse_args()
    digest = validate_zip(args.zip, args.version)
    print(f'Validated {args.version}: sha256 {digest}')
    if args.validate_only:
        return
    client = Client(os.environ['CWS_PUBLISHER_ID'], os.environ['CWS_ACCESS_TOKEN'])
    state = submit(client, args.zip, args.version)
    message = f'Chrome {args.version}: {state}\nSHA256: {digest}\n'
    if state == 'PENDING_REVIEW':
        message += 'Submitted for Google review; not yet publicly available.\n'
    print(message)
    if os.environ.get('GITHUB_STEP_SUMMARY'):
        with open(os.environ['GITHUB_STEP_SUMMARY'], 'a') as output:
            output.write(message)


if __name__ == '__main__':
    main()
