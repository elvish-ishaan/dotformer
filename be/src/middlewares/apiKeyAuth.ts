import { Request, Response, NextFunction } from 'express';
import { validateApiKey } from '../services/apiKeyService';
import rateLimit from 'express-rate-limit';

// Rate limiting configuration
export const apiKeyRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // Limit each IP/API key to 60 requests per minute
  standardHeaders: true,
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
  },
  keyGenerator: (req): string => {
    // Use API key as rate limit key if available, otherwise use IP
    const apiKey = req.headers['x-api-key'] as string;
    return apiKey || req.ip || 'unknown';
  },
});

// API key authentication middleware
export const authenticateApiKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('API Key Auth - Headers:', JSON.stringify(req.headers));
    
    // Get API key from header
    const apiKey = req.headers['x-api-key'] as string;
    
    if (!apiKey) {
      console.log('API Key Auth - No API key provided');
      return res.status(401).json({ 
        success: false, 
        error: 'API key required' 
      });
    }
    
    // Validate API key
    console.log('API Key Auth - Validating key:', apiKey.substring(0, 8) + '...');
    const result = await validateApiKey(apiKey);
    
    if (!result.success) {
      console.log('API Key Auth - Invalid key:', result.error);
      return res.status(401).json({ 
        success: false, 
        error: result.error
      });
    }
    
    // Add user to request
    console.log('API Key Auth - Valid key for user:', result.user!.email);
    req.user = {
      userId: result.user!.userId,
      email: result.user!.email
    };
    
    next();
  } catch (error) {
    console.error('API Key Auth - Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'API key authentication failed' 
    });
  }
}; 