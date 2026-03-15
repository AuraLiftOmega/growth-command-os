import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Brain, Zap, TrendingUp, AlertCircle, 
  CheckCircle, Clock, Loader2, Sparkles,
  Target, DollarSign, Activity, Power,
  Flame, Skull, Rocket, Timer, Crown,
  TrendingDown, BarChart3, Play, Pause
} from "lucide-react";
import { toast } from "sonner";

interface GrokThinking {
  analysis: string;
  commands: Array<{ bot_id: string; action: string; target: string; priority: string }>;
  optimizations: string[];
  projected_revenue: number;
  confidence: number;
  next_think_in_minutes: number;
  bottlenecks?: string[];
  winners_to_scale?: string[];
  losers_to_kill?: string[];
  performance_score?: number;
  roas?: number;
}

interface GrokBrainPanelProps {
  onThink: () => Promise<GrokThinking | null>;
  lastThinking: GrokThinking | null;
  isThinking: boolean;
}

// Performance metrics for aggressive analysis
const CURRENT_METRICS = {
  totalRevenue: 3190,
  salesDeals: 12,
  avgDealValue: 38,
  salesConversion: 0.68,
  adRoas: 3.2,
  adSpend: 33,
  engagementRate: 0.85,
  upsellSuccess: 0.4,
  domainSales: 0,
  performanceScore: 4.5,
};

export function GrokBrainPanel({ onThink, lastThinking, isThinking }: GrokBrainPanelProps) {
  const [autoThink, setAutoThink] = useState(false);
  const [isHourlyLoop, setIsHourlyLoop] = useState(false);
  const [loopCount, setLoopCount] = useState(0);
  const [nextLoopTime, setNextLoopTime] = useState<Date | null>(null);
  const [customQuery, setCustomQuery] = useState("");
  const [showQueryInput, setShowQueryInput] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Hourly autonomous loop
  useEffect(() => {
    if (!isHourlyLoop) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setNextLoopTime(null);
      return;
    }

    const runLoop = async () => {
      setLoopCount(prev => prev + 1);
      toast.info(`🧠 Autonomous Loop #${loopCount + 1} - Grok analyzing...`, { duration: 3000 });
      await onThink();
      setNextLoopTime(new Date(Date.now() + 60 * 60 * 1000)); // 1 hour
    };

    // Run immediately on activation
    runLoop();

    // Then run every hour
    intervalRef.current = setInterval(runLoop, 60 * 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isHourlyLoop, onThink, loopCount]);

  const getTimeUntilNextLoop = () => {
    if (!nextLoopTime) return null;
    const diff = nextLoopTime.getTime() - Date.now();
    if (diff <= 0) return "Running...";
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const toggleHourlyLoop = () => {
    const newState = !isHourlyLoop;
    setIsHourlyLoop(newState);
    if (newState) {
      toast.success("🚀 AUTONOMOUS MODE ACTIVATED - Grok self-thinking hourly for $10k+ revenue!", {
        duration: 5000,
      });
    } else {
      toast.info("Autonomous mode deactivated", { duration: 3000 });
    }
  };

  // Enhanced metrics display
  const enhancedThinking = lastThinking ? {
    ...lastThinking,
    bottlenecks: lastThinking.bottlenecks || [
      "Domain Bots: 0 sales - need whale outreach",
      "Ad Bots: Budget $33 too low for scale",
      "Engagement Bots: 40% upsell needs boost to 60%"
    ],
    winners_to_scale: lastThinking.winners_to_scale || [
      "Sales Bot 1-5: 68% conversion - SCALE 5x to WhatsApp",
      "Ad Bot 1: TikTok ROAS 3.2x - SCALE budget 10x",
      "Engagement Bot 1-3: 85% response - add upsell scripts"
    ],
    losers_to_kill: lastThinking.losers_to_kill || [
      "Domain Bot 1-10: 0 conversions - pivot to X outreach",
      "Ad Bot 7-10: ROAS < 1.5x - pause and reallocate"
    ],
    performance_score: lastThinking.performance_score || 4.5,
    roas: lastThinking.roas || 3.2
  } : null;

  return (
    <Card className="overflow-hidden border-2 border-primary/50 bg-gradient-to-br from-card via-card to-primary/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="flex items-center gap-2">
            <motion.div
              animate={isHourlyLoop ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Brain className={`h-7 w-7 ${isHourlyLoop ? 'text-green-500' : 'text-primary'}`} />
            </motion.div>
            <span className="text-xl font-bold">GROK CEO Brain</span>
            <Badge 
              variant="outline" 
              className={`${isHourlyLoop ? 'bg-green-500/20 text-green-500 border-green-500 animate-pulse' : 'bg-primary/10 text-primary border-primary/30'}`}
            >
              {isHourlyLoop ? '🔥 AUTONOMOUS' : 'Central Intelligence'}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Autonomous Mode Toggle */}
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <Switch
                id="hourly-loop"
                checked={isHourlyLoop}
                onCheckedChange={toggleHourlyLoop}
                className={isHourlyLoop ? 'data-[state=checked]:bg-green-500' : ''}
              />
              <Label htmlFor="hourly-loop" className="text-sm font-medium cursor-pointer">
                Hourly Auto-Think
              </Label>
              {isHourlyLoop && nextLoopTime && (
                <Badge variant="outline" className="bg-green-500/10 text-green-500 text-xs">
                  <Timer className="h-3 w-3 mr-1" />
                  Next: {getTimeUntilNextLoop()}
                </Badge>
              )}
            </div>
            
            <Button
              size="sm"
              variant={autoThink ? "default" : "outline"}
              onClick={() => setAutoThink(!autoThink)}
              className="text-xs"
            >
              <Clock className="h-3 w-3 mr-1" />
              Auto-Think {autoThink ? "ON" : "OFF"}
            </Button>
            
            <Button
              size="sm"
              onClick={onThink}
              disabled={isThinking}
              className="bg-gradient-to-r from-primary to-primary/80 font-bold"
            >
              {isThinking ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Thinking...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Think Now
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Performance Snapshot */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Current Performance Snapshot
            </h4>
            <Badge variant="outline" className={`${CURRENT_METRICS.performanceScore >= 7 ? 'text-green-500 border-green-500' : CURRENT_METRICS.performanceScore >= 5 ? 'text-yellow-500 border-yellow-500' : 'text-red-500 border-red-500'}`}>
              Score: {CURRENT_METRICS.performanceScore}/10
            </Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
            <div className="p-2 rounded bg-muted/50">
              <span className="text-muted-foreground">Revenue</span>
              <p className="font-bold text-green-500">${CURRENT_METRICS.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="p-2 rounded bg-muted/50">
              <span className="text-muted-foreground">Sales</span>
              <p className="font-bold">{CURRENT_METRICS.salesDeals} deals @ ${CURRENT_METRICS.avgDealValue}</p>
            </div>
            <div className="p-2 rounded bg-muted/50">
              <span className="text-muted-foreground">ROAS</span>
              <p className="font-bold text-blue-500">{CURRENT_METRICS.adRoas}x on ${CURRENT_METRICS.adSpend}</p>
            </div>
            <div className="p-2 rounded bg-muted/50">
              <span className="text-muted-foreground">Engagement</span>
              <p className="font-bold">{(CURRENT_METRICS.engagementRate * 100).toFixed(0)}% / {(CURRENT_METRICS.upsellSuccess * 100).toFixed(0)}% upsell</p>
            </div>
            <div className="p-2 rounded bg-muted/50">
              <span className="text-muted-foreground">Domains</span>
              <p className={`font-bold ${CURRENT_METRICS.domainSales === 0 ? 'text-red-500' : 'text-green-500'}`}>
                {CURRENT_METRICS.domainSales} sales
              </p>
            </div>
          </div>
        </div>

        {/* Custom Query Input */}
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowQueryInput(!showQueryInput)}
            className="w-full"
          >
            {showQueryInput ? 'Hide' : 'Custom Grok Query'} 
          </Button>
          <AnimatePresence>
            {showQueryInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Textarea
                  placeholder="Analyze bot team performance: Sales 12 deals $38 avg, Ad ROAS 3.2x $33 spend, Engagement 85% response 40% upsell, Domain 0 sales, Revenue tracking live. Optimize for $10k revenue tonight — scale winners, kill losers, adjust strategies, trigger n8n actions, hourly loop."
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  className="min-h-[80px] text-sm"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Thinking animation */}
        <AnimatePresence>
          {isThinking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 rounded-lg bg-primary/10 border border-primary/30"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Brain className="h-8 w-8 text-primary" />
                  <motion.div
                    className="absolute inset-0 bg-primary/30 rounded-full"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </div>
                <div>
                  <p className="font-medium">🧠 Analyzing 50 bots across 5 teams...</p>
                  <p className="text-sm text-muted-foreground">Running optimization algorithms for $10k+ tonight</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Thinking results */}
        {enhancedThinking && !isThinking && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Key metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-muted-foreground">Projected Revenue</span>
                </div>
                <p className="text-2xl font-bold text-green-500">
                  ${enhancedThinking.projected_revenue.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Confidence</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={enhancedThinking.confidence} className="h-2 flex-1" />
                  <span className="text-lg font-bold">{enhancedThinking.confidence}%</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <span className="text-xs text-muted-foreground">ROAS Target</span>
                </div>
                <p className="text-lg font-bold text-blue-500">
                  {enhancedThinking.roas}x → 5x+
                </p>
              </div>
              <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="text-xs text-muted-foreground">Next Think</span>
                </div>
                <p className="text-lg font-bold text-orange-500">
                  {enhancedThinking.next_think_in_minutes} min
                </p>
              </div>
            </div>

            {/* Analysis */}
            <div className="p-4 rounded-lg bg-muted/30">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Analysis
              </h4>
              <p className="text-sm text-muted-foreground">{enhancedThinking.analysis}</p>
            </div>

            {/* Bottlenecks - Kill Zone */}
            {enhancedThinking.bottlenecks && enhancedThinking.bottlenecks.length > 0 && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-red-500">
                  <AlertCircle className="h-4 w-4" />
                  Bottlenecks Identified (KILL)
                </h4>
                <ul className="space-y-1">
                  {enhancedThinking.bottlenecks.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Skull className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Winners - Scale Zone */}
            {enhancedThinking.winners_to_scale && enhancedThinking.winners_to_scale.length > 0 && (
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-500">
                  <Rocket className="h-4 w-4" />
                  Winners to Scale (5x)
                </h4>
                <ul className="space-y-1">
                  {enhancedThinking.winners_to_scale.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Losers to Kill */}
            {enhancedThinking.losers_to_kill && enhancedThinking.losers_to_kill.length > 0 && (
              <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-orange-500">
                  <TrendingDown className="h-4 w-4" />
                  Underperformers (Pivot/Kill)
                </h4>
                <ul className="space-y-1">
                  {enhancedThinking.losers_to_kill.map((l, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span>{l}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Commands */}
            {enhancedThinking.commands.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  Bot Commands ({enhancedThinking.commands.length})
                </h4>
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {enhancedThinking.commands.map((cmd, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={cmd.priority === "high" ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            {cmd.priority}
                          </Badge>
                          <span className="text-sm font-mono">{cmd.bot_id}</span>
                          <span className="text-sm text-muted-foreground">→</span>
                          <span className="text-sm">{cmd.action}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{cmd.target}</span>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Optimizations */}
            {enhancedThinking.optimizations.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Optimizations
                </h4>
                <ul className="space-y-1">
                  {enhancedThinking.optimizations.map((opt, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{opt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}

        {/* Empty state */}
        {!lastThinking && !isThinking && (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Click "Think Now" to activate Grok CEO Brain</p>
            <p className="text-sm">Analyzes all 50 bots and issues optimization commands</p>
            <p className="text-sm mt-2 text-primary">🎯 Target: $10k+ revenue tonight</p>
          </div>
        )}

        {/* Loop Status */}
        {isHourlyLoop && (
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-green-500 animate-pulse" />
                <span className="font-medium text-green-500">Autonomous Mode Active</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span>Loops: {loopCount}</span>
                {nextLoopTime && <span>Next: {getTimeUntilNextLoop()}</span>}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
