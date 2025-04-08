import express from 'express';
import { 
  getCurrentUsage, 
  getBillingHistory, 
  getCurrentBillEstimate, 
  updatePaymentMethod, 
  getPricingPlans, 
  subscribeToPlan 
} from '../controllers/billingController';
import { requireAuth } from '../middlewares/authMiddleware';

const router = express.Router();

// All billing routes require authentication
router.use(requireAuth as any);

// Usage tracking
router.get('/usage', getCurrentUsage as any);

// Billing
router.get('/bills', getBillingHistory as any);
router.get('/current-bill', getCurrentBillEstimate as any);

// Payment methods
router.post('/payment-method', updatePaymentMethod as any);

// Subscription plans
router.get('/pricing-plans', getPricingPlans as any);
router.post('/subscribe', subscribeToPlan as any);

export default router; 