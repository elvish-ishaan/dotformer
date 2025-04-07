import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { transformFile } from './utils/transformation';
import authRoutes from './routes/auth';
import fileRoutes from './routes/files';
import apiKeyRoutes from './routes/apiKeys';
import apiRoutes from './routes/api';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Express server is running' });
});

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/api-keys', apiKeyRoutes);

// API routes with API key authentication
app.use('/api/v1', apiRoutes);

// Transform route - direct endpoint
app.get('/transform/:fileName', async (req: Request, res: Response) => {
  const fileName = req.params.fileName as string;
  if(!fileName) {
    res.status(400).json({ error: 'Filename is required' });
    return
  }
  
  try {
    // Parse transformation options from query parameters
    const transformOptions = {
      width: req.query.width ? parseInt(req.query.width.toString()) : 100,
      height: req.query.height ? parseInt(req.query.height.toString()) : 100,
      format: req.query.format?.toString() || 'png',
      quality: req.query.quality ? parseInt(req.query.quality.toString()) : 100,
      fit: req.query.fit?.toString() || 'cover',
      grayscale: req.query.grayscale === 'true',
      rotate: req.query.rotate ? parseInt(req.query.rotate.toString()) : undefined
    };

    // Use the improved transformFile function with cache check
    const result = await transformFile(fileName, transformOptions);
    
    // Return the transformation result
    res.json(result);
    return
  } catch (error: unknown) {
    console.log(error, 'this is error');
    
    // Check if this is a "NoSuchKey" error (file doesn't exist)
    const isS3Error = (err: unknown): err is { 
      $metadata?: { httpStatusCode?: number }; 
      name?: string; 
      Code?: string;
    } => {
      return typeof err === 'object' && err !== null;
    };
    
    if (isS3Error(error) && (
        (error.$metadata && error.$metadata.httpStatusCode === 404) || 
        error.name === 'NoSuchKey' || 
        error.Code === 'NoSuchKey'
    )) {
      res.status(404).json({
        success: false,
        error: 'File not found in S3 bucket'
      });
      return
    }
    
    // Handle other errors
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
    return
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
  console.log(`Transform endpoint: http://localhost:${PORT}/transform/:fileName`);
}); 