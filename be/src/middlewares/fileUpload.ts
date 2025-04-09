import multer from 'multer';
import path from 'path';
import { Request, Response, NextFunction } from 'express';

// Configure storage in memory (not on disk)
const storage = multer.memoryStorage();

// Configure file size limits
const FILE_SIZE_LIMIT = 10 * 1024 * 1024; // 10MB limit

// Configure file filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Define allowed file types
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ];

  // Check if file type is allowed
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`));
  }
};

// Create multer instance
const upload = multer({
  storage,
  limits: { fileSize: FILE_SIZE_LIMIT },
  fileFilter,
});

// Middleware for single file upload
export const uploadSingleFile = upload.single('file');

// Error handling middleware for multer errors
export const handleFileUploadError = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: `File size exceeds the ${FILE_SIZE_LIMIT / (1024 * 1024)}MB limit`
      });
    }
    
    return res.status(400).json({
      success: false,
      error: `Upload error: ${err.message}`
    });
  } else if (err) {
    // An unknown error occurred
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
  
  // No error, continue
  next();
}; 