import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth/jwt';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }

    // Extract token from header (Bearer TOKEN_STRING)
    const token = authHeader.split(' ')[1]; //it will return the token string here on first index
    
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

    // Add user to request for use in route handlers
    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };
//call the next fucntion
    next();
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: 'Authentication failed' 
    });
  }
}; 