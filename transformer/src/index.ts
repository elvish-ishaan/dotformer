import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { transformS3Image } from './utils/imageTransformer';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Transformer service is running' });
});

// Image transformation endpoint using URL parameter
app.get('/transform-image/:filename', async (req: Request, res: Response) => {
  try {
    const fileName = req.params.filename;
    console.log('Received transform request for:', fileName);
    console.log('Query parameters:', req.query);

    // Parse query parameters for transformation
    const transformOptions = {
      width: req.query.width ? parseInt(req.query.width.toString()) : undefined,
      height: req.query.height ? parseInt(req.query.height.toString()) : undefined,
      format: req.query.format?.toString(),
      quality: req.query.quality ? parseInt(req.query.quality.toString()) : undefined,
      fit: req.query.fit?.toString() as 'cover' | 'contain' | 'fill' | 'inside' | 'outside',
      position: req.query.position?.toString(),
      rotate: req.query.rotate ? parseInt(req.query.rotate.toString()) : undefined,
      grayscale: req.query.grayscale === 'true',
      flip: req.query.flip === 'true',
      flop: req.query.flop === 'true'
    };

    // Check if this request has an S3 path in query params
    const s3Path = req.query.s3Path?.toString();
    
    // If s3Path is provided, use that instead of the filename from URL
    const fileToTransform = s3Path || fileName;
    
    // Source and target bucket names from environment variables
    const sourceBucket = process.env.AWS_BUCKET_NAME;
    const targetBucket = process.env.AWS_TARGET_BUCKET || process.env.AWS_BUCKET_NAME;
    
    if (!sourceBucket) {
      res.status(500).json({ 
        success: false, 
        error: 'Source bucket not configured' 
      });
      return;
    }
    
    // Transform the image and get the result
    const result = await transformS3Image(
      fileToTransform,
      transformOptions,
      sourceBucket,
      targetBucket
    );
    
    if (!result.success) {
      res.status(404).json(result);
      return;
    }
    
    // Return successful transformation result
    res.json(result);
  } catch (error) {
    console.error('Error in transform-image endpoint:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Transformer service running on port ${PORT}`);
  console.log(`Transform endpoint: http://localhost:${PORT}/transform-image/:filename`);
}); 