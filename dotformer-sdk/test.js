// Dotformer SDK Tests
// Run with: node test.js <API_KEY> [BASE_URL]

import DotformerSDK from './index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get API key from command line arguments
const apiKey = process.argv[2];
const baseUrl = process.argv[3] || 'http://localhost:5000';

if (!apiKey) {
  console.error('Please provide an API key as an argument: node test.js <API_KEY>');
  process.exit(1);
}

// Initialize the SDK
const sdk = new DotformerSDK({
  apiKey,
  baseUrl,
});

console.log(`\n🔑 Initialized SDK with API key: ${apiKey.substring(0, 8)}...`);
console.log(`🌐 Using base URL: ${baseUrl}\n`);

// Test file path (create a small text file for testing)
const testFilePath = path.join(__dirname, 'test-file.txt');
fs.writeFileSync(testFilePath, 'This is a test file for Dotformer SDK.');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Helper function to log test results
function logTest(name, result, error = null) {
  if (result) {
    console.log(`${colors.green}✓ ${name}${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ ${name}${colors.reset}`);
    if (error) {
      console.log(`  ${colors.yellow}Error: ${error.message || error}${colors.reset}`);
    }
  }
}

// Store test file ID for later tests
let testFileId = null;

// Run tests sequentially
async function runTests() {
  console.log(`${colors.cyan}Running Dotformer SDK Tests...${colors.reset}\n`);

  try {
    // Test 1: Upload a file
    try {
      console.log(`${colors.blue}Testing file upload...${colors.reset}`);
      
      const fileBuffer = fs.readFileSync(testFilePath);
      const file = new Blob([fileBuffer], { type: 'text/plain' });
      file.name = 'test-file.txt'; // Add name property manually

      const uploadResult = await sdk.uploadFile(file);
      testFileId = uploadResult.asset?.id;
      
      logTest('Upload file', 
        uploadResult.success && 
        uploadResult.asset && 
        uploadResult.fileUrl
      );
      
      console.log(`  File ID: ${testFileId}`);
      console.log(`  URL: ${uploadResult.fileUrl}\n`);
    } catch (error) {
      logTest('Upload file', false, error);
      console.log('\n');
    }

    // Test 2: Get all files
    try {
      console.log(`${colors.blue}Testing get all files...${colors.reset}`);
      
      const filesResult = await sdk.getFiles();
      
      logTest('Get files', 
        Array.isArray(filesResult.assets) && 
        filesResult.assets.length > 0
      );
      
      console.log(`  Found ${filesResult.assets?.length || 0} files\n`);
    } catch (error) {
      logTest('Get files', false, error);
      console.log('\n');
    }

    // Test 3: Get a specific file
    if (testFileId) {
      try {
        console.log(`${colors.blue}Testing get file...${colors.reset}`);
        
        const fileResult = await sdk.getFile(testFileId);
        
        logTest('Get file', 
          fileResult.success && 
          fileResult.asset && 
          fileResult.asset.id === testFileId
        );
        
        console.log(`  File name: ${fileResult.asset?.fileName}\n`);
      } catch (error) {
        logTest('Get file', false, error);
        console.log('\n');
      }
    } else {
      console.log(`${colors.yellow}Skipping "Get file" test - No file ID available${colors.reset}\n`);
    }

    // Test 4: Transform a file
    if (testFileId) {
      try {
        console.log(`${colors.blue}Testing transform file...${colors.reset}`);
        
        const transformOptions = {
          width: 100,
          height: 100,
          format: 'webp',
          quality: 80,
          grayscale: true
        };
        
        const transformResult = await sdk.transformFile(testFileId, transformOptions);
        
        logTest('Transform file', 
          transformResult.success && 
          transformResult.transformedUrl
        );
        
        console.log(`  Transformed URL: ${transformResult.transformedUrl}\n`);
      } catch (error) {
        logTest('Transform file', false, error);
        console.log('\n');
      }
    } else {
      console.log(`${colors.yellow}Skipping "Transform file" test - No file ID available${colors.reset}\n`);
    }

    // Test 5: Delete a file
    if (testFileId) {
      try {
        console.log(`${colors.blue}Testing delete file...${colors.reset}`);
        
        const deleteResult = await sdk.deleteFile(testFileId);
        
        logTest('Delete file', deleteResult.success);
        console.log('\n');
      } catch (error) {
        logTest('Delete file', false, error);
        console.log('\n');
      }
    } else {
      console.log(`${colors.yellow}Skipping "Delete file" test - No file ID available${colors.reset}\n`);
    }

  } catch (error) {
    console.error(`${colors.red}Test suite error: ${error.message}${colors.reset}`);
  } finally {
    // Clean up test file
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
    
    console.log(`${colors.cyan}Tests completed${colors.reset}`);
  }
}

// Run the tests
runTests(); 