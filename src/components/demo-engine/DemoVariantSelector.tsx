import { motion } from 'framer-motion';
import { 
  Video, 
  Crown, 
  Building2, 
  VolumeX,
  Check,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { useDemoEngineStore, DemoVariant } from '@/stores/demo-engine-store';
import { cn } from '@/lib/utils';

/**
 * DEMO VARIANT SELECTOR
 * 
 * Variants:
 * A - Founder Aries Demo Mode
 * B - $100K+ Enterprise Demo Version
 * C - Silent Closing Demo (No Narration)
 */

interface VariantConfig {
  id: DemoVariant;
  name: string;
  subtitle: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  characteristics: string[];
  bestFor: string[];
  tone: string;
}

const VARIANTS: VariantConfig[] = [
  {
    id: 'standard',
    name: 'Standard Demo',
    subtitle: 'Balanced explanation & authority',
    icon: Video,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30',
    description: 'Clear, comprehensive demos that explain capabilities while maintaining authority positioning.',
    characteristics: [
      'Full feature walkthrough',
      'Outcome-focused narrative',
      'Professional tone',
      'Balanced explanation depth',
    ],
    bestFor: ['Warm leads', 'Mid-market deals', 'Sales team enablement'],
    tone: 'Professional & Confident',
  },
  {
    id: 'aries',
    name: 'Founder Aries',
    subtitle: 'Maximum authority & inevitability',
    icon: Crown,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/30',
    description: 'Reduces explanatory language, increases visual authority and system dominance. Makes prospects feel they need the system, not vice versa.',
    characteristics: [
      'Minimal explanation',
      'Visual dominance',
      'Control & leverage focus',
      'Inevitability framing',
      '"Not everyone gets access" positioning',
    ],
    bestFor: ['Live demos', 'Founder calls', 'Strategic partnerships', 'High-conviction buyers'],
    tone: 'Calmly Dominant',
  },
  {
    id: 'enterprise',
    name: '$100K+ Enterprise',
    subtitle: 'Executive logic & risk reduction',
    icon: Building2,
    color: 'text-accent',
    bgColor: 'bg-accent/10',
    borderColor: 'border-accent/30',
    description: 'Removes SMB language entirely. Pure executive logic focused on risk reduction, revenue continuity, and long-term leverage.',
    characteristics: [
      'Risk reduction emphasis',
      'Revenue continuity focus',
      'Governance & control',
      'Scale without fragility',
      'No hype, pure logic',
    ],
    bestFor: ['Enterprise deals', 'Board presentations', 'C-suite reviews', 'Multi-year contracts'],
    tone: 'Strategic & Measured',
  },
  {
    id: 'silent',
    name: 'Silent Closing',
    subtitle: 'Zero narration, pure visual flow',
    icon: VolumeX,
    color: 'text-muted-foreground',
    bgColor: 'bg-secondary',
    borderColor: 'border-border',
    description: 'Fully silent demo using motion, sequencing, UI flow, and metrics only. Communicates inevitability without words.',
    characteristics: [
      'No voiceover required',
      'Motion-driven narrative',
      'Metrics as proof',
      'Background-compatible',
      'Clarity over explanation',
    ],
    bestFor: ['Sales call backgrounds', 'Deck embeds', 'High-trust buyers', 'Self-serve prospects'],
    tone: 'Visual Certainty',
  },
];

export const DemoVariantSelector = () => {
  const { currentVariant, setVariant } = useDemoEngineStore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
          <Crown className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h3 className="font-semibold">Demo Variants</h3>
          <p className="text-sm text-muted-foreground">
            Select positioning mode based on buyer type and sales stage
          </p>
        </div>
      </div>

      {/* Variant Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {VARIANTS.map((variant, index) => {
          const isSelected = currentVariant === variant.id;
          const Icon = variant.icon;

          return (
            <motion.button
              key={variant.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setVariant(variant.id)}
              className={cn(
                "p-5 rounded-xl border-2 text-left transition-all",
                isSelected
                  ? `${variant.bgColor} ${variant.borderColor} shadow-lg`
                  : "bg-card/50 border-border/50 hover:border-border"
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    isSelected ? variant.bgColor : "bg-secondary"
                  )}>
                    <Icon className={cn(
                      "w-5 h-5",
                      isSelected ? variant.color : "text-muted-foreground"
                    )} />
                  </div>
                  <div>
                    <h4 className={cn("font-semibold", isSelected && variant.color)}>
                      {variant.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">{variant.subtitle}</p>
                  </div>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center">
                    <Check className="w-4 h-4 text-success-foreground" />
                  </div>
                )}
              </div>

              <p className="text-sm text-muted-foreground mb-4">{variant.description}</p>

              {/* Characteristics */}
              <div className="space-y-1.5 mb-4">
                {variant.characteristics.slice(0, 3).map((char) => (
                  <div key={char} className="flex items-center gap-2 text-xs">
                    <Zap className={cn("w-3 h-3", variant.color)} />
                    <span className="text-muted-foreground">{char}</span>
                  </div>
                ))}
              </div>

              {/* Best For */}
              <div className="pt-3 border-t border-border/30">
                <p className="text-xs text-muted-foreground mb-2">Best for:</p>
                <div className="flex flex-wrap gap-1.5">
                  {variant.bestFor.map((use) => (
                    <span
                      key={use}
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        isSelected ? variant.bgColor : "bg-secondary"
                      )}
                    >
                      {use}
                    </span>
                  ))}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Variant-Specific Instructions */}
      {currentVariant === 'aries' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-warning/10 border border-warning/20"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
            <div>
              <p className="text-sm font-medium text-warning mb-1">Aries Mode Active</p>
              <p className="text-sm text-muted-foreground">
                This mode is designed for founder-level calls and strategic deals. 
                The demo will minimize selling language and maximize system authority. 
                Prospects should feel they are witnessing infrastructure, not being pitched.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {currentVariant === 'enterprise' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-accent/10 border border-accent/20"
        >
          <div className="flex items-start gap-3">
            <Building2 className="w-5 h-5 text-accent mt-0.5" />
            <div>
              <p className="text-sm font-medium text-accent mb-1">Enterprise Mode Active</p>
              <p className="text-sm text-muted-foreground">
                All SMB language removed. Demo focuses exclusively on: risk reduction, 
                revenue continuity, governance, and scale without fragility. 
                No hype. No speed selling. Pure executive logic.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DemoVariantSelector;
