/**
 * This is not an actual test file that will be run automatically.
 * It's a code example showing how to use the file storage service programmatically.
 */

import { fileStorageService } from '../services/fileStorage';
import fs from 'fs';
import path from 'path';

// Example: How to upload a public file programmatically
async function uploadPublicFileExample() {
  try {
    // Read a file from the filesystem
    const filePath = path.join(__dirname, 'example.jpg');
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = 'example.jpg';
    const mimeType = 'image/jpeg';
    
    // Upload to S3 as a public file (default)
    const result = await fileStorageService.uploadFile(
      fileBuffer,
      fileName,
      mimeType,
      'user-123', // Optional user ID
      true // makePublic = true (default)
    );
    
    console.log('File uploaded successfully:', result);
    // The result.asset.url will be a permanent, public URL that can be used anywhere
    return result;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

// Example: How to upload a private file programmatically
async function uploadPrivateFileExample() {
  try {
    // Read a file from the filesystem
    const filePath = path.join(__dirname, 'sensitive.pdf');
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = 'sensitive.pdf';
    const mimeType = 'application/pdf';
    
    // Upload to S3 as a private file
    const result = await fileStorageService.uploadFile(
      fileBuffer,
      fileName,
      mimeType,
      'user-123', // Optional user ID
      false // makePublic = false (private file)
    );
    
    console.log('Private file uploaded successfully:', result);
    
    // For private files, you'll need to generate a presigned URL for temporary access
    const assetId = result.asset.id;
    const presignedData = await fileStorageService.getPresignedUrl(assetId);
    
    console.log('Presigned URL for temporary access:', presignedData.presignedUrl);
    // presignedData.presignedUrl can be used for temporary access (expires after 1 hour by default)
    
    return { result, presignedData };
  } catch (error) {
    console.error('Error uploading private file:', error);
    throw error;
  }
}

// Example: How to delete a file programmatically
async function deleteFileExample(assetId: string) {
  try {
    const result = await fileStorageService.deleteFile(assetId);
    console.log('File deleted successfully:', result);
    return result;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

// Example: How to get a file's info
async function getFileInfoExample(assetId: string) {
  try {
    const result = await fileStorageService.getFileInfo(assetId);
    console.log('File info retrieved successfully:', result);
    // result.asset.url contains the permanent public URL
    return result;
  } catch (error) {
    console.error('Error getting file info:', error);
    throw error;
  }
}

// Example: How to get a presigned URL for a file
async function getPresignedUrlExample(assetId: string) {
  try {
    const result = await fileStorageService.getPresignedUrl(assetId);
    console.log('Presigned URL generated successfully:', result);
    // result.presignedUrl contains the temporary URL
    // result.publicUrl contains the permanent URL
    return result;
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw error;
  }
}

// Example: How to check if a file exists in S3
async function fileExistsExample(s3Key: string) {
  try {
    const exists = await fileStorageService.fileExists(s3Key);
    console.log('File exists in S3:', exists);
    return exists;
  } catch (error) {
    console.error('Error checking if file exists:', error);
    throw error;
  }
}

// Example: Upload a file from a base64 string
async function uploadBase64FileExample(base64Data: string, fileName: string, mimeType: string, makePublic = true) {
  try {
    // Convert base64 to buffer
    // Remove the data URL prefix if it exists (e.g., "data:image/jpeg;base64,")
    const base64Content = base64Data.includes('base64,') 
      ? base64Data.split('base64,')[1] 
      : base64Data;
    
    const fileBuffer = Buffer.from(base64Content, 'base64');
    
    // Upload to S3
    const result = await fileStorageService.uploadFile(
      fileBuffer,
      fileName,
      mimeType,
      undefined, // No user ID
      makePublic // Flag for public/private
    );
    
    console.log('Base64 file uploaded successfully:', result);
    return result;
  } catch (error) {
    console.error('Error uploading base64 file:', error);
    throw error;
  }
}

// Example: Using transformed images in a website/app
async function usingTransformedImagesExample() {
  try {
    // 1. First, upload an original image
    const filePath = path.join(__dirname, 'original.jpg');
    const fileBuffer = fs.readFileSync(filePath);
    const uploadResult = await fileStorageService.uploadFile(
      fileBuffer,
      'original.jpg',
      'image/jpeg'
    );
    
    const assetId = uploadResult.asset.id;
    
    // 2. Transform the image into multiple variants
    // This will create permanent transformed versions that won't expire
    
    // Thumbnail transformation
    const thumbnailOptions = { width: 150, height: 150, fit: 'cover' };
    // These URLs can be used directly in your website/app
    const thumbnailResult = await fetch(`/api/files/transform/${assetId}?width=150&height=150&fit=cover`).then(r => r.json());
    
    // Medium-sized transformation
    const mediumOptions = { width: 800, height: 600, fit: 'inside' };
    const mediumResult = await fetch(`/api/files/transform/${assetId}?width=800&height=600&fit=inside`).then(r => r.json());
    
    // Grayscale transformation
    const grayOptions = { grayscale: true };
    const grayResult = await fetch(`/api/files/transform/${assetId}?grayscale=true`).then(r => r.json());
    
    // 3. Use the permanent URLs for transformed images in your application
    const imageUrls = {
      original: uploadResult.asset.url,
      thumbnail: thumbnailResult.transformedUrl,
      medium: mediumResult.transformedUrl,
      grayscale: grayResult.transformedUrl
    };
    
    console.log('Image URLs for all variants:', imageUrls);
    
    // 4. These URLs can be used directly in HTML, CSS, or sent to frontend
    const html = `
      <img src="${imageUrls.thumbnail}" alt="Thumbnail" />
      <img src="${imageUrls.medium}" alt="Medium" />
      <img src="${imageUrls.grayscale}" alt="Grayscale" />
    `;
    
    return { imageUrls, html };
  } catch (error) {
    console.error('Error in transformation example:', error);
    throw error;
  }
}

export {
  uploadPublicFileExample,
  uploadPrivateFileExample,
  deleteFileExample,
  getFileInfoExample,
  getPresignedUrlExample,
  fileExistsExample,
  uploadBase64FileExample,
  usingTransformedImagesExample
}; 