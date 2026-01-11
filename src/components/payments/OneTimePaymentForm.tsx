import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Lock, ShoppingCart, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

interface OneTimePaymentFormProps {
  productName: string;
  amount: number; // in cents
  description?: string;
  imageUrl?: string;
  metadata?: Record<string, string>;
  onSuccess?: (paymentIntentId: string) => void;
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
    },
    invalid: {
      color: 'hsl(0, 84%, 60%)',
      iconColor: 'hsl(0, 84%, 60%)',
    },
  },
  hidePostalCode: false,
};

export function OneTimePaymentForm({
  productName,
  amount,
  description,
  imageUrl,
  metadata,
  onSuccess,
  onCancel,
}: OneTimePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  const displayAmount = (amount / 100).toFixed(2);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      setError('Stripe has not loaded yet. Please try again.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
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

      // Create payment intent on server
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData?.session) {
        throw new Error('Please sign in to make a purchase');
      }

      const response = await supabase.functions.invoke('stripe-checkout', {
        body: {
          action: 'create-payment-intent',
          paymentMethodId: paymentMethod.id,
          amount,
          productName,
          description,
          metadata,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { clientSecret, paymentIntentId, requiresAction } = response.data;

      // Confirm the payment
      if (requiresAction && clientSecret) {
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret);
        
        if (confirmError) {
          throw new Error(confirmError.message);
        }

        if (paymentIntent?.status === 'succeeded') {
          setSucceeded(true);
          toast.success('🎉 Payment successful!', {
            description: `Thank you for your purchase of ${productName}!`,
          });
          onSuccess?.(paymentIntentId);
        }
      } else if (response.data.status === 'succeeded') {
        setSucceeded(true);
        toast.success('🎉 Payment successful!', {
          description: `Thank you for your purchase of ${productName}!`,
        });
        onSuccess?.(paymentIntentId);
      }
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
          Thank you for purchasing {productName}!
        </p>
      </motion.div>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center gap-4">
          {imageUrl && (
            <img 
              src={imageUrl} 
              alt={productName} 
              className="w-16 h-16 rounded-lg object-cover"
            />
          )}
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              {productName}
            </CardTitle>
            {description && (
              <CardDescription>{description}</CardDescription>
            )}
          </div>
          <Badge variant="outline" className="text-lg font-bold">
            ${displayAmount}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Card Information
            </label>
            <div className="p-4 rounded-lg border bg-card/50">
              <CardElement options={cardElementOptions} />
            </div>
          </div>

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
                  Pay ${displayAmount}
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

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Lock className="w-3 h-3" />
            <span>Secured by Stripe. We never store your card details.</span>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
