import express from 'express';
import { register, login, getProfile } from '../controllers/authController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// Public routes
router.post('/register', register as any);
router.post('/login', login as any);

// Protected routes
router.get('/me', authenticate as any, getProfile as any);

export default router; 