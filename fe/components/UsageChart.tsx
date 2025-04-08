import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UsageStats } from '@/lib/services/billingService';
import billingService from '@/lib/services/billingService';

interface UsageChartProps {
  usageStats: UsageStats;
  type: 'api' | 'storage' | 'transform' | 'upload';
  title: string;
  description?: string;
}

const UsageChart: React.FC<UsageChartProps> = ({
  usageStats,
  type,
  title,
  description,
}) => {
  // Find the usage for this type
  const usage = usageStats.usageByOperation[type];
  
  // If no usage data for this type, show empty state
  if (!usage) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="h-32 flex items-center justify-center">
          <p className="text-muted-foreground">No usage data available</p>
        </CardContent>
      </Card>
    );
  }

  // For demonstration purposes, we're creating a simple visual bar chart
  // In a real app, you might want to use a chart library like Chart.js or Recharts
  
  // Determine colors for each type
  const getBarColor = () => {
    switch (type) {
      case 'api':
        return 'bg-blue-500';
      case 'storage':
        return 'bg-purple-500';
      case 'transform':
        return 'bg-amber-500';
      case 'upload':
        return 'bg-emerald-500';
      default:
        return 'bg-slate-500';
    }
  };

  // Format the usage value based on type
  const formatUsage = () => {
    if (usage.unit === 'bytes') {
      return billingService.formatBytes(usage.total);
    } else if (type === 'transform') {
      return `${usage.total} transformations`;
    } else {
      return `${usage.total} ${usage.unit}`;
    }
  };

  // Calculate percentage for API/transform based on assumed quotas
  // This is just for visualization and would be replaced with real quota data
  const getPercentage = () => {
    const quotas = {
      api: 1000,
      storage: 104857600, // 100MB
      transform: 50,
      upload: 104857600, // 100MB
    };
    
    const maxValue = quotas[type] || 100;
    return Math.min(100, (usage.total / maxValue) * 100);
  };

  const percentage = getPercentage();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">{formatUsage()}</span>
        </div>
        
        <div className="h-4 bg-muted rounded-full overflow-hidden">
          <div 
            className={`h-full ${getBarColor()}`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UsageChart; 