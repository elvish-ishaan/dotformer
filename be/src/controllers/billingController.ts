import { Request, Response } from 'express';
import { billingService } from '../services/billingService';
import { PrismaClient } from '@prisma/client';
import { ForbiddenError, NotFoundError } from '../utils/errors';

const prisma = new PrismaClient();

/**
 * Get current usage statistics
 * @route GET /api/billing/usage
 */
export const getCurrentUsage = async (req: Request, res: Response) => {
  try {
    // Get the user ID from the authenticated user
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    const usageStats = await billingService.getCurrentUsage(userId);
    
    return res.status(200).json({
      success: true,
      ...usageStats
    });
  } catch (error) {
    console.error('Error in getCurrentUsage controller:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};

/**
 * Get user's billing history
 * @route GET /api/billing/bills
 */
export const getBillingHistory = async (req: Request, res: Response) => {
  try {
    // Get the user ID from the authenticated user
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    // Parse pagination parameters
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    const billingHistory = await billingService.getBillingHistory(userId, limit, offset);
    
    return res.status(200).json({
      success: true,
      ...billingHistory
    });
  } catch (error) {
    console.error('Error in getBillingHistory controller:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};

/**
 * Get current billing period estimate
 * @route GET /api/billing/current-bill
 */
export const getCurrentBillEstimate = async (req: Request, res: Response) => {
  try {
    // Get the user ID from the authenticated user
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    // Get current month period
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0); // Last day of the current month
    endOfMonth.setHours(23, 59, 59, 999);
    
    // Get usage and estimate bill
    const usageStats = await billingService.getCurrentUsage(userId);
    
    return res.status(200).json({
      success: true,
      estimatedCost: usageStats.estimatedCost,
      currency: usageStats.currency,
      billingPeriod: {
        start: startOfMonth,
        end: endOfMonth
      },
      usage: usageStats.usageByOperation
    });
  } catch (error) {
    console.error('Error in getCurrentBillEstimate controller:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};

/**
 * Add or update payment method
 * @route POST /api/billing/payment-method
 */
export const updatePaymentMethod = async (req: Request, res: Response) => {
  try {
    // Get the user ID from the authenticated user
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    // Get payment method from request body
    const { paymentMethodId } = req.body;
    
    if (!paymentMethodId) {
      return res.status(400).json({
        success: false,
        error: 'Payment method ID is required'
      });
    }
    
    // In a real implementation, this would validate the payment method with Stripe or another processor
    // For now, just store the payment method ID
    const result = await billingService.updatePaymentMethod(userId, paymentMethodId);
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in updatePaymentMethod controller:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};

/**
 * Get available pricing plans
 * @route GET /api/billing/pricing-plans
 */
export const getPricingPlans = async (req: Request, res: Response) => {
  try {
    const plans = await billingService.getPricingPlans();
    
    // Transform plans for client consumption
    const transformedPlans = plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      features: formatPlanFeatures(plan),
    }));
    
    return res.status(200).json({
      success: true,
      plans: transformedPlans
    });
  } catch (error) {
    console.error('Error in getPricingPlans controller:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};

/**
 * Subscribe to a pricing plan
 * @route POST /api/billing/subscribe
 */
export const subscribeToPlan = async (req: Request, res: Response) => {
  try {
    // Get the user ID from the authenticated user
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    // Get plan ID from request body
    const { planId } = req.body;
    
    if (!planId) {
      return res.status(400).json({
        success: false,
        error: 'Plan ID is required'
      });
    }
    
    // Subscribe to the plan
    const result = await billingService.subscribeToPlan(userId, planId);
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in subscribeToPlan controller:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};

/**
 * Format plan features for client-side display
 */
function formatPlanFeatures(plan: { 
  name: string;
  pricingTiers: Array<{
    operationType: string;
    tier: number;
    freeQuota: number;
    unitPrice: number;
  }>
}) {
  const features: string[] = [];
  
  // Group tiers by operation type
  const tiersByOperation: Record<string, Array<{
    operationType: string;
    tier: number;
    freeQuota: number;
    unitPrice: number;
  }>> = {};
  
  for (const tier of plan.pricingTiers) {
    if (!tiersByOperation[tier.operationType]) {
      tiersByOperation[tier.operationType] = [];
    }
    tiersByOperation[tier.operationType].push(tier);
  }
  
  // Format features based on operation type
  for (const [operationType, tiers] of Object.entries(tiersByOperation)) {
    // Sort tiers by tier number
    const sortedTiers = tiers.sort((a, b) => a.tier - b.tier);
    
    // Get the first tier for free quota
    const firstTier = sortedTiers[0];
    
    if (firstTier) {
      // Format storage size for better readability
      if (operationType === 'storage' || operationType === 'upload') {
        const formatBytes = (bytes: number) => {
          if (bytes === 0) return '0 Bytes';
          const k = 1024;
          const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
          const i = Math.floor(Math.log(bytes) / Math.log(k));
          return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        };
        
        if (firstTier.freeQuota > 0) {
          features.push(`${formatBytes(firstTier.freeQuota)} free ${operationType}`);
        }
        
        // Add pricing for additional usage
        if (firstTier.unitPrice > 0) {
          // Convert to GB pricing for display
          const gbPrice = firstTier.unitPrice * 1024 * 1024 * 1024;
          features.push(`$${gbPrice.toFixed(2)} per GB for additional ${operationType}`);
        }
      } else if (operationType === 'transform') {
        if (firstTier.freeQuota > 0) {
          features.push(`${firstTier.freeQuota} free transformations`);
        }
        
        if (firstTier.unitPrice > 0) {
          features.push(`$${firstTier.unitPrice.toFixed(3)} per additional transformation`);
        }
      } else if (operationType === 'api') {
        if (firstTier.freeQuota > 0) {
          features.push(`${firstTier.freeQuota} free API calls`);
        }
        
        if (firstTier.unitPrice > 0) {
          features.push(`$${firstTier.unitPrice.toFixed(4)} per additional API call`);
        }
      }
    }
  }
  
  // Add minimum billing if applicable
  if (plan.name === 'Basic') {
    features.push('$5/month minimum');
  } else if (plan.name === 'Professional') {
    features.push('$20/month minimum');
    features.push('Priority support');
  } else if (plan.name === 'Enterprise') {
    features.push('Custom pricing');
    features.push('Volume discounts');
    features.push('Dedicated support');
    features.push('Custom SLA');
  }
  
  return features;
} 