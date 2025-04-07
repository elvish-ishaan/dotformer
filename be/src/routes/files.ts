import express from 'express';
import { uploadFile, deleteFile, getFile, transformFileById, getFiles } from '../controllers/fileController';
import { uploadSingleFile, handleFileUploadError } from '../middlewares/fileUpload';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// Public routes (if you want them public)
// If all routes should be protected, move these under the authenticate middleware

// Protected routes
router.use(authenticate as any);

// Upload file - protected
router.post('/upload', uploadSingleFile as any, handleFileUploadError as any, uploadFile as any);

// Get all files for a user - protected
router.get('/', getFiles as any);

// Get file info and URL - protected
router.get('/:fileId', getFile as any);

// Delete file - protected
router.delete('/:fileId', deleteFile as any);

// Transform file - protected
router.post('/transform/:fileId', transformFileById as any);

export default router; 