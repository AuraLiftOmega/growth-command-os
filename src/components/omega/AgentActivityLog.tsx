/**
 * AGENT ACTIVITY LOG
 * Live log of agent actions with "HOT" actions pulsing for War Room
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  Flame,
  Activity,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  RefreshCw,
  Zap,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOmegaSwarm, type HotAction, type AgentType } from '@/hooks/useOmegaSwarm';

const AGENT_EMOJIS: Record<AgentType, string> = {
  analytics: '📊',
  forecasting: '🔮',
  sales: '💼',
  creative: '🎨',
  optimization: '⚡',
  global: '🌍',
  sustainability: '🌱',
  web3: '⛓️',
  orchestrator: '👑',
};

const STATUS_ICONS = {
  pending: Clock,
  executing: Loader2,
  completed: CheckCircle2,
  failed: XCircle,
};

const STATUS_STYLES = {
  pending: 'text-amber-500',
  executing: 'text-primary animate-spin',
  completed: 'text-success',
  failed: 'text-destructive',
};

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

interface ActionItemProps {
  action: HotAction;
  index: number;
}

function ActionItem({ action, index }: ActionItemProps) {
  const StatusIcon = STATUS_ICONS[action.status];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'p-3 rounded-xl border transition-all',
        action.isHot 
          ? 'bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/30 shadow-lg shadow-orange-500/10' 
          : 'bg-muted/30 border-border'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Agent Emoji */}
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0',
          action.isHot ? 'bg-orange-500/20 animate-pulse' : 'bg-muted'
        )}>
          {AGENT_EMOJIS[action.agent]}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm capitalize">{action.agent}</span>
            {action.isHot && (
              <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30 gap-1 animate-pulse">
                <Flame className="w-3 h-3" />
                HOT
              </Badge>
            )}
            <Badge variant="outline" className={cn('text-[10px] gap-1', STATUS_STYLES[action.status])}>
              <StatusIcon className="w-3 h-3" />
              {action.status}
            </Badge>
            <span className="text-xs text-muted-foreground ml-auto">
              {formatTimeAgo(action.timestamp)}
            </span>
          </div>
          <p className="text-sm text-foreground/90 line-clamp-2">{action.action}</p>
          
          {/* Metrics */}
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1 text-xs">
              <Zap className="w-3 h-3 text-primary" />
              <span className={getConfidenceColor(action.confidence)}>
                {action.confidence}% confidence
              </span>
            </div>
            {action.revenueImpact > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <DollarSign className="w-3 h-3 text-success" />
                <span className="text-success">
                  +${action.revenueImpact.toLocaleString()} impact
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 80) return 'text-success';
  if (confidence >= 60) return 'text-amber-500';
  return 'text-muted-foreground';
}

interface AgentActivityLogProps {
  className?: string;
  maxHeight?: string;
}

export function AgentActivityLog({ className, maxHeight = '500px' }: AgentActivityLogProps) {
  const { hotActions, isLoading, refresh, stats } = useOmegaSwarm();

  const hotCount = hotActions.filter(a => a.isHot).length;
  const totalRevenue = hotActions.reduce((sum, a) => sum + a.revenueImpact, 0);

  return (
    <Card className={cn('border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/30">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Live Agent Log
                {hotCount > 0 && (
                  <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30 animate-pulse gap-1">
                    <Flame className="w-3 h-3" />
                    {hotCount} HOT
                  </Badge>
                )}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {hotActions.length} actions • ${totalRevenue.toLocaleString()} revenue impact
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={refresh}
            disabled={isLoading}
            className="gap-1.5"
          >
            <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
            Refresh
          </Button>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-4 gap-2 mt-3">
          <div className="p-2 rounded-lg bg-success/10 text-center">
            <p className="text-sm font-bold text-success">{stats.activeAgents}</p>
            <p className="text-[10px] text-muted-foreground">Active</p>
          </div>
          <div className="p-2 rounded-lg bg-primary/10 text-center">
            <p className="text-sm font-bold text-primary">{stats.totalActions24h}</p>
            <p className="text-[10px] text-muted-foreground">24h</p>
          </div>
          <div className="p-2 rounded-lg bg-amber-500/10 text-center">
            <p className="text-sm font-bold text-amber-500">{stats.avgConfidence}%</p>
            <p className="text-[10px] text-muted-foreground">Conf</p>
          </div>
          <div className="p-2 rounded-lg bg-orange-500/10 text-center">
            <p className="text-sm font-bold text-orange-500">{hotCount}</p>
            <p className="text-[10px] text-muted-foreground">Hot</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea style={{ maxHeight }} className="pr-2">
          <AnimatePresence mode="popLayout">
            {hotActions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-muted-foreground"
              >
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No recent actions</p>
                <p className="text-xs mt-1">Execute an agent or run a full cycle</p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {hotActions.map((action, index) => (
                  <ActionItem key={action.id} action={action} index={index} />
                ))}
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
