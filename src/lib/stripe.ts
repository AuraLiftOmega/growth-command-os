import { loadStripe, Stripe } from '@stripe/stripe-js';

// Stripe configuration - uses env var for publishable key
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 
  import.meta.env.VITE_STRIPE_LIVE_PUBLISHABLE_KEY ||
  '';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

// Plan configurations matching server-side
export const STRIPE_PLANS = {
  starter: {
    name: 'Starter',
    monthlyPrice: 4900, // $49 in cents
    annualPrice: 47000, // $470/year
    displayPrice: 49,
    description: 'For growing businesses',
    features: [
      '3 Shopify store connections',
      '50 AI videos per month',
      'Unlimited social posts',
      'Advanced analytics',
      'Priority support',
      'CJ Dropshipping integration',
    ],
  },
  growth: {
    name: 'Pro',
    monthlyPrice: 9900, // $99
    annualPrice: 95000, // $950/year
    displayPrice: 99,
    description: 'For scaling businesses',
    popular: true,
    features: [
      '10 Shopify store connections',
      'Unlimited AI videos',
      'Unlimited social posts',
      'Super Grok CEO AI',
      'Autonomous campaigns',
      'White-label options',
      'Priority support',
    ],
  },
  enterprise: {
    name: 'Business',
    monthlyPrice: 29900, // $299
    annualPrice: 287000, // $2870/year
    displayPrice: 299,
    description: 'For large operations',
    features: [
      'Unlimited store connections',
      'Unlimited everything',
      'Custom AI training',
      'Dedicated account manager',
      'SLA guarantees',
      'Custom integrations',
      'Multi-user RBAC',
      'API access',
    ],
  },
} as const;

export type StripePlanId = keyof typeof STRIPE_PLANS;
