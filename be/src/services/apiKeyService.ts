import { PrismaClient } from '@prisma/client';
import { randomBytes, createHash } from 'crypto';

const prisma = new PrismaClient();

// Generate a secure random API key
export const generateApiKey = (): string => {
  // Generate 32 random bytes and convert to hex
  const buffer = randomBytes(32);
  return buffer.toString('hex');
};

// Hash the API key for verification (optional additional security)
export const hashApiKey = (key: string): string => {
  return createHash('sha256').update(key).digest('hex');
};

// Create a new API key for a user
export const createApiKey = async (userId: string, name: string, expiresInDays?: number) => {
  try {
    const key = generateApiKey();
    
    const expiresAt = expiresInDays 
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) 
      : null;
    
    const apiKey = await prisma.apiKey.create({
      data: {
        name,
        key,
        expiresAt,
        userId
      }
    });
    
    // Return without the actual key for safety
    return {
      success: true,
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        key, // Only send the key on creation
        createdAt: apiKey.createdAt,
        expiresAt: apiKey.expiresAt,
        isActive: apiKey.isActive
      }
    };
  } catch (error) {
    console.error('Error creating API key:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create API key'
    };
  }
};

// Get all API keys for a user
export const getApiKeys = async (userId: string) => {
  try {
    const apiKeys = await prisma.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    
    // Return without the actual keys
    return {
      success: true,
      apiKeys: apiKeys.map(key => ({
        id: key.id,
        name: key.name,
        lastUsed: key.lastUsed,
        expiresAt: key.expiresAt,
        isActive: key.isActive,
        createdAt: key.createdAt
      }))
    };
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch API keys'
    };
  }
};

// Delete an API key
export const deleteApiKey = async (keyId: string, userId: string) => {
  try {
    // Ensure the key belongs to the user
    const existingKey = await prisma.apiKey.findFirst({
      where: {
        id: keyId,
        userId
      }
    });
    
    if (!existingKey) {
      return {
        success: false,
        error: 'API key not found or does not belong to this user'
      };
    }
    
    await prisma.apiKey.delete({
      where: { id: keyId }
    });
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Error deleting API key:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete API key'
    };
  }
};

// Update an API key (e.g., deactivate, rename)
export const updateApiKey = async (keyId: string, userId: string, data: { name?: string, isActive?: boolean }) => {
  try {
    // Ensure the key belongs to the user
    const existingKey = await prisma.apiKey.findFirst({
      where: {
        id: keyId,
        userId
      }
    });
    
    if (!existingKey) {
      return {
        success: false,
        error: 'API key not found or does not belong to this user'
      };
    }
    
    const apiKey = await prisma.apiKey.update({
      where: { id: keyId },
      data
    });
    
    return {
      success: true,
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        lastUsed: apiKey.lastUsed,
        expiresAt: apiKey.expiresAt,
        isActive: apiKey.isActive,
        createdAt: apiKey.createdAt
      }
    };
  } catch (error) {
    console.error('Error updating API key:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update API key'
    };
  }
};

// Validate an API key during authentication
export const validateApiKey = async (key: string) => {
  try {
    // Update lastUsed timestamp
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        key,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });
    
    if (!apiKey) {
      return {
        success: false,
        error: 'Invalid or expired API key'
      };
    }
    
    // Update the lastUsed timestamp
    await prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsed: new Date() }
    });
    
    return {
      success: true,
      user: {
        userId: apiKey.user.id,
        email: apiKey.user.email
      }
    };
  } catch (error) {
    console.error('Error validating API key:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to validate API key'
    };
  }
}; 