const fs = require('fs');

const manifestPath = './build/chrome-mv3-prod/manifest.json';

const manifestData = fs.readFileSync(manifestPath);

const manifestObj = JSON.parse(manifestData);

delete manifestObj['web_accessible_resources'];

fs.writeFileSync(manifestPath, JSON.stringify(manifestObj, null, 2));
