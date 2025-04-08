# Dotformer SDK

A TypeScript SDK for interacting with the Dotformer API. This SDK provides a simple and type-safe way to upload, transform, and manage files using the Dotformer service.

## Installation

```bash
npm install dotformer-sdk
# or
yarn add dotformer-sdk
```

## Quick Start

```typescript
import DotformerSDK from 'dotformer-sdk';

// Initialize the SDK with your API key
const sdk = new DotformerSDK({
  apiKey: 'your-api-key-here',
  // Optional: specify a different base URL
  // baseUrl: 'https://custom-api.dotformer.com'
});

// Upload a file
const file = new File(['content'], 'example.txt');
const uploadResult = await sdk.uploadFile(file, { makePublic: true });

// Transform a file
const transformResult = await sdk.transformFile('file-id', {
  width: 800,
  height: 600,
  format: 'jpeg',
  quality: 90
});

// Get file information
const fileInfo = await sdk.getFile('file-id', { presigned: true });

// List all files
const files = await sdk.getFiles();

// Delete a file
const deleteResult = await sdk.deleteFile('file-id');
```

## API Reference

### Constructor

```typescript
new DotformerSDK(config: SDKConfig)
```

#### Configuration Options

| Option  | Type   | Required | Default                    | Description                    |
|---------|--------|----------|----------------------------|--------------------------------|
| apiKey  | string | Yes      | -                          | Your Dotformer API key         |
| baseUrl | string | No       | 'https://api.dotformer.com' | Custom API base URL            |

### Methods

#### uploadFile

Upload a file to Dotformer.

```typescript
async uploadFile(file: File | Blob | Buffer, options?: FileOptions): Promise<ApiResponse>
```

##### Parameters

| Parameter | Type                    | Required | Description                    |
|-----------|-------------------------|----------|--------------------------------|
| file      | File \| Blob \| Buffer | Yes      | The file to upload            |
| options   | FileOptions            | No       | Upload options                |

##### FileOptions

| Option     | Type    | Default | Description                    |
|------------|---------|---------|--------------------------------|
| makePublic | boolean | true    | Make the file publicly accessible |

#### getFiles

Get all files for the authenticated user.

```typescript
async getFiles(): Promise<ApiResponse>
```

#### getFile

Get information about a specific file.

```typescript
async getFile(fileId: string, options?: GetFileOptions): Promise<ApiResponse>
```

##### Parameters

| Parameter | Type          | Required | Description                    |
|-----------|---------------|----------|--------------------------------|
| fileId    | string        | Yes      | ID of the file to retrieve    |
| options   | GetFileOptions| No       | File options                  |

##### GetFileOptions

| Option    | Type    | Default | Description                    |
|-----------|---------|---------|--------------------------------|
| presigned | boolean | false   | Get a presigned URL for private files |

#### deleteFile

Delete a file.

```typescript
async deleteFile(fileId: string): Promise<ApiResponse>
```

##### Parameters

| Parameter | Type   | Required | Description                    |
|-----------|--------|----------|--------------------------------|
| fileId    | string | Yes      | ID of the file to delete      |

#### transformFile

Transform a file with various options.

```typescript
async transformFile(fileId: string, options?: TransformOptions): Promise<ApiResponse>
```

##### Parameters

| Parameter | Type            | Required | Description                    |
|-----------|-----------------|----------|--------------------------------|
| fileId    | string          | Yes      | ID of the file to transform   |
| options   | TransformOptions| No       | Transformation options        |

##### TransformOptions

| Option     | Type    | Description                    |
|------------|---------|--------------------------------|
| width      | number  | Target width in pixels         |
| height     | number  | Target height in pixels        |
| format     | string  | Output format (jpeg, png, webp)|
| quality    | number  | Output quality (1-100)         |
| fit        | string  | Fit method (cover, contain, fill)|
| grayscale  | boolean | Convert to grayscale           |
| rotate     | number  | Rotation angle in degrees      |

### Response Types

All methods return a Promise that resolves to an `ApiResponse` object:

```typescript
interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}
```

## Error Handling

The SDK throws errors in the following cases:

- Invalid API key
- Network errors
- API errors (with status code and error message)

Example error handling:

```typescript
try {
  const result = await sdk.uploadFile(file);
} catch (error) {
  if (error.status) {
    // API error
    console.error(`API Error (${error.status}): ${error.message}`);
  } else {
    // Network or other error
    console.error('Error:', error.message);
  }
}
```

## TypeScript Support

This SDK is written in TypeScript and includes type definitions. All methods and interfaces are fully typed, providing excellent IDE support and type checking.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT 