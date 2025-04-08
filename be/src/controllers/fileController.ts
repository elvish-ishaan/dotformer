import { Request, Response } from 'express';
import { fileStorageService } from '../services/fileStorage';
import { transformFile } from '../utils/transformation';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Upload a file to S3
 * @route POST /api/files/upload
 */
export const uploadFile = async (req: Request, res: Response) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const { buffer, originalname, mimetype } = req.file;
    
    // Get the user ID from the authenticated user (if available)
    const userId = (req as any).user?.userId || '';
    
    // Get the makePublic param (default to true)
    const makePublic = req.body.makePublic !== 'false';
    
    // Upload file to S3
    const result = await fileStorageService.uploadFile(
      buffer,
      originalname,
      mimetype,
      userId,
      makePublic
    );
    
    return res.status(201).json(result);
  } catch (error) {
    console.error('Error in uploadFile controller:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};

/**
 * Get all files for a user
 * @route GET /api/files
 */
export const getFiles = async (req: Request, res: Response) => {
  try {
    // Get the user ID from the authenticated user
    const userId = (req as any).user?.userId || '';
    
    // Get all assets for this user from the database
    const assets = await prisma.asset.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return res.status(200).json({
      success: true,
      assets
    });
  } catch (error) {
    console.error('Error in getFiles controller:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};

/**
 * Delete a file from S3
 * @route DELETE /api/files/:fileId
 */
export const deleteFile = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    
    if (!fileId) {
      return res.status(400).json({
        success: false,
        error: 'File ID is required'
      });
    }
    
    // Delete file
    const result = await fileStorageService.deleteFile(fileId);
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in deleteFile controller:', error);
    
    // Check if this is a "not found" error
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};

/**
 * Get file info and URL
 * @route GET /api/files/:fileId
 */
export const getFile = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    
    if (!fileId) {
      return res.status(400).json({
        success: false,
        error: 'File ID is required'
      });
    }
    
    // Check if a presigned URL is explicitly requested
    const needsPresigned = req.query.presigned === 'true';
    
    if (needsPresigned) {
      // Get presigned URL with 1 hour expiry for private access
      const result = await fileStorageService.getPresignedUrl(fileId, 3600);
      return res.status(200).json(result);
    } else {
      // Just get the file info with its permanent public URL
      const fileInfo = await fileStorageService.getFileInfo(fileId);
      return res.status(200).json(fileInfo);
    }
  } catch (error) {
    console.error('Error in getFile controller:', error);
    
    // Check if this is a "not found" error
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};

/**
 * Transform a file with various options
 * @route POST /api/files/transform/:fileId
 */
export const transformFileById = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    
    if (!fileId) {
      return res.status(400).json({
        success: false,
        error: 'File ID is required'
      });
    }
    
    // Get the file info
    const fileInfo = await fileStorageService.getFileInfo(fileId);
    
    if (!fileInfo.success || !fileInfo.asset) {
      return res.status(404).json({
        success: false,
        error: `File with ID ${fileId} not found`
      });
    }
    
    // Parse transformation options from query parameters
    const transformOptions = {
      width: req.query.width ? parseInt(req.query.width.toString()) : undefined,
      height: req.query.height ? parseInt(req.query.height.toString()) : undefined,
      format: req.query.format?.toString(),
      quality: req.query.quality ? parseInt(req.query.quality.toString()) : undefined,
      fit: req.query.fit?.toString(),
      grayscale: req.query.grayscale === 'true',
      rotate: req.query.rotate ? parseInt(req.query.rotate.toString()) : undefined
    };
    
    // Use the existing transformation utility
    const result = await transformFile(fileInfo.asset.url, transformOptions);
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in transformFile controller:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}; 