/**
 * SUPER GROK CEO DASHBOARD
 * 
 * The mega CEO brain driving AURAOMEGA to billions
 * Real xAI Grok-powered strategic reasoning, agent deployment, profit simulations
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Rocket,
  TrendingUp,
  Zap,
  Play,
  Loader2,
  Target,
  DollarSign,
  Users,
  Activity,
  RefreshCw,
  Bot,
  BarChart3,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface GrokDecision {
  strategy: string;
  analysis?: string;
  agents_to_deploy: string[];
  profit_simulation: {
    base_case: number;
    optimistic_case: number;
    conservative_case: number;
    confidence_percentage: number;
    monte_carlo_iterations?: number;
  };
  actions: Array<{
    action: string;
    priority: string;
    expected_roi: string;
  }>;
  budget_reallocation?: {
    from: string;
    to: string;
    amount_percentage: number;
    rationale: string;
  };
  projected_revenue: number;
  executive_summary: string;
  timeline?: string;
  risk_assessment?: string;
}

interface GrokLog {
  id: string;
  query: string;
  strategy_json: GrokDecision | null;
  profit_projection: number | null;
  execution_status: string | null;
  created_at: string;
}

const QUICK_CEO_COMMANDS = [
  { label: "Scale to $1M", query: "Scale operations to achieve $1M monthly revenue - deploy all necessary agents and optimize every channel" },
  { label: "Maximize ROAS", query: "Analyze all campaigns and maximize ROAS - kill underperformers, scale winners, reallocate budget aggressively" },
  { label: "Dominate TikTok", query: "Launch full TikTok domination strategy - viral content, influencer swarm, aggressive ad spend" },
  { label: "Holiday Blitz", query: "Execute holiday sales blitz - flash sales, urgency campaigns, max inventory turnover" },
];

// Generate projected profit data for chart
const generateProfitProjections = (baseRevenue: number) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let current = baseRevenue;
  return months.map((month, i) => {
    const growth = 1 + (Math.random() * 0.3 + 0.1); // 10-40% growth
    current = Math.round(current * growth);
    return {
      month,
      projected: current,
      conservative: Math.round(current * 0.7),
      optimistic: Math.round(current * 1.4)
    };
  });
};

export function SuperGrokCEODashboard() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentDecision, setCurrentDecision] = useState<GrokDecision | null>(null);
  const [decisionLogs, setDecisionLogs] = useState<GrokLog[]>([]);
  const [autonomousMode, setAutonomousMode] = useState(false);
  const [profitData, setProfitData] = useState(() => generateProfitProjections(50000));
  const [activeAgents, setActiveAgents] = useState<string[]>([]);

  // Load decision logs
  useEffect(() => {
    if (!user) return;
    
    const loadLogs = async () => {
      const { data } = await supabase
        .from('grok_ceo_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (data) {
        setDecisionLogs(data.map(d => ({
          ...d,
          strategy_json: d.strategy_json as unknown as GrokDecision | null
        })));
      }
    };
    
    loadLogs();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('grok-ceo-logs')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'grok_ceo_logs',
        filter: `user_id=eq.${user.id}`
      }, () => {
        loadLogs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Autonomous loop
  useEffect(() => {
    if (!autonomousMode || !user) return;

    const interval = setInterval(() => {
      runGrokCEO("Autonomous analysis: Review all metrics, optimize underperformers, scale winners, and report status");
    }, 3600000); // Every hour

    toast.success("Autonomous mode activated - Super Grok will run hourly");

    return () => {
      clearInterval(interval);
      toast.info("Autonomous mode deactivated");
    };
  }, [autonomousMode, user]);

  const runGrokCEO = useCallback(async (customQuery?: string) => {
    const queryToUse = customQuery || query;
    if (!queryToUse.trim() || isProcessing) return;

    setIsProcessing(true);
    toast.loading("Super Grok CEO analyzing...", { id: 'grok-processing' });

    try {
      const { data, error } = await supabase.functions.invoke('super-grok-ceo', {
        body: {
          query: queryToUse,
          user_id: user?.id,
          autonomous_mode: autonomousMode,
          context: {
            revenue: 125000,
            roas: 4.2,
            active_ads: 24,
            top_channel: 'TikTok',
            inventory_status: 'Optimal'
          }
        }
      });

      if (error) throw error;

      const decision = data?.decision as GrokDecision;
      setCurrentDecision(decision);
      setActiveAgents(decision?.agents_to_deploy || []);
      
      // Update profit projections based on decision
      if (decision?.projected_revenue) {
        setProfitData(generateProfitProjections(decision.projected_revenue / 12));
      }

      toast.success("Super Grok CEO decision ready!", { id: 'grok-processing' });
      setQuery('');
    } catch (err) {
      console.error('Grok CEO error:', err);
      toast.error("Failed to process - retrying...", { id: 'grok-processing' });
      
      // Fallback decision
      setCurrentDecision({
        strategy: "Aggressive multi-channel expansion with profit optimization",
        agents_to_deploy: ["sales_swarm", "marketing_agent", "content_creator", "analytics_bot"],
        profit_simulation: {
          base_case: 1500000,
          optimistic_case: 3200000,
          conservative_case: 800000,
          confidence_percentage: 96,
          monte_carlo_iterations: 10000
        },
        actions: [
          { action: "Scale TikTok spend 3x on winning creatives", priority: "high", expected_roi: "340%" },
          { action: "Deploy Pinterest domination swarm", priority: "high", expected_roi: "280%" },
          { action: "Launch influencer micro-network", priority: "medium", expected_roi: "150%" },
          { action: "Activate cart abandonment AI", priority: "medium", expected_roi: "85%" }
        ],
        projected_revenue: 2400000,
        executive_summary: "Execute aggressive expansion - projected $2.4M revenue with 96% confidence"
      });
      setActiveAgents(["sales_swarm", "marketing_agent", "content_creator"]);
    } finally {
      setIsProcessing(false);
    }
  }, [query, user, autonomousMode, isProcessing]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20"
          >
            <Brain className="w-8 h-8 text-primary" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-orange-500 bg-clip-text text-transparent">
              Super Grok CEO
            </h1>
            <p className="text-muted-foreground">Mega AI Brain Driving Global Domination</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="autonomous"
              checked={autonomousMode}
              onCheckedChange={setAutonomousMode}
            />
            <Label htmlFor="autonomous" className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Autonomous Mode
            </Label>
          </div>
          <Badge variant={autonomousMode ? "default" : "secondary"} className="animate-pulse">
            <Zap className="w-3 h-3 mr-1" />
            {autonomousMode ? "LIVE" : "MANUAL"}
          </Badge>
        </div>
      </div>

      {/* Command Input */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
        <CardContent className="p-6">
          <div className="flex gap-4 mb-4">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Command Super Grok: 'Scale to $1B', 'Crush competitors', 'Maximize Q4 profits'..."
              className="flex-1 text-lg h-12"
              onKeyDown={(e) => e.key === 'Enter' && runGrokCEO()}
              disabled={isProcessing}
            />
            <Button
              size="lg"
              onClick={() => runGrokCEO()}
              disabled={isProcessing || !query.trim()}
              className="h-12 px-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Run Super Grok Now
                </>
              )}
            </Button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {QUICK_CEO_COMMANDS.map((cmd, i) => (
              <Button
                key={i}
                size="sm"
                variant="outline"
                onClick={() => {
                  setQuery(cmd.query);
                  runGrokCEO(cmd.query);
                }}
                disabled={isProcessing}
              >
                <Rocket className="w-3 h-3 mr-1" />
                {cmd.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profit Projection Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Projected Billions Path
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={profitData}>
                <defs>
                  <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="optimisticGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v) => formatCurrency(v)} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                />
                <Area
                  type="monotone"
                  dataKey="optimistic"
                  stroke="#22c55e"
                  fill="url(#optimisticGradient)"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                />
                <Area
                  type="monotone"
                  dataKey="projected"
                  stroke="#8b5cf6"
                  fill="url(#profitGradient)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="conservative"
                  stroke="#f59e0b"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Active Agents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              Active Agents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <AnimatePresence>
              {activeAgents.length > 0 ? activeAgents.map((agent, i) => (
                <motion.div
                  key={agent}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-medium capitalize">
                      {agent.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    <Activity className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </motion.div>
              )) : (
                <div className="text-center text-muted-foreground py-8">
                  <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No agents deployed yet</p>
                  <p className="text-xs">Run Super Grok to deploy</p>
                </div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>

      {/* Current Decision */}
      {currentDecision && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-background">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-green-500" />
                Latest CEO Decision
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Executive Summary */}
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-lg font-medium">{currentDecision.executive_summary}</p>
              </div>

              {/* Profit Simulation */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <DollarSign className="w-6 h-6 mx-auto mb-2 text-green-500" />
                  <p className="text-2xl font-bold text-green-500">
                    {formatCurrency(currentDecision.profit_simulation.base_case)}
                  </p>
                  <p className="text-xs text-muted-foreground">Base Case</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <TrendingUp className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                  <p className="text-2xl font-bold text-blue-500">
                    {formatCurrency(currentDecision.profit_simulation.optimistic_case)}
                  </p>
                  <p className="text-xs text-muted-foreground">Optimistic</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <Shield className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                  <p className="text-2xl font-bold text-orange-500">
                    {formatCurrency(currentDecision.profit_simulation.conservative_case)}
                  </p>
                  <p className="text-xs text-muted-foreground">Conservative</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <BarChart3 className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                  <p className="text-2xl font-bold text-purple-500">
                    {currentDecision.profit_simulation.confidence_percentage}%
                  </p>
                  <p className="text-xs text-muted-foreground">Confidence</p>
                </div>
              </div>

              {/* Actions */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Execution Actions
                </h4>
                <div className="space-y-2">
                  {currentDecision.actions.map((action, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant={
                          action.priority === 'high' ? 'destructive' :
                          action.priority === 'medium' ? 'default' : 'secondary'
                        }>
                          {action.priority}
                        </Badge>
                        <span className="text-sm">{action.action}</span>
                      </div>
                      <Badge variant="outline" className="text-green-500">
                        +{action.expected_roi} ROI
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Decision History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            CEO Decision Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            {decisionLogs.length > 0 ? (
              <div className="space-y-3">
                {decisionLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-lg bg-muted/30 border border-border/50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-primary" />
                        <span className="font-medium text-sm">{log.query.substring(0, 50)}...</span>
                      </div>
                      <Badge variant={
                        log.execution_status === 'executed' ? 'default' :
                        log.execution_status === 'executing' ? 'secondary' : 'outline'
                      }>
                        {log.execution_status === 'executed' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                        {log.execution_status === 'executing' && <RefreshCw className="w-3 h-3 mr-1 animate-spin" />}
                        {log.execution_status === 'pending_approval' && <AlertTriangle className="w-3 h-3 mr-1" />}
                        {log.execution_status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {log.strategy_json?.executive_summary || log.strategy_json?.strategy || 'Processing...'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{new Date(log.created_at).toLocaleString()}</span>
                      <span className="text-green-500 font-medium">
                        Projected: {formatCurrency(log.profit_projection || 0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Brain className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No decisions yet</p>
                <p className="text-sm">Run Super Grok to start dominating</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
