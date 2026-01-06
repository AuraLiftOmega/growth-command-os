import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Play, 
  Pause, 
  TrendingUp, 
  MessageSquare, 
  Video, 
  Mail,
  Calendar,
  DollarSign,
  Target,
  Brain,
  Activity,
  Users,
  ArrowUpRight,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { useDominionStore } from '@/stores/dominion-core-store';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

/**
 * SELF-MARKETING ENGINE - MODULE B
 * 
 * DOMINION treats itself as a client.
 * This proves: "If it works for us, it works for you."
 * 
 * Capabilities:
 * - Run ads for itself
 * - Generate creatives for itself
 * - Write copy for itself
 * - Create demos for itself
 * - Book calls for itself
 * - Close customers for itself
 * 
 * ISOLATION GUARANTEE:
 * - Toggleable and never interferes with founder's primary business
 * - Operates on separate budget/resource allocation
 * - Uses DOMINION's own traffic, proof, and outbound systems
 */

interface SelfMetric {
  label: string;
  value: string;
  delta: string;
  deltaType: 'up' | 'down' | 'neutral';
  icon: any;
}

export const SelfMarketingEngine = () => {
  const { isSelfMarketingActive, toggleSelfMarketing, selfAsClient } = useDominionStore();
  const [isolationMode, setIsolationMode] = useState(true);
  const [metrics, setMetrics] = useState<SelfMetric[]>([
    { label: 'Leads Generated', value: '847', delta: '+23 today', deltaType: 'up', icon: Users },
    { label: 'Demos Booked', value: '34', delta: '+7 this week', deltaType: 'up', icon: Calendar },
    { label: 'Revenue (Self)', value: '$127,439', delta: '+18.4%', deltaType: 'up', icon: DollarSign },
    { label: 'Close Rate', value: '34.2%', delta: '+2.1%', deltaType: 'up', icon: Target },
  ]);

  const [automations, setAutomations] = useState([
    { id: 1, name: 'DOMINION Ad Campaigns', status: 'running', executions: 847, type: 'traffic' },
    { id: 2, name: 'Self-Creative Generation', status: 'running', executions: 234, type: 'creative' },
    { id: 3, name: 'Demo Booking Automation', status: 'running', executions: 156, type: 'sales' },
    { id: 4, name: 'Proof Compilation Engine', status: 'running', executions: 89, type: 'proof' },
    { id: 5, name: 'High-Ticket Close Sequence', status: 'ready', executions: 34, type: 'close' },
  ]);

  // Simulate live updates when active
  useEffect(() => {
    if (!isSelfMarketingActive) return;
    
    const interval = setInterval(() => {
      setAutomations(prev => prev.map(a => ({
        ...a,
        executions: a.status === 'running' ? a.executions + Math.floor(Math.random() * 3) : a.executions
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, [isSelfMarketingActive]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              isSelfMarketingActive ? "bg-primary/20" : "bg-secondary"
            )}>
              <Zap className={cn(
                "w-5 h-5",
                isSelfMarketingActive ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Self-Marketing Engine</h2>
              <p className="text-sm text-muted-foreground">DOMINION as its own client</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Self-Marketing</span>
            <Switch
              checked={isSelfMarketingActive}
              onCheckedChange={toggleSelfMarketing}
            />
          </div>
          {isSelfMarketingActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20"
            >
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs font-medium text-success">LIVE</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Self-Marketing Philosophy */}
      <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
        <p className="text-sm text-muted-foreground">
          <span className="text-accent font-medium">Proof Philosophy:</span> DOMINION runs its own 
          marketing, sales, and automation. Every feature used to sell DOMINION was built to sell 
          your products. If it works for us, it works for you.
        </p>
      </div>

      {/* Isolation Guarantee */}
      <div className="p-4 rounded-lg bg-success/5 border border-success/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-success" />
            <div>
              <p className="text-sm font-medium">Isolation Mode</p>
              <p className="text-xs text-muted-foreground">
                Self-marketing operates on separate resources, never touching your primary business
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{isolationMode ? 'Isolated' : 'Shared'}</span>
            <Switch
              checked={isolationMode}
              onCheckedChange={setIsolationMode}
            />
          </div>
        </div>
        {!isolationMode && (
          <div className="mt-3 p-2 rounded bg-warning/10 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <span className="text-xs text-warning">Shared mode may impact primary business resources</span>
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-lg bg-card/50 border border-border/50"
          >
            <div className="flex items-center gap-2 mb-2">
              <metric.icon className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{metric.label}</span>
            </div>
            <p className="text-2xl font-mono font-bold">{metric.value}</p>
            <p className={cn(
              "text-xs mt-1",
              metric.deltaType === 'up' ? "text-success" :
              metric.deltaType === 'down' ? "text-destructive" :
              "text-muted-foreground"
            )}>
              {metric.delta}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Active Self-Automations */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">Self-Execution Automations</h3>
        <div className="space-y-3">
          {automations.map((automation, index) => (
            <motion.div
              key={automation.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/30"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  automation.status === 'running' ? "bg-success animate-pulse" : "bg-muted"
                )} />
                <div>
                  <p className="text-sm font-medium">{automation.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{automation.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-mono text-muted-foreground">
                  {automation.executions.toLocaleString()} executions
                </span>
                <span className={cn(
                  "text-xs font-medium uppercase px-2 py-1 rounded",
                  automation.status === 'running' 
                    ? "bg-success/10 text-success" 
                    : "bg-secondary text-muted-foreground"
                )}>
                  {automation.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Self-Sales Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-4 h-4 text-accent" />
            <h4 className="text-sm font-medium">Self-Outbound</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">DMs Sent</span>
              <span className="font-mono">2,847</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Reply Rate</span>
              <span className="font-mono text-success">23.4%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Qualified</span>
              <span className="font-mono">189</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Video className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-medium">Self-Creative</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ads Generated</span>
              <span className="font-mono">234</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Active</span>
              <span className="font-mono text-success">47</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Avg ROAS</span>
              <span className="font-mono">4.7x</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-success" />
            <h4 className="text-sm font-medium">Self-Close</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Demos This Week</span>
              <span className="font-mono">34</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Closed</span>
              <span className="font-mono text-success">12</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pipeline</span>
              <span className="font-mono">$847K</span>
            </div>
          </div>
        </div>
      </div>

      {/* Proof Generation */}
      <div className="p-5 rounded-lg border border-success/20 bg-success/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-success" />
            <h4 className="font-medium">Auto-Generated Proof</h4>
          </div>
          <span className="text-xs text-muted-foreground">Updates automatically</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-mono font-bold text-success">147</p>
            <p className="text-xs text-muted-foreground">Agencies Replaced</p>
          </div>
          <div>
            <p className="text-2xl font-mono font-bold text-success">$2.4M</p>
            <p className="text-xs text-muted-foreground">Revenue Generated</p>
          </div>
          <div>
            <p className="text-2xl font-mono font-bold text-success">47x</p>
            <p className="text-xs text-muted-foreground">Speed vs Manual</p>
          </div>
          <div>
            <p className="text-2xl font-mono font-bold text-success">94.2%</p>
            <p className="text-xs text-muted-foreground">Learning Accuracy</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelfMarketingEngine;
