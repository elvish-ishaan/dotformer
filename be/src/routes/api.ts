import express from 'express';
import { authenticateApiKey, apiKeyRateLimiter } from '../middlewares/apiKeyAuth';
import { uploadFile, deleteFile, getFile, transformFileById, getFiles } from '../controllers/fileController';
import { uploadSingleFile, handleFileUploadError } from '../middlewares/fileUpload';

const router = express.Router();

// Apply rate limiting to all API endpoints
router.use(apiKeyRateLimiter);

// Apply API key authentication to all API endpoints
router.use(authenticateApiKey as express.RequestHandler);

// Files API with usage tracking
router.post('/files/upload', 
  uploadSingleFile, 
  handleFileUploadError as express.ErrorRequestHandler, 
  uploadFile as any
);

router.get('/files', 
  getFiles as any
);

router.get('/files/:fileId', 
  getFile as any
);

router.delete('/files/:fileId', 
  deleteFile as any
);

router.post('/files/transform/:fileId', 
  transformFileById as any
);

export default router; 