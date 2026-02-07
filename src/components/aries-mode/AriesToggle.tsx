import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Zap } from 'lucide-react';
import { useAriesStore } from '@/stores/aries-store';
import { cn } from '@/lib/utils';

/**
 * FOUNDER-ONLY TOGGLE
 * This component is invisible to observers.
 * Shows only to the founder in a subtle, deniable position.
 */
export const AriesToggle = () => {
  const { isActive, toggle, demoPhase } = useAriesStore();

  return (
    <motion.button
      onClick={toggle}
      className={cn(
        "fixed bottom-4 right-4 z-[100] p-3 rounded-lg transition-all duration-300",
        "border backdrop-blur-xl",
        isActive 
          ? "bg-primary/20 border-primary/40 shadow-[0_0_30px_-5px_hsl(var(--primary)/0.5)]" 
          : "bg-card/80 border-border/40 hover:border-border/60"
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={isActive ? "Deactivate Aries Mode" : "Activate Aries Mode"}
    >
      <AnimatePresence mode="wait">
        {isActive ? (
          <motion.div
            key="active"
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            className="flex items-center gap-2"
          >
            <Zap className="w-5 h-5 text-primary" />
            <span className="text-xs font-mono text-primary uppercase tracking-wider">
              {demoPhase}
            </span>
          </motion.div>
        ) : (
          <motion.div
            key="inactive"
            initial={{ opacity: 0, rotate: 90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: -90 }}
          >
            <Eye className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

/**
 * DEMO PHASE CONTROLLER
 * Allows founder to advance through demo phases
 */
export const DemoPhaseController = () => {
  const { isActive, demoPhase, setDemoPhase } = useAriesStore();

  if (!isActive) return null;

  const phases: Array<{ id: typeof demoPhase; label: string }> = [
    { id: 'authority', label: 'Authority' },
    { id: 'replacement', label: 'Replacement' },
    { id: 'intelligence', label: 'Intelligence' },
    { id: 'scale', label: 'Scale' },
    { id: 'close', label: 'Close' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 left-4 z-[100] flex items-center gap-1 p-1 rounded-lg bg-card/90 border border-border/50 backdrop-blur-xl"
    >
      {phases.map((phase, index) => (
        <button
          key={phase.id}
          onClick={() => setDemoPhase(phase.id)}
          className={cn(
            "px-3 py-1.5 rounded text-xs font-medium transition-all duration-200",
            demoPhase === phase.id
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          )}
        >
          {index + 1}. {phase.label}
        </button>
      ))}
    </motion.div>
  );
};
