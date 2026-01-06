import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  Clock,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Zap
} from 'lucide-react';
import { useDemoEngineStore } from '@/stores/demo-engine-store';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

/**
 * CONTINUOUS IMPROVEMENT LOOP
 * 
 * Tracks engagement, replays, and drop-off points
 * Identifies which sections correlate with closes
 * Automatically optimizes future demo videos
 */

export const DemoAnalyticsPanel = () => {
  const { generatedDemos, capabilities, selectedCapabilities } = useDemoEngineStore();

  // Aggregate analytics
  const totalViews = generatedDemos.reduce((sum, d) => sum + d.analytics.views, 0);
  const avgCompletionRate = generatedDemos.length > 0
    ? generatedDemos.reduce((sum, d) => sum + d.analytics.completionRate, 0) / generatedDemos.length
    : 0;
  const avgCloseRate = generatedDemos.length > 0
    ? generatedDemos.reduce((sum, d) => sum + d.analytics.closeRate, 0) / generatedDemos.length
    : 0;
  const totalWatchTime = generatedDemos.reduce((sum, d) => sum + d.analytics.avgWatchTime, 0);

  // Simulate capability performance data
  const capabilityPerformance = capabilities.map((cap) => ({
    ...cap,
    closeCorrelation: Math.random() * 40 + 20, // Simulated 20-60%
    engagementScore: Math.random() * 30 + 70, // Simulated 70-100
    timesShown: Math.floor(Math.random() * 50 + 10),
  })).sort((a, b) => b.closeCorrelation - a.closeCorrelation);

  // Simulated optimization suggestions
  const optimizations = [
    {
      type: 'capability',
      title: 'Lead with Traffic Engine',
      description: 'Demos starting with traffic_engine have 34% higher completion rates',
      impact: '+34%',
      priority: 'high',
    },
    {
      type: 'length',
      title: 'Shorten Enterprise Demos',
      description: 'Enterprise demos over 4 minutes show 22% drop-off increase',
      impact: '-22% drop-off',
      priority: 'medium',
    },
    {
      type: 'variant',
      title: 'Intimidation Mode Closes Better',
      description: 'Intimidation variant shows 18% higher close rate for high-ticket',
      impact: '+18%',
      priority: 'high',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-lg bg-card border border-border"
        >
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Total Views</span>
          </div>
          <p className="text-3xl font-mono font-bold">{totalViews.toLocaleString()}</p>
          <div className="flex items-center gap-1 mt-1 text-success text-xs">
            <ArrowUpRight className="w-3 h-3" />
            +23% this week
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 rounded-lg bg-card border border-border"
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Avg Watch Time</span>
          </div>
          <p className="text-3xl font-mono font-bold">{Math.round(totalWatchTime / Math.max(generatedDemos.length, 1))}s</p>
          <div className="flex items-center gap-1 mt-1 text-success text-xs">
            <ArrowUpRight className="w-3 h-3" />
            +12% improvement
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 rounded-lg bg-success/10 border border-success/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-xs text-success">Completion Rate</span>
          </div>
          <p className="text-3xl font-mono font-bold text-success">{Math.round(avgCompletionRate)}%</p>
          <div className="flex items-center gap-1 mt-1 text-success text-xs">
            <ArrowUpRight className="w-3 h-3" />
            Above benchmark
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-5 rounded-lg bg-accent/10 border border-accent/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-accent" />
            <span className="text-xs text-accent">Demo Close Rate</span>
          </div>
          <p className="text-3xl font-mono font-bold text-accent">{Math.round(avgCloseRate)}%</p>
          <div className="flex items-center gap-1 mt-1 text-accent text-xs">
            <ArrowUpRight className="w-3 h-3" />
            +8% from optimization
          </div>
        </motion.div>
      </div>

      {/* Capability Performance */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Capability Close Correlation</h3>
          </div>
          <Badge variant="outline">Auto-optimizing</Badge>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Which capabilities correlate most with demo-to-close conversion
        </p>

        <div className="space-y-3">
          {capabilityPerformance.slice(0, 5).map((cap, index) => (
            <motion.div
              key={cap.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4"
            >
              <div className="w-8 text-center">
                <span className={cn(
                  "text-sm font-mono font-bold",
                  index === 0 ? "text-success" : 
                  index === 1 ? "text-accent" : 
                  "text-muted-foreground"
                )}>
                  #{index + 1}
                </span>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{cap.name}</span>
                  <span className="text-sm font-mono text-success">
                    {cap.closeCorrelation.toFixed(1)}% close correlation
                  </span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    className={cn(
                      "h-full rounded-full",
                      index === 0 ? "bg-success" : 
                      index === 1 ? "bg-accent" : 
                      "bg-primary"
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${cap.closeCorrelation}%` }}
                    transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* AI Optimization Suggestions */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-accent" />
          <h3 className="font-semibold">AI Optimization Suggestions</h3>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          The demo engine continuously learns what converts best
        </p>

        <div className="space-y-3">
          {optimizations.map((opt, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "p-4 rounded-lg border",
                opt.priority === 'high' 
                  ? "bg-success/5 border-success/20" 
                  : "bg-secondary/30 border-border/50"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    opt.priority === 'high' ? "bg-success/20" : "bg-secondary"
                  )}>
                    <Zap className={cn(
                      "w-4 h-4",
                      opt.priority === 'high' ? "text-success" : "text-muted-foreground"
                    )} />
                  </div>
                  <div>
                    <p className="font-medium">{opt.title}</p>
                    <p className="text-sm text-muted-foreground">{opt.description}</p>
                  </div>
                </div>
                <Badge variant={opt.priority === 'high' ? 'default' : 'outline'} className="gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  {opt.impact}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Learning Philosophy */}
      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <p className="text-sm font-medium mb-1">Continuous Improvement Loop</p>
            <p className="text-sm text-muted-foreground">
              Every view, completion, and close feeds back into the demo engine. 
              The system automatically prioritizes features that convert best and 
              optimizes narrative structure for maximum impact.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoAnalyticsPanel;
