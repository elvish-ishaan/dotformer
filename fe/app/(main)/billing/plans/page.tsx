"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import PricingPlanCard from '@/components/PricingPlanCard';
import PaymentMethodForm from '@/components/PaymentMethodForm';
import billingService, { PricingPlan } from '@/lib/services/billingService';
import { toast } from 'sonner';

interface PaymentDetails {
  paymentMethodId: string;
}

export default function PlansPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for plans data
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [hasPaymentMethod, setHasPaymentMethod] = useState(false);
  
  // State for subscription flow
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  
  // Fetch plans data
  useEffect(() => {
    const fetchPlansData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch available pricing plans
        const plansResponse = await billingService.getPricingPlans();
        setPlans(plansResponse.plans);
        
        // Get user's current subscription
        // In a real app, this would come from the user profile or a separate API
        // For now, we'll just assume the user has the Free plan or no plan
        setCurrentPlanId(null);
        
        // Check if user has a payment method
        // In a real app, this would come from the user profile
        setHasPaymentMethod(false);
      } catch (err) {
        console.error('Error fetching plans data:', err);
        setError('Failed to load pricing plans. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPlansData();
  }, []);
  
  // Handle plan selection
  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
    
    // If it's a paid plan and user doesn't have a payment method, show payment form
    const isPaidPlan = plans.find(p => p.id === planId)?.name.toLowerCase() !== 'free';
    if (isPaidPlan && !hasPaymentMethod) {
      setShowPaymentForm(true);
    } else {
      // Otherwise, proceed with subscription
      handleSubscribe(planId);
    }
  };
  
  // Handle payment method save
  const handleSavePaymentMethod = async (paymentDetails: PaymentDetails) => {
    try {
      await billingService.updatePaymentMethod(paymentDetails.paymentMethodId);
      setHasPaymentMethod(true);
      setShowPaymentForm(false);
      
      // If a plan was selected, proceed with subscription
      if (selectedPlanId) {
        handleSubscribe(selectedPlanId);
      }
      
      toast.success("Payment method saved", {
        description: "Your payment information has been updated successfully."
      });
    } catch (err) {
      console.error('Error saving payment method:', err);
      toast.error("Error saving payment method", {
        description: "There was an error processing your payment information. Please try again."
      });
    }
  };
  
  // Handle subscription
  const handleSubscribe = async (planId: string) => {
    try {
      await billingService.subscribeToPlan(planId);
      setCurrentPlanId(planId);
      
      toast.success("Subscription updated", {
        description: "Your subscription has been updated successfully."
      });
      
      // Redirect to billing page
      router.push('/billing');
    } catch (err) {
      console.error('Error subscribing to plan:', err);
      toast.error("Error updating subscription", {
        description: "There was an error updating your subscription. Please try again."
      });
    }
  };
  
  // If loading, show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Pricing Plans</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading pricing plans...</p>
        </div>
      </div>
    );
  }
  
  // If error, show error state
  if (error) {
    return (
      <div className="flex flex-col space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Pricing Plans</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Pricing Plans</h1>
        <Button variant="outline" onClick={() => router.push('/billing')}>
          Back to Billing
        </Button>
      </div>
      
      {showPaymentForm ? (
        <div className="max-w-md mx-auto">
          <PaymentMethodForm 
            onSave={handleSavePaymentMethod}
            hasPaymentMethod={hasPaymentMethod}
          />
          <div className="mt-4 flex justify-end">
            <Button variant="ghost" onClick={() => setShowPaymentForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <PricingPlanCard
                key={plan.id}
                plan={plan}
                isActive={plan.id === currentPlanId}
                onSelect={handleSelectPlan}
              />
            ))}
          </div>
          
          {!hasPaymentMethod && (
            <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-700">
              <h3 className="font-semibold mb-2">Payment Method Required</h3>
              <p className="text-sm">
                You need to add a payment method to subscribe to paid plans.
              </p>
              <button
                onClick={() => setShowPaymentForm(true)}
                className="mt-2 text-sm font-medium text-primary hover:underline"
              >
                Add payment method
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
} 