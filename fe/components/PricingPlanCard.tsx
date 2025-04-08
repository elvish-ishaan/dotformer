import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PricingPlan } from '@/lib/services/billingService';
import { CheckIcon } from 'lucide-react';

interface PricingPlanCardProps {
  plan: PricingPlan;
  isActive?: boolean;
  onSelect: (planId: string) => void;
}

const PricingPlanCard: React.FC<PricingPlanCardProps> = ({
  plan,
  isActive = false,
  onSelect,
}) => {
  // Color accent based on plan name
  const getAccentColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free':
        return 'bg-slate-100';
      case 'basic':
        return 'bg-blue-100';
      case 'professional':
        return 'bg-purple-100';
      case 'enterprise':
        return 'bg-emerald-100';
      default:
        return 'bg-slate-100';
    }
  };

  return (
    <Card className={`w-full h-full flex flex-col border-2 ${isActive ? 'border-primary' : 'border-border'}`}>
      <CardHeader className={`${getAccentColor(plan.name)}`}>
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow pt-6">
        <ul className="space-y-3">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-start">
              <CheckIcon className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-4 pb-6">
        <Button 
          onClick={() => onSelect(plan.id)} 
          variant={isActive ? "secondary" : "default"}
          className="w-full"
          disabled={isActive}
        >
          {isActive ? 'Current Plan' : 'Select Plan'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PricingPlanCard; 