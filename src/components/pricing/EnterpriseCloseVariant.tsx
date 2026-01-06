import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  TrendingDown, 
  CheckCircle2,
  Clock,
  Shield,
  Building2,
  ArrowRight,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * $100K+ ONE-CALL CLOSE VARIANT™
 * 
 * Enterprise and high-ticket buyers make single-call decisions
 * without proposals, follow-ups, or internal delays.
 */

interface EnterpriseCloseState {
  isActive: boolean;
  activatedAt: Date | null;
  phase: 'idle' | 'collapse' | 'authority' | 'activation';
}

/**
 * COLLAPSED DECISION VIEW
 * Removes all options, shows only outcomes
 */
export const CollapsedDecisionView = ({ 
  isActive, 
  onActivate 
}: { 
  isActive: boolean;
  onActivate: () => void;
}) => {
  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-background flex items-center justify-center p-8"
    >
      <div className="max-w-2xl w-full text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <p className="text-xs font-mono text-primary uppercase tracking-[0.3em] mb-6">
            Enterprise Infrastructure Decision
          </p>
          
          {/* Single outcome focus */}
          <h1 className="text-4xl font-bold mb-4">
            Revenue Operations Infrastructure
          </h1>
          <p className="text-lg text-muted-foreground">
            Autonomous execution replacing $52,200/month in labor costs
          </p>
        </motion.div>

        {/* Three facts only */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-4 mb-12"
        >
          <OutcomeFact 
            icon={TrendingDown}
            label="Eliminated"
            value="$627K/year"
            detail="Labor cost removed"
          />
          <OutcomeFact 
            icon={Zap}
            label="Speed"
            value="47x faster"
            detail="Than manual teams"
          />
          <OutcomeFact 
            icon={Activity}
            label="Compounds"
            value="+12%/cycle"
            detail="Intelligence growth"
          />
        </motion.div>

        {/* Activation (not purchase) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <button
            onClick={onActivate}
            className={cn(
              "inline-flex items-center gap-3 px-8 py-4",
              "bg-primary text-primary-foreground rounded-lg",
              "text-lg font-semibold",
              "hover:bg-primary/90 transition-colors",
              "shadow-[0_0_40px_-10px_hsl(var(--primary)/0.5)]"
            )}
          >
            <span>Activate Infrastructure</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-xs text-muted-foreground mt-4">
            This is not a purchase. This is access.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

const OutcomeFact = ({ 
  icon: Icon, 
  label, 
  value, 
  detail 
}: { 
  icon: any; 
  label: string; 
  value: string; 
  detail: string;
}) => (
  <div className="p-4 rounded-lg bg-card border border-border">
    <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
      {label}
    </p>
    <p className="text-xl font-bold">{value}</p>
    <p className="text-xs text-muted-foreground">{detail}</p>
  </div>
);

/**
 * AUTHORITY TRANSFER PANEL
 * Positions buyer as stepping into control
 */
export const AuthorityTransferPanel = ({ isVisible }: { isVisible: boolean }) => {
  const [phraseIndex, setPhraseIndex] = useState(0);
  
  const phrases = [
    "Activation grants control of an already-working system",
    "The system is running. You are deciding to enter.",
    "Execution begins immediately upon authorization",
    "This is infrastructure, not software",
  ];

  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setPhraseIndex(prev => (prev + 1) % phrases.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60]"
    >
      <AnimatePresence mode="wait">
        <motion.p
          key={phraseIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-sm text-muted-foreground font-mono text-center"
        >
          {phrases[phraseIndex]}
        </motion.p>
      </AnimatePresence>
    </motion.div>
  );
};

/**
 * ACTIVATION READY STATE
 * Final close - shows system ready, not "buy now"
 */
export const ActivationReadyState = ({ 
  isActive,
  tierName = "DOMINION",
  onConfirm,
  onBack
}: { 
  isActive: boolean;
  tierName?: string;
  onConfirm: () => void;
  onBack: () => void;
}) => {
  const [pulse, setPulse] = useState(false);
  const [queuedActions] = useState([
    { label: "Industry configuration", status: "ready" },
    { label: "First automation deployment", status: "ready" },
    { label: "Intelligence calibration", status: "ready" },
    { label: "Revenue tracking activation", status: "ready" },
  ]);

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => setPulse(prev => !prev), 2000);
      return () => clearInterval(interval);
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[70] bg-background flex items-center justify-center"
    >
      <div className="max-w-lg w-full text-center px-6">
        {/* Activation indicator */}
        <motion.div
          animate={{ 
            scale: pulse ? 1.02 : 1,
            boxShadow: pulse 
              ? '0 0 80px -20px hsl(var(--primary) / 0.6)' 
              : '0 0 40px -20px hsl(var(--primary) / 0.3)'
          }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-card border border-primary/30 mb-6"
        >
          <Zap className="w-10 h-10 text-primary" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs font-mono text-primary uppercase tracking-[0.3em] mb-2"
        >
          {tierName} Infrastructure
        </motion.p>

        <h2 className="text-2xl font-bold mb-8">
          System Ready for Activation
        </h2>

        {/* Queued actions */}
        <div className="space-y-2 mb-8 text-left">
          {queuedActions.map((action, i) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border/50"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="text-sm">{action.label}</span>
              </div>
              <span className="text-xs font-mono text-success uppercase">
                {action.status}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Start date */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-muted-foreground mb-6"
        >
          Execution timeline: <span className="text-foreground font-semibold">Immediate</span>
        </motion.p>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={onBack}
            className="px-6 py-3 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          >
            Back
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              "px-8 py-3 rounded-lg",
              "bg-primary text-primary-foreground font-semibold",
              "hover:bg-primary/90 transition-colors",
              "shadow-[0_0_30px_-5px_hsl(var(--primary)/0.5)]"
            )}
          >
            Authorize Activation
          </button>
        </div>

        {/* Bottom text */}
        <p className="text-xs text-muted-foreground mt-8">
          This begins immediately.
        </p>
      </div>

      {/* Background activity indicator */}
      <SystemActivityIndicator />
    </motion.div>
  );
};

/**
 * System keeps showing activity even in silence
 */
const SystemActivityIndicator = () => {
  const [metrics, setMetrics] = useState({
    cycles: 1247,
    queued: 4,
    intelligence: 96.8
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        cycles: prev.cycles + Math.floor(Math.random() * 2),
        queued: Math.max(2, prev.queued + (Math.random() > 0.5 ? 1 : -1)),
        intelligence: Math.min(99.9, prev.intelligence + (Math.random() * 0.05))
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 text-xs text-muted-foreground/60 font-mono">
      <span>Cycles: {metrics.cycles.toLocaleString()}</span>
      <span className="text-border">|</span>
      <span>Queued: {metrics.queued}</span>
      <span className="text-border">|</span>
      <span>Intelligence: {metrics.intelligence.toFixed(1)}%</span>
    </div>
  );
};
