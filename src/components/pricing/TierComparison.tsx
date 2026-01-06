import { motion } from 'framer-motion';
import { 
  Check, 
  X, 
  Zap, 
  Crown, 
  Shield,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TierLevel, TIER_CONFIGS, usePricingStore } from '@/stores/pricing-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * AUTONOMOUS TIER COMPARISON
 * 
 * Clear tiering that:
 * - Avoids feature overload
 * - Anchors high value against replacement cost
 * - Recommends tier based on customer inputs
 */

interface TierComparisonProps {
  onSelectTier: (tier: TierLevel) => void;
  showRecommendation?: boolean;
}

export const TierComparison = ({ 
  onSelectTier,
  showRecommendation = true 
}: TierComparisonProps) => {
  const { 
    billingCycle, 
    setBillingCycle, 
    recommendedTier, 
    recommendationReason 
  } = usePricingStore();
  
  const tiers: TierLevel[] = ['core', 'scale', 'dominion'];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Billing Toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-card border border-border">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors",
              billingCycle === 'monthly'
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
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
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Annual
            <Badge variant="secondary" className="ml-2 text-[10px]">
              Save 17%
            </Badge>
          </button>
        </div>
      </div>

      {/* Recommendation */}
      {showRecommendation && recommendedTier && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 mb-6 p-3 rounded-lg bg-primary/10 border border-primary/20"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm">
            Recommended: <span className="font-semibold">{TIER_CONFIGS[recommendedTier].name}</span>
            {recommendationReason && (
              <span className="text-muted-foreground"> — {recommendationReason}</span>
            )}
          </span>
        </motion.div>
      )}

      {/* Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tierId, index) => {
          const tier = TIER_CONFIGS[tierId];
          const isRecommended = tierId === recommendedTier;
          const isDominion = tierId === 'dominion';
          
          const price = billingCycle === 'monthly' 
            ? tier.price.monthly 
            : Math.round(tier.price.annual / 12);

          return (
            <motion.div
              key={tierId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "relative p-6 rounded-xl border transition-all duration-300",
                isDominion 
                  ? "bg-gradient-to-b from-primary/10 to-card border-primary/30 shadow-[0_0_40px_-10px_hsl(var(--primary)/0.3)]"
                  : "bg-card border-border hover:border-border/80",
                isRecommended && !isDominion && "ring-2 ring-primary/30"
              )}
            >
              {/* Recommended badge */}
              {isRecommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Recommended
                  </Badge>
                </div>
              )}

              {/* Tier header */}
              <div className="text-center mb-6">
                <div className={cn(
                  "inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3",
                  isDominion ? "bg-primary/20" : "bg-secondary"
                )}>
                  {tierId === 'core' && <Zap className="w-6 h-6 text-primary" />}
                  {tierId === 'scale' && <Shield className="w-6 h-6 text-primary" />}
                  {tierId === 'dominion' && <Crown className="w-6 h-6 text-primary" />}
                </div>
                
                <h3 className="text-xl font-bold">{tier.name}</h3>
                <p className="text-sm text-muted-foreground">{tier.tagline}</p>
              </div>

              {/* Price - visually smaller than replacement value */}
              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold">${price.toLocaleString()}</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
                {billingCycle === 'annual' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    ${tier.price.annual.toLocaleString()}/year billed annually
                  </p>
                )}
              </div>

              {/* Replacement value - larger emphasis */}
              <div className="p-3 rounded-lg bg-success/10 border border-success/20 mb-6">
                <p className="text-xs text-success text-center font-medium">
                  {tier.replacementValue}
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                {tier.features.slice(0, 6).map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
                {tier.features.length > 6 && (
                  <li className="text-xs text-muted-foreground text-center">
                    +{tier.features.length - 6} more capabilities
                  </li>
                )}
              </ul>

              {/* CTA - Activation language */}
              <Button
                onClick={() => onSelectTier(tierId)}
                className={cn(
                  "w-full",
                  isDominion && "bg-primary hover:bg-primary/90 shadow-[0_0_20px_-5px_hsl(var(--primary)/0.5)]"
                )}
                variant={isDominion ? "default" : "outline"}
              >
                {isDominion ? 'Request Access' : 'Activate'} {tier.name}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-sm text-muted-foreground mt-8"
      >
        All tiers include 14-day activation guarantee. 
        Cancel within 14 days for a full refund.
      </motion.p>
    </div>
  );
};

/**
 * Minimal tier comparison for embedded use
 */
export const TierComparisonMini = ({ 
  currentTier,
  onUpgrade 
}: { 
  currentTier: TierLevel;
  onUpgrade: (tier: TierLevel) => void;
}) => {
  const tiers: TierLevel[] = ['core', 'scale', 'dominion'];
  const currentIndex = tiers.indexOf(currentTier);

  return (
    <div className="flex gap-2">
      {tiers.map((tierId, index) => {
        const tier = TIER_CONFIGS[tierId];
        const isActive = tierId === currentTier;
        const isUpgrade = index > currentIndex;

        return (
          <button
            key={tierId}
            onClick={() => isUpgrade && onUpgrade(tierId)}
            disabled={!isUpgrade}
            className={cn(
              "flex-1 p-3 rounded-lg border text-center transition-all",
              isActive && "bg-primary/10 border-primary/30",
              isUpgrade && "hover:border-primary/50 cursor-pointer",
              !isActive && !isUpgrade && "opacity-50 cursor-not-allowed"
            )}
          >
            <p className="text-xs font-medium">{tier.name}</p>
            <p className="text-[10px] text-muted-foreground">
              ${tier.price.monthly}/mo
            </p>
          </button>
        );
      })}
    </div>
  );
};
