import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import Mock
import zipfile

from chrome_webstore import submit, validate_zip


class ReleaseTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.path = Path(self.temp.name) / 'chrome.zip'
        self.manifest = json.loads((Path(__file__).resolve().parents[1] / 'package.json').read_text())['manifest']
        self.manifest = dict(self.manifest, version='3.2.1')
        self.write_zip()

    def write_zip(self):
        with zipfile.ZipFile(self.path, 'w') as archive:
            archive.writestr('manifest.json', json.dumps(self.manifest))

    def test_manifest_validation(self):
        self.assertEqual(len(validate_zip(self.path, '3.2.1')), 64)
        with self.assertRaises(ValueError):
            validate_zip(self.path, '3.2.0')

    def test_wrong_extension_rejected(self):
        self.manifest['key'] = 'd3Jvbmc='
        self.write_zip()
        with self.assertRaises(ValueError):
            validate_zip(self.path, '3.2.1')

    def test_missing_oauth_permission_rejected(self):
        self.manifest['host_permissions'] = []
        self.write_zip()
        with self.assertRaises(ValueError):
            validate_zip(self.path, '3.2.1')

    def test_success_waits_for_upload(self):
        client = Mock()
        client.request.side_effect = [{}, {'uploadState': 'IN_PROGRESS'},
                                      {'lastAsyncUploadState': 'SUCCEEDED'}, {'state': 'PENDING_REVIEW'}]
        self.assertEqual(submit(client, self.path, '3.2.1', sleep=lambda _: None), 'PENDING_REVIEW')
        self.assertEqual([c.args[0] for c in client.request.call_args_list],
                         ['fetchStatus', 'upload', 'fetchStatus', 'publish'])
        body = json.loads(client.request.call_args.args[1])
        self.assertFalse(body['skipReview'])
        self.assertTrue(body['blockOnWarnings'])

    def test_failed_or_unknown_upload_never_publishes(self):
        for state in ('FAILED', 'UNKNOWN', None):
            client = Mock()
            client.request.side_effect = [{}, {'uploadState': state}]
            with self.assertRaises(RuntimeError):
                submit(client, self.path, '3.2.1')
            self.assertEqual(client.request.call_count, 2)

    def test_upload_timeout_never_publishes(self):
        client = Mock()
        client.request.side_effect = [{}, {'uploadState': 'IN_PROGRESS'}] + [
            {'lastAsyncUploadState': 'IN_PROGRESS'}] * 30
        with self.assertRaises(RuntimeError):
            submit(client, self.path, '3.2.1', sleep=lambda _: None)
        self.assertNotIn('publish', [c.args[0] for c in client.request.call_args_list])

    def test_pending_submission_is_preserved(self):
        for state in ('PENDING_REVIEW', 'STAGED'):
            client = Mock()
            client.request.return_value = {'submittedItemRevisionStatus': {'state': state}}
            with self.assertRaises(RuntimeError):
                submit(client, self.path, '3.2.1')
            client.request.assert_called_once_with('fetchStatus')

    def test_already_published_does_not_upload(self):
        client = Mock()
        client.request.return_value = {'publishedItemRevisionStatus': {
            'state': 'PUBLISHED', 'distributionChannels': [{'crxVersion': '3.2.1'}]}}
        self.assertEqual(submit(client, self.path, '3.2.1'), 'ALREADY_PUBLISHED')
        client.request.assert_called_once_with('fetchStatus')

    def test_unexpected_publish_state_fails(self):
        client = Mock()
        client.request.side_effect = [{}, {'uploadState': 'SUCCEEDED'}, {'state': 'REJECTED'}]
        with self.assertRaises(RuntimeError):
            submit(client, self.path, '3.2.1')


if __name__ == '__main__':
    unittest.main()
