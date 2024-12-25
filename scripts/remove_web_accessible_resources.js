const fs = require('fs');
const { consola } = require('consola');

const manifestPaths = [
  './build/chrome-mv3-prod/manifest.json',
  './build/chrome-mv3-dev/manifest.json',
  './build/firefox-mv3-prod/manifest.json',
  './build/firefox-mv3-dev/manifest.json',
];

for (const manifestPath of manifestPaths) {
  const manifestData = fs.readFileSync(manifestPath);
  const manifestObj = JSON.parse(manifestData);
  delete manifestObj.web_accessible_resources;
  fs.writeFileSync(manifestPath, JSON.stringify(manifestObj, null, 2));
  consola.success(`Removed web_accessible_resources from ${manifestPath} `);
}
