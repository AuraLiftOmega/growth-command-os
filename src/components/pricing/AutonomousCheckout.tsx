import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  CheckCircle2, 
  Loader2,
  ArrowLeft,
  Zap,
  Shield,
  Crown,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TierLevel, TIER_CONFIGS, usePricingStore } from '@/stores/pricing-store';
import { TierComparison } from './TierComparison';
import { WhiteLabelConfig } from './WhiteLabelConfig';
import { ActivationReadyState } from './EnterpriseCloseVariant';
import { useStripeCheckout, StripePlan } from '@/hooks/useStripeCheckout';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

/**
 * AUTONOMOUS CHECKOUT WITH STRIPE
 * 
 * - Real Stripe Checkout integration
 * - Tier comparison with replacement cost anchoring
 * - God-mode bypass for admin
 * - 14-day trial for all paid plans
 */

// Map our tier names to Stripe plan keys
const TIER_TO_STRIPE: Record<TierLevel, StripePlan | null> = {
  core: 'starter',
  scale: 'growth', 
  dominion: 'enterprise',
};

export const AutonomousCheckout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription, isAdmin, isLoading: subLoading } = useSubscription();
  const { createCheckoutSession, isLoading: checkoutLoading } = useStripeCheckout();
  
  const { 
    selectedTier, 
    selectTier,
    billingCycle,
    setBillingCycle,
    checkoutStep,
    setCheckoutStep,
    whiteLabelConfig,
    setWhiteLabelConfig,
  } = usePricingStore();

  // Handle success/cancel from Stripe
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const plan = searchParams.get('plan');

    if (success === 'true') {
      toast.success('Subscription activated!', {
        description: `Your ${plan || 'new'} plan is now active. Welcome aboard!`,
      });
      setCheckoutStep('complete');
      // Clear URL params
      navigate('/pricing', { replace: true });
    } else if (canceled === 'true') {
      toast.info('Checkout canceled', {
        description: 'No worries! Your subscription wasn\'t changed.',
      });
      navigate('/pricing', { replace: true });
    }
  }, [searchParams, navigate, setCheckoutStep]);

  const handleTierSelect = async (tier: TierLevel) => {
    selectTier(tier);
    
    // If not logged in, redirect to auth
    if (!user) {
      toast.info('Please sign in to subscribe');
      navigate('/auth?redirect=/pricing');
      return;
    }

    // DOMINION tier goes through enterprise close flow first
    if (tier === 'dominion') {
      setCheckoutStep('configure');
    } else {
      // For other tiers, go straight to Stripe
      await handleStripeCheckout(tier);
    }
  };

  const handleStripeCheckout = async (tier: TierLevel) => {
    const stripePlan = TIER_TO_STRIPE[tier];
    if (!stripePlan) {
      toast.error('Invalid plan selected');
      return;
    }

    const result = await createCheckoutSession(stripePlan, billingCycle);
    if (!result.success) {
      toast.error('Checkout failed', { description: result.error });
    }
    // If successful, user is redirected to Stripe
  };

  const handleConfigComplete = async () => {
    if (selectedTier) {
      await handleStripeCheckout(selectedTier);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* God Mode Banner */}
      {isAdmin && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-r from-amber-500/20 via-primary/20 to-amber-500/20 border-b border-amber-500/30 py-2 text-center"
        >
          <div className="flex items-center justify-center gap-2">
            <Crown className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-mono text-amber-500">
              GOD MODE ACTIVE — Unlimited Everything
            </span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {checkoutStep === 'select' && (
          <CheckoutStepWrapper key="select">
            <div className="text-center mb-12">
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-mono text-primary uppercase tracking-[0.3em] mb-2"
              >
                Revenue Infrastructure
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl font-bold mb-4"
              >
                Select Your Execution Level
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground max-w-xl mx-auto"
              >
                This is infrastructure, not software. 
                Each tier replaces labor costs, not adds them.
              </motion.p>

              {/* Current Plan Indicator */}
              {subscription && subscription.plan !== 'free' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20"
                >
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span className="text-sm text-success">
                    Current plan: {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}
                  </span>
                </motion.div>
              )}
            </div>

            {/* Billing Cycle Toggle */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center gap-2 p-1 rounded-lg bg-card border border-border">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    billingCycle === 'monthly' 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-secondary"
                  )}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    billingCycle === 'annual' 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-secondary"
                  )}
                >
                  Annual
                  <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-success/20 text-success">
                    Save 17%
                  </span>
                </button>
              </div>
            </div>
            
            <TierComparison onSelectTier={handleTierSelect} />

            {/* Test Mode Notice */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 text-center text-xs text-muted-foreground"
            >
              <p>Test mode: Use card 4242 4242 4242 4242, any future expiry, any CVC</p>
            </motion.div>
          </CheckoutStepWrapper>
        )}

        {checkoutStep === 'configure' && selectedTier && (
          <CheckoutStepWrapper key="configure">
            <div className="max-w-2xl mx-auto">
              <BackButton onClick={() => setCheckoutStep('select')} />
              
              {TIER_CONFIGS[selectedTier].capabilities.whiteLabelLevel !== 'none' ? (
                <WhiteLabelConfig 
                  accessLevel={TIER_CONFIGS[selectedTier].capabilities.whiteLabelLevel}
                  onSave={(config) => {
                    setWhiteLabelConfig(config);
                    handleConfigComplete();
                  }}
                  onCancel={() => setCheckoutStep('select')}
                />
              ) : (
                <StripeCheckoutButton 
                  tier={selectedTier}
                  billingCycle={billingCycle}
                  onCheckout={handleConfigComplete}
                  isLoading={checkoutLoading}
                />
              )}
            </div>
          </CheckoutStepWrapper>
        )}

        {checkoutStep === 'complete' && (
          <CheckoutStepWrapper key="complete">
            <ActivationComplete />
          </CheckoutStepWrapper>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Checkout step wrapper with consistent animation
 */
const CheckoutStepWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="p-8 pt-16"
  >
    {children}
  </motion.div>
);

const BackButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
  >
    <ArrowLeft className="w-4 h-4" />
    Back
  </button>
);

/**
 * Stripe Checkout Button for configured tiers
 */
const StripeCheckoutButton = ({ 
  tier, 
  billingCycle,
  onCheckout,
  isLoading,
}: { 
  tier: TierLevel;
  billingCycle: 'monthly' | 'annual';
  onCheckout: () => void;
  isLoading: boolean;
}) => {
  const config = TIER_CONFIGS[tier];
  const price = billingCycle === 'monthly' ? config.price.monthly : config.price.annual;

  return (
    <div className="text-center">
      <div className={cn(
        "inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4",
        tier === 'dominion' ? "bg-primary/20" : "bg-secondary"
      )}>
        {tier === 'core' && <Zap className="w-8 h-8 text-primary" />}
        {tier === 'scale' && <Shield className="w-8 h-8 text-primary" />}
        {tier === 'dominion' && <Crown className="w-8 h-8 text-primary" />}
      </div>
      
      <h2 className="text-2xl font-bold mb-2">{config.name}</h2>
      <p className="text-muted-foreground mb-4">{config.tagline}</p>
      
      <div className="text-3xl font-bold mb-2">
        ${price.toLocaleString()}
        <span className="text-base text-muted-foreground font-normal">
          /{billingCycle === 'monthly' ? 'mo' : 'yr'}
        </span>
      </div>

      <p className="text-xs text-success mb-6">{config.replacementValue}</p>

      <Button 
        size="lg" 
        onClick={onCheckout}
        disabled={isLoading}
        className="gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Preparing checkout...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4" />
            Proceed to Checkout
            <ExternalLink className="w-3 h-3" />
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground mt-4">
        14-day trial included. Cancel anytime.
      </p>
    </div>
  );
};

/**
 * Activation Complete State
 */
const ActivationComplete = () => {
  const { subscription } = useSubscription();
  const navigate = useNavigate();

  return (
    <div className="max-w-lg mx-auto text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/20 mb-6"
      >
        <CheckCircle2 className="w-10 h-10 text-success" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-xs font-mono text-success uppercase tracking-[0.3em] mb-2">
          Infrastructure Active
        </p>
        <h2 className="text-2xl font-bold mb-4">
          {subscription?.plan ? subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1) : 'Plan'} Activated
        </h2>
        <p className="text-muted-foreground mb-8">
          Your revenue infrastructure is now operational. 
          First automations are being deployed.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-3 mb-8"
      >
        <StatusLine status="complete" text="Payment processed" />
        <StatusLine status="complete" text="Subscription activated" />
        <StatusLine status="complete" text="Credits allocated" />
        <StatusLine status="active" text="Configuring your dashboard..." />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Button size="lg" onClick={() => navigate('/')}>
          Enter Command Center
        </Button>
      </motion.div>
    </div>
  );
};

const StatusLine = ({ 
  status, 
  text 
}: { 
  status: 'complete' | 'active' | 'pending';
  text: string;
}) => (
  <div className="flex items-center gap-3 text-sm justify-center">
    {status === 'complete' && <CheckCircle2 className="w-4 h-4 text-success" />}
    {status === 'active' && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
    {status === 'pending' && <div className="w-4 h-4 rounded-full border-2 border-border" />}
    <span className={cn(
      status === 'pending' && "text-muted-foreground"
    )}>
      {text}
    </span>
  </div>
);

export default AutonomousCheckout;
