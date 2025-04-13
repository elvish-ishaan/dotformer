"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BillingSummaryCard from '@/components/BillingSummaryCard';
import BillingHistoryTable from '@/components/BillingHistoryTable';
import UsageChart from '@/components/UsageChart';
import billingService, { Bill, UsageStats } from '@/lib/services/billingService';

export default function BillingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for billing data
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [billingHistory, setBillingHistory] = useState<Bill[]>([]);
  
  // Fetch billing data
  useEffect(() => {
    const fetchBillingData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch usage statistics
        const usageResponse = await billingService.getCurrentUsage();
        setUsageStats(usageResponse);
        
        // Fetch billing history
        const historyResponse = await billingService.getBillingHistory();
        setBillingHistory(historyResponse.bills);
      } catch (err) {
        console.error('Error fetching billing data:', err);
        setError('Failed to load billing data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBillingData();
  }, []);
  
  // Handle view details click
  const handleViewDetails = () => {
    setActiveTab('history');
  };
  
  // If loading, show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Billing & Usage</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading billing data...</p>
        </div>
      </div>
    );
  }
  
  // If error, show error state
  if (error) {
    return (
      <div className="flex flex-col space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Billing & Usage</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }
  
  // If no usage data yet, show empty state
  if (!usageStats) {
    return (
      <div className="flex flex-col space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Billing & Usage</h1>
        </div>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <p className="text-muted-foreground">No billing data available yet</p>
          <button
            onClick={() => router.push('/plans')}
            className="text-primary hover:underline"
          >
            View pricing plans
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Billing & Usage</h1>
        <button
          onClick={() => router.push('/billing/plans')}
          className="text-primary hover:underline"
        >
          Manage subscription
        </button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="usage">Usage Details</TabsTrigger>
          <TabsTrigger value="history">Billing History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <BillingSummaryCard 
                usageStats={usageStats}
                onViewDetails={handleViewDetails}
              />
            </div>
            <div className="md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <UsageChart 
                  usageStats={usageStats}
                  type="api"
                  title="API Calls"
                  description="Total API calls this month"
                />
                <UsageChart 
                  usageStats={usageStats}
                  type="storage"
                  title="Storage"
                  description="Total storage used"
                />
                <UsageChart 
                  usageStats={usageStats}
                  type="transform"
                  title="Transformations"
                  description="Image transformations this month"
                />
                <UsageChart 
                  usageStats={usageStats}
                  type="upload"
                  title="Uploads"
                  description="Total uploads this month"
                />
              </div>
            </div>
          </div>
          
          {billingHistory.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Recent Billing History</h2>
              <BillingHistoryTable bills={billingHistory.slice(0, 3)} />
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="usage" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <UsageChart 
              usageStats={usageStats}
              type="api"
              title="API Calls"
              description="Total API calls this month"
            />
            <UsageChart 
              usageStats={usageStats}
              type="storage"
              title="Storage"
              description="Total storage used"
            />
            <UsageChart 
              usageStats={usageStats}
              type="transform"
              title="Transformations"
              description="Image transformations this month"
            />
            <UsageChart 
              usageStats={usageStats}
              type="upload"
              title="Uploads"
              description="Total uploads this month"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4">Billing History</h2>
              <BillingHistoryTable bills={billingHistory} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 