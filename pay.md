# Pay-As-You-Go Pricing Model for Dotformer

## Overview

The pay-as-you-go pricing model will allow users to pay only for what they use, providing flexibility and cost efficiency. The system will track usage of various resources and bill users accordingly.

## Key Components

1. **Usage Tracking**: Track API calls, storage usage, and file transformations
2. **Billing System**: Calculate costs based on usage and generate invoices
3. **Subscription Tiers**: Provide different tiers with varying rates and features
4. **Quota System**: Implement usage limits and alerts

## Database Schema Extensions

We need to add the following models to the Prisma schema:

```prisma
model UsageRecord {
  id          String   @id @default(uuid())
  userId      String
  apiKeyId    String?
  operationType String  // e.g., "upload", "transform", "storage", "download"
  resourceId  String?  // e.g., fileId for file operations
  quantity    Float    // amount of resources used (bytes, api calls, etc.)
  unit        String   // e.g., "bytes", "calls", "seconds"
  timestamp   DateTime @default(now())
  billed      Boolean  @default(false)
  billId      String?
}

model Bill {
  id          String   @id @default(uuid())
  userId      String
  amount      Float
  currency    String   @default("USD")
  status      String   // "pending", "paid", "failed"
  startPeriod DateTime
  endPeriod   DateTime
  createdAt   DateTime @default(now())
  paidAt      DateTime?
}

model PricingPlan {
  id               String   @id @default(uuid())
  name             String
  description      String?
  isActive         Boolean  @default(true)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  subscriptions    Subscription[]
  pricingTiers     PricingTier[]
}

model PricingTier {
  id               String   @id @default(uuid())
  pricingPlanId    String
  pricingPlan      PricingPlan @relation(fields: [pricingPlanId], references: [id])
  operationType    String
  unitPrice        Float
  currency         String   @default("USD")
  unitType         String   // "byte", "call", "transformation"
  freeQuota        Float    @default(0)
  tier             Int      // For tiered pricing: 1, 2, 3...
  minQuantity      Float    // Threshold for this tier
  maxQuantity      Float?   // Max threshold (null for unlimited)
}

model Subscription {
  id               String   @id @default(uuid())
  userId           String
  pricingPlanId    String
  pricingPlan      PricingPlan @relation(fields: [pricingPlanId], references: [id])
  startDate        DateTime @default(now())
  endDate          DateTime?
  status           String   // "active", "canceled", "expired"
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

// Extend existing User model with billing info
model User {
  id               String   @id @default(uuid())
  email            String   @unique
  password         String
  name             String?
  billingAddress   String?
  paymentMethod    String?  // Reference to payment method (e.g., Stripe customer ID)
  subscriptionId   String?  // Current active subscription
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  apiKeys          ApiKey[]
  subscription     Subscription? @relation(fields: [subscriptionId], references: [id])
}
```

## Usage Tracking Implementation

The system will record usage at several key points:

1. **File Uploads**: Track the size of uploaded files
2. **File Storage**: Track storage duration and size
3. **File Transformations**: Track type and complexity of transformations
4. **API Calls**: Track all API endpoints usage

Usage tracking will be implemented as middleware that:
- Intercepts API requests
- Records usage metrics
- Checks against quota limits
- Rejects requests if quotas are exceeded

## Middleware Implementation

```typescript
// usageTrackingMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { QuotaExceededError } from '../utils/errors';

const prisma = new PrismaClient();

export const trackUsage = (operationType: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    
    // Store original end function
    const originalEnd = res.end;
    
    // Get user ID and API key if available
    const userId = (req as any).user?.id;
    const apiKeyId = (req as any).apiKey?.id;
    
    // If neither user ID nor API key is available, pass to next middleware
    if (!userId && !apiKeyId) {
      return next();
    }
    
    // Override res.end to capture response
    res.end = function(chunk?: any, encoding?: any) {
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
      
      // Restore original end behavior
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

async function checkQuota(userId: string, apiKeyId: string | undefined, operationType: string): Promise<void> {
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
  
  if (!user || !user.subscription || !user.subscription.pricingPlan) {
    throw new QuotaExceededError('No active subscription found');
  }
  
  // Find the pricing tier for this operation
  const pricingTier = user.subscription.pricingPlan.pricingTiers.find(
    tier => tier.operationType === operationType && tier.tier === 1
  );
  
  if (!pricingTier) {
    // Operation not covered by subscription
    throw new QuotaExceededError(`Operation ${operationType} not covered by your subscription`);
  }
  
  // Calculate current period usage
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
  
  // Check if usage exceeds free quota
  if (totalUsage > pricingTier.freeQuota) {
    // For pay-as-you-go, we would just continue but for rate limiting purposes
    // we might want to check if they have a valid payment method

    if (!user.paymentMethod) {
      throw new QuotaExceededError(
        `You have exceeded your free quota for ${operationType}. Please add a payment method.`
      );
    }
  }
}
```

## Billing System

The billing system will consist of:

1. **Usage Calculation**: Aggregate usage records for billing period
2. **Cost Calculation**: Apply pricing tiers to calculate costs
3. **Invoice Generation**: Create invoices for users
4. **Payment Processing**: Integration with payment gateway (Stripe)

### Billing Service Implementation

```typescript
// billingService.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    
    for (const user of users) {
      await generateBillForUser(user.id, startDate, endDate);
    }
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
    // const paymentResult = await stripeService.chargeBill(bill);
    
    // Update bill status
    await prisma.bill.update({
      where: { id: billId },
      data: {
        status: 'paid', // or 'failed' based on payment result
        paidAt: new Date()
      }
    });
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
  const usageByOperation = {};
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
    let remainingUsage = Math.max(0, usage - tiers[0].freeQuota);
    
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
```

## API Endpoints for Billing and Usage

```
// New API endpoints for billing
- `GET /api/billing/usage` - Get current usage statistics
- `GET /api/billing/bills` - Get billing history
- `GET /api/billing/current-bill` - Get current billing period estimate
- `POST /api/billing/payment-method` - Add/update payment method
- `GET /api/billing/pricing-plans` - Get available pricing plans
- `POST /api/billing/subscribe` - Subscribe to a pricing plan
```

## Frontend Changes

The frontend will need new pages for:

1. **Usage Dashboard**: Show current usage and estimated costs
2. **Billing History**: Display past invoices and payment status
3. **Subscription Management**: Choose and manage pricing plans
4. **Payment Methods**: Add and manage payment information

## Pricing Plans (Example)

1. **Free Tier**
   - 100MB storage
   - 10 transformations per day
   - 100 API calls per day
   - No credit card required

2. **Basic Tier**
   - $0.05 per GB storage per month
   - $0.01 per transformation
   - $0.001 per API call
   - $5/month minimum

3. **Professional Tier**
   - $0.04 per GB storage per month
   - $0.008 per transformation
   - $0.0008 per API call
   - $20/month minimum
   - Priority support

4. **Enterprise Tier**
   - Custom pricing
   - Volume discounts
   - Dedicated support
   - Custom SLA

## Implementation Strategy

1. **Phase 1: Usage Tracking**
   - Implement database schema changes
   - Add usage tracking middleware
   - Create usage dashboard UI

2. **Phase 2: Billing System**
   - Implement billing calculation logic
   - Integrate payment gateway
   - Add billing management UI

3. **Phase 3: Subscription Plans**
   - Implement plan management
   - Add subscription UI
   - Create upgrade/downgrade flows

4. **Phase 4: Quota Enforcement**
   - Implement rate limiting
   - Add usage alerts
   - Create quota management UI

## Technical Considerations

1. **Performance**: Usage tracking should have minimal impact on API performance
2. **Scalability**: System should handle high volume of usage records
3. **Reliability**: Ensure accurate billing and prevent revenue leakage
4. **Security**: Protect payment information and prevent billing manipulation
5. **Compliance**: Ensure compliance with payment regulations (PCI DSS) 