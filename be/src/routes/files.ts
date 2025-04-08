import express from 'express';
import { uploadFile, deleteFile, getFile, transformFileById, getFiles } from '../controllers/fileController';
import { uploadSingleFile, handleFileUploadError } from '../middlewares/fileUpload';
import { authenticate } from '../middlewares/auth';
import { trackUsage } from '../middlewares/usageTrackingMiddleware';

const router = express.Router();

// Public routes (if you want them public)
// If all routes should be protected, move these under the authenticate middleware

// Protected routes
router.use(authenticate as any);

// Upload file - protected and tracked
router.post(
  '/upload', 
  trackUsage('upload') as any, 
  uploadSingleFile as any, 
  handleFileUploadError as any, 
  uploadFile as any
);

// Get all files for a user - protected and tracked
router.get(
  '/', 
  trackUsage('api') as any, 
  getFiles as any
);

// Get file info and URL - protected and tracked
router.get(
  '/:fileId', 
  trackUsage('api') as any, 
  getFile as any
);

// Delete file - protected and tracked
router.delete(
  '/:fileId', 
  trackUsage('api') as any, 
  deleteFile as any
);

// Transform file - protected and tracked
router.post(
  '/transform/:fileId', 
  trackUsage('transform') as any, 
  transformFileById as any
);

export default router; 