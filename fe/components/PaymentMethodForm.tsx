import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PaymentMethodFormProps {
  onSave: (paymentDetails: any) => Promise<void>;
  hasPaymentMethod: boolean;
}

const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({ 
  onSave,
  hasPaymentMethod 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // In a real app, this would use a proper payment integration library
  // like Stripe Elements for secure payment collection
  // For now, we'll use a simplified form for demonstration
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvc: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // In a real app, you would tokenize this data with a payment processor
      // and only send the token to your server
      const paymentMethodId = `pm_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      
      await onSave({ paymentMethodId });
    } catch (error) {
      console.error('Error saving payment method:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Payment Method</CardTitle>
        <CardDescription>
          {hasPaymentMethod 
            ? 'Update your payment details'
            : 'Add a payment method to use pay-as-you-go features'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardholderName">Cardholder Name</Label>
            <Input
              id="cardholderName"
              name="cardholderName"
              placeholder="Jane Smith"
              value={formData.cardholderName}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              name="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={formData.cardNumber}
              onChange={handleChange}
              required
              maxLength={19}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                name="expiryDate"
                placeholder="MM/YY"
                value={formData.expiryDate}
                onChange={handleChange}
                required
                maxLength={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvc">CVC</Label>
              <Input
                id="cvc"
                name="cvc"
                placeholder="123"
                value={formData.cvc}
                onChange={handleChange}
                required
                maxLength={3}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : hasPaymentMethod ? 'Update Payment Method' : 'Add Payment Method'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default PaymentMethodForm; 