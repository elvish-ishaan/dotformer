# Dotformer SDK

JavaScript SDK for interacting with the Dotformer API.

## Installation

```bash
npm install dotformer-sdk
```

## Usage

```javascript
import DotformerSDK from 'dotformer-sdk';

// Initialize the SDK with your API key
const dotformer = new DotformerSDK({
  apiKey: 'your-api-key',
  // Optional: override the base URL (defaults to https://api.dotformer.com)
  // baseUrl: 'http://localhost:5000'
});

// Upload a file
async function uploadExample() {
  try {
    // Using File object (browser)
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    const result = await dotformer.uploadFile(file);
    console.log('Upload success:', result);
  } catch (error) {
    console.error('Upload failed:', error);
  }
}

// Get all files
async function getFilesExample() {
  try {
    const result = await dotformer.getFiles();
    console.log('Files:', result.assets);
  } catch (error) {
    console.error('Failed to get files:', error);
  }
}

// Get a specific file
async function getFileExample(fileId) {
  try {
    const result = await dotformer.getFile(fileId);
    console.log('File info:', result.asset);
  } catch (error) {
    console.error('Failed to get file:', error);
  }
}

// Delete a file
async function deleteFileExample(fileId) {
  try {
    const result = await dotformer.deleteFile(fileId);
    console.log('Delete result:', result);
  } catch (error) {
    console.error('Failed to delete file:', error);
  }
}

// Transform a file
async function transformFileExample(fileId) {
  try {
    const options = {
      width: 300,
      height: 200,
      format: 'webp',
      quality: 80,
      grayscale: true
    };
    
    const result = await dotformer.transformFile(fileId, options);
    console.log('Transform result:', result);
  } catch (error) {
    console.error('Failed to transform file:', error);
  }
}
```

## API Reference

### Constructor

```javascript
const dotformer = new DotformerSDK({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.dotformer.com' // Optional
});
```

### Methods

#### `uploadFile(file, options)`
Upload a file to Dotformer.

- `file`: File, Blob, or Buffer to upload
- `options`: Upload options
  - `makePublic`: Boolean (default: true) - Make the file publicly accessible

#### `getFiles()`
Get all files for the authenticated user.

#### `getFile(fileId, options)`
Get a specific file by ID.

- `fileId`: ID of the file to retrieve
- `options`: File options
  - `presigned`: Boolean (default: false) - Get a presigned URL for private files

#### `deleteFile(fileId)`
Delete a file by ID.

- `fileId`: ID of the file to delete

#### `transformFile(fileId, options)`
Transform a file.

- `fileId`: ID of the file to transform
- `options`: Transformation options
  - `width`: Target width
  - `height`: Target height
  - `format`: Output format (jpeg, png, webp, etc.)
  - `quality`: Output quality (1-100)
  - `fit`: Fit method (cover, contain, fill, etc.)
  - `grayscale`: Convert to grayscale
  - `rotate`: Rotation angle in degrees

## License

MIT 