import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Zap, 
  TrendingDown, 
  ArrowRight, 
  Clock,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { useAriesStore, highTicketLanguage } from '@/stores/aries-store';
import { cn } from '@/lib/utils';

/**
 * OPPORTUNITY COST ESCALATOR
 * Visualizes the cost of delaying the decision
 */
export const OpportunityCostEscalator = () => {
  const { isHighTicketActive, highTicketActivatedAt, opportunityCostAccumulated, incrementOpportunityCost } = useAriesStore();
  const [displayCost, setDisplayCost] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isHighTicketActive && highTicketActivatedAt) {
      intervalRef.current = setInterval(() => {
        incrementOpportunityCost(47);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHighTicketActive, highTicketActivatedAt]);

  useEffect(() => {
    const animationFrame = requestAnimationFrame(() => {
      if (displayCost < opportunityCostAccumulated) {
        setDisplayCost(prev => Math.min(prev + Math.ceil((opportunityCostAccumulated - prev) * 0.1), opportunityCostAccumulated));
      }
    });
    return () => cancelAnimationFrame(animationFrame);
  }, [opportunityCostAccumulated, displayCost]);

  if (!isHighTicketActive) return null;

  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="fixed top-4 right-4 z-[60] p-4 rounded-lg bg-card/90 border border-warning/30 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <TrendingDown className="w-5 h-5 text-warning" />
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Deferred Execution Impact</p>
          <p className="text-xl font-mono font-bold text-warning">-${displayCost.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Opportunity cost since evaluation began</p>
        </div>
      </div>
    </motion.div>
  );
};

export const DecisionCollapseView = () => {
  const { isHighTicketActive, closePhase } = useAriesStore();
  if (!isHighTicketActive || closePhase !== 'collapse') return null;

  const facts = [
    { icon: AlertTriangle, label: "Being Replaced", value: "Agencies, media buyers, content teams", detail: "$52,200/month in labor costs", color: "text-destructive" },
    { icon: CheckCircle2, label: "Being Gained", value: "Autonomous revenue operations", detail: "24/7 execution, compounding intelligence", color: "text-success" },
    { icon: Clock, label: "Compounding If You Wait", value: "Competitor advantage", detail: "Every day = missed learning cycles", color: "text-warning" }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[55] bg-background/95 backdrop-blur-xl flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-xs font-mono text-primary uppercase tracking-[0.3em] text-center mb-8">Decision Architecture</motion.p>
        <div className="grid grid-cols-3 gap-6">
          {facts.map((fact, index) => (
            <motion.div key={fact.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.15 }} className="glass-card p-6 text-center">
              <fact.icon className={cn("w-8 h-8 mx-auto mb-4", fact.color)} />
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{fact.label}</p>
              <p className="text-lg font-semibold mb-2">{fact.value}</p>
              <p className="text-sm text-muted-foreground">{fact.detail}</p>
            </motion.div>
          ))}
        </div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-center text-sm text-muted-foreground mt-8">This is not a menu. This is a system.</motion.p>
      </div>
    </motion.div>
  );
};

export const ObjectionNeutralizationPanel = () => {
  const { isHighTicketActive, closePhase } = useAriesStore();
  const [visibleIndex, setVisibleIndex] = useState(0);

  useEffect(() => {
    if (isHighTicketActive && closePhase === 'cost') {
      const interval = setInterval(() => {
        setVisibleIndex(prev => (prev + 1) % highTicketLanguage.objectionNeutralizers.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isHighTicketActive, closePhase]);

  if (!isHighTicketActive || closePhase !== 'cost') return null;
  const current = highTicketLanguage.objectionNeutralizers[visibleIndex];

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="fixed right-8 top-1/2 -translate-y-1/2 z-[55] w-80">
      <p className="text-xs font-mono text-accent uppercase tracking-wider mb-4">Anticipated Concern #{visibleIndex + 1}</p>
      <AnimatePresence mode="wait">
        <motion.div key={visibleIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass-card p-5 border-accent/20">
          <p className="text-sm text-muted-foreground italic mb-3">"{current.objection}"</p>
          <p className="text-sm font-medium text-foreground mb-2">{current.neutralizer}</p>
          <p className="text-xs text-muted-foreground">{current.subtext}</p>
        </motion.div>
      </AnimatePresence>
      <div className="flex gap-1 mt-3 justify-center">
        {highTicketLanguage.objectionNeutralizers.map((_, i) => (
          <div key={i} className={cn("w-1.5 h-1.5 rounded-full transition-colors", i === visibleIndex ? "bg-accent" : "bg-border")} />
        ))}
      </div>
    </motion.div>
  );
};

export const FinalCloseSequence = () => {
  const { isHighTicketActive, closePhase } = useAriesStore();
  const [activationPulse, setActivationPulse] = useState(false);

  useEffect(() => {
    if (closePhase === 'activation') {
      const interval = setInterval(() => { setActivationPulse(prev => !prev); }, 2000);
      return () => clearInterval(interval);
    }
  }, [closePhase]);

  if (!isHighTicketActive || closePhase !== 'activation') return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[55] bg-background flex items-center justify-center">
      <div className="text-center max-w-lg">
        <motion.div
          animate={{ scale: activationPulse ? 1.02 : 1, boxShadow: activationPulse ? '0 0 80px -20px hsl(var(--primary) / 0.6)' : '0 0 40px -20px hsl(var(--primary) / 0.3)' }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-card border border-primary/30 mb-8"
        >
          <Zap className="w-12 h-12 text-primary" />
        </motion.div>
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xs font-mono text-primary uppercase tracking-[0.3em] mb-4">System Status: Ready</motion.p>
        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-3xl font-bold mb-6">Execution Awaiting Authorization</motion.h2>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-3 mb-8">
          <ActivationLine icon={Activity} text="First autonomous action: pending" status="ready" />
          <ActivationLine icon={DollarSign} text="Revenue operations: standing by" status="ready" />
          <ActivationLine icon={Target} text="Intelligence compounding: initialized" status="ready" />
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-sm text-muted-foreground">This begins immediately.</motion.p>
      </div>
      <SilenceAmplification />
    </motion.div>
  );
};

const ActivationLine = ({ icon: Icon, text, status }: { icon: any; text: string; status: 'ready' | 'pending' }) => (
  <div className="flex items-center justify-center gap-3 text-sm">
    <Icon className="w-4 h-4 text-muted-foreground" />
    <span className="text-foreground">{text}</span>
    <span className={cn("text-xs font-mono uppercase", status === 'ready' ? "text-success" : "text-muted-foreground")}>{status}</span>
  </div>
);

const SilenceAmplification = () => {
  const [metrics, setMetrics] = useState({ learningCycles: 847, automationsQueued: 12, intelligenceScore: 94.2 });
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        learningCycles: prev.learningCycles + Math.floor(Math.random() * 3),
        automationsQueued: Math.max(8, prev.automationsQueued + (Math.random() > 0.5 ? 1 : -1)),
        intelligenceScore: Math.min(99.9, prev.intelligenceScore + (Math.random() * 0.1))
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 text-xs text-muted-foreground font-mono">
      <span>Learning cycles: {metrics.learningCycles.toLocaleString()}</span>
      <span className="text-border">|</span>
      <span>Queued: {metrics.automationsQueued}</span>
      <span className="text-border">|</span>
      <span>Intelligence: {metrics.intelligenceScore.toFixed(1)}%</span>
    </div>
  );
};

/**
 * HIGH-TICKET TOGGLE
 * Stacks on Aries Mode
 */
export const HighTicketToggle = () => {
  const { isActive, isHighTicketActive, toggleHighTicket, closePhase } = useAriesStore();
  if (!isActive) return null;

  return (
    <motion.button
      onClick={toggleHighTicket}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "fixed bottom-4 right-20 z-[100] p-3 rounded-lg transition-all duration-300",
        "border backdrop-blur-xl",
        isHighTicketActive 
          ? "bg-warning/20 border-warning/40 shadow-[0_0_30px_-5px_hsl(var(--warning)/0.5)]" 
          : "bg-card/80 border-border/40 hover:border-border/60"
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={isHighTicketActive ? "Deactivate High-Ticket Mode" : "Activate High-Ticket Mode"}
    >
      <div className="flex items-center gap-2">
        <DollarSign className={cn("w-5 h-5", isHighTicketActive ? "text-warning" : "text-muted-foreground")} />
        {isHighTicketActive && (
          <span className="text-xs font-mono text-warning uppercase tracking-wider">{closePhase}</span>
        )}
      </div>
    </motion.button>
  );
};

export const ClosePhaseController = () => {
  const { isHighTicketActive, closePhase, setClosePhase } = useAriesStore();
  if (!isHighTicketActive) return null;

  const phases: Array<{ id: typeof closePhase; label: string }> = [
    { id: 'collapse', label: 'Collapse' },
    { id: 'cost', label: 'Cost' },
    { id: 'certainty', label: 'Certainty' },
    { id: 'activation', label: 'Activate' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 left-40 z-[100] flex items-center gap-1 p-1 rounded-lg bg-warning/10 border border-warning/30 backdrop-blur-xl"
    >
      {phases.map((phase, index) => (
        <button
          key={phase.id}
          onClick={() => setClosePhase(phase.id)}
          className={cn(
            "px-3 py-1.5 rounded text-xs font-medium transition-all duration-200",
            closePhase === phase.id ? "bg-warning text-warning-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          )}
        >
          {index + 1}. {phase.label}
        </button>
      ))}
    </motion.div>
  );
};
