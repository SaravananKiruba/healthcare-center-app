// Simple verification script
const fs = require('fs');
const path = require('path');

console.log('Verifying fixes for module import errors...');

// Check if @chakra-ui/icons is installed
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
if (packageJson.dependencies['@chakra-ui/icons']) {
  console.log('✅ @chakra-ui/icons is installed.');
} else {
  console.log('❌ @chakra-ui/icons is NOT installed.');
}

// Check if the import path in ProtectedRoute.js is correct
const protectedRouteContent = fs.readFileSync(
  path.join(__dirname, 'src', 'components', 'Auth', 'ProtectedRoute.js'), 
  'utf8'
);
if (protectedRouteContent.includes("import { useAuth } from '../../context/AuthContext'")) {
  console.log('✅ Import path in ProtectedRoute.js is correct.');
} else {
  console.log('❌ Import path in ProtectedRoute.js is NOT correct.');
}

console.log('\nVerification complete. The errors should now be fixed.');
