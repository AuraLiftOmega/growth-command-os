/**
 * AUTONOMOUS LOOPS PANEL
 * 
 * Real-time visualization of all autonomous CEO loops:
 * - Creative generation
 * - Performance optimization
 * - Social publishing
 * - A/B testing
 * - SEO optimization
 * - Dynamic pricing
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bot, 
  Zap, 
  Video,
  BarChart3,
  Share2,
  FlaskConical,
  Search,
  DollarSign,
  Play,
  Pause,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { useAutonomousEngine, AutonomousLoop, EngineStats } from '@/hooks/useAutonomousEngine';
import { useAdminEntitlements } from '@/hooks/useAdminEntitlements';
import { cn } from '@/lib/utils';

const LOOP_ICONS: Record<string, React.ElementType> = {
  'creative-gen': Video,
  'perf-optimizer': BarChart3,
  'social-publisher': Share2,
  'ab-tester': FlaskConical,
  'seo-optimizer': Search,
  'pricing-engine': DollarSign,
};

const STATUS_COLORS = {
  active: 'bg-success/20 text-success border-success/30',
  paused: 'bg-muted text-muted-foreground border-muted',
  learning: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
  error: 'bg-destructive/20 text-destructive border-destructive/30',
};

export function AutonomousLoopsPanel() {
  const { 
    loops, 
    stats, 
    isLoading, 
    isRunning, 
    triggerEngineRun, 
    toggleLoop, 
    toggleEngine 
  } = useAutonomousEngine();
  const { isAdmin } = useAdminEntitlements();
  const [expandedLoop, setExpandedLoop] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecuteAll = async () => {
    setIsExecuting(true);
    try {
      await triggerEngineRun();
    } finally {
      setIsExecuting(false);
    }
  };

  const formatTimeAgo = (date: Date | null) => {
    if (!date) return 'Never';
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const formatTimeUntil = (date: Date | null) => {
    if (!date) return 'Not scheduled';
    const minutes = Math.floor((date.getTime() - Date.now()) / 60000);
    if (minutes < 1) return 'Imminent';
    if (minutes < 60) return `${minutes}m`;
    return `${Math.floor(minutes / 60)}h`;
  };

  return (
    <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Autonomous Loops
                {isRunning && (
                  <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-xs">
                    <span className="relative flex h-2 w-2 mr-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                    </span>
                    LIVE
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {isAdmin && <span className="text-amber-500 font-medium">GOD MODE • </span>}
                {stats.activeLoops} loops active • {stats.totalActionsToday} actions today
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleExecuteAll}
              disabled={isExecuting}
              className="gap-1"
            >
              {isExecuting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Zap className="w-3.5 h-3.5" />
              )}
              Execute
            </Button>
            <Button
              size="sm"
              variant={isRunning ? 'default' : 'outline'}
              onClick={() => toggleEngine(!isRunning)}
              className={cn(
                'gap-1',
                isRunning && 'bg-success hover:bg-success/90'
              )}
            >
              {isRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  Running
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  Start
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2">
          <div className="p-2 rounded-lg bg-muted/50 text-center">
            <p className="text-lg font-bold text-success">${stats.totalRevenueToday.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Revenue</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/50 text-center">
            <p className="text-lg font-bold">{stats.creativesGenerated}</p>
            <p className="text-xs text-muted-foreground">Generated</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/50 text-center">
            <p className="text-lg font-bold text-destructive">{stats.creativesKilled}</p>
            <p className="text-xs text-muted-foreground">Killed</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/50 text-center">
            <p className="text-lg font-bold text-primary">{stats.creativesScaled}</p>
            <p className="text-xs text-muted-foreground">Scaled</p>
          </div>
        </div>

        {/* Loops List */}
        <ScrollArea className="h-[360px]">
          <div className="space-y-2">
            {loops.map((loop) => {
              const Icon = LOOP_ICONS[loop.id] || Bot;
              const isExpanded = expandedLoop === loop.id;

              return (
                <motion.div
                  key={loop.id}
                  layout
                  className={cn(
                    'rounded-lg border transition-all cursor-pointer',
                    loop.status === 'active' ? 'bg-muted/50' : 'bg-background opacity-70'
                  )}
                  onClick={() => setExpandedLoop(isExpanded ? null : loop.id)}
                >
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'p-2 rounded-lg',
                          loop.status === 'active' ? 'bg-primary/20' : 'bg-muted'
                        )}>
                          <Icon className={cn(
                            'w-4 h-4',
                            loop.status === 'active' ? 'text-primary' : 'text-muted-foreground'
                          )} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{loop.name}</p>
                            <Badge 
                              variant="outline" 
                              className={cn('text-xs px-1.5 py-0', STATUS_COLORS[loop.status])}
                            >
                              {loop.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{loop.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {loop.status === 'active' && (
                          <div className="text-right">
                            <p className="text-xs font-medium text-success">
                              ${loop.revenueGenerated.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {loop.actionsToday} actions
                            </p>
                          </div>
                        )}
                        <Switch
                          checked={loop.status === 'active'}
                          onCheckedChange={(checked) => {
                            toggleLoop(loop.id, checked);
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <ChevronRight className={cn(
                          'w-4 h-4 text-muted-foreground transition-transform',
                          isExpanded && 'rotate-90'
                        )} />
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-3 mt-3 border-t space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Last Run</p>
                                <div className="flex items-center gap-1 text-sm">
                                  <Clock className="w-3 h-3" />
                                  {formatTimeAgo(loop.lastRun)}
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Next Run</p>
                                <div className="flex items-center gap-1 text-sm">
                                  <Clock className="w-3 h-3" />
                                  {formatTimeUntil(loop.nextRun)}
                                </div>
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-xs text-muted-foreground">Efficiency</p>
                                <p className="text-xs font-medium">{loop.efficiency}%</p>
                              </div>
                              <Progress value={loop.efficiency} className="h-1.5" />
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                triggerEngineRun(loop.id.toUpperCase().replace(/-/g, '_'));
                              }}
                            >
                              <Zap className="w-3 h-3" />
                              Run Now
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>

        {/* ROAS Indicator */}
        <div className="pt-3 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-sm">Average ROAS</span>
            </div>
            <Badge variant="outline" className="bg-success/10 text-success border-success/30">
              {stats.avgROAS.toFixed(1)}x
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
