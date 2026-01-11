import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Layers, Server, Cpu, TrendingUp, Activity,
  Zap, ArrowUpRight, ArrowDownRight, Bot,
  RefreshCw, AlertTriangle, CheckCircle,
  Brain, Rocket, Gauge, BarChart3, Target,
  Play, Pause, Settings2, Shield
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ScalingMetrics {
  cpuUsage: number;
  memoryUsage: number;
  currentRoas: number;
  targetRoas: number;
  requestsPerSecond: number;
  errorRate: number;
  avgResponseTime: number;
  activeBots: number;
  maxBots: number;
  queueDepth: number;
}

interface ScalingEvent {
  id: string;
  type: 'scale_up' | 'scale_down' | 'prediction' | 'n8n_trigger';
  team: string;
  from: number;
  to: number;
  reason: string;
  timestamp: Date;
  status: 'pending' | 'executing' | 'completed' | 'failed';
}

interface DemandPrediction {
  hour: number;
  predictedLoad: number;
  recommendedBots: number;
  confidence: number;
}

interface AutoScalingConfig {
  enabled: boolean;
  minBots: number;
  maxBots: number;
  cpuThresholdUp: number;
  cpuThresholdDown: number;
  roasThresholdUp: number;
  targetRoas: number;
  roasThresholdDown: number;
  cooldownSeconds: number;
  predictiveScaling: boolean;
  n8nIntegration: boolean;
}

const DEFAULT_CONFIG: AutoScalingConfig = {
  enabled: true,
  minBots: 10,
  maxBots: 100,
  cpuThresholdUp: 80,
  cpuThresholdDown: 30,
  roasThresholdUp: 4.0,
  roasThresholdDown: 2.0,
  targetRoas: 5.0,
  cooldownSeconds: 60,
  predictiveScaling: true,
  n8nIntegration: true,
};

const TEAM_COLORS: Record<string, string> = {
  sales: 'text-green-500 border-green-500 bg-green-500/10',
  ad: 'text-blue-500 border-blue-500 bg-blue-500/10',
  domain: 'text-purple-500 border-purple-500 bg-purple-500/10',
  engagement: 'text-orange-500 border-orange-500 bg-orange-500/10',
  revenue: 'text-cyan-500 border-cyan-500 bg-cyan-500/10',
};

export function BotAutoScalingPanel() {
  const [config, setConfig] = useState<AutoScalingConfig>(DEFAULT_CONFIG);
  const [metrics, setMetrics] = useState<ScalingMetrics>({
    cpuUsage: 45,
    memoryUsage: 62,
    currentRoas: 3.2,
    targetRoas: 5.0,
    requestsPerSecond: 127,
    errorRate: 0.8,
    avgResponseTime: 45,
    activeBots: 50,
    maxBots: 100,
    queueDepth: 12,
  });
  const [events, setEvents] = useState<ScalingEvent[]>([]);
  const [predictions, setPredictions] = useState<DemandPrediction[]>([]);
  const [isScaling, setIsScaling] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  // Simulate real-time metrics updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        cpuUsage: Math.min(100, Math.max(0, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.min(100, Math.max(0, prev.memoryUsage + (Math.random() - 0.5) * 5)),
        currentRoas: Math.max(0, prev.currentRoas + (Math.random() - 0.4) * 0.3),
        requestsPerSecond: Math.max(0, prev.requestsPerSecond + (Math.random() - 0.5) * 20),
        errorRate: Math.max(0, Math.min(10, prev.errorRate + (Math.random() - 0.5) * 0.5)),
        queueDepth: Math.max(0, prev.queueDepth + Math.floor((Math.random() - 0.5) * 5)),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Check scaling conditions
  useEffect(() => {
    if (!config.enabled) return;

    const shouldScaleUp = 
      metrics.cpuUsage > config.cpuThresholdUp || 
      metrics.currentRoas > config.roasThresholdUp ||
      metrics.queueDepth > 20;

    const shouldScaleDown = 
      metrics.cpuUsage < config.cpuThresholdDown && 
      metrics.currentRoas < config.roasThresholdDown &&
      metrics.queueDepth < 5;

    if (shouldScaleUp && metrics.activeBots < config.maxBots) {
      triggerScaling('up');
    } else if (shouldScaleDown && metrics.activeBots > config.minBots) {
      triggerScaling('down');
    }
  }, [metrics, config]);

  // Generate predictions with Grok
  useEffect(() => {
    if (config.predictiveScaling) {
      generatePredictions();
    }
  }, [config.predictiveScaling]);

  const generatePredictions = async () => {
    // Simulate Grok-powered predictions
    const newPredictions: DemandPrediction[] = [];
    const now = new Date().getHours();
    
    for (let i = 0; i < 12; i++) {
      const hour = (now + i) % 24;
      const isPeakHour = hour >= 18 && hour <= 23;
      const baseLoad = isPeakHour ? 0.8 : 0.4;
      
      newPredictions.push({
        hour,
        predictedLoad: baseLoad + Math.random() * 0.3,
        recommendedBots: Math.floor((baseLoad + Math.random() * 0.3) * config.maxBots),
        confidence: 75 + Math.random() * 20,
      });
    }
    
    setPredictions(newPredictions);
  };

  const triggerScaling = async (direction: 'up' | 'down') => {
    if (isScaling) return;
    setIsScaling(true);

    const teams = ['sales', 'ad', 'engagement', 'domain', 'revenue'];
    const team = teams[Math.floor(Math.random() * teams.length)];
    const change = direction === 'up' ? 5 : -3;
    const from = metrics.activeBots;
    const to = Math.min(config.maxBots, Math.max(config.minBots, from + change));

    const event: ScalingEvent = {
      id: Date.now().toString(),
      type: direction === 'up' ? 'scale_up' : 'scale_down',
      team,
      from,
      to,
      reason: direction === 'up' 
        ? `CPU ${metrics.cpuUsage.toFixed(0)}% > ${config.cpuThresholdUp}% | ROAS ${metrics.currentRoas.toFixed(1)}x > ${config.roasThresholdUp}x`
        : `CPU ${metrics.cpuUsage.toFixed(0)}% < ${config.cpuThresholdDown}% | Low queue depth`,
      timestamp: new Date(),
      status: 'executing',
    };

    setEvents(prev => [event, ...prev].slice(0, 20));

    // Call backend for actual scaling
    try {
      await supabase.functions.invoke('bot-team-orchestrator', {
        body: {
          action: 'auto_scale',
          direction,
          team,
          currentBots: from,
          targetBots: to,
          reason: event.reason,
        },
      });

      // Trigger n8n if enabled
      if (config.n8nIntegration) {
        await supabase.functions.invoke('bot-team-orchestrator', {
          body: {
            action: 'n8n_webhook',
            event: 'bot_scaling',
            data: { direction, team, from, to, metrics },
          },
        });
      }

      setEvents(prev => prev.map(e => 
        e.id === event.id ? { ...e, status: 'completed' } : e
      ));

      setMetrics(prev => ({ ...prev, activeBots: to }));

      toast.success(
        direction === 'up' ? '🚀 Scaled UP' : '📉 Scaled DOWN',
        { description: `${team} team: ${from} → ${to} bots` }
      );
    } catch (error) {
      setEvents(prev => prev.map(e => 
        e.id === event.id ? { ...e, status: 'failed' } : e
      ));
      toast.error('Scaling failed');
    } finally {
      setIsScaling(false);
    }
  };

  const manualScale = async (team: string, direction: 'up' | 'down') => {
    const change = direction === 'up' ? 2 : -2;
    const from = metrics.activeBots;
    const to = Math.min(config.maxBots, Math.max(config.minBots, from + change));

    const event: ScalingEvent = {
      id: Date.now().toString(),
      type: direction === 'up' ? 'scale_up' : 'scale_down',
      team,
      from,
      to,
      reason: 'Manual override',
      timestamp: new Date(),
      status: 'completed',
    };

    setEvents(prev => [event, ...prev].slice(0, 20));
    setMetrics(prev => ({ ...prev, activeBots: to }));

    toast.success(`${team} team scaled ${direction}`, { description: `${from} → ${to} bots` });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500';
      case 'executing': return 'text-yellow-500';
      case 'failed': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card className="overflow-hidden border-2 border-cyan-500/50 bg-gradient-to-br from-card via-card to-cyan-500/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="flex items-center gap-2">
            <motion.div
              animate={config.enabled ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Layers className="h-6 w-6 text-cyan-500" />
            </motion.div>
            <span className="text-xl font-bold">Auto-Scaling Engine</span>
            <Badge 
              variant="outline" 
              className={config.enabled ? 'bg-green-500/20 text-green-500 border-green-500' : 'bg-muted text-muted-foreground'}
            >
              {config.enabled ? '⚡ ACTIVE' : 'Disabled'}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfig(!showConfig)}
            >
              <Settings2 className="h-4 w-4 mr-1" />
              Config
            </Button>
            <Switch
              checked={config.enabled}
              onCheckedChange={(enabled) => setConfig(prev => ({ ...prev, enabled }))}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Real-time Metrics Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Cpu className="h-3 w-3" /> CPU
              </span>
              <Badge variant="outline" className={`text-xs ${metrics.cpuUsage > 80 ? 'text-red-500 border-red-500' : metrics.cpuUsage > 60 ? 'text-yellow-500 border-yellow-500' : 'text-green-500 border-green-500'}`}>
                {metrics.cpuUsage.toFixed(0)}%
              </Badge>
            </div>
            <Progress value={metrics.cpuUsage} className="h-2" />
          </div>
          
          <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> ROAS
              </span>
              <Badge variant="outline" className={`text-xs ${metrics.currentRoas >= config.roasThresholdUp ? 'text-green-500 border-green-500' : 'text-yellow-500 border-yellow-500'}`}>
                {metrics.currentRoas.toFixed(1)}x
              </Badge>
            </div>
            <div className="text-sm">
              <span className="font-bold">{metrics.currentRoas.toFixed(1)}x</span>
              <span className="text-muted-foreground"> / {config.targetRoas}x target</span>
            </div>
          </div>
          
          <div className="p-3 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Bot className="h-3 w-3" /> Bots
              </span>
              <Badge variant="outline" className="text-xs text-green-500 border-green-500">
                {metrics.activeBots}/{config.maxBots}
              </Badge>
            </div>
            <Progress value={(metrics.activeBots / config.maxBots) * 100} className="h-2" />
          </div>
          
          <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Activity className="h-3 w-3" /> Queue
              </span>
              <Badge variant="outline" className={`text-xs ${metrics.queueDepth > 20 ? 'text-red-500 border-red-500' : 'text-green-500 border-green-500'}`}>
                {metrics.queueDepth}
              </Badge>
            </div>
            <div className="text-sm">
              <span className="font-bold">{metrics.requestsPerSecond.toFixed(0)}</span>
              <span className="text-muted-foreground"> req/s</span>
            </div>
          </div>
        </div>

        {/* Scaling Thresholds */}
        <AnimatePresence>
          {showConfig && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 rounded-lg bg-muted/30 border border-muted space-y-4"
            >
              <h4 className="font-semibold flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                Scaling Configuration
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">CPU Scale Up Threshold: {config.cpuThresholdUp}%</Label>
                  <Slider
                    value={[config.cpuThresholdUp]}
                    onValueChange={([v]) => setConfig(prev => ({ ...prev, cpuThresholdUp: v }))}
                    min={50}
                    max={95}
                    step={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">CPU Scale Down Threshold: {config.cpuThresholdDown}%</Label>
                  <Slider
                    value={[config.cpuThresholdDown]}
                    onValueChange={([v]) => setConfig(prev => ({ ...prev, cpuThresholdDown: v }))}
                    min={10}
                    max={50}
                    step={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">ROAS Scale Up: {config.roasThresholdUp}x</Label>
                  <Slider
                    value={[config.roasThresholdUp * 10]}
                    onValueChange={([v]) => setConfig(prev => ({ ...prev, roasThresholdUp: v / 10 }))}
                    min={20}
                    max={100}
                    step={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Min/Max Bots: {config.minBots} - {config.maxBots}</Label>
                  <div className="flex gap-2">
                    <Slider
                      value={[config.minBots]}
                      onValueChange={([v]) => setConfig(prev => ({ ...prev, minBots: v }))}
                      min={5}
                      max={50}
                      step={5}
                      className="flex-1"
                    />
                    <Slider
                      value={[config.maxBots]}
                      onValueChange={([v]) => setConfig(prev => ({ ...prev, maxBots: v }))}
                      min={50}
                      max={200}
                      step={10}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={config.predictiveScaling}
                    onCheckedChange={(v) => setConfig(prev => ({ ...prev, predictiveScaling: v }))}
                  />
                  <Label className="text-sm">Grok Predictive Scaling</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={config.n8nIntegration}
                    onCheckedChange={(v) => setConfig(prev => ({ ...prev, n8nIntegration: v }))}
                  />
                  <Label className="text-sm">n8n Webhook Triggers</Label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grok Demand Predictions */}
        {config.predictiveScaling && predictions.length > 0 && (
          <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/30">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              Grok Demand Prediction (Next 12h)
            </h4>
            <div className="flex gap-1 overflow-x-auto pb-2">
              {predictions.map((pred, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-16 text-center p-2 rounded bg-muted/50"
                >
                  <div className="text-xs text-muted-foreground">{pred.hour}:00</div>
                  <div 
                    className="h-12 rounded mt-1 flex items-end justify-center"
                    style={{ background: `linear-gradient(to top, hsl(var(--primary)) ${pred.predictedLoad * 100}%, transparent ${pred.predictedLoad * 100}%)` }}
                  >
                    <span className="text-xs font-bold">{pred.recommendedBots}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {pred.confidence.toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Team Manual Controls */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {['sales', 'ad', 'engagement', 'domain', 'revenue'].map(team => (
            <div
              key={team}
              className={`p-3 rounded-lg border ${TEAM_COLORS[team]}`}
            >
              <div className="text-xs font-medium mb-2 capitalize">{team}</div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1 h-7 text-xs"
                  onClick={() => manualScale(team, 'up')}
                >
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1 h-7 text-xs"
                  onClick={() => manualScale(team, 'down')}
                >
                  <ArrowDownRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Scaling Events Log */}
        <div className="space-y-2">
          <h4 className="font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Recent Scaling Events
          </h4>
          <ScrollArea className="h-40">
            <div className="space-y-2">
              {events.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No scaling events yet. Enable auto-scaling to begin.
                </p>
              ) : (
                events.map(event => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 p-2 rounded bg-muted/30 text-sm"
                  >
                    <div className={`p-1.5 rounded ${TEAM_COLORS[event.team] || 'bg-muted'}`}>
                      {event.type === 'scale_up' ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">{event.team}</span>
                        <span className="text-muted-foreground">{event.from} → {event.to}</span>
                        <Badge variant="outline" className={`text-xs ${getStatusColor(event.status)}`}>
                          {event.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{event.reason}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {event.timestamp.toLocaleTimeString()}
                    </span>
                  </motion.div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* System Health */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">System Health</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">Error Rate: {metrics.errorRate.toFixed(1)}%</span>
            <span className="text-muted-foreground">Latency: {metrics.avgResponseTime}ms</span>
            <Badge variant="outline" className={metrics.errorRate < 2 ? 'text-green-500 border-green-500' : 'text-yellow-500 border-yellow-500'}>
              {metrics.errorRate < 2 ? 'Healthy' : 'Warning'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
