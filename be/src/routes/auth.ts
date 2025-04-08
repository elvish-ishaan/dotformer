import express from 'express';
import { register, login, getProfile } from '../controllers/authController';
import { authenticate } from '../middlewares/auth';
import { AuthService } from '../services/auth.service';

const router = express.Router();
const authService = new AuthService();

// Public routes
router.post('/register', register as any);
router.post('/login', login as any);

// Forgot password routes
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    const result = await authService.requestPasswordReset(email);
    res.json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    console.log('reset-password route called...........')
    const { email, otp, newPassword } = req.body;
    
    const result = await authService.verifyOtpAndResetPassword(email, otp, newPassword);
    console.log(result,'result........')
    res.json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Protected routes
router.get('/me', authenticate as any, getProfile as any);

export default router; 