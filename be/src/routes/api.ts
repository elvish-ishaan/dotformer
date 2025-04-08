import express from 'express';
import { authenticateApiKey, apiKeyRateLimiter } from '../middlewares/apiKeyAuth';
import { uploadFile, deleteFile, getFile, transformFileById, getFiles } from '../controllers/fileController';
import { uploadSingleFile, handleFileUploadError } from '../middlewares/fileUpload';
import { trackUsage } from '../middlewares/usageTrackingMiddleware';

const router = express.Router();

// Apply rate limiting to all API endpoints
router.use(apiKeyRateLimiter);

// Apply API key authentication to all API endpoints
router.use(authenticateApiKey as express.RequestHandler);

// Files API with usage tracking
router.post('/files/upload', 
  trackUsage('upload') as any, 
  uploadSingleFile, 
  handleFileUploadError as express.ErrorRequestHandler, 
  uploadFile as any
);

router.get('/files', 
  trackUsage('api') as any, 
  getFiles as any
);

router.get('/files/:fileId', 
  trackUsage('api') as any, 
  getFile as any
);

router.delete('/files/:fileId', 
  trackUsage('api') as any, 
  deleteFile as any
);

router.post('/files/transform/:fileId', 
  trackUsage('transform') as any, 
  transformFileById as any
);

export default router; 