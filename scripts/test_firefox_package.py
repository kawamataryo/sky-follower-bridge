import json
from pathlib import Path
import tempfile
import unittest
import zipfile

from firefox_package import ADDON_ID, package


class PackageTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.source = self.root / 'build'
        self.source.mkdir()
        self.manifest = {'version': '3.2.1', 'browser_specific_settings': {'gecko': {'id': ADDON_ID}}}

    def run_package(self):
        (self.source / 'manifest.json').write_text(json.dumps(self.manifest))
        return package(self.source, self.root / 'firefox.zip', '3.2.1')

    def test_only_production_files_and_root_manifest(self):
        (self.root / 'private.txt').write_text('not for upload')
        self.assertEqual(len(self.run_package()), 64)
        with zipfile.ZipFile(self.root / 'firefox.zip') as archive:
            self.assertEqual(archive.namelist(), ['manifest.json'])

    def test_wrong_identity_or_version_rejected(self):
        self.manifest['version'] = '3.2.0'
        with self.assertRaises(ValueError):
            self.run_package()
        self.manifest['version'] = '3.2.1'
        self.manifest['browser_specific_settings']['gecko']['id'] = 'wrong'
        with self.assertRaises(ValueError):
            self.run_package()

    def test_chrome_build_rejected(self):
        self.manifest['background'] = {'service_worker': 'background.js'}
        with self.assertRaises(ValueError):
            self.run_package()

    def test_hidden_files_and_symlinks_rejected(self):
        hidden = self.source / '.env'
        hidden.write_text('private')
        with self.assertRaises(ValueError):
            self.run_package()
        hidden.unlink()
        (self.root / 'private.txt').write_text('private')
        (self.source / 'leak.txt').symlink_to(self.root / 'private.txt')
        with self.assertRaises(ValueError):
            self.run_package()

    def test_self_hosted_update_rejected(self):
        self.manifest['browser_specific_settings']['gecko']['update_url'] = 'https://example.com'
        with self.assertRaises(ValueError):
            self.run_package()
