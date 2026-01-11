import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Lock, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { STRIPE_PLANS, StripePlanId } from '@/lib/stripe';
import { motion, AnimatePresence } from 'framer-motion';

interface PaymentFormProps {
  plan: StripePlanId;
  billingCycle?: 'monthly' | 'annual';
  onSuccess?: () => void;
  onCancel?: () => void;
}

const cardElementOptions = {
  style: {
    base: {
      color: 'hsl(0, 0%, 98%)',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: 'hsl(240, 5%, 50%)',
      },
      backgroundColor: 'transparent',
    },
    invalid: {
      color: 'hsl(0, 84%, 60%)',
      iconColor: 'hsl(0, 84%, 60%)',
    },
  },
  hidePostalCode: false,
};

export function PaymentForm({ plan, billingCycle = 'monthly', onSuccess, onCancel }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  const planConfig = STRIPE_PLANS[plan];
  const price = billingCycle === 'annual' 
    ? Math.round(planConfig.annualPrice / 100) 
    : planConfig.displayPrice;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      setError('Stripe has not loaded yet. Please try again.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Get card element
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Create payment method
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (pmError) {
        throw new Error(pmError.message);
      }

      // Send to server to create subscription
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData?.session) {
        throw new Error('Please sign in to subscribe');
      }

      const response = await supabase.functions.invoke('stripe-checkout', {
        body: {
          action: 'create-subscription-direct',
          paymentMethodId: paymentMethod.id,
          plan,
          billingCycle,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { subscription, clientSecret, requiresAction } = response.data;

      // Handle 3D Secure authentication if required
      if (requiresAction && clientSecret) {
        const { error: confirmError } = await stripe.confirmCardPayment(clientSecret);
        
        if (confirmError) {
          throw new Error(confirmError.message);
        }
      }

      // Success!
      setSucceeded(true);
      toast.success('🎉 Subscription activated!', {
        description: `Welcome to ${planConfig.name}! Your subscription is now active.`,
      });
      
      onSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment failed';
      setError(message);
      toast.error('Payment failed', { description: message });
    } finally {
      setIsProcessing(false);
    }
  };

  if (succeeded) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-success" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
        <p className="text-muted-foreground">
          Your {planConfig.name} subscription is now active.
        </p>
      </motion.div>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Subscribe to {planConfig.name}
            </CardTitle>
            <CardDescription>
              {billingCycle === 'annual' ? 'Annual billing (save 20%)' : 'Monthly billing'}
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-lg font-bold">
            ${price}/{billingCycle === 'annual' ? 'yr' : 'mo'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card Element Container */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Card Information
            </label>
            <div className="p-4 rounded-lg border bg-card/50">
              <CardElement options={cardElementOptions} />
            </div>
          </div>

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Features Summary */}
          <div className="p-3 rounded-lg bg-muted/30 space-y-2">
            <p className="text-sm font-medium">Includes:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {planConfig.features.slice(0, 3).map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-success" />
                  {feature}
                </li>
              ))}
              {planConfig.features.length > 3 && (
                <li className="text-xs">+ {planConfig.features.length - 3} more features</li>
              )}
            </ul>
          </div>

          {/* Submit Button */}
          <div className="space-y-3">
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={!stripe || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Subscribe for ${price}/{billingCycle === 'annual' ? 'year' : 'month'}
                </>
              )}
            </Button>
            
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={onCancel}
                disabled={isProcessing}
              >
                Cancel
              </Button>
            )}
          </div>

          {/* Security Notice */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Lock className="w-3 h-3" />
            <span>Secured by Stripe. We never store your card details.</span>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
