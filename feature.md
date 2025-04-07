# S3 File Storage Implementation Plan

## Overview
We've implemented a complete file management system with the following features:
- Upload files to AWS S3 (both public and private)
- Delete files from S3
- Transform files (resize, convert, etc.)
- Both REST API endpoints and programmatic interface
- Permanent URLs for public files and presigned URLs for private files

## Implementation Details

### 1. File Storage Service
We created a dedicated file storage service in `be/src/services/fileStorage.ts` that:
- Handles S3 operations (upload, delete, get URL, check if exists)
- Supports both public and private file uploads
- Provides both permanent public URLs and presigned temporary URLs
- Can be used both by API endpoints and programmatically from other services

### 2. File Upload Middleware
We implemented a middleware using `multer` in `be/src/middlewares/fileUpload.ts` that:
- Handles multipart form data uploads
- Performs file type validation
- Limits file size to 10MB
- Provides error handling for upload issues

### 3. File Controller
We created a controller in `be/src/controllers/fileController.ts` with methods for:
- `uploadFile`: Upload file to S3 (public or private)
- `deleteFile`: Delete file from S3
- `getFile`: Get file info with permanent URL or presigned URL
- `transformFileById`: Transform file with various options

### 4. Routes
We added routes in `be/src/routes/files.ts` for all file operations and registered them in the main app.

### 5. File Database Model
We're using the existing Asset model in Prisma to track:
- Original filename
- S3 key (via URL)
- File type/mime
- Size
- Upload date
- User association

### 6. Security Considerations
- File size limits (10MB)
- File type validation (images, documents, archives)
- Authentication for file operations
- Public vs private file setting
- Permanent URLs for public files, presigned URLs for private files

### 7. File Transformation Integration
- We updated the existing transformation capabilities to make transformed files publicly accessible
- Added ACL: 'public-read' to the transformer service
- Ensured transformed images have permanent, non-expiring URLs

### 8. Dependencies
We're using:
- AWS SDK v3 for S3 operations
- Multer for handling multipart form data
- UUID for generating unique filenames

## API Endpoints

1. `POST /api/files/upload` - Upload a file (public or private)
2. `DELETE /api/files/:fileId` - Delete a file
3. `GET /api/files/:fileId` - Get file info and URL (with optional presigned URL)
4. `POST /api/files/transform/:fileId` - Transform a file

## Programmatic Usage

The file storage service can be imported and used in any part of the codebase, as shown in `be/src/tests/fileStorage.test.ts`.

## Documentation

API documentation is available in `be/docs/file-api.md` with examples for all endpoints. 