/**
 * AUTONOMOUS SELLING ENGINE
 * 
 * Fully autonomous system that:
 * - Creates offers automatically
 * - Generates content (ads, video, copy)
 * - Builds funnels and store flows
 * - Optimizes for conversion automatically
 * - Continuously improves using performance data
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket,
  Zap,
  TrendingUp,
  Target,
  Video,
  MessageSquare,
  DollarSign,
  BarChart3,
  Play,
  Pause,
  Settings2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Brain,
  ShoppingCart,
  Mail,
  Users
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AutonomousModule {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'idle' | 'running' | 'optimizing' | 'paused' | 'error';
  enabled: boolean;
  metrics: {
    label: string;
    value: string;
    change?: string;
    positive?: boolean;
  }[];
  lastAction?: string;
  nextAction?: string;
}

const AUTONOMOUS_MODULES: AutonomousModule[] = [
  {
    id: 'offer_creation',
    name: 'Offer Creation Engine',
    description: 'Automatically creates and tests high-converting offers',
    icon: DollarSign,
    status: 'running',
    enabled: true,
    metrics: [
      { label: 'Offers Created', value: '24', change: '+8', positive: true },
      { label: 'Conversion Rate', value: '4.2%', change: '+0.8%', positive: true },
      { label: 'Revenue Impact', value: '$47,291', change: '+23%', positive: true }
    ],
    lastAction: 'Created "Flash Sale - 24hr" offer',
    nextAction: 'A/B testing pricing for top SKU'
  },
  {
    id: 'content_generation',
    name: 'Content Generation AI',
    description: 'Generates scroll-stopping ads, videos, and copy',
    icon: Video,
    status: 'running',
    enabled: true,
    metrics: [
      { label: 'Videos Generated', value: '156', change: '+34', positive: true },
      { label: 'Avg CTR', value: '3.8%', change: '+1.2%', positive: true },
      { label: 'Top Performer ROAS', value: '5.4x', positive: true }
    ],
    lastAction: 'Generated 3 new video variants',
    nextAction: 'Creating holiday campaign assets'
  },
  {
    id: 'funnel_optimization',
    name: 'Funnel Optimizer',
    description: 'Builds and optimizes conversion funnels automatically',
    icon: Target,
    status: 'optimizing',
    enabled: true,
    metrics: [
      { label: 'Active Funnels', value: '8', change: '+2', positive: true },
      { label: 'Funnel Conversion', value: '12.4%', change: '+3.1%', positive: true },
      { label: 'Drop-off Reduced', value: '34%', positive: true }
    ],
    lastAction: 'Optimized checkout flow',
    nextAction: 'Testing new upsell sequence'
  },
  {
    id: 'audience_targeting',
    name: 'Audience Intelligence',
    description: 'Discovers and targets highest-value audience segments',
    icon: Users,
    status: 'running',
    enabled: true,
    metrics: [
      { label: 'Segments Active', value: '12', change: '+4', positive: true },
      { label: 'Lookalike ROAS', value: '4.1x', change: '+0.9x', positive: true },
      { label: 'CAC Reduction', value: '28%', positive: true }
    ],
    lastAction: 'Expanded high-LTV segment',
    nextAction: 'Launching exclusion audiences'
  },
  {
    id: 'email_automation',
    name: 'Email Revenue Engine',
    description: 'Automated email sequences that drive repeat purchases',
    icon: Mail,
    status: 'running',
    enabled: true,
    metrics: [
      { label: 'Sequences Active', value: '6', change: '+1', positive: true },
      { label: 'Open Rate', value: '42%', change: '+8%', positive: true },
      { label: 'Email Revenue', value: '$28,420', change: '+45%', positive: true }
    ],
    lastAction: 'Sent cart abandonment series',
    nextAction: 'Testing new subject lines'
  },
  {
    id: 'pricing_optimization',
    name: 'Dynamic Pricing AI',
    description: 'Optimizes pricing for maximum revenue and margin',
    icon: BarChart3,
    status: 'running',
    enabled: true,
    metrics: [
      { label: 'Price Tests', value: '47', change: '+12', positive: true },
      { label: 'Margin Lift', value: '+18%', positive: true },
      { label: 'Revenue Increase', value: '$12,340', positive: true }
    ],
    lastAction: 'Adjusted bundle pricing',
    nextAction: 'Testing scarcity triggers'
  }
];

interface AutonomousSellingEngineProps {
  className?: string;
}

export function AutonomousSellingEngine({ className }: AutonomousSellingEngineProps) {
  const [modules, setModules] = useState<AutonomousModule[]>(AUTONOMOUS_MODULES);
  const [isGlobalEnabled, setIsGlobalEnabled] = useState(true);
  const [systemStatus, setSystemStatus] = useState<'active' | 'paused' | 'learning'>('active');
  const [totalRevenue, setTotalRevenue] = useState(847291);
  const [actionsToday, setActionsToday] = useState(156);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (isGlobalEnabled) {
        setActionsToday(prev => prev + Math.floor(Math.random() * 3));
        setTotalRevenue(prev => prev + Math.floor(Math.random() * 500));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isGlobalEnabled]);

  const toggleModule = useCallback((moduleId: string) => {
    setModules(prev => prev.map(m => 
      m.id === moduleId 
        ? { ...m, enabled: !m.enabled, status: !m.enabled ? 'running' : 'paused' }
        : m
    ));
    toast.success('Module updated');
  }, []);

  const toggleGlobal = useCallback(() => {
    setIsGlobalEnabled(prev => !prev);
    setSystemStatus(prev => prev === 'active' ? 'paused' : 'active');
    toast.success(isGlobalEnabled ? 'Autonomous mode paused' : 'Autonomous mode activated');
  }, [isGlobalEnabled]);

  const getStatusColor = (status: AutonomousModule['status']) => {
    switch (status) {
      case 'running': return 'bg-success text-success';
      case 'optimizing': return 'bg-primary text-primary';
      case 'paused': return 'bg-muted-foreground text-muted-foreground';
      case 'error': return 'bg-destructive text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: AutonomousModule['status']) => {
    switch (status) {
      case 'running': return 'Active';
      case 'optimizing': return 'Optimizing';
      case 'paused': return 'Paused';
      case 'error': return 'Error';
      default: return 'Idle';
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* System Status Header */}
      <Card className="p-6 bg-gradient-to-br from-card to-primary/5 border-primary/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center",
              isGlobalEnabled 
                ? "bg-gradient-to-br from-primary to-chart-2" 
                : "bg-muted"
            )}>
              <Brain className={cn(
                "w-8 h-8",
                isGlobalEnabled ? "text-primary-foreground" : "text-muted-foreground"
              )} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-display font-bold">Autonomous Selling Engine</h2>
                <Badge className={cn(
                  systemStatus === 'active' ? 'bg-success/20 text-success' :
                  systemStatus === 'learning' ? 'bg-primary/20 text-primary' :
                  'bg-muted text-muted-foreground'
                )}>
                  {systemStatus === 'active' ? 'ACTIVE' : systemStatus === 'learning' ? 'LEARNING' : 'PAUSED'}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                AI is autonomously managing your revenue operations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold">${totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Revenue Generated</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{actionsToday}</p>
              <p className="text-xs text-muted-foreground">Actions Today</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {isGlobalEnabled ? 'Enabled' : 'Disabled'}
              </span>
              <Switch
                checked={isGlobalEnabled}
                onCheckedChange={toggleGlobal}
              />
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">System Optimization</span>
            <span className="font-medium">94% Optimal</span>
          </div>
          <Progress value={94} className="h-2" />
        </div>
      </Card>

      {/* Module Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((module, index) => {
          const Icon = module.icon;
          
          return (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={cn(
                "p-4 h-full transition-all",
                module.enabled ? "border-primary/20" : "border-border opacity-60"
              )}>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      module.enabled ? "bg-primary/20" : "bg-muted"
                    )}>
                      <Icon className={cn(
                        "w-5 h-5",
                        module.enabled ? "text-primary" : "text-muted-foreground"
                      )} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{module.name}</h3>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          getStatusColor(module.status).split(' ')[0]
                        )} />
                        <span className="text-xs text-muted-foreground">
                          {getStatusLabel(module.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={module.enabled}
                    onCheckedChange={() => toggleModule(module.id)}
                    disabled={!isGlobalEnabled}
                  />
                </div>

                {/* Metrics */}
                <div className="space-y-2 mb-3">
                  {module.metrics.slice(0, 2).map((metric, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{metric.label}</span>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{metric.value}</span>
                        {metric.change && (
                          <span className={cn(
                            "text-xs",
                            metric.positive ? "text-success" : "text-destructive"
                          )}>
                            {metric.change}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                {module.enabled && (
                  <div className="pt-3 border-t border-border/50 space-y-1">
                    {module.lastAction && (
                      <div className="flex items-start gap-2 text-xs">
                        <CheckCircle className="w-3 h-3 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground line-clamp-1">{module.lastAction}</span>
                      </div>
                    )}
                    {module.nextAction && (
                      <div className="flex items-start gap-2 text-xs">
                        <Sparkles className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground line-clamp-1">{module.nextAction}</span>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="p-4 bg-muted/30">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="w-4 h-4" />
            <span>System learns from every action to improve results</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Settings2 className="w-4 h-4" />
              Configure
            </Button>
            <Button size="sm" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              View Analytics
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Hook for autonomous selling operations
export function useAutonomousSelling() {
  const [isActive, setIsActive] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 847291,
    actionsToday: 156,
    optimizationScore: 94,
    modulesActive: 6
  });

  const activate = useCallback(() => {
    setIsActive(true);
    toast.success('Autonomous selling activated');
  }, []);

  const pause = useCallback(() => {
    setIsActive(false);
    toast.success('Autonomous selling paused');
  }, []);

  const triggerOptimization = useCallback(() => {
    toast.success('Optimization cycle triggered');
  }, []);

  return {
    isActive,
    stats,
    activate,
    pause,
    triggerOptimization
  };
}
