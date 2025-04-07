import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { S3Client, GetObjectCommand, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import crypto from 'crypto';

// Interface for transformation options
interface TransformOptions {
  width?: number;
  height?: number;
  format?: string;
  quality?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  position?: string;
  background?: string;
  rotate?: number;
  flip?: boolean;
  flop?: boolean;
  grayscale?: boolean;
}

/**
 * Transforms an image buffer using Sharp based on provided options
 * 
 * @param imageBuffer - Buffer containing the image data
 * @param options - Transformation options
 * @returns Promise with transformed image buffer
 */
export async function transformImageBuffer(imageBuffer: Buffer, options: TransformOptions): Promise<Buffer> {
  try {
    console.log('Transforming image with options:', options);
    
    // Initialize Sharp with the input buffer
    let transformer = sharp(imageBuffer);
    
    // Apply resize if width or height is specified
    if (options.width || options.height) {
      transformer = transformer.resize({
        width: options.width,
        height: options.height,
        fit: options.fit || 'cover',
        position: options.position as any || 'center',
        background: options.background || { r: 255, g: 255, b: 255, alpha: 1 }
      });
    }

    // Apply rotation if specified
    if (options.rotate) {
      transformer = transformer.rotate(options.rotate);
    }

    // Apply flip if specified
    if (options.flip) {
      transformer = transformer.flip();
    }

    // Apply flop (mirror horizontally) if specified
    if (options.flop) {
      transformer = transformer.flop();
    }

    // Apply grayscale if specified
    if (options.grayscale) {
      transformer = transformer.grayscale();
    }

    // Set output format
    if (options.format) {
      transformer = transformer.toFormat(options.format as keyof sharp.FormatEnum, {
        quality: options.quality || 80,
        progressive: true
      });
    }

    // Generate the output buffer
    return await transformer.toBuffer();
  } catch (error) {
    console.error('Error transforming image:', error);
    throw error;
  }
}

/**
 * Transforms an image from S3 and optionally uploads the result back to S3
 * 
 * @param fileName - S3 key of the image to transform
 * @param options - Transformation options
 * @param sourceBucket - S3 bucket containing the source image
 * @param targetBucket - S3 bucket to store the transformed image (optional)
 * @returns Promise with the result object
 */
export async function transformS3Image(
  fileName: string, 
  options: TransformOptions, 
  sourceBucket: string,
  targetBucket?: string
): Promise<{
  success: boolean;
  originalKey: string;
  transformedKey?: string;
  transformedUrl?: string;
  error?: string;
  cached?: boolean;
}> {
  try {
    console.log(`Transforming S3 image: ${fileName}`);
    console.log('Options:', options);
    
    // Initialize S3 client
    const s3Client = new S3Client({
      region: process.env.AWS_REGION as string,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
      },
    });

    // First check if the transformed image already exists
    const transformedKey = generateTransformationKey(fileName, options);
    
    try {
      // Try to get the object to see if it exists
      await s3Client.send(new HeadObjectCommand({
        Bucket: targetBucket,
        Key: transformedKey
      }));
      
      // If we get here, the object exists - return the URL without re-transforming
      const cloudFrontDomain = process.env.CLOUDFRONT_DOMAIN;
      const transformedUrl = cloudFrontDomain 
        ? `https://${cloudFrontDomain}/${transformedKey}`
        : `https://${targetBucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${transformedKey}`;
      
      return {
        success: true,
        originalKey: fileName,
        transformedKey,
        transformedUrl,
        cached: true  // Indicate this was served from cache
      };
    } catch (error) {
      // Object doesn't exist, continue with transformation
    }

    // Get the image from S3
    const getObjectResponse = await s3Client.send(new GetObjectCommand({
      Bucket: sourceBucket,
      Key: fileName,
    }));
    
    // Convert the S3 object stream to buffer
    const imageBuffer = await streamToBuffer(getObjectResponse.Body as Readable);
    
    // Transform the image buffer
    const transformedBuffer = await transformImageBuffer(imageBuffer, options);
    
    // If a target bucket is specified, upload the transformed image
    if (targetBucket) {
      // Generate a target key with format info
      const fileNameWithoutExt = path.parse(fileName).name;
      const formatExt = options.format || path.extname(fileName).substring(1) || 'jpg';
      const dimensions = options.width && options.height 
        ? `_${options.width}x${options.height}` 
        : '';
      
      const transformedKey = generateTransformationKey(fileName, options);
      
      // Upload to S3
      await s3Client.send(new PutObjectCommand({
        Bucket: targetBucket,
        Key: transformedKey,
        Body: transformedBuffer,
        ContentType: `image/${formatExt}`,
        CacheControl: 'max-age=31536000' // Cache for 1 year
      }));
      
      // Construct URL if using CloudFront
      const cloudFrontDomain = process.env.CLOUDFRONT_DOMAIN;
      const transformedUrl = cloudFrontDomain 
        ? `https://${cloudFrontDomain}/${transformedKey}`
        : `https://${targetBucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${transformedKey}`;
      
      return {
        success: true,
        originalKey: fileName,
        transformedKey,
        transformedUrl,
      };
    }
    
    // If no target bucket, just return the original key and success status
    return {
      success: true,
      originalKey: fileName,
    };
  } catch (error) {
    console.error('Error in transformS3Image:', error);
    
    // Handle S3 NoSuchKey error
    const s3Error = error as any;
    if (s3Error.$metadata?.httpStatusCode === 404 || s3Error.name === 'NoSuchKey') {
      return {
        success: false,
        originalKey: fileName,
        error: 'File not found in S3 bucket',
      };
    }
    
    return {
      success: false,
      originalKey: fileName,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Utility function to convert a stream to a buffer
 * 
 * @param stream - Readable stream
 * @returns Promise with buffer
 */
async function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

/**
 * Transforms a local image file
 * 
 * @param inputPath - Path to the input file
 * @param outputPath - Path to save the output file
 * @param options - Transformation options
 * @returns Promise with the result
 */
export async function transformLocalImage(
  inputPath: string, 
  outputPath: string, 
  options: TransformOptions
): Promise<{ success: boolean; error?: string }> {
  try {
    // Read the input file
    const imageBuffer = fs.readFileSync(inputPath);
    
    // Transform the image
    const transformedBuffer = await transformImageBuffer(imageBuffer, options);
    
    // Write the output file
    fs.writeFileSync(outputPath, transformedBuffer);
    
    return { success: true };
  } catch (error) {
    console.error('Error in transformLocalImage:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

function generateTransformationKey(fileName: string, options: TransformOptions): string {
  // Create a deterministic string representation of the options
  const optionsString = JSON.stringify(Object.entries(options)
    .filter(([_, value]) => value !== undefined)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB)));
  
  // Create a hash of the options
  const optionsHash = crypto.createHash('md5').update(optionsString).digest('hex').substring(0, 10);
  
  // Build the key with original filename and options hash
  const { name, ext } = path.parse(fileName);
  const format = options.format || ext.substring(1) || 'jpg';
  
  return `transformed/${name}_${optionsHash}.${format}`;
} 