import axios from 'axios';
import path from 'path';
import crypto from 'crypto';
import { S3Client, HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

// Define the Transformer service URL - make sure this is correct
const TRANSFORMER_URL = process.env.TRANSFORMER_URL || 'http://localhost:3001';

// Define transformation parameters interface
interface TransformationOptions {
  width?: number;
  height?: number;
  format?: string;
  quality?: number;
  [key: string]: any; // Allow additional custom parameters
}

/**
 * Generates a consistent key for a transformed image
 * 
 * @param fileName - Original file name
 * @param options - Transformation options
 * @returns A unique key for the transformed image
 */
function generateTransformationKey(fileName: string, options: TransformationOptions): string {
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

/**
 * Checks if a transformed version of the image already exists in S3
 * 
 * @param fileName - Original file name
 * @param options - Transformation options
 * @returns Promise with existence check result
 */
async function checkTransformedImageExists(fileName: string, options: TransformationOptions): Promise<{
  exists: boolean;
  transformedKey?: string;
  transformedUrl?: string;
}> {
  try {
    // Generate transformation key
    const transformedKey = generateTransformationKey(fileName, options);
    
    // Get target bucket from env
    const targetBucket = process.env.AWS_TARGET_BUCKET || process.env.AWS_BUCKET_NAME;
    
    if (!targetBucket) {
      return { exists: false };
    }
    
    // Initialize S3 client
    const s3Client = new S3Client({
      region: process.env.AWS_REGION as string,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
      },
    });
    
    try {
      // Check if transformed image exists
      await s3Client.send(new HeadObjectCommand({
        Bucket: targetBucket,
        Key: transformedKey
      }));
      
      // If we get here, the image exists - construct URL
      const cloudFrontDomain = process.env.CLOUDFRONT_DOMAIN;
      const transformedUrl = cloudFrontDomain 
        ? `https://${cloudFrontDomain}/${transformedKey}`
        : `https://${targetBucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${transformedKey}`;
      
      return {
        exists: true,
        transformedKey,
        transformedUrl
      };
    } catch (error) {
      // Image doesn't exist
      return { exists: false };
    }
  } catch (error) {
    console.error('Error checking if transformed image exists:', error);
    return { exists: false };
  }
}

/**
 * Sends a transformation request for a specific file
 * 
 * @param file - The name or path of the file to transform
 * @param options - Transformation options like width, height, format, etc.
 * @returns Promise with the transformation result
 */
export async function transformFile(file: string, options: TransformationOptions) {
  try {
    console.log('Processing file:', file);
    console.log('Transformation options:', options);
    
    // Check if the transformed image already exists in S3
    const cacheResult = await checkTransformedImageExists(file, options);
    
    if (cacheResult.exists && cacheResult.transformedUrl) {
      console.log('Cache hit! Transformed image already exists:', cacheResult.transformedUrl);
      return {
        success: true,
        originalFile: file,
        transformedKey: cacheResult.transformedKey,
        transformedUrl: cacheResult.transformedUrl,
        cached: true
      };
    }
    
    console.log('Cache miss. Requesting transformation from transformer service');
    
    // Check if the file is an S3 URL or path
    const isS3Path = file.includes('s3://') || file.includes('s3.amazonaws.com');
    
    // Prepare query parameters string
    const queryParams = new URLSearchParams();
    
    // Add transformation options to query params
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    
    // If it's an S3 path, add it as a separate parameter
    if (isS3Path) {
      queryParams.append('s3Path', file);
      
      // Extract just the filename from the S3 path
      const s3Filename = file.split('/').pop() || '';
      // Use the extracted filename for the URL parameter
      const encodedFilename = encodeURIComponent(s3Filename);
      
      // Construct the full URL with query parameters
      const url = `${TRANSFORMER_URL}/transform-image/${encodedFilename}?${queryParams.toString()}`;
      
      console.log(`Sending S3 file request to: ${url}`);
      
      const response = await axios.get(url, {
        timeout: 30000, // 30 second timeout
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log('Transformation response status:', response.status);
      return response.data;
    } else {
      // Regular file handling (non-S3)
      const encodedFilename = encodeURIComponent(file);
      const url = `${TRANSFORMER_URL}/transform-image/${encodedFilename}?${queryParams.toString()}`;
      
      console.log(`Sending local file request to: ${url}`);
      
      const response = await axios.get(url, {
        timeout: 30000,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log('Transformation response status:', response.status);
      return response.data;
    }
  } catch (error) {
    // Properly handle axios errors
    if (axios.isAxiosError(error)) {
      console.error('Axios error in transformFile:', 
        error.message, 
        error.response?.status, 
        error.response?.data
      );
      
      return {
        success: false,
        error: error.message,
        status: error.response?.status,
        originalFile: file
      };
    } else {
      console.error('Error in transformFile:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        originalFile: file
      };
    }
  }
}

// export async function transformImageBuffer(
//   imageBuffer: Buffer, 
//   filename: string, 
//   options: TransformationOptions
// ) {
//   try {
//     console.log(`Transforming image buffer for file: ${filename}`);
//     console.log('Transformation options:', options);

//     // Create FormData instance
//     const formData = new FormData();
    
//     // Add the image buffer to the form data
//     formData.append('image', imageBuffer, { filename });
    
//     // Prepare query parameters string
//     const queryParams = new URLSearchParams();
    
//     // Add transformation options to query params
//     Object.entries(options).forEach(([key, value]) => {
//       if (value !== undefined) {
//         queryParams.append(key, value.toString());
//       }
//     });
    
//     // Construct the full URL with query parameters
//     const url = `${TRANSFORMER_URL}/transform-image?${queryParams.toString()}`;
    
//     console.log(`Sending request to: ${url}`);
    
//     // Send PUT request to the transformer service
//     const response = await axios.put(url, formData, {
//       headers: {
//         ...formData.getHeaders(),
//       },
//       maxBodyLength: Infinity,
//       maxContentLength: Infinity,
//     });
    
//     console.log('Transformation response:', response.data);
//     return response.data;
//   } catch (error) {
//     console.error('Error in transformImageBuffer:', error);
//     throw error;
//   }
// }
