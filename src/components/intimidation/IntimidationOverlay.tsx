import { motion, AnimatePresence } from 'framer-motion';
import { useIntimidationStore, intimidationLanguage } from '@/stores/intimidation-store';
import { cn } from '@/lib/utils';

/**
 * INTIMIDATION OVERLAY
 * Applies visual escalation when mode is active.
 * Darkens background, increases contrast, adds psychological weight.
 */
export const IntimidationOverlay = () => {
  const { isActive } = useIntimidationStore();

  return (
    <AnimatePresence>
      {isActive && (
        <>
          {/* Darkening overlay - subtle but effective */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[1] pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, hsl(220 15% 1% / 0.4) 0%, hsl(220 15% 2% / 0.3) 100%)',
            }}
          />
          
          {/* Vignette effect - focus attention to center */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[1] pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 40%, hsl(220 15% 1% / 0.5) 100%)',
            }}
          />
          
          {/* Subtle red accent glow at edges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[1] pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at top, hsl(0 90% 50% / 0.08) 0%, transparent 50%)',
            }}
          />
        </>
      )}
    </AnimatePresence>
  );
};

/**
 * PREEMPTIVE PROOF DISPLAY
 * Shows proof before objections arise.
 * "That was my question — and they already answered it."
 */
export const PreemptiveProofPanel = () => {
  const { isActive, demoPhase } = useIntimidationStore();

  if (!isActive) return null;

  // Select relevant proofs based on demo phase
  const phaseProofs: Record<string, typeof intimidationLanguage.preemptiveProof> = {
    authority: intimidationLanguage.preemptiveProof.slice(0, 2),
    replacement: [intimidationLanguage.preemptiveProof[0], intimidationLanguage.preemptiveProof[1]],
    intelligence: [intimidationLanguage.preemptiveProof[4], intimidationLanguage.preemptiveProof[2]],
    scale: [intimidationLanguage.preemptiveProof[3], intimidationLanguage.preemptiveProof[4]],
    close: intimidationLanguage.preemptiveProof.slice(0, 3),
  };

  const currentProofs = phaseProofs[demoPhase] || [];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-2"
    >
      {currentProofs.map((item, index) => (
        <motion.div
          key={item.objection}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.2, duration: 0.5 }}
          className="px-4 py-3 rounded-lg bg-card/60 border border-border/30"
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            {item.objection} preemption
          </p>
          <p className="text-sm font-medium text-foreground">
            {item.proof}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
};

/**
 * RESIDUAL CUE
 * Shows when mode is deactivated to create psychological residue.
 * "Something big is running — and I'm not part of it yet."
 */
export const ResidualCue = () => {
  const { residualCue, isActive } = useIntimidationStore();

  if (isActive || !residualCue) return null;

  const cueContent = {
    pending_automation: {
      title: 'Automation Pending',
      subtitle: '3 executions queued',
      pulse: true,
    },
    paused_execution: {
      title: 'Execution Paused',
      subtitle: 'Awaiting authorization',
      pulse: false,
    },
    muted_delta: {
      title: 'Revenue Delta',
      subtitle: '+$47,293 (processing)',
      pulse: true,
    },
  };

  const cue = cueContent[residualCue];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className={cn(
        "fixed bottom-20 right-4 z-50 px-4 py-3 rounded-lg",
        "bg-card/80 border border-primary/30 backdrop-blur-xl",
        cue.pulse && "animate-pulse-power"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <div>
          <p className="text-xs font-medium text-foreground">{cue.title}</p>
          <p className="text-xs text-muted-foreground">{cue.subtitle}</p>
        </div>
      </div>
    </motion.div>
  );
};
