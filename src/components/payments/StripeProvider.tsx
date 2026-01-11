import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe';

interface StripeProviderProps {
  children: React.ReactNode;
}

const stripeOptions = {
  appearance: {
    theme: 'night' as const,
    variables: {
      colorPrimary: 'hsl(262, 83%, 58%)',
      colorBackground: 'hsl(240, 10%, 3.9%)',
      colorText: 'hsl(0, 0%, 98%)',
      colorDanger: 'hsl(0, 84%, 60%)',
      fontFamily: 'Inter, system-ui, sans-serif',
      borderRadius: '8px',
    },
    rules: {
      '.Input': {
        backgroundColor: 'hsl(240, 10%, 10%)',
        border: '1px solid hsl(240, 3.7%, 15.9%)',
      },
      '.Input:focus': {
        border: '1px solid hsl(262, 83%, 58%)',
        boxShadow: '0 0 0 2px hsla(262, 83%, 58%, 0.2)',
      },
      '.Label': {
        color: 'hsl(240, 5%, 64.9%)',
      },
    },
  },
};

export function StripeProvider({ children }: StripeProviderProps) {
  return (
    <Elements stripe={getStripe()} options={stripeOptions}>
      {children}
    </Elements>
  );
}
