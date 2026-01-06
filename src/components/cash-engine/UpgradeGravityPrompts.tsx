import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, X, Zap, Shield, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useCashEngineStore, getUpgradeMessage } from '@/stores/cash-engine-store';
import { TIER_CONFIGS } from '@/stores/pricing-store';

/**
 * UPGRADE GRAVITY PROMPTS
 * 
 * Surface upgrade prompts based on usage, not ads.
 * Frame upgrades as "unlocking throughput," not features.
 */

interface UpgradePromptProps {
  currentTier: 'core' | 'scale';
  usagePercent: number;
  onUpgrade: () => void;
  onDismiss: () => void;
}

export const UpgradeGravityPrompt = ({ 
  currentTier, 
  usagePercent, 
  onUpgrade, 
  onDismiss 
}: UpgradePromptProps) => {
  const { upgradeGravityRules } = useCashEngineStore();
  
  // Find matching rule
  const rule = upgradeGravityRules.find(r => 
    r.fromTier === currentTier && 
    r.isActive && 
    r.triggerType === 'usage_limit'
  );

  if (!rule || usagePercent < rule.triggerThreshold) return null;

  const targetTier = rule.toTier as keyof typeof TIER_CONFIGS;
  const targetConfig = TIER_CONFIGS[targetTier];
  const message = getUpgradeMessage(rule.messagingStyle, rule.toTier);

  const icons = {
    core: Zap,
    scale: Shield,
    dominion: Crown,
  };
  const TargetIcon = icons[targetTier] || Crown;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 max-w-sm"
      >
        <div className="relative p-5 rounded-xl bg-card border border-border shadow-xl">
          {/* Dismiss */}
          <button
            onClick={onDismiss}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Usage indicator */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${usagePercent}%` }}
                className={cn(
                  "h-full rounded-full",
                  usagePercent >= 90 ? "bg-destructive" : "bg-warning"
                )}
              />
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              {usagePercent}%
            </span>
          </div>

          {/* Message */}
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
              <TargetIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold mb-1">{message}</p>
              <p className="text-sm text-muted-foreground">
                You're approaching your {currentTier.toUpperCase()} capacity limits.
              </p>
            </div>
          </div>

          {/* Constraint reminder */}
          <p className="text-xs text-muted-foreground mb-4 p-2 rounded bg-secondary/50">
            {targetConfig.replacementValue}
          </p>

          {/* CTA */}
          <Button onClick={onUpgrade} className="w-full">
            Unlock {targetConfig.name}
            <ArrowUpRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Inline upgrade gravity (for embedding in panels)
 */
export const InlineUpgradeGravity = ({ 
  currentTier,
  constraintType,
  currentValue,
  limitValue 
}: { 
  currentTier: 'core' | 'scale';
  constraintType: string;
  currentValue: number;
  limitValue: number;
}) => {
  const percent = Math.round((currentValue / limitValue) * 100);
  const isNearLimit = percent >= 75;

  if (!isNearLimit) return null;

  const nextTier = currentTier === 'core' ? 'SCALE' : 'DOMINION';

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="mt-3 p-3 rounded-lg bg-warning/10 border border-warning/20"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArrowUpRight className="w-4 h-4 text-warning" />
          <span className="text-sm">
            <span className="font-medium">{constraintType}</span>: {currentValue}/{limitValue}
          </span>
        </div>
        <Button variant="ghost" size="sm" className="text-warning hover:text-warning">
          Unlock with {nextTier}
        </Button>
      </div>
    </motion.div>
  );
};

/**
 * Success-based upgrade prompt
 */
export const SuccessUpgradePrompt = ({ 
  revenueGenerated,
  threshold = 50000,
  onUpgrade 
}: { 
  revenueGenerated: number;
  threshold?: number;
  onUpgrade: () => void;
}) => {
  if (revenueGenerated < threshold) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-success/10 border border-success/20"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-success">
            ${revenueGenerated.toLocaleString()} generated
          </p>
          <p className="text-sm text-muted-foreground">
            You've outgrown your current infrastructure
          </p>
        </div>
        <Button onClick={onUpgrade} className="bg-success hover:bg-success/90">
          Scale Capacity
          <ArrowUpRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
};
