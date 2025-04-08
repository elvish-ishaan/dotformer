import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import billingService from '@/lib/services/billingService';
import { UsageStats } from '@/lib/services/billingService';

interface BillingSummaryCardProps {
  usageStats: UsageStats;
  onViewDetails: () => void;
}

const BillingSummaryCard: React.FC<BillingSummaryCardProps> = ({ 
  usageStats,
  onViewDetails
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Current Billing Summary</CardTitle>
        <CardDescription>
          Billing period: {new Date(usageStats.billingPeriod.start).toLocaleDateString()} - {new Date().toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Estimated Cost</span>
            <span className="text-xl font-semibold">{billingService.formatCurrency(usageStats.estimatedCost)}</span>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Usage Breakdown</h4>
            {Object.entries(usageStats.usageByOperation).map(([key, usage]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="capitalize">{key}:</span>
                <span>
                  {usage.unit === 'bytes' 
                    ? billingService.formatBytes(usage.total) 
                    : `${usage.total} ${usage.unit}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={onViewDetails} className="w-full">
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BillingSummaryCard; 