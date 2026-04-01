const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Clean dist directory
try {
  console.log('Cleaning dist directory...');
  if (fs.existsSync('./dist')) {
    fs.rmSync('./dist', { recursive: true, force: true });
  }
  fs.mkdirSync('./dist');
  console.log('Dist directory cleaned successfully.');
} catch (error) {
  console.error('Error cleaning dist directory:', error);
  process.exit(1);
}

// Run TypeScript compiler
try {
  console.log('Compiling TypeScript...');
  execSync('npx tsc', { stdio: 'inherit' });
  console.log('TypeScript compilation successful.');
  
  // Check if index.js was built and create it if needed
  if (!fs.existsSync('./dist/index.js')) {
    console.log('Creating index.js manually...');
    const indexContent = `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnleashedApi = exports.Unleashed = void 0;
// Import nodes
const Unleashed_node_1 = require("./nodes/Unleashed/Unleashed.node");
exports.Unleashed = Unleashed_node_1.Unleashed;
// Import credentials
const UnleashedApi_credentials_1 = require("./credentials/UnleashedApi.credentials");
exports.UnleashedApi = UnleashedApi_credentials_1.UnleashedApi;
`;
    
    // Create the file
    fs.writeFileSync('./dist/index.js', indexContent);
    
    // Create the corresponding .d.ts file
    const dtsContent = `import { INodeType, ICredentialType } from 'n8n-workflow';
import { Unleashed } from './nodes/Unleashed/Unleashed.node';
import { UnleashedApi } from './credentials/UnleashedApi.credentials';
export { Unleashed, UnleashedApi };
`;
    
    fs.writeFileSync('./dist/index.d.ts', dtsContent);
    console.log('Created index.js and index.d.ts manually.');
  }
} catch (error) {
  console.error('TypeScript compilation failed:', error);
  process.exit(1);
}

// Copy icon files
try {
  console.log('Copying icon files...');
  
  // Create directories if they don't exist
  if (!fs.existsSync('./dist/nodes/Unleashed')) {
    fs.mkdirSync('./dist/nodes/Unleashed', { recursive: true });
  }
  
  // Copy Unleashed icon
  if (fs.existsSync('./nodes/Unleashed/unleashed.svg')) {
    fs.copyFileSync(
      './nodes/Unleashed/unleashed.svg', 
      './dist/nodes/Unleashed/unleashed.svg'
    );
  }
  
  console.log('Icon files copied successfully.');
} catch (error) {
  console.error('Error copying icon files:', error);
  // Continue even if icon copying fails
}

// Copy package.json to dist
try {
  console.log('Creating clean package.json in dist...');
  const pkg = require('./package.json');
  
  // Create a simplified package.json for the dist directory
  // Rewrite n8n paths: the root package.json uses "dist/..." prefixes,
  // but the dist package.json is already inside dist, so strip them.
  const n8n = JSON.parse(JSON.stringify(pkg.n8n));
  if (n8n.credentials) {
    n8n.credentials = n8n.credentials.map((p) => p.replace(/^dist\//, ''));
  }
  if (n8n.nodes) {
    n8n.nodes = n8n.nodes.map((p) => p.replace(/^dist\//, ''));
  }

  const distPkg = {
    name: pkg.name,
    version: pkg.version,
    description: pkg.description,
    license: pkg.license,
    author: pkg.author,
    keywords: pkg.keywords,
    n8n,
    main: 'index.js',
    types: 'index.d.ts',
    repository: pkg.repository,
    peerDependencies: {
      'n8n-workflow': '*'
    }
  };
  
  fs.writeFileSync(
    './dist/package.json',
    JSON.stringify(distPkg, null, 2)
  );
  
  console.log('Clean package.json created successfully.');
} catch (error) {
  console.error('Error creating package.json:', error);
  process.exit(1);
}

console.log('Build completed successfully!');
