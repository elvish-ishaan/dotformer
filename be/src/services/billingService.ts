import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Service for handling billing and payment operations
 */
export const billingService = {
  /**
   * Generate bills for all users for the specified period
   */
  generateBills: async (startDate: Date, endDate: Date) => {
    // Get all users with active subscriptions
    const users = await prisma.user.findMany({
      where: {
        subscription: {
          status: 'active'
        }
      },
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
    
    const bills = [];
    for (const user of users) {
      try {
        const bill = await generateBillForUser(user.id, startDate, endDate);
        bills.push(bill);
      } catch (error) {
        console.error(`Failed to generate bill for user ${user.id}:`, error);
      }
    }
    
    return bills;
  },
  
  /**
   * Generate a bill for a specific user
   */
  generateBillForUser: async (userId: string, startDate: Date, endDate: Date) => {
    return generateBillForUser(userId, startDate, endDate);
  },
  
  /**
   * Get current usage statistics for a user
   */
  getCurrentUsage: async (userId: string) => {
    // Get the current billing period (month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    // Get usage grouped by operation type
    const usageRecords = await prisma.usageRecord.findMany({
      where: {
        userId,
        timestamp: {
          gte: startOfMonth
        }
      }
    });
    
    // Group by operation type
    const usageByOperation: Record<string, { total: number, unit: string }> = {};
    for (const record of usageRecords) {
      if (!usageByOperation[record.operationType]) {
        usageByOperation[record.operationType] = {
          total: 0,
          unit: record.unit
        };
      }
      usageByOperation[record.operationType].total += record.quantity;
    }
    
    // Get the user's subscription and pricing tiers
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
    
    // Calculate estimated cost
    let estimatedCost = 0;
    
    if (user?.subscription?.pricingPlan) {
      for (const [operationType, usage] of Object.entries(usageByOperation)) {
        // Find applicable pricing tiers for this operation, sorted by tier
        const tiers = user.subscription.pricingPlan.pricingTiers
          .filter(tier => tier.operationType === operationType)
          .sort((a, b) => a.tier - b.tier);
        
        if (tiers.length === 0) continue;
        
        // Apply free quota to the first tier
        let remainingUsage = Math.max(0, usage.total - tiers[0].freeQuota);
        
        // Calculate cost across all applicable tiers
        for (const tier of tiers) {
          if (remainingUsage <= 0) break;
          
          const tierLimit = tier.maxQuantity !== null 
            ? tier.maxQuantity - tier.minQuantity
            : Infinity;
          
          const usageInThisTier = Math.min(remainingUsage, tierLimit);
          const costForTier = usageInThisTier * tier.unitPrice;
          
          estimatedCost += costForTier;
          remainingUsage -= usageInThisTier;
        }
      }
    }
    
    return {
      usageByOperation,
      estimatedCost,
      currency: 'USD',
      billingPeriod: {
        start: startOfMonth,
        end: new Date() // Current date
      }
    };
  },
  
  /**
   * Get billing history for a user
   */
  getBillingHistory: async (userId: string, limit = 10, offset = 0) => {
    const bills = await prisma.bill.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });
    
    const count = await prisma.bill.count({
      where: { userId }
    });
    
    return {
      bills,
      total: count,
      limit,
      offset
    };
  },
  
  /**
   * Process payment for a specific bill
   */
  processBillPayment: async (billId: string) => {
    // Get bill details
    const bill = await prisma.bill.findUnique({
      where: { id: billId },
      include: {
        user: true
      }
    });
    
    if (!bill) {
      throw new Error('Bill not found');
    }
    
    if (bill.status !== 'pending') {
      throw new Error(`Bill is already ${bill.status}`);
    }
    
    // TODO: Integrate with payment gateway (e.g., Stripe)
    // For now, we'll simulate a successful payment
    
    // Update bill status
    const updatedBill = await prisma.bill.update({
      where: { id: billId },
      data: {
        status: 'paid',
        paidAt: new Date()
      }
    });
    
    return {
      success: true,
      bill: updatedBill
    };
  },
  
  /**
   * Get available pricing plans
   */
  getPricingPlans: async () => {
    const plans = await prisma.pricingPlan.findMany({
      where: { isActive: true },
      include: {
        pricingTiers: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    return plans;
  },
  
  /**
   * Subscribe a user to a pricing plan
   */
  subscribeToPlan: async (userId: string, planId: string) => {
    // Check if the plan exists
    const plan = await prisma.pricingPlan.findUnique({
      where: { id: planId }
    });
    
    if (!plan) {
      throw new Error('Pricing plan not found');
    }
    
    // Check if user already has a subscription
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true
      }
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    if (user.subscription) {
      // Update existing subscription
      const updatedSubscription = await prisma.subscription.update({
        where: { id: user.subscription.id },
        data: {
          pricingPlanId: planId,
          status: 'active',
          startDate: new Date(),
          endDate: null, // Ongoing subscription
        }
      });
      
      return {
        success: true,
        subscription: updatedSubscription
      };
    } else {
      // Create new subscription
      const subscription = await prisma.subscription.create({
        data: {
          userId,
          pricingPlanId: planId,
          status: 'active',
        }
      });
      
      // Update user with subscription
      await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionId: subscription.id
        }
      });
      
      return {
        success: true,
        subscription
      };
    }
  },
  
  /**
   * Update payment method for a user
   */
  updatePaymentMethod: async (userId: string, paymentMethodId: string) => {
    // In a real implementation, this would validate the payment method with a payment gateway
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        paymentMethod: paymentMethodId
      }
    });
    
    return {
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        hasPaymentMethod: !!updatedUser.paymentMethod
      }
    };
  }
};

/**
 * Generate a bill for a specific user for the given period
 */
async function generateBillForUser(userId: string, startDate: Date, endDate: Date) {
  // Get the user's subscription and pricing plan
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
  
  if (!user || !user.subscription) {
    throw new Error('User has no active subscription');
  }
  
  // Get all unbilled usage records for this period
  const usageRecords = await prisma.usageRecord.findMany({
    where: {
      userId,
      timestamp: {
        gte: startDate,
        lt: endDate
      },
      billed: false
    }
  });
  
  // Group usage by operation type
  const usageByOperation: Record<string, number> = {};
  for (const record of usageRecords) {
    if (!usageByOperation[record.operationType]) {
      usageByOperation[record.operationType] = 0;
    }
    usageByOperation[record.operationType] += record.quantity;
  }
  
  // Calculate cost for each operation type
  let totalCost = 0;
  for (const [operationType, usage] of Object.entries(usageByOperation)) {
    // Find applicable pricing tiers for this operation, sorted by tier
    const tiers = user.subscription.pricingPlan.pricingTiers
      .filter(tier => tier.operationType === operationType)
      .sort((a, b) => a.tier - b.tier);
    
    if (tiers.length === 0) continue;
    
    // Apply free quota to the first tier
    let remainingUsage = Math.max(0, Number(usage) - tiers[0].freeQuota);
    
    // Calculate cost across all applicable tiers
    for (const tier of tiers) {
      if (remainingUsage <= 0) break;
      
      const tierLimit = tier.maxQuantity !== null 
        ? tier.maxQuantity - tier.minQuantity
        : Infinity;
      
      const usageInThisTier = Math.min(remainingUsage, tierLimit);
      const costForTier = usageInThisTier * tier.unitPrice;
      
      totalCost += costForTier;
      remainingUsage -= usageInThisTier;
    }
  }
  
  // Enforce minimum billing amount if applicable
  if (user.subscription.pricingPlan.name === 'Basic' && totalCost > 0 && totalCost < 5) {
    totalCost = 5; // $5 minimum for Basic plan
  } else if (user.subscription.pricingPlan.name === 'Professional' && totalCost > 0 && totalCost < 20) {
    totalCost = 20; // $20 minimum for Professional plan
  }
  
  // Don't create a bill if there's no cost
  if (totalCost <= 0) {
    return null;
  }
  
  // Create bill record
  const bill = await prisma.bill.create({
    data: {
      userId,
      amount: totalCost,
      currency: 'USD',
      status: 'pending',
      startPeriod: startDate,
      endPeriod: endDate,
    }
  });
  
  // Mark usage records as billed
  await prisma.usageRecord.updateMany({
    where: {
      id: {
        in: usageRecords.map(record => record.id)
      }
    },
    data: {
      billed: true,
      billId: bill.id
    }
  });
  
  return bill;
} 