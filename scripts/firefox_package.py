"""Validate Firefox release identity and build a ZIP from the production directory."""
import argparse
import hashlib
import json
from pathlib import Path
import zipfile

ADDON_ID = 'sky-follower-bridge@ryo.kawamata'


def package(source, destination, version):
    source = Path(source)
    manifest = json.loads((source / 'manifest.json').read_text())
    if manifest.get('version') != version:
        raise ValueError('Firefox manifest version does not match package.json')
    if manifest.get('browser_specific_settings', {}).get('gecko', {}).get('id') != ADDON_ID:
        raise ValueError('Wrong Firefox add-on ID; refusing to submit a different add-on')
    if 'update_url' in manifest or 'update_url' in manifest['browser_specific_settings']['gecko']:
        raise ValueError('Self-hosted update URLs are not allowed in this listed release')
    if manifest.get('background', {}).get('service_worker'):
        raise ValueError('Chrome service worker found in Firefox build')
    files = sorted(p for p in source.rglob('*') if p.is_file())
    if any(p.is_symlink() or any(part.startswith('.') for part in p.relative_to(source).parts) for p in files):
        raise ValueError('Unexpected hidden file or symlink in Firefox build')
    with zipfile.ZipFile(destination, 'w', zipfile.ZIP_DEFLATED) as archive:
        for path in files:
            archive.write(path, path.relative_to(source))
    return hashlib.sha256(Path(destination).read_bytes()).hexdigest()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source')
    parser.add_argument('destination')
    parser.add_argument('--version', required=True)
    args = parser.parse_args()
    print('Firefox ZIP SHA256:', package(args.source, args.destination, args.version))
