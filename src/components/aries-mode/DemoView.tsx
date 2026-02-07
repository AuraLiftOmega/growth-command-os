import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  TrendingUp, 
  Brain, 
  Scale, 
  Target,
  ArrowUpRight,
  Activity,
  Cpu,
  Users,
  DollarSign,
  Clock,
  Shield
} from 'lucide-react';
import { useAriesStore, ariesLanguage } from '@/stores/aries-store';
import { PreemptiveProofPanel } from './AriesOverlay';
import { cn } from '@/lib/utils';

/**
 * DEMO VIEW - FOUNDER ARIES MODE™
 * 
 * Designed to:
 * - Establish authority instantly
 * - Frame the founder as inevitable and superior
 * - Reduce objections before they are spoken
 * - Make alternatives feel obsolete
 */
export const DemoView = () => {
  const { isActive, demoPhase } = useAriesStore();

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 bg-background overflow-hidden"
    >
      {/* Grid background */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: '80px 80px'
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col p-8">
        <header className="flex items-center justify-between mb-8">
          <div>
            <motion.p 
              key={demoPhase}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-mono text-primary uppercase tracking-[0.2em] mb-1"
            >
              {ariesLanguage.phaseHeadlines[demoPhase]}
            </motion.p>
            <h1 className="text-3xl font-bold tracking-tight">
              DOMINION
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-mono text-muted-foreground">
              SYSTEM LIVE
            </span>
          </div>
        </header>

        <div className="flex-1 grid grid-cols-12 gap-6">
          <div className="col-span-8 space-y-6">
            <AnimatePresence mode="wait">
              <PhaseContent phase={demoPhase} />
            </AnimatePresence>
          </div>

          <div className="col-span-4">
            <div className="sticky top-8">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4">
                System Intelligence
              </p>
              <PreemptiveProofPanel />
            </div>
          </div>
        </div>

        <footer className="mt-8 pt-6 border-t border-border/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <SocialProofBadge label="Agencies Replaced" value="147" delta="+12 this week" />
              <SocialProofBadge label="Median Execution Speed" value="47x" delta="vs manual teams" />
              <SocialProofBadge label="Market Inefficiencies Captured" value="$2.4M" delta="last 30 days" />
            </div>
            <p className="text-xs text-muted-foreground/50 font-mono">
              Typical agency replacement window: 14 days
            </p>
          </div>
        </footer>
      </div>
    </motion.div>
  );
};

const PhaseContent = ({ phase }: { phase: string }) => {
  const content: Record<string, React.ReactNode> = {
    authority: <AuthorityPhase />,
    replacement: <ReplacementPhase />,
    intelligence: <IntelligencePhase />,
    scale: <ScalePhase />,
    close: <ClosePhase />,
  };

  return (
    <motion.div
      key={phase}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {content[phase] || content.authority}
    </motion.div>
  );
};

const AuthorityPhase = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-3 gap-4">
      <MetricCard icon={DollarSign} label="Revenue Today" value="$127,439" delta="+23.4%" deltaType="success" />
      <MetricCard icon={Activity} label="Active Automations" value="847" delta="executing now" deltaType="neutral" />
      <MetricCard icon={Cpu} label="Decisions Eliminated" value="12,847" delta="this week" deltaType="neutral" />
    </div>
    <div className="glass-card p-6">
      <p className="text-sm text-muted-foreground mb-4">The system is executing:</p>
      <div className="space-y-3">
        <ExecutionLine text="Scaling creative deployment across 4 platforms" status="active" />
        <ExecutionLine text="Replacing manual ad optimization" status="complete" />
        <ExecutionLine text="Compounding audience intelligence" status="active" />
      </div>
    </div>
  </div>
);

const ReplacementPhase = () => (
  <div className="space-y-6">
    <div className="glass-card p-6 border-primary/20">
      <h3 className="text-xl font-bold mb-6">Labor Elimination Status</h3>
      <div className="grid grid-cols-2 gap-6">
        <ReplacementItem role="Media Buyers" status="Replaced" savings="$8,400/mo" />
        <ReplacementItem role="Creative Team" status="Replaced" savings="$12,600/mo" />
        <ReplacementItem role="Analytics" status="Replaced" savings="$6,200/mo" />
        <ReplacementItem role="Agencies" status="Eliminated" savings="$25,000/mo" />
      </div>
    </div>
    <div className="flex items-center gap-4 p-4 rounded-lg bg-success/10 border border-success/20">
      <DollarSign className="w-8 h-8 text-success" />
      <div>
        <p className="text-2xl font-mono font-bold text-success">$52,200</p>
        <p className="text-sm text-muted-foreground">Monthly labor cost eliminated</p>
      </div>
    </div>
  </div>
);

const IntelligencePhase = () => (
  <div className="space-y-6">
    <div className="glass-card p-6 border-accent/20">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="w-6 h-6 text-accent" />
        <h3 className="text-xl font-bold">Compounding Intelligence</h3>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 rounded-lg bg-accent/10">
          <p className="text-3xl font-mono font-bold text-accent">94.2%</p>
          <p className="text-xs text-muted-foreground mt-1">Learning Accuracy</p>
        </div>
        <div className="text-center p-4 rounded-lg bg-accent/10">
          <p className="text-3xl font-mono font-bold text-accent">+12%</p>
          <p className="text-xs text-muted-foreground mt-1">Per Cycle Improvement</p>
        </div>
        <div className="text-center p-4 rounded-lg bg-accent/10">
          <p className="text-3xl font-mono font-bold text-accent">∞</p>
          <p className="text-xs text-muted-foreground mt-1">Learning Capacity</p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        The system learns from every ad, DM, objection, close, and loss. 
        Intelligence compounds. Labor does not.
      </p>
    </div>
  </div>
);

const ScalePhase = () => (
  <div className="space-y-6">
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <Scale className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-bold">Infinite Scale Protocol</h3>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Current Capacity</p>
          <p className="text-4xl font-mono font-bold text-primary">Unlimited</p>
          <p className="text-sm text-muted-foreground mt-1">Concurrent operations</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Headcount Required</p>
          <p className="text-4xl font-mono font-bold text-success">0</p>
          <p className="text-sm text-muted-foreground mt-1">Additional hires needed</p>
        </div>
      </div>
    </div>
    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
      <p className="text-sm font-medium">
        If growth requires hiring, the system has failed. 
        DOMINION scales without headcount.
      </p>
    </div>
  </div>
);

const ClosePhase = () => (
  <div className="space-y-6">
    <div className="glass-card p-6 border-primary/30 animate-pulse-power">
      <div className="flex items-center gap-3 mb-6">
        <Target className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-bold">Execution Awaiting Authorization</h3>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
          <span className="text-sm">Replace agency operations</span>
          <span className="text-xs font-mono text-success">READY</span>
        </div>
        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
          <span className="text-sm">Activate autonomous scaling</span>
          <span className="text-xs font-mono text-success">READY</span>
        </div>
        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
          <span className="text-sm">Begin intelligence compounding</span>
          <span className="text-xs font-mono text-success">READY</span>
        </div>
      </div>
    </div>
    <p className="text-center text-muted-foreground text-sm">
      The system does not wait. It executes.
    </p>
  </div>
);

// Supporting components
const MetricCard = ({ icon: Icon, label, value, delta, deltaType }: { icon: any; label: string; value: string; delta: string; deltaType: 'success' | 'warning' | 'neutral'; }) => (
  <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
    <motion.p className="text-3xl font-mono font-bold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>{value}</motion.p>
    <p className={cn("text-xs mt-1", deltaType === 'success' && "text-success", deltaType === 'warning' && "text-warning", deltaType === 'neutral' && "text-muted-foreground")}>{delta}</p>
  </motion.div>
);

const ExecutionLine = ({ text, status }: { text: string; status: 'active' | 'complete' | 'pending' }) => (
  <div className="flex items-center gap-3">
    <div className={cn("w-2 h-2 rounded-full", status === 'active' && "bg-accent animate-pulse", status === 'complete' && "bg-success", status === 'pending' && "bg-muted")} />
    <span className="text-sm text-foreground">{text}</span>
    {status === 'complete' && <span className="text-xs text-success font-mono ml-auto">COMPLETE</span>}
  </div>
);

const ReplacementItem = ({ role, status, savings }: { role: string; status: string; savings: string }) => (
  <div className="p-4 rounded-lg bg-secondary/50 border border-border/30">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-medium">{role}</span>
      <span className="text-xs font-mono text-success">{status}</span>
    </div>
    <p className="text-lg font-mono font-bold text-success">{savings}</p>
  </div>
);

const SocialProofBadge = ({ label, value, delta }: { label: string; value: string; delta: string }) => (
  <div>
    <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
    <div className="flex items-baseline gap-2">
      <span className="text-lg font-mono font-bold">{value}</span>
      <span className="text-xs text-muted-foreground">{delta}</span>
    </div>
  </div>
);

export default DemoView;
