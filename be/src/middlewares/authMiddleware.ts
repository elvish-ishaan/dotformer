import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth/jwt';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;  // Changed from id to userId to match auth.ts
        email: string;
      };
    }
  }
}

/**
 * Middleware to require authentication for routes
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }

    // Extract token from header (Bearer TOKEN_STRING)
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid token format' 
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid or expired token' 
      });
    }

    // Add user to request for use in route handlers - changed id to userId
    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };

    next();
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: 'Authentication failed' 
    });
  }
}; 