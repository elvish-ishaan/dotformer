// Dotformer SDK Image Transform Test
// Tests transformation features on a specific image
// Run with: node transform-test.js

import DotformerSDK from '../index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import FormData from 'form-data';

// Check if node-fetch is needed as a polyfill
if (!globalThis.fetch) {
  globalThis.fetch = fetch;
}

// Constants
const API_KEY = "b83d516a18f66ed892e8827856cba27409a741049c50a082289a2730e22855be";
const BASE_URL = "http://localhost:5000"; // Change to your server URL if needed
const IMAGE_FILENAME = "medrepoShot.png";

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize the SDK
const sdk = new DotformerSDK({
  apiKey: API_KEY,
  baseUrl: BASE_URL,
});

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
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
let fileId = null;

// Test multiple transformations on the same image
async function runTransformTests() {
  try {
    console.log(`\n${colors.cyan}Dotformer SDK Transformation Test${colors.reset}`);
    console.log(`${colors.blue}Testing image: ${colors.yellow}${IMAGE_FILENAME}${colors.reset}`);
    console.log(`${colors.blue}API Key: ${colors.yellow}${API_KEY.substring(0, 8)}...${colors.reset}\n`);

    // Step 1: Check if the image exists, if not, create a sample image
    const imagePath = path.join(__dirname, IMAGE_FILENAME);
    
    if (!fs.existsSync(imagePath)) {
      console.log(`${colors.yellow}Warning: Image file not found at ${imagePath}${colors.reset}`);
      console.log(`${colors.blue}Creating a placeholder image for testing...${colors.reset}`);
      
      // Download a placeholder image
      const response = await fetch('https://via.placeholder.com/800x600/0000FF/FFFFFF?text=Dotformer+Test');
      const buffer = await response.arrayBuffer();
      fs.writeFileSync(imagePath, Buffer.from(buffer));
      console.log(`${colors.green}Created placeholder image at ${imagePath}${colors.reset}\n`);
    }

    // Step 2: Upload the image
    console.log(`${colors.magenta}Step 1: Uploading image...${colors.reset}`);
    try {
      // Read the image file
      const fileBuffer = fs.readFileSync(imagePath);
      
      // Create a file-like object for the SDK
      const file = {
        buffer: fileBuffer,
        name: IMAGE_FILENAME,
        type: 'image/png',
        size: fileBuffer.length
      };
      
      // Upload the file
      const uploadResult = await sdk.uploadFile(file);
      fileId = uploadResult.asset?.id;
      
      logTest('Upload image', uploadResult.success && fileId);
      console.log(`  File ID: ${fileId}`);
      console.log(`  Original URL: ${uploadResult.fileUrl}\n`);
    } catch (error) {
      logTest('Upload image', false, error);
      console.log('\n');
      process.exit(1); // Exit if we can't upload the image
    }

    // Step 3: Test various transformations
    if (fileId) {
      // Test 1: Resize to 300x200
      await testTransformation("Resize to 300x200", {
        width: 300,
        height: 200,
      });

      // Test 2: Convert to grayscale
      await testTransformation("Convert to grayscale", {
        grayscale: true
      });

      // Test 3: Convert to WebP with quality 50
      await testTransformation("Convert to WebP with quality 50", {
        format: 'webp',
        quality: 50
      });

      // Test 4: Rotate 90 degrees
      await testTransformation("Rotate 90 degrees", {
        rotate: 90
      });

      // Test 5: Multiple transformations
      await testTransformation("Multiple transformations", {
        width: 400,
        height: 300,
        format: 'jpeg',
        quality: 80,
        grayscale: true,
        rotate: 45
      });
    }

    // Optional: Delete the file after testing
    if (fileId) {
      console.log(`\n${colors.magenta}Cleaning up...${colors.reset}`);
      try {
        const deleteResult = await sdk.deleteFile(fileId);
        logTest('Delete test image', deleteResult.success);
      } catch (error) {
        logTest('Delete test image', false, error);
      }
    }

    console.log(`\n${colors.cyan}Tests completed${colors.reset}`);

  } catch (error) {
    console.error(`\n${colors.red}Error running tests: ${error.message}${colors.reset}`);
    console.error(error);
  }
}

// Helper function to test a transformation with given options
async function testTransformation(name, options) {
  console.log(`${colors.magenta}Testing: ${name}${colors.reset}`);
  console.log(`  Options: ${JSON.stringify(options)}`);
  
  try {
    const result = await sdk.transformFile(fileId, options);
    
    logTest(name, result.success && result.transformedUrl);
    
    if (result.success) {
      console.log(`  Transformed URL: ${result.transformedUrl}`);
      
      // Optionally download the transformed image for verification
      const outputDir = path.join(__dirname, 'output');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      const transformName = name.replace(/\s+/g, '-').toLowerCase();
      const outputPath = path.join(outputDir, `${transformName}.${options.format || 'png'}`);
      
      try {
        // Download the transformed image
        const imgResponse = await fetch(result.transformedUrl);
        const imgBuffer = await imgResponse.arrayBuffer();
        fs.writeFileSync(outputPath, Buffer.from(imgBuffer));
        console.log(`  Saved to: ${outputPath}`);
      } catch (downloadError) {
        console.log(`  ${colors.yellow}Couldn't save transformed image: ${downloadError.message}${colors.reset}`);
      }
    }
    
    console.log(''); // Empty line for readability
  } catch (error) {
    logTest(name, false, error);
    console.log(''); // Empty line for readability
  }
}

// Run the tests
runTransformTests(); 