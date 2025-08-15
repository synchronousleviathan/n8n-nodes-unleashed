const fs = require('fs');

const packageJson = {
  "name": "@neilcayton/n8n-nodes-unleashed",
  "version": "1.0.1",
  "description": "n8n community node to integrate with Unleashed inventory management API",
  "license": "MIT",
  "author": {
    "name": "Neil Cayton",
    "email": "neil@example.com"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/neilcayton/n8n-nodes-unleashed.git"
  },
  "keywords": [
    "n8n",
    "n8n-community-node-package",
    "unleashed",
    "inventory",
    "api"
  ],
  "main": "index.js",
  "types": "index.d.ts",
  "n8n": {
    "credentials": [
      "credentials/UnleashedApi.credentials.js"
    ],
    "nodes": [
      "nodes/Unleashed/Unleashed.node.js"
    ]
  },
  "peerDependencies": {
    "n8n-workflow": "*"
  }
};

// Write the package.json file
fs.writeFileSync('./dist/package.json', JSON.stringify(packageJson, null, 2));
console.log('Fixed package.json written successfully');
