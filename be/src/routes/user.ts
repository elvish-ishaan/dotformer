import express from 'express';
import { updateProfile, updatePassword } from '../controllers/userController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// All user routes are protected
router.use(authenticate as any);

// Update user profile
router.put('/profile', updateProfile as any);

// Update user password
router.put('/password', updatePassword as any);

export default router; 