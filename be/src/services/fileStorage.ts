import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../lib/prisma';

class FileStorageService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    // Initialize S3 client
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION as string,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
      },
    });
    
    this.bucketName = process.env.AWS_BUCKET_NAME as string;
    
    if (!this.bucketName) {
      throw new Error('AWS_BUCKET_NAME is not defined in environment variables');
    }
  }

  /**
   * Uploads a file to S3 and records it in the database
   * 
   * @param fileBuffer - The file buffer to upload
   * @param originalFilename - Original filename
   * @param mimeType - File MIME type
   * @param userId - ID of the user who owns this file (optional)
   * @param makePublic - Whether to make the file publicly accessible (default: true)
   * @returns Promise with the created asset record
   */
  async uploadFile(
    fileBuffer: Buffer,
    originalFilename: string,
    mimeType: string,
    userId?: string,
    makePublic: boolean = true
  ) {
    try {
      // Generate a unique filename to avoid collisions
      const fileExtension = originalFilename.split('.').pop() || '';
      const uniqueFilename = `${uuidv4()}.${fileExtension}`;
      const s3Key = `uploads/${uniqueFilename}`;
      
      // Upload to S3
      // Remove ACL if bucket doesn't support it (we'll assume public access by default)
      const uploadParams = {
        Bucket: this.bucketName,
        Key: s3Key,
        Body: fileBuffer,
        ContentType: mimeType,
        ContentDisposition: `inline; filename="${originalFilename}"`
      };
      
      await this.s3Client.send(new PutObjectCommand(uploadParams));
      
      // Generate a URL for the file
      const fileUrl = this.getPublicUrl(s3Key);
      
      // Create database record
      const asset = await prisma.asset.create({
        data: {
          fileName: originalFilename,
          fileSize: fileBuffer.length,
          fileType: mimeType,
          url: fileUrl,
          userId: userId || '',
        },
      });
      
      return {
        success: true,
        asset,
        s3Key,
        fileUrl
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  /**
   * Deletes a file from S3 and the database
   * 
   * @param assetId - ID of the asset to delete
   * @returns Promise with the deletion result
   */
  async deleteFile(assetId: string) {
    try {
      // First get the asset to determine the S3 key
      const asset = await prisma.asset.findUnique({
        where: {
          id: assetId
        }
      });
      
      if (!asset) {
        throw new Error(`Asset with ID ${assetId} not found`);
      }
      
      // Extract the S3 key from the URL
      let s3Key;
      if (process.env.CLOUDFRONT_DOMAIN && asset.url.includes(process.env.CLOUDFRONT_DOMAIN)) {
        // Extract from CloudFront URL
        s3Key = asset.url.split(`https://${process.env.CLOUDFRONT_DOMAIN}/`)[1];
      } else {
        // Extract from S3 URL
        s3Key = asset.url.split(`https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/`)[1];
      }
      
      if (!s3Key) {
        throw new Error(`Could not extract S3 key from URL: ${asset.url}`);
      }
      
      // Delete from S3
      await this.s3Client.send(new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key
      }));
      
      // Delete from database
      await prisma.asset.delete({
        where: {
          id: assetId
        }
      });
      
      return {
        success: true,
        message: `File ${asset.fileName} deleted successfully`
      };
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }
  
  /**
   * Gets a permanent public URL for an S3 key
   * 
   * @param s3Key - The S3 key
   * @returns The public URL string
   */
  getPublicUrl(s3Key: string): string {
    if (process.env.CLOUDFRONT_DOMAIN) {
      // Use CloudFront if available
      return `https://${process.env.CLOUDFRONT_DOMAIN}/${s3Key}`;
    } else {
      // Otherwise use direct S3 URL
      return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
    }
  }

  /**
   * Generates a presigned URL for a file (for private files only)
   * 
   * @param assetId - ID of the asset
   * @param expiresIn - Expiration time in seconds (default: 3600)
   * @returns Promise with the presigned URL
   */
  async getPresignedUrl(assetId: string, expiresIn = 3600) { //expires in 1 hour
    try {
      const asset = await prisma.asset.findUnique({
        where: {
          id: assetId
        }
      });
      
      if (!asset) {
        throw new Error(`Asset with ID ${assetId} not found`);
      }
      
      // Extract the S3 key from the URL
      let s3Key;
      if (process.env.CLOUDFRONT_DOMAIN && asset.url.includes(process.env.CLOUDFRONT_DOMAIN)) {
        s3Key = asset.url.split(`https://${process.env.CLOUDFRONT_DOMAIN}/`)[1];
      } else {
        s3Key = asset.url.split(`https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/`)[1];
      }
      
      if (!s3Key) {
        throw new Error(`Could not extract S3 key from URL: ${asset.url}`);
      }
      
      // Generate presigned URL
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key
      });
      
      const presignedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
      
      return {
        success: true,
        presignedUrl,
        asset,
        publicUrl: asset.url // Always return the permanent public URL as well
      };
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      throw error;
    }
  }

  async fileExists(s3Key: string) {
    try {
      await this.s3Client.send(new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key
      }));
      
      return true;
    } catch (error) {
      return false;
    }
  }

  async getFileInfo(assetId: string) {
    try {
      const asset = await prisma.asset.findUnique({
        where: {
          id: assetId
        }
      });
      
      if (!asset) {
        throw new Error(`Asset with ID ${assetId} not found`);
      }
      
      return {
        success: true,
        asset
      };
    } catch (error) {
      console.error('Error getting file info:', error);
      throw error;
    }
  }
}

// Singleton instance
export const fileStorageService = new FileStorageService(); 