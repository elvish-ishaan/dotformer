import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { QuotaExceededError } from '../utils/errors';

const prisma = new PrismaClient();

/**
 * Middleware for tracking usage of various operations
 * @param operationType Type of operation being performed (e.g., "upload", "transform")
 */
export const trackUsage = (operationType: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    
    // Store original end function
    const originalEnd = res.end;
    
    // Get user ID and API key if available
    const userId = (req as any).user?.userId;
    const apiKeyId = (req as any).apiKey?.id;
    
    // If neither user ID nor API key is available, pass to next middleware
    if (!userId && !apiKeyId) {
      return next();
    }
    
    // Override res.end to capture response
    res.end = function(chunk: any, encoding?: any, callback?: any) {
      // Calculate operation duration
      const duration = Date.now() - startTime;
      
      // Determine quantity based on operation type
      let quantity = 1; // Default is 1 call
      let unit = 'calls';
      
      if (operationType === 'upload' && req.file) {
        quantity = req.file.size;
        unit = 'bytes';
      } else if (operationType === 'transform') {
        // For transformations, we might want to calculate based on complexity
        quantity = 1;
        unit = 'transformations';
      } else if (operationType === 'storage') {
        // For storage, quantity is size in bytes over time
        if (req.body && req.body.fileSize) {
          quantity = parseInt(req.body.fileSize);
        }
        unit = 'bytes';
      }
      
      // Record usage asynchronously (don't await to avoid blocking)
      prisma.usageRecord.create({
        data: {
          userId: userId || '',
          apiKeyId: apiKeyId,
          operationType,
          resourceId: req.params.fileId,
          quantity,
          unit,
          timestamp: new Date(),
          billed: false
        }
      }).catch(err => console.error('Failed to record usage:', err));
      
      // Restore original end behavior and return result
      // @ts-ignore - Working around type issues with res.end
      return originalEnd.apply(res, arguments);
    };
    
    // Check if user has exceeded quota before processing request
    try {
      await checkQuota(userId || '', apiKeyId, operationType);
      next();
    } catch (error) {
      if (error instanceof QuotaExceededError) {
        return res.status(429).json({
          success: false,
          error: error.message
        });
      }
      next(error);
    }
  };
};

/**
 * Check if the user has exceeded their quota for a specific operation type
 */
async function checkQuota(userId: string, apiKeyId: string | undefined, operationType: string): Promise<void> {
  // If it's a system operation or not authenticated, skip quota check
  if (!userId && !apiKeyId) {
    return;
  }
  
  // Get the user's subscription
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscription: {
        include: {
          pricingPlan: {
            include: {
              pricingTiers: true
            }
          }
        }
      }
    }
  });
  
  // If user doesn't have a subscription, use the default free plan
  if (!user || !user.subscription || !user.subscription.pricingPlan) {
    // Check if there's a free plan
    const freePlan = await prisma.pricingPlan.findFirst({
      where: { name: 'Free' },
      include: { pricingTiers: true }
    });
    
    if (!freePlan) {
      // No free plan found, create it
      await createDefaultPlans();
      // Let this request through, we'll check quota on subsequent requests
      return;
    }
    
    // Find the free tier for this operation
    const freeTier = freePlan.pricingTiers.find(
      tier => tier.operationType === operationType && tier.tier === 1
    );
    
    if (!freeTier) {
      // Operation not covered by free plan
      throw new QuotaExceededError(
        `Operation ${operationType} not available in free plan. Please upgrade.`
      );
    }
    
    // Calculate current period usage (daily for free tier)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const currentUsage = await prisma.usageRecord.aggregate({
      where: {
        userId,
        operationType,
        timestamp: {
          gte: startOfDay
        }
      },
      _sum: {
        quantity: true
      }
    });
    
    const totalUsage = currentUsage._sum.quantity || 0;
    
    // Check if usage exceeds free quota
    if (totalUsage > freeTier.freeQuota) {
      throw new QuotaExceededError(
        `You have exceeded your free daily quota for ${operationType}. Please upgrade your plan.`
      );
    }
    
    return;
  }
  
  // Find the pricing tier for this operation
  const pricingTier = user.subscription.pricingPlan.pricingTiers.find(
    tier => tier.operationType === operationType && tier.tier === 1
  );
  
  if (!pricingTier) {
    // Operation not covered by subscription
    throw new QuotaExceededError(`Operation ${operationType} not covered by your subscription`);
  }
  
  // For paid plans, we only need to check if they have a payment method for exceeding free quota
  if (user.subscription.pricingPlan.name !== 'Free') {
    // Calculate current period usage (monthly for paid plans)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const currentUsage = await prisma.usageRecord.aggregate({
      where: {
        userId,
        operationType,
        timestamp: {
          gte: startOfMonth
        }
      },
      _sum: {
        quantity: true
      }
    });
    
    const totalUsage = currentUsage._sum.quantity || 0;
    
    // Check if usage exceeds free quota and user has no payment method
    if (totalUsage > pricingTier.freeQuota && !user.paymentMethod) {
      throw new QuotaExceededError(
        `You have exceeded your free quota for ${operationType}. Please add a payment method.`
      );
    }
  }
}

/**
 * Create default pricing plans if none exist
 */
async function createDefaultPlans(): Promise<void> {
  // Check if plans already exist
  const plansCount = await prisma.pricingPlan.count();
  
  if (plansCount > 0) {
    return;
  }
  
  // Create the free plan
  const freePlan = await prisma.pricingPlan.create({
    data: {
      name: 'Free',
      description: 'Free tier with limited usage',
      isActive: true,
      pricingTiers: {
        create: [
          {
            operationType: 'upload',
            unitPrice: 0,
            unitType: 'bytes',
            freeQuota: 104857600, // 100MB
            tier: 1,
            minQuantity: 0,
            maxQuantity: 104857600
          },
          {
            operationType: 'transform',
            unitPrice: 0,
            unitType: 'transformations',
            freeQuota: 10, // 10 transformations per day
            tier: 1,
            minQuantity: 0,
            maxQuantity: 10
          },
          {
            operationType: 'storage',
            unitPrice: 0,
            unitType: 'bytes',
            freeQuota: 104857600, // 100MB
            tier: 1,
            minQuantity: 0,
            maxQuantity: 104857600
          },
          {
            operationType: 'api',
            unitPrice: 0,
            unitType: 'calls',
            freeQuota: 100, // 100 API calls per day
            tier: 1,
            minQuantity: 0,
            maxQuantity: 100
          }
        ]
      }
    }
  });
  
  // Create Basic plan
  const basicPlan = await prisma.pricingPlan.create({
    data: {
      name: 'Basic',
      description: 'Pay-as-you-go pricing for individuals',
      isActive: true,
      pricingTiers: {
        create: [
          {
            operationType: 'upload',
            unitPrice: 0.00000005, // $0.05 per GB
            unitType: 'bytes',
            freeQuota: 536870912, // 512MB free
            tier: 1,
            minQuantity: 0,
            maxQuantity: null
          },
          {
            operationType: 'transform',
            unitPrice: 0.01, // $0.01 per transformation
            unitType: 'transformations',
            freeQuota: 50, // 50 free transformations
            tier: 1,
            minQuantity: 0,
            maxQuantity: null
          },
          {
            operationType: 'storage',
            unitPrice: 0.00000005, // $0.05 per GB per month
            unitType: 'bytes',
            freeQuota: 1073741824, // 1GB free
            tier: 1,
            minQuantity: 0,
            maxQuantity: null
          },
          {
            operationType: 'api',
            unitPrice: 0.001, // $0.001 per API call
            unitType: 'calls',
            freeQuota: 1000, // 1000 free API calls
            tier: 1,
            minQuantity: 0,
            maxQuantity: null
          }
        ]
      }
    }
  });
  
  // Create Professional plan
  const proPlan = await prisma.pricingPlan.create({
    data: {
      name: 'Professional',
      description: 'Premium pricing with higher quotas for professionals',
      isActive: true,
      pricingTiers: {
        create: [
          {
            operationType: 'upload',
            unitPrice: 0.00000004, // $0.04 per GB
            unitType: 'bytes',
            freeQuota: 5368709120, // 5GB free
            tier: 1,
            minQuantity: 0,
            maxQuantity: null
          },
          {
            operationType: 'transform',
            unitPrice: 0.008, // $0.008 per transformation
            unitType: 'transformations',
            freeQuota: 200, // 200 free transformations
            tier: 1,
            minQuantity: 0,
            maxQuantity: null
          },
          {
            operationType: 'storage',
            unitPrice: 0.00000004, // $0.04 per GB per month
            unitType: 'bytes',
            freeQuota: 10737418240, // 10GB free
            tier: 1,
            minQuantity: 0,
            maxQuantity: null
          },
          {
            operationType: 'api',
            unitPrice: 0.0008, // $0.0008 per API call
            unitType: 'calls',
            freeQuota: 5000, // 5000 free API calls
            tier: 1,
            minQuantity: 0,
            maxQuantity: null
          }
        ]
      }
    }
  });
} 