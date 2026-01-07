/**
 * THREE-CLICK ONBOARDING MODES
 * 
 * Mode A — "DONE FOR YOU" - Auto-fills everything, best-practice defaults
 * Mode B — "FASTEST PATH TO REVENUE" - Speed + monetization focused
 * Mode C — "CUSTOM CONTROL" - Manual control with AI assistance
 */

import { motion } from 'framer-motion';
import { 
  Rocket, 
  Zap, 
  Settings2, 
  Crown, 
  TrendingUp, 
  Wand2,
  ChevronRight,
  Sparkles,
  Target,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type OnboardingMode = 'done_for_you' | 'fastest_revenue' | 'custom_control';

interface OnboardingModeSelectorProps {
  onSelect: (mode: OnboardingMode) => void;
  selectedMode?: OnboardingMode;
}

const MODES = [
  {
    id: 'done_for_you' as OnboardingMode,
    title: 'Done For You',
    subtitle: 'AI handles everything',
    description: 'Auto-fills all settings with proven best practices. Launch revenue-ready in 3 clicks.',
    icon: Wand2,
    color: 'from-purple-500 to-pink-500',
    badge: 'RECOMMENDED',
    badgeColor: 'bg-success text-success-foreground',
    features: [
      'Auto-configure all settings',
      'Best-practice defaults',
      'Revenue-ready instantly',
      'AI-optimized campaigns'
    ],
    timeToValue: '2 minutes',
    effort: 'Zero effort'
  },
  {
    id: 'fastest_revenue' as OnboardingMode,
    title: 'Fastest Path to Revenue',
    subtitle: 'Speed + monetization focused',
    description: 'Skip non-critical steps. Focus only on actions that produce income immediately.',
    icon: Zap,
    color: 'from-orange-500 to-red-500',
    badge: 'FAST TRACK',
    badgeColor: 'bg-orange-500/20 text-orange-400',
    features: [
      'Skip non-essential setup',
      'Monetization first',
      'Quick launch mode',
      'Revenue-focused defaults'
    ],
    timeToValue: '5 minutes',
    effort: 'Minimal input'
  },
  {
    id: 'custom_control' as OnboardingMode,
    title: 'Custom Control',
    subtitle: 'For advanced users',
    description: 'Full manual control with AI assistance. Configure every detail to your specification.',
    icon: Settings2,
    color: 'from-blue-500 to-cyan-500',
    badge: 'ADVANCED',
    badgeColor: 'bg-blue-500/20 text-blue-400',
    features: [
      'Complete customization',
      'AI-assisted suggestions',
      'Granular control',
      'Export configurations'
    ],
    timeToValue: '15-30 minutes',
    effort: 'Full control'
  }
];

export function OnboardingModeSelector({ onSelect, selectedMode }: OnboardingModeSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Choose Your Launch Path</span>
        </motion.div>
        <h2 className="text-3xl font-display font-bold mb-2">How do you want to get started?</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Select your preferred onboarding experience. You can always adjust settings later.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {MODES.map((mode, index) => {
          const Icon = mode.icon;
          const isSelected = selectedMode === mode.id;
          
          return (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                onClick={() => onSelect(mode.id)}
                className={cn(
                  "relative cursor-pointer transition-all duration-300 h-full",
                  "hover:shadow-xl hover:scale-[1.02]",
                  "border-2",
                  isSelected 
                    ? "border-primary shadow-lg shadow-primary/20" 
                    : "border-border hover:border-primary/50"
                )}
              >
                {/* Gradient Header */}
                <div className={cn(
                  "h-2 rounded-t-lg bg-gradient-to-r",
                  mode.color
                )} />

                <div className="p-6 space-y-4">
                  {/* Badge */}
                  <Badge className={cn("text-[10px]", mode.badgeColor)}>
                    {mode.badge}
                  </Badge>

                  {/* Icon & Title */}
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br",
                      mode.color
                    )}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg">{mode.title}</h3>
                      <p className="text-sm text-muted-foreground">{mode.subtitle}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground">
                    {mode.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2">
                    {mode.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div>
                      <p className="text-xs text-muted-foreground">Time to value</p>
                      <p className="font-medium text-sm">{mode.timeToValue}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Effort</p>
                      <p className="font-medium text-sm">{mode.effort}</p>
                    </div>
                  </div>

                  {/* Select Button */}
                  <Button
                    className={cn(
                      "w-full gap-2 transition-all",
                      isSelected 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-secondary hover:bg-primary hover:text-primary-foreground"
                    )}
                  >
                    {isSelected ? 'Selected' : 'Choose This Path'}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                {/* Selected Indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-3 -right-3 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg"
                  >
                    <Crown className="w-4 h-4 text-primary-foreground" />
                  </motion.div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center pt-4"
      >
        <p className="text-sm text-muted-foreground">
          <Shield className="w-4 h-4 inline mr-1" />
          All modes include our AI assistant and can be changed anytime
        </p>
      </motion.div>
    </div>
  );
}

// Quick mode presets for auto-configuration
export const MODE_PRESETS: Record<OnboardingMode, {
  skipSteps: number[];
  autoFill: boolean;
  focusRevenue: boolean;
  showAdvanced: boolean;
}> = {
  done_for_you: {
    skipSteps: [0, 1, 2, 3, 4, 5, 6], // Skip all, auto-fill everything
    autoFill: true,
    focusRevenue: true,
    showAdvanced: false
  },
  fastest_revenue: {
    skipSteps: [2, 3, 4], // Skip Product Truth, Brand Control, Creative Direction
    autoFill: true,
    focusRevenue: true,
    showAdvanced: false
  },
  custom_control: {
    skipSteps: [],
    autoFill: false,
    focusRevenue: false,
    showAdvanced: true
  }
};
