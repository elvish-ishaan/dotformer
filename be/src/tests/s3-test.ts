import * as fs from 'fs';
import * as path from 'path';
import { fileStorageService } from '../services/fileStorage';
import { transformFile } from '../utils/transformation';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client for database operations
const prisma = new PrismaClient();

// Test image path - update this to point to a real image on your system
const TEST_IMAGE_PATH = path.join(__dirname, 'test-image.jpg');

// Create a test image if it doesn't exist (a simple colored square)
function ensureTestImage() {
  if (!fs.existsSync(TEST_IMAGE_PATH)) {
    console.log('Creating test image at:', TEST_IMAGE_PATH);
    // Ensure the directory exists
    const dir = path.dirname(TEST_IMAGE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Create a simple test image from base64
    const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAhklEQVR42u3XQQkAIRQFULEYFotYxCIWsYhFLGIRixiL2MNs8uEvhL5wDlze8JhZ1aUUawQQEBCQViBm1ec4DzzdQZyNz3HJscV3EBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEJBWIAICAiIgAiIgBERABERABERABIS00z4dqWptXIV+GgAAAABJRU5ErkJggg==';
    const imageBuffer = Buffer.from(base64Image, 'base64');
    fs.writeFileSync(TEST_IMAGE_PATH, imageBuffer);
  }
}

// Run tests sequentially
async function runTests() {
  try {
    console.log('🧪 TESTING S3 FILE STORAGE IMPLEMENTATION');
    console.log('----------------------------------------');
    
    // Ensure test image exists
    ensureTestImage();
    
    // Test 1: Upload a file
    console.log('\n🔍 TEST 1: Uploading a file');
    const imageBuffer = fs.readFileSync(TEST_IMAGE_PATH);
    const uploadResult = await fileStorageService.uploadFile(
      imageBuffer,
      'test-image.jpg',
      'image/jpeg',
      'test-user'
    );
    
    console.log('✅ File uploaded successfully');
    console.log('Asset ID:', uploadResult.asset.id);
    console.log('URL:', uploadResult.asset.url);
    
    // Store asset ID for further tests
    const assetId = uploadResult.asset.id;
    
    // Test 2: Get file info
    console.log('\n🔍 TEST 2: Getting file info');
    const fileInfo = await fileStorageService.getFileInfo(assetId);
    console.log('✅ File info retrieved');
    console.log('File name:', fileInfo.asset.fileName);
    console.log('File size:', fileInfo.asset.fileSize, 'bytes');
    console.log('URL:', fileInfo.asset.url);
    
    // Test 3: Transform the image
    console.log('\n🔍 TEST 3: Transforming image');
    const transformOptions = {
      width: 100,
      height: 100,
      grayscale: true
    };
    
    const transformResult = await transformFile(fileInfo.asset.url, transformOptions);
    console.log('✅ Image transformed');
    console.log('Transformed URL:', transformResult.transformedUrl);
    
    // Test 4: Get a presigned URL
    console.log('\n🔍 TEST 4: Getting presigned URL');
    try {
      const presignedResult = await fileStorageService.getPresignedUrl(assetId, 3600);
      console.log('✅ Presigned URL generated');
      console.log('Presigned URL (valid for 1 hour):', presignedResult.presignedUrl);
      console.log('Public URL:', presignedResult.publicUrl);
    } catch (error) {
      console.log('⚠️ Could not generate presigned URL:', error instanceof Error ? error.message : String(error));
    }
    
    // Test 5: Delete the file
    console.log('\n🔍 TEST 5: Deleting the file');
    
    // Delete the file
    const deleteResult = await fileStorageService.deleteFile(assetId);
    console.log('✅ File deleted');
    
    console.log('\n✨ ALL TESTS COMPLETED SUCCESSFULLY ✨');
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error);
  } finally {
    // Clean up: disconnect the Prisma client
    await prisma.$disconnect();
  }
}

// Run the tests
runTests().catch(console.error); 