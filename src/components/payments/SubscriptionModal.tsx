import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StripeProvider } from './StripeProvider';
import { PaymentForm } from './PaymentForm';
import { STRIPE_PLANS, StripePlanId } from '@/lib/stripe';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';

interface SubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: StripePlanId;
  onSuccess?: () => void;
}

export function SubscriptionModal({ open, onOpenChange, plan, onSuccess }: SubscriptionModalProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const planConfig = STRIPE_PLANS[plan];

  const handleSuccess = () => {
    onSuccess?.();
    setTimeout(() => {
      onOpenChange(false);
      window.location.reload(); // Refresh to update subscription status
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Subscribe to {planConfig.name}
            {'popular' in planConfig && planConfig.popular && (
              <Badge className="bg-primary text-primary-foreground text-xs">Popular</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Unlock all {planConfig.name} features with secure Stripe payment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Billing Cycle Toggle */}
          <Tabs value={billingCycle} onValueChange={(v) => setBillingCycle(v as 'monthly' | 'annual')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="monthly">
                Monthly - ${planConfig.displayPrice}/mo
              </TabsTrigger>
              <TabsTrigger value="annual" className="relative">
                Annual - ${Math.round(planConfig.annualPrice / 100)}/yr
                <Badge className="absolute -top-2 -right-2 text-[10px] bg-success">
                  Save 20%
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Features List */}
          <div className="grid grid-cols-2 gap-2">
            {planConfig.features.map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-3 h-3 text-success shrink-0" />
                <span className="text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>

          {/* Payment Form */}
          <StripeProvider>
            <PaymentForm
              plan={plan}
              billingCycle={billingCycle}
              onSuccess={handleSuccess}
              onCancel={() => onOpenChange(false)}
            />
          </StripeProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
}
