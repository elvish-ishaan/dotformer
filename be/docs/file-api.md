# File API Documentation

This document describes the File API endpoints for uploading, retrieving, transforming, and deleting files.

## Authentication

All file API endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Upload File

Upload a file to S3 storage.

- **URL**: `/api/files/upload`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Authorization**: Required

**Request Body**:
- `file`: The file to upload (form-data)
- `makePublic`: Optional boolean parameter (default: true) indicating whether the file should be publicly accessible

**Response**:
```json
{
  "success": true,
  "asset": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "fileName": "example.jpg",
    "fileSize": 12345,
    "fileType": "image/jpeg",
    "url": "https://cdn-domain.com/uploads/file.jpg",
    "userId": "user-123",
    "createdAt": "2023-04-06T10:30:00.000Z",
    "updatedAt": "2023-04-06T10:30:00.000Z"
  },
  "s3Key": "uploads/uuid.jpg",
  "fileUrl": "https://cdn-domain.com/uploads/file.jpg"
}
```

### Get File Information

Retrieve file information and URL.

- **URL**: `/api/files/:fileId`
- **Method**: `GET`
- **Authorization**: Required

**Query Parameters**:
- `presigned`: Optional boolean parameter (default: false). Set to `true` to get a temporary presigned URL in addition to the permanent URL.

**Response (with presigned=false)**:
```json
{
  "success": true,
  "asset": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "fileName": "example.jpg",
    "fileSize": 12345,
    "fileType": "image/jpeg",
    "url": "https://cdn-domain.com/uploads/file.jpg",
    "userId": "user-123",
    "createdAt": "2023-04-06T10:30:00.000Z",
    "updatedAt": "2023-04-06T10:30:00.000Z"
  }
}
```

**Response (with presigned=true)**:
```json
{
  "success": true,
  "presignedUrl": "https://s3.amazonaws.com/bucket/file.jpg?...",
  "asset": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "fileName": "example.jpg",
    "fileSize": 12345,
    "fileType": "image/jpeg",
    "url": "https://cdn-domain.com/uploads/file.jpg",
    "userId": "user-123",
    "createdAt": "2023-04-06T10:30:00.000Z",
    "updatedAt": "2023-04-06T10:30:00.000Z"
  },
  "publicUrl": "https://cdn-domain.com/uploads/file.jpg"
}
```

### Delete File

Delete a file from S3 storage.

- **URL**: `/api/files/:fileId`
- **Method**: `DELETE`
- **Authorization**: Required

**Response**:
```json
{
  "success": true,
  "message": "File example.jpg deleted successfully"
}
```

### Transform File

Transform a file with various options. The transformed version will be stored permanently and accessible via a permanent URL.

- **URL**: `/api/files/transform/:fileId`
- **Method**: `POST`
- **Authorization**: Required

**Query Parameters**:
- `width`: (optional) Width in pixels
- `height`: (optional) Height in pixels
- `format`: (optional) Output format (jpg, png, webp, etc.)
- `quality`: (optional) Output quality (1-100)
- `fit`: (optional) Resize mode (cover, contain, fill, etc.)
- `grayscale`: (optional) Convert to grayscale (true/false)
- `rotate`: (optional) Rotation angle in degrees

**Response**:
```json
{
  "success": true,
  "originalFile": "example.jpg",
  "transformedKey": "transformed/example_abc123.jpg",
  "transformedUrl": "https://cdn-domain.com/transformed/example_abc123.jpg"
}
```

## Error Responses

All endpoints may return the following error responses:

### Bad Request (400)
```json
{
  "success": false,
  "error": "Error message describing the issue"
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "error": "Authentication required"
}
```

### Not Found (404)
```json
{
  "success": false,
  "error": "Asset with ID 123 not found"
}
```

### Server Error (500)
```json
{
  "success": false,
  "error": "Internal server error message"
}
```

## File Size and Type Restrictions

- Maximum file size: 10MB
- Allowed file types:
  - Images: JPEG, PNG, GIF, WebP, SVG
  - Documents: PDF, Text, Word (DOC, DOCX), Excel (XLS, XLSX)
  - Archives: ZIP

## URL Types

The system provides two types of URLs for files:

1. **Permanent Public URLs**: These are always available and safe to use in websites, applications, or share with users. They don't expire and are the default URL type returned.

2. **Presigned URLs**: These are temporary URLs with an expiration time (default: 1 hour). They're used for accessing private files that shouldn't be publicly accessible, or for providing temporary access to files that require additional authentication. 