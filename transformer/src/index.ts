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
// Use CORS_ORIGIN from environment variable or allow all origins in production
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

    // Parse query parameters for transformation
    //accept all the parameter which sharp supports
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
      flop: req.query.flop === 'true',
      blur: req.query.blur ? parseInt(req.query.blur.toString()) : undefined,
      sharpen: req.query.sharpen ? parseInt(req.query.sharpen.toString()) : undefined,
      tint: req.query.tint ? parseInt(req.query.tint.toString()) : undefined,
      opacity: req.query.opacity ? parseInt(req.query.opacity.toString()) : undefined,
      background: req.query.background?.toString(),
      backgroundOpacity: req.query.backgroundOpacity ? parseInt(req.query.backgroundOpacity.toString()) : undefined,
      gamma: req.query.gamma ? parseInt(req.query.gamma.toString()) : undefined,
      tintAmount: req.query.tintAmount ? parseInt(req.query.tintAmount.toString()) : undefined,
      tintColor: req.query.tintColor?.toString(),
      tintOpacity: req.query.tintOpacity ? parseInt(req.query.tintOpacity.toString()) : undefined,
      tintBlendMode: req.query.tintBlendMode?.toString(),
      tintIntensity: req.query.tintIntensity ? parseInt(req.query.tintIntensity.toString()) : undefined,
      tintHue: req.query.tintHue ? parseInt(req.query.tintHue.toString()) : undefined,
      tintSaturation: req.query.tintSaturation ? parseInt(req.query.tintSaturation.toString()) : undefined,
      tintLightness: req.query.tintLightness ? parseInt(req.query.tintLightness.toString()) : undefined,
      tintAlpha: req.query.tintAlpha ? parseInt(req.query.tintAlpha.toString()) : undefined,
    };

    // Check if this request has an S3 path in query params
    //explain me this code
    //if the request has an S3 path in query params
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
}); 