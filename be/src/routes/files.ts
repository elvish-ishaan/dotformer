import express from 'express';
import { uploadFile, deleteFile, getFile, transformFileById, getFiles } from '../controllers/fileController';
import { uploadSingleFile, handleFileUploadError } from '../middlewares/fileUpload';
import { authenticate } from '../middlewares/auth';

const router = express.Router();


// Protected routes
router.use(authenticate as any);

// Upload file - protected and tracked
router.post(
  '/upload', 
  uploadSingleFile,
  handleFileUploadError as any, 
  uploadFile as any
);

// Get all files for a user - protected and tracked
router.get(
  '/', 
  getFiles as any
);

// Get file info and URL - protected and tracked
router.get(
  '/:fileId',  
  getFile as any
);

// Delete file - protected and tracked
router.delete(
  '/:fileId', 
  deleteFile as any
);

// Transform file - protected and tracked
router.post(
  '/transform/:fileId', 
  transformFileById as any
);

export default router; 