import { Request, Response } from 'express';
import { createApiKey, getApiKeys, deleteApiKey, updateApiKey } from '../services/apiKeyService';

/**
 * Create a new API key for the authenticated user
 * @route POST /api/api-keys
 */
export const createKey = async (req: Request, res: Response) => {
  try {
    console.log('Create API key - Body:', JSON.stringify(req.body));
    console.log('Create API key - User:', JSON.stringify(req.user));
    
    // Get the user ID from the authenticated user
    const userId = req.user?.userId;
    
    if (!userId) {
      console.log('Create API key - No authenticated user');
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }
    
    const { name, expiresInDays } = req.body;
    
    if (!name) {
      console.log('Create API key - Missing name');
      return res.status(400).json({
        success: false,
        error: 'Name is required'
      });
    }
    
    // Create new API key
    console.log(`Create API key - Creating key for user ${userId} with name "${name}" and expiresInDays:`, expiresInDays);
    const result = await createApiKey(userId, name, expiresInDays);
    console.log('Create API key - Result:', JSON.stringify({ 
      success: result.success, 
      apiKeyId: result.apiKey?.id, 
      error: result.error
    }));
    
    return res.status(201).json(result);
  } catch (error) {
    console.error('Error creating API key:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create API key'
    });
  }
};

/**
 * Get all API keys for the authenticated user
 * @route GET /api/api-keys
 */
export const getKeys = async (req: Request, res: Response) => {
  try {
    // Get the user ID from the authenticated user
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }
    
    // Get all keys
    const result = await getApiKeys(userId);
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch API keys'
    });
  }
};

/**
 * Delete an API key
 * @route DELETE /api/api-keys/:keyId
 */
export const deleteKey = async (req: Request, res: Response) => {
  try {
    // Get the user ID from the authenticated user
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }
    
    const { keyId } = req.params;
    
    if (!keyId) {
      return res.status(400).json({
        success: false,
        error: 'Key ID is required'
      });
    }
    
    // Delete the key
    const result = await deleteApiKey(keyId, userId);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error deleting API key:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete API key'
    });
  }
};

/**
 * Update an API key (name or active status)
 * @route PUT /api/api-keys/:keyId
 */
export const updateKey = async (req: Request, res: Response) => {
  try {
    // Get the user ID from the authenticated user
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }
    
    const { keyId } = req.params;
    const { name, isActive } = req.body;
    
    if (!keyId) {
      return res.status(400).json({
        success: false,
        error: 'Key ID is required'
      });
    }
    
    if (name === undefined && isActive === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Nothing to update'
      });
    }
    
    // Update the key
    const updateData: { name?: string; isActive?: boolean } = {};
    if (name !== undefined) updateData.name = name;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    const result = await updateApiKey(keyId, userId, updateData);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error updating API key:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update API key'
    });
  }
}; 