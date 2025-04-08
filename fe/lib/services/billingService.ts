import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Interface definitions
export interface UsageRecord {
  operationType: string;
  total: number;
  unit: string;
}

export interface UsageStats {
  usageByOperation: Record<string, UsageRecord>;
  estimatedCost: number;
  currency: string;
  billingPeriod: {
    start: string;
    end: string;
  };
}

export interface Bill {
  id: string;
  amount: number;
  currency: string;
  status: string;
  startPeriod: string;
  endPeriod: string;
  createdAt: string;
  paidAt?: string;
}

export interface BillingHistory {
  bills: Bill[];
  total: number;
  limit: number;
  offset: number;
}

export interface PricingPlanFeature {
  name: string;
  included: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  features: string[];
}

export interface Subscription {
  id: string;
  pricingPlanId: string;
  status: string;
  startDate: string;
  endDate?: string;
}

// Define the billing service
const billingService = {
  /**
   * Get current usage statistics
   */
  getCurrentUsage: async (): Promise<UsageStats> => {
    try {
      const response = await axios.get(`${API_URL}/billing/usage`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching usage stats:', error);
      throw error;
    }
  },

  /**
   * Get current bill estimate
   */
  getCurrentBillEstimate: async (): Promise<{
    success: boolean;
    estimatedCost: number;
    currency: string;
    billingPeriod: {
      start: string;
      end: string;
    };
    usage: Record<string, UsageRecord>;
  }> => {
    try {
      const response = await axios.get(`${API_URL}/billing/current-bill`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching current bill estimate:', error);
      throw error;
    }
  },

  /**
   * Get billing history
   */
  getBillingHistory: async (limit = 10, offset = 0): Promise<BillingHistory> => {
    try {
      const response = await axios.get(`${API_URL}/billing/bills`, {
        params: { limit, offset },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching billing history:', error);
      throw error;
    }
  },

  /**
   * Get available pricing plans
   */
  getPricingPlans: async (): Promise<{ plans: PricingPlan[] }> => {
    try {
      const response = await axios.get(`${API_URL}/billing/pricing-plans`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching pricing plans:', error);
      throw error;
    }
  },

  /**
   * Subscribe to a pricing plan
   */
  subscribeToPlan: async (planId: string): Promise<{
    success: boolean;
    subscription: Subscription;
  }> => {
    try {
      const response = await axios.post(
        `${API_URL}/billing/subscribe`,
        { planId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error subscribing to plan:', error);
      throw error;
    }
  },

  /**
   * Update payment method
   */
  updatePaymentMethod: async (paymentMethodId: string): Promise<{
    success: boolean;
    message: string;
  }> => {
    try {
      const response = await axios.post(
        `${API_URL}/billing/payment-method`,
        { paymentMethodId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating payment method:', error);
      throw error;
    }
  },

  /**
   * Format number to currency
   */
  formatCurrency: (amount: number, currency = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  },

  /**
   * Format bytes to human-readable format
   */
  formatBytes: (bytes: number, decimals = 2): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
  }
};

export default billingService; 