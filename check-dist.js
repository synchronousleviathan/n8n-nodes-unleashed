const fs = require('fs');

// Read the package.json file
try {
  const packageJsonPath = './dist/package.json';
  const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
  
  console.log('Package.json content:');
  console.log(packageJsonContent);
  
  // Try to parse it to validate it's proper JSON
  try {
    const packageJson = JSON.parse(packageJsonContent);
    console.log('\nParsed successfully:');
    console.log('- name:', packageJson.name);
    console.log('- version:', packageJson.version);
    console.log('- main:', packageJson.main);
    console.log('- types:', packageJson.types);
    console.log('- n8n credentials path:', packageJson.n8n?.credentials?.length > 0 ? packageJson.n8n.credentials[0] : 'Not defined');
    console.log('- n8n nodes path:', packageJson.n8n?.nodes?.length > 0 ? packageJson.n8n.nodes[0] : 'Not defined');
  } catch (parseError) {
    console.error('\nError parsing package.json:', parseError.message);
  }
} catch (error) {
  console.error('Error reading package.json:', error.message);
}

// Check if index files exist
console.log('\nChecking for index files:');
console.log('- index.js exists:', fs.existsSync('./dist/index.js'));
console.log('- index.d.ts exists:', fs.existsSync('./dist/index.d.ts'));

// List directories
console.log('\nDirectories in dist:');
fs.readdirSync('./dist', { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .forEach(dir => console.log(`- ${dir.name}`));
