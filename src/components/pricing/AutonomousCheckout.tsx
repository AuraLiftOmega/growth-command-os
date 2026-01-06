import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Building2, 
  CheckCircle2, 
  Loader2,
  ArrowLeft,
  Zap,
  Shield,
  Crown,
  Receipt
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { TierLevel, TIER_CONFIGS, usePricingStore } from '@/stores/pricing-store';
import { TierComparison } from './TierComparison';
import { WhiteLabelConfig } from './WhiteLabelConfig';
import { ActivationReadyState } from './EnterpriseCloseVariant';

/**
 * AUTONOMOUS CHECKOUT & ONBOARDING
 * 
 * - Display tier comparison clearly
 * - Recommend tier based on customer inputs
 * - Allow instant payment
 * - Auto-provision access
 * - Trigger onboarding flows automatically
 * 
 * No human involvement required.
 */

export const AutonomousCheckout = () => {
  const { 
    selectedTier, 
    selectTier,
    billingCycle,
    checkoutStep,
    setCheckoutStep,
    isProcessing,
    setProcessing,
    whiteLabelConfig,
    setWhiteLabelConfig,
    reset
  } = usePricingStore();

  const handleTierSelect = (tier: TierLevel) => {
    selectTier(tier);
    
    // DOMINION tier goes through enterprise close flow
    if (tier === 'dominion') {
      setCheckoutStep('configure');
    } else {
      setCheckoutStep('payment');
    }
  };

  const handlePaymentComplete = async () => {
    setProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setProcessing(false);
    setCheckoutStep('onboarding');
  };

  const handleOnboardingComplete = () => {
    setCheckoutStep('complete');
  };

  return (
    <div className="min-h-screen bg-background">
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
            </div>
            
            <TierComparison onSelectTier={handleTierSelect} />
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
                    setCheckoutStep('payment');
                  }}
                  onCancel={() => setCheckoutStep('select')}
                />
              ) : (
                <PaymentForm 
                  tier={selectedTier}
                  onComplete={handlePaymentComplete}
                  onBack={() => setCheckoutStep('select')}
                />
              )}
            </div>
          </CheckoutStepWrapper>
        )}

        {checkoutStep === 'payment' && selectedTier && (
          <CheckoutStepWrapper key="payment">
            <div className="max-w-xl mx-auto">
              <BackButton onClick={() => setCheckoutStep('select')} />
              
              <PaymentForm 
                tier={selectedTier}
                onComplete={handlePaymentComplete}
                onBack={() => setCheckoutStep('select')}
              />
            </div>
          </CheckoutStepWrapper>
        )}

        {checkoutStep === 'onboarding' && selectedTier && (
          <ActivationReadyState 
            isActive={true}
            tierName={TIER_CONFIGS[selectedTier].name}
            onConfirm={handleOnboardingComplete}
            onBack={() => setCheckoutStep('payment')}
          />
        )}

        {checkoutStep === 'complete' && selectedTier && (
          <CheckoutStepWrapper key="complete">
            <ActivationComplete tier={selectedTier} />
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
 * Payment Form Component
 */
const PaymentForm = ({ 
  tier, 
  onComplete,
  onBack
}: { 
  tier: TierLevel;
  onComplete: () => void;
  onBack: () => void;
}) => {
  const { billingCycle, isProcessing, setProcessing } = usePricingStore();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'invoice'>('card');
  const config = TIER_CONFIGS[tier];
  
  const price = billingCycle === 'monthly' 
    ? config.price.monthly 
    : config.price.annual;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    
    // Simulate payment
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setProcessing(false);
    onComplete();
  };

  return (
    <div>
      <div className="text-center mb-8">
        <div className={cn(
          "inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3",
          tier === 'dominion' ? "bg-primary/20" : "bg-secondary"
        )}>
          {tier === 'core' && <Zap className="w-6 h-6 text-primary" />}
          {tier === 'scale' && <Shield className="w-6 h-6 text-primary" />}
          {tier === 'dominion' && <Crown className="w-6 h-6 text-primary" />}
        </div>
        <h2 className="text-2xl font-bold">{config.name} Activation</h2>
        <p className="text-muted-foreground">{config.tagline}</p>
      </div>

      {/* Order summary */}
      <div className="p-4 rounded-lg bg-card border border-border mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm">{config.name} ({billingCycle})</span>
          <span className="font-semibold">${price.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>Billed {billingCycle}</span>
          {billingCycle === 'annual' && (
            <span className="text-success">Save ${(config.price.monthly * 12 - config.price.annual).toLocaleString()}</span>
          )}
        </div>
      </div>

      {/* Replacement value reminder */}
      <div className="p-3 rounded-lg bg-success/10 border border-success/20 mb-6">
        <p className="text-xs text-success text-center">
          {config.replacementValue}
        </p>
      </div>

      {/* Payment method toggle */}
      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setPaymentMethod('card')}
          className={cn(
            "flex-1 p-3 rounded-lg border flex items-center justify-center gap-2 transition-colors",
            paymentMethod === 'card' 
              ? "bg-primary/10 border-primary/30" 
              : "border-border hover:border-border/80"
          )}
        >
          <CreditCard className="w-4 h-4" />
          <span className="text-sm font-medium">Card</span>
        </button>
        <button
          type="button"
          onClick={() => setPaymentMethod('invoice')}
          className={cn(
            "flex-1 p-3 rounded-lg border flex items-center justify-center gap-2 transition-colors",
            paymentMethod === 'invoice' 
              ? "bg-primary/10 border-primary/30" 
              : "border-border hover:border-border/80"
          )}
        >
          <Receipt className="w-4 h-4" />
          <span className="text-sm font-medium">Invoice</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {paymentMethod === 'card' ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="4242 4242 4242 4242"
                className="bg-card"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry</Label>
                <Input id="expiry" placeholder="MM/YY" className="bg-card" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input id="cvc" placeholder="123" className="bg-card" />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input id="companyName" placeholder="Acme Inc." className="bg-card" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billingEmail">Billing Email</Label>
              <Input id="billingEmail" type="email" placeholder="billing@company.com" className="bg-card" />
            </div>
          </>
        )}

        <Button 
          type="submit" 
          className="w-full mt-6"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Activate {config.name}
            </>
          )}
        </Button>
      </form>

      <p className="text-xs text-center text-muted-foreground mt-4">
        14-day activation guarantee. Cancel anytime.
      </p>
    </div>
  );
};

/**
 * Activation Complete State
 */
const ActivationComplete = ({ tier }: { tier: TierLevel }) => {
  const config = TIER_CONFIGS[tier];

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
          {config.name} Activated
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
        <StatusLine status="complete" text="Access provisioned" />
        <StatusLine status="active" text="Industry configuration initializing..." />
        <StatusLine status="pending" text="First automation deployment" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Button size="lg" onClick={() => window.location.href = '/dashboard'}>
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
  <div className="flex items-center gap-3 text-sm">
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
