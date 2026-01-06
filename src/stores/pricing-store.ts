import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * DOMINION TIER SYSTEM
 * 
 * CORE: Self-serve, limited automation, entry price
 * SCALE: Advanced automation, high-ticket close tools, partial white-label
 * DOMINION: Full system access, $100K+ one-call close, full white-label
 */

export type TierLevel = 'core' | 'scale' | 'dominion';
export type WhiteLabelLevel = 'none' | 'partial' | 'full';

export interface TierConfig {
  id: TierLevel;
  name: string;
  tagline: string;
  price: {
    monthly: number;
    annual: number;
  };
  replacementValue: string; // What it replaces
  features: string[];
  limits: {
    automations: number | 'unlimited';
    stores: number | 'unlimited';
    aiCredits: number | 'unlimited';
    videoCredits: number | 'unlimited';
  };
  capabilities: {
    highTicketClose: boolean;
    oneCallClose: boolean;
    whiteLabelLevel: WhiteLabelLevel;
    industryAdaptation: boolean;
    selfMarketing: boolean;
    dedicatedInstance: boolean;
    enterpriseControls: boolean;
    founderMode: boolean;
  };
}

export const TIER_CONFIGS: Record<TierLevel, TierConfig> = {
  core: {
    id: 'core',
    name: 'CORE',
    tagline: 'Autonomous Foundation',
    price: {
      monthly: 497,
      annual: 4970, // 2 months free
    },
    replacementValue: 'Replaces: 1 junior marketer ($4,500/mo)',
    features: [
      'Autonomous ad generation',
      'Basic performance optimization',
      'Single store connection',
      'Comment-to-DM automation',
      'Standard AI credits',
      'Email support',
    ],
    limits: {
      automations: 50,
      stores: 1,
      aiCredits: 1000,
      videoCredits: 10,
    },
    capabilities: {
      highTicketClose: false,
      oneCallClose: false,
      whiteLabelLevel: 'none',
      industryAdaptation: false,
      selfMarketing: false,
      dedicatedInstance: false,
      enterpriseControls: false,
      founderMode: false,
    },
  },
  scale: {
    id: 'scale',
    name: 'SCALE',
    tagline: 'Full Automation',
    price: {
      monthly: 1497,
      annual: 14970,
    },
    replacementValue: 'Replaces: Creative agency ($15,000/mo)',
    features: [
      'Everything in CORE',
      'High-Ticket Close Variant™',
      'Industry Adaptation Engine',
      'Multi-store management',
      'Advanced proof compounding',
      'Competitive kill automation',
      'Partial white-label',
      'Priority support',
    ],
    limits: {
      automations: 500,
      stores: 5,
      aiCredits: 10000,
      videoCredits: 100,
    },
    capabilities: {
      highTicketClose: true,
      oneCallClose: false,
      whiteLabelLevel: 'partial',
      industryAdaptation: true,
      selfMarketing: false,
      dedicatedInstance: false,
      enterpriseControls: false,
      founderMode: false,
    },
  },
  dominion: {
    id: 'dominion',
    name: 'DOMINION',
    tagline: 'Total Control',
    price: {
      monthly: 4997,
      annual: 49970,
    },
    replacementValue: 'Replaces: Full marketing team ($52,200/mo)',
    features: [
      'Everything in SCALE',
      '$100K+ One-Call Close Variant™',
      'Founder Intimidation Mode™',
      'Full white-label deployment',
      'Dedicated instance',
      'Enterprise-grade controls',
      'Self-marketing engine',
      'Custom integrations',
      'Dedicated success manager',
      'Unlimited everything',
    ],
    limits: {
      automations: 'unlimited',
      stores: 'unlimited',
      aiCredits: 'unlimited',
      videoCredits: 'unlimited',
    },
    capabilities: {
      highTicketClose: true,
      oneCallClose: true,
      whiteLabelLevel: 'full',
      industryAdaptation: true,
      selfMarketing: true,
      dedicatedInstance: true,
      enterpriseControls: true,
      founderMode: true,
    },
  },
};

interface PricingState {
  // Current selection
  selectedTier: TierLevel | null;
  billingCycle: 'monthly' | 'annual';
  
  // Checkout state
  checkoutStep: 'select' | 'configure' | 'payment' | 'onboarding' | 'complete';
  isProcessing: boolean;
  
  // White-label config
  whiteLabelConfig: {
    brandName: string;
    logoUrl: string;
    primaryColor: string;
    customDomain: string;
  } | null;
  
  // Recommendation engine
  recommendedTier: TierLevel | null;
  recommendationReason: string | null;
  
  // Actions
  selectTier: (tier: TierLevel) => void;
  setBillingCycle: (cycle: 'monthly' | 'annual') => void;
  setCheckoutStep: (step: PricingState['checkoutStep']) => void;
  setProcessing: (processing: boolean) => void;
  setWhiteLabelConfig: (config: PricingState['whiteLabelConfig']) => void;
  calculateRecommendation: (inputs: {
    industry?: string;
    dealSize?: string;
    teamSize?: number;
    currentSpend?: number;
  }) => void;
  reset: () => void;
}

export const usePricingStore = create<PricingState>()(
  persist(
    (set) => ({
      selectedTier: null,
      billingCycle: 'annual',
      checkoutStep: 'select',
      isProcessing: false,
      whiteLabelConfig: null,
      recommendedTier: null,
      recommendationReason: null,
      
      selectTier: (tier) => set({ selectedTier: tier }),
      setBillingCycle: (cycle) => set({ billingCycle: cycle }),
      setCheckoutStep: (step) => set({ checkoutStep: step }),
      setProcessing: (processing) => set({ isProcessing: processing }),
      setWhiteLabelConfig: (config) => set({ whiteLabelConfig: config }),
      
      calculateRecommendation: (inputs) => {
        let recommended: TierLevel = 'core';
        let reason = 'Entry-level automation';
        
        // Deal size determines tier
        if (inputs.dealSize === 'enterprise' || (inputs.currentSpend && inputs.currentSpend > 50000)) {
          recommended = 'dominion';
          reason = 'Enterprise deals require $100K+ Close Variant and full control';
        } else if (inputs.dealSize === 'high' || (inputs.teamSize && inputs.teamSize > 5)) {
          recommended = 'scale';
          reason = 'High-ticket operations benefit from advanced automation';
        } else if (inputs.industry === 'saas' || inputs.industry === 'agency') {
          recommended = 'scale';
          reason = 'Industry requires multi-client management';
        }
        
        set({ recommendedTier: recommended, recommendationReason: reason });
      },
      
      reset: () => set({
        selectedTier: null,
        checkoutStep: 'select',
        isProcessing: false,
        whiteLabelConfig: null,
      }),
    }),
    {
      name: 'dominion-pricing',
    }
  )
);
