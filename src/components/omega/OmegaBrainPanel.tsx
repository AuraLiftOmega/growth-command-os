/**
 * OMEGA BRAIN PANEL
 * Full 9-agent intelligence dashboard with confidence %, last action, and Execute buttons
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Brain,
  Zap,
  Play,
  RefreshCw,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Crown,
  Sparkles,
  Target,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOmegaSwarm, type AgentType, type OmegaAgent } from '@/hooks/useOmegaSwarm';

const STATUS_STYLES = {
  active: 'border-success/50 bg-success/5',
  idle: 'border-muted bg-muted/20',
  executing: 'border-primary/50 bg-primary/5 animate-pulse',
  error: 'border-destructive/50 bg-destructive/5',
};

const STATUS_BADGE = {
  active: 'bg-success/20 text-success border-success/30',
  idle: 'bg-muted text-muted-foreground border-muted',
  executing: 'bg-primary/20 text-primary border-primary/30',
  error: 'bg-destructive/20 text-destructive border-destructive/30',
};

function formatTimeAgo(date: Date | null): string {
  if (!date) return 'Never';
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 80) return 'text-success';
  if (confidence >= 60) return 'text-amber-500';
  if (confidence >= 40) return 'text-orange-500';
  return 'text-muted-foreground';
}

interface AgentCardProps {
  agent: OmegaAgent;
  isExecuting: boolean;
  onExecute: () => void;
}

function AgentCard({ agent, isExecuting, onExecute }: AgentCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-xl border-2 p-4 transition-all',
        STATUS_STYLES[agent.status]
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center text-xl',
            agent.status === 'active' ? 'bg-primary/20' : 'bg-muted'
          )}>
            {agent.emoji}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm">{agent.name}</h4>
              {agent.id === 'orchestrator' && (
                <Crown className="w-3.5 h-3.5 text-amber-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {agent.description}
            </p>
          </div>
        </div>
        <Badge variant="outline" className={cn('text-[10px] px-1.5', STATUS_BADGE[agent.status])}>
          {agent.status}
        </Badge>
      </div>

      {/* Confidence & Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center p-2 rounded-lg bg-background/50">
          <p className={cn('text-lg font-bold', getConfidenceColor(agent.confidence))}>
            {agent.confidence}%
          </p>
          <p className="text-[10px] text-muted-foreground">Confidence</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-background/50">
          <p className="text-lg font-bold">{agent.actionsToday}</p>
          <p className="text-[10px] text-muted-foreground">Actions</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-background/50">
          <p className="text-lg font-bold text-success">
            ${agent.revenueImpact.toLocaleString()}
          </p>
          <p className="text-[10px] text-muted-foreground">Impact</p>
        </div>
      </div>

      {/* Last Action */}
      {agent.lastAction && (
        <div className="mb-3 p-2 rounded-lg bg-background/50 border border-dashed">
          <div className="flex items-center gap-1 mb-1">
            <Activity className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Last Action</span>
            <span className="text-[10px] text-muted-foreground ml-auto">
              {formatTimeAgo(agent.lastActionTime)}
            </span>
          </div>
          <p className="text-xs line-clamp-2">{agent.lastAction}</p>
        </div>
      )}

      {/* Execute Button */}
      <Button
        size="sm"
        variant={agent.status === 'active' ? 'default' : 'outline'}
        className="w-full gap-1.5"
        disabled={isExecuting}
        onClick={onExecute}
      >
        {isExecuting ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Executing...
          </>
        ) : (
          <>
            <Zap className="w-3.5 h-3.5" />
            Execute
          </>
        )}
      </Button>
    </motion.div>
  );
}

export function OmegaBrainPanel() {
  const {
    agents,
    stats,
    isLoading,
    isExecuting,
    executeAgent,
    executeFullCycle,
    simulateFirstSale,
    refresh,
  } = useOmegaSwarm();

  return (
    <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-transparent to-primary/5">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 shadow-lg shadow-orange-500/30">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                OMEGA Brain
                <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-xs">
                  <span className="relative flex h-2 w-2 mr-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                  </span>
                  9 AGENTS LIVE
                </Badge>
              </CardTitle>
              <CardDescription>
                {stats.activeAgents} agents active • {stats.totalActions24h} actions (24h) • Avg {stats.avgConfidence}% confidence
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={simulateFirstSale}
                    disabled={isExecuting !== null}
                    className="gap-1.5"
                  >
                    <Target className="w-4 h-4" />
                    Test Trigger
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Simulate first sale → agents propose 3 actions</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
            <Button
              size="sm"
              className="gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              onClick={executeFullCycle}
              disabled={isExecuting !== null}
            >
              {isExecuting === 'all' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Running Cycle...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Full Swarm Cycle
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-5 gap-3 mt-4">
          <div className="p-3 rounded-xl bg-success/10 border border-success/20 text-center">
            <p className="text-xl font-bold text-success">${stats.totalRevenue24h.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Revenue Impact (24h)</p>
          </div>
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-center">
            <p className="text-xl font-bold text-primary">{stats.totalActions24h}</p>
            <p className="text-xs text-muted-foreground">Actions (24h)</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
            <p className="text-xl font-bold text-amber-500">{stats.avgConfidence}%</p>
            <p className="text-xs text-muted-foreground">Avg Confidence</p>
          </div>
          <div className="p-3 rounded-xl bg-muted/50 border text-center">
            <p className="text-xl font-bold">{stats.activeAgents}/9</p>
            <p className="text-xs text-muted-foreground">Active Agents</p>
          </div>
          <div className="p-3 rounded-xl bg-muted/50 border text-center">
            <p className="text-xl font-bold">{stats.pendingActions}</p>
            <p className="text-xs text-muted-foreground">Pending Actions</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Agent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map(agent => (
            <AgentCard
              key={agent.id}
              agent={agent}
              isExecuting={isExecuting === agent.id}
              onExecute={() => executeAgent(agent.id)}
            />
          ))}
        </div>

        {/* Last Full Cycle */}
        {stats.lastFullCycle && (
          <div className="mt-4 pt-4 border-t flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              Last full cycle: {formatTimeAgo(stats.lastFullCycle)}
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-sm text-success">System healthy</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
