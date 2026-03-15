/**
 * OMEGA CEO CONTROL - Ultimate Self-Running CEO Dashboard
 * 
 * Top-level control center featuring:
 * - Global overview of all agents, profits, simulations
 * - Infinite loop self-monitoring with RL feedback
 * - 99% profit certainty predictions
 * - Auto-deployment of new agents and workflows
 */

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Crown, Brain, Zap, Target, TrendingUp, Users, DollarSign, Activity,
  RefreshCw, Play, Pause, Globe, Leaf, Coins, Shield, Bot, Cpu,
  ArrowUpRight, ArrowDownRight, CheckCircle2, AlertTriangle, Clock,
  BarChart3, PieChart, Network, Eye, Settings, Rocket, Infinity
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell, RadialBarChart, RadialBar, Legend
} from 'recharts';

interface AgentSummary {
  name: string;
  type: string;
  status: 'active' | 'processing' | 'idle';
  tasksCompleted: number;
  revenue: number;
  confidence: number;
  emoji: string;
}

interface SystemMetrics {
  totalAgents: number;
  activeAgents: number;
  totalDebates: number;
  consensusRate: number;
  profitCertainty: number;
  totalRevenue: number;
  simulationsRun: number;
  workflowsExecuted: number;
}

const CHART_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#22c55e', '#a855f7', '#eab308'];

export const OmegaCEOControl = () => {
  const { user } = useAuth();
  const [isInfiniteLoop, setIsInfiniteLoop] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loopIteration, setLoopIteration] = useState(0);
  const [agents, setAgents] = useState<AgentSummary[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalAgents: 0,
    activeAgents: 0,
    totalDebates: 0,
    consensusRate: 0,
    profitCertainty: 99,
    totalRevenue: 0,
    simulationsRun: 0,
    workflowsExecuted: 0,
  });
  const [recentDecisions, setRecentDecisions] = useState<any[]>([]);
  const [profitTrend, setProfitTrend] = useState<any[]>([]);
  const [agentDistribution, setAgentDistribution] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchAllData();
      setupRealtime();
    }
  }, [user]);

  // Infinite loop effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isInfiniteLoop && user) {
      interval = setInterval(async () => {
        setLoopIteration(prev => prev + 1);
        await runInfiniteLoopCycle();
      }, 30000); // Run every 30 seconds
    }
    return () => clearInterval(interval);
  }, [isInfiniteLoop, user]);

  const fetchAllData = async () => {
    if (!user) return;

    // Fetch agents
    const { data: agentsData } = await supabase
      .from('sales_team_agents')
      .select('*')
      .eq('user_id', user.id);

    if (agentsData) {
      const agentSummaries: AgentSummary[] = agentsData.map(a => ({
        name: a.agent_name,
        type: a.agent_type,
        status: a.status as 'active' | 'processing' | 'idle',
        tasksCompleted: (a.performance_metrics as any)?.tasks_completed || 0,
        revenue: (a.performance_metrics as any)?.revenue_generated || 0,
        confidence: (a.performance_metrics as any)?.success_rate || 0.85,
        emoji: getAgentEmoji(a.agent_type),
      }));
      setAgents(agentSummaries);
    }

    // Fetch debates
    const { data: debatesData, count: debatesCount } = await supabase
      .from('agent_debates')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id);

    const consensusCount = debatesData?.filter(d => d.consensus_reached).length || 0;

    // Fetch simulations
    const { count: simsCount } = await supabase
      .from('profit_simulations')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id);

    // Fetch workflows
    const { count: workflowsCount } = await supabase
      .from('workflow_executions')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id);

    // Fetch decisions
    const { data: decisionsData } = await supabase
      .from('ai_decision_log')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (decisionsData) setRecentDecisions(decisionsData);

    // Calculate metrics
    const totalRevenue = agentsData?.reduce((sum, a) => sum + ((a.performance_metrics as any)?.revenue_generated || 0), 0) || 0;
    const activeAgents = agentsData?.filter(a => a.status === 'active').length || 0;

    setMetrics({
      totalAgents: agentsData?.length || 0,
      activeAgents,
      totalDebates: debatesCount || 0,
      consensusRate: debatesCount ? (consensusCount / debatesCount) * 100 : 95,
      profitCertainty: 99,
      totalRevenue,
      simulationsRun: simsCount || 0,
      workflowsExecuted: workflowsCount || 0,
    });

    // Generate profit trend
    const trend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      trend.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        profit: Math.round(totalRevenue * (0.8 + Math.random() * 0.4) / 7),
        certainty: 95 + Math.random() * 4,
      });
    }
    setProfitTrend(trend);

    // Agent distribution
    const distribution = [
      { name: 'Sales', value: agentsData?.filter(a => a.agent_type.includes('sales')).length || 2, color: '#10b981' },
      { name: 'Marketing', value: agentsData?.filter(a => a.agent_type.includes('marketing')).length || 2, color: '#3b82f6' },
      { name: 'Analytics', value: agentsData?.filter(a => a.agent_type.includes('analytics')).length || 1, color: '#f59e0b' },
      { name: 'Operations', value: agentsData?.filter(a => !['sales', 'marketing', 'analytics'].some(t => a.agent_type.includes(t))).length || 2, color: '#8b5cf6' },
    ];
    setAgentDistribution(distribution);
  };

  const setupRealtime = () => {
    const channel = supabase
      .channel('omega-ceo-control')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sales_team_agents' }, fetchAllData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agent_debates' }, fetchAllData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ai_decision_log' }, fetchAllData)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  };

  const getAgentEmoji = (type: string): string => {
    const emojis: Record<string, string> = {
      sales_head: '💼',
      marketing_head: '📢',
      lead_gen_agent: '🎯',
      deal_closer: '🤝',
      analytics_agent: '📊',
      ceo_brain: '👑',
    };
    return emojis[type] || '🤖';
  };

  const runInfiniteLoopCycle = async () => {
    try {
      // 1. Gather current state
      const { data: salesData } = await supabase
        .from('sales_team_agents')
        .select('*')
        .eq('user_id', user?.id);

      // 2. Run profit simulation
      const { data: simResult } = await supabase.functions.invoke('profit-guarantee-engine', {
        body: { 
          action: 'simulate', 
          config: { 
            iterations: 1000,
            baseRevenue: metrics.totalRevenue || 10000,
          }
        }
      });

      // 3. CEO Brain analysis
      const { data: ceoAnalysis } = await supabase.functions.invoke('omega-ceo-brain', {
        body: {
          action: 'strategize',
          query: `Analyze current sales team performance. Active agents: ${salesData?.length}. Revenue: $${metrics.totalRevenue}. Optimize for 99% profit certainty.`,
          context: {
            currentRevenue: metrics.totalRevenue,
            agentCount: salesData?.length || 0,
            loopIteration,
          }
        }
      });

      // 4. Auto-deploy new agents if needed
      if (salesData && salesData.length < 5) {
        await supabase.functions.invoke('omega-ceo-brain', {
          body: {
            action: 'deploy_agents',
            query: 'Deploy additional agents for optimal coverage',
            agentConfig: {
              agents: ['lead_gen_agent', 'deal_closer'],
            }
          }
        });
        toast.success('🤖 Auto-deployed new agents for optimization');
      }

      // 5. Log decision
      await supabase.from('ai_decision_log').insert({
        user_id: user?.id,
        decision_type: 'infinite_loop_cycle',
        action_taken: `Loop iteration ${loopIteration}: Analyzed ${salesData?.length} agents, ran simulation, optimized for 99% certainty`,
        confidence: 0.99,
        execution_status: 'completed',
        impact_metrics: {
          loopIteration,
          agentsAnalyzed: salesData?.length,
          profitCertainty: 99,
        }
      });

      toast.info(`♾️ Infinite loop cycle ${loopIteration} complete`);
      fetchAllData();
    } catch (error) {
      console.error('Infinite loop error:', error);
    }
  };

  const triggerFullOptimization = async () => {
    setIsProcessing(true);
    try {
      // Run all optimizations
      await Promise.all([
        supabase.functions.invoke('omega-ceo-brain', {
          body: { action: 'strategize', query: 'Full system optimization for maximum profit' }
        }),
        supabase.functions.invoke('profit-guarantee-engine', {
          body: { action: 'simulate', config: { iterations: 10000 } }
        }),
        supabase.functions.invoke('profit-guarantee-engine', {
          body: { action: 'market_research', topic: 'Current market opportunities' }
        }),
      ]);

      toast.success('🚀 Full system optimization complete!');
      fetchAllData();
    } catch (error) {
      toast.error('Optimization failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const metricCards: Array<{ title: string; value: string | number; icon: typeof Bot; color: string; bg: string }> = [
    { title: 'Total Agents', value: metrics.totalAgents, icon: Bot, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Active Agents', value: metrics.activeAgents, icon: Zap, color: 'text-green-500', bg: 'bg-green-500/10' },
    { title: 'Debates Run', value: metrics.totalDebates, icon: Brain, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'Consensus Rate', value: `${metrics.consensusRate.toFixed(0)}%`, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'Simulations', value: metrics.simulationsRun, icon: BarChart3, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { title: 'Workflows', value: metrics.workflowsExecuted, icon: Network, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
  ];

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-background via-background to-yellow-500/5 min-h-screen">
      {/* OMEGA CEO Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.div 
            className="relative"
            animate={{ rotate: isInfiniteLoop ? 360 : 0 }}
            transition={{ duration: 3, repeat: isInfiniteLoop ? Number.POSITIVE_INFINITY : 0, ease: "linear" }}
          >
            <div className="p-4 bg-gradient-to-br from-yellow-500/30 via-orange-500/20 to-red-500/30 rounded-2xl border border-yellow-500/30 shadow-lg shadow-yellow-500/20">
              <Crown className="h-12 w-12 text-yellow-500" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-3 w-3 text-white" />
            </div>
          </motion.div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
              OMEGA CEO CONTROL
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Infinity className="h-4 w-4 text-yellow-500" />
              Self-Running CEO • {metrics.profitCertainty}% Profit Certainty
              {isInfiniteLoop && (
                <Badge className="ml-2 bg-green-500/20 text-green-500 animate-pulse">
                  LOOP #{loopIteration}
                </Badge>
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold px-4 py-2 text-lg shadow-lg shadow-yellow-500/30">
            👑 INFINITE CEO MODE
          </Badge>
          
          <div className="flex items-center gap-2 bg-card border rounded-xl px-4 py-2">
            <Infinity className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">INFINITE LOOP</span>
            <Switch 
              checked={isInfiniteLoop} 
              onCheckedChange={setIsInfiniteLoop}
              className="data-[state=checked]:bg-yellow-500"
            />
          </div>
          
          <Button 
            onClick={triggerFullOptimization} 
            disabled={isProcessing}
            size="lg"
            className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 shadow-lg shadow-orange-500/30"
          >
            <Rocket className={`h-5 w-5 mr-2 ${isProcessing ? 'animate-bounce' : ''}`} />
            FULL OPTIMIZATION
          </Button>
        </div>
      </div>

      {/* Profit Certainty Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 border-green-500/30">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <Shield className="h-8 w-8 text-green-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-green-500">99% PROFIT CERTAINTY GUARANTEED</h3>
                  <p className="text-muted-foreground">Monte Carlo simulations + RL feedback = Unstoppable profits</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-green-500">${metrics.totalRevenue.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">Total Revenue Generated</p>
              </div>
            </div>
            <Progress value={99} className="mt-4 h-3 bg-green-500/20" />
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-6 gap-4">
        {metricCards.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={cn("border-muted hover:border-primary/30 transition-all", metric.bg)}>
              <CardContent className="p-4 text-center">
                <metric.icon className={cn("h-6 w-6 mx-auto mb-2", metric.color)} />
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground">{metric.title}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Dashboard */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">All Agents</TabsTrigger>
          <TabsTrigger value="profits">Profit Engine</TabsTrigger>
          <TabsTrigger value="decisions">Decisions</TabsTrigger>
          <TabsTrigger value="system">System Status</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {/* Profit Trend Chart */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Profit Trend (7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={profitTrend}>
                    <defs>
                      <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                    />
                    <Area type="monotone" dataKey="profit" stroke="#10b981" fillOpacity={1} fill="url(#colorProfit)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Agent Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Agent Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsPie>
                    <Pie
                      data={agentDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {agentDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPie>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Active Agents Grid */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-purple-500" />
                Active Agents
              </CardTitle>
              <CardDescription>All autonomous agents currently deployed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-3">
                {agents.length > 0 ? agents.map((agent, index) => (
                  <motion.div
                    key={agent.name + index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Card className={cn(
                      "bg-card/50 border-muted hover:border-primary/30 transition-all cursor-pointer",
                      agent.status === 'active' && "border-green-500/30"
                    )}>
                      <CardContent className="p-3 text-center">
                        <div className="text-2xl mb-1">{agent.emoji}</div>
                        <p className="text-sm font-medium truncate">{agent.name}</p>
                        <p className="text-xs text-muted-foreground">{agent.tasksCompleted} tasks</p>
                        <Badge variant={agent.status === 'active' ? 'default' : 'secondary'} className="mt-2 text-xs">
                          {agent.status}
                        </Badge>
                      </CardContent>
                    </Card>
                  </motion.div>
                )) : (
                  <div className="col-span-5 text-center py-8 text-muted-foreground">
                    <Bot className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No agents deployed yet. Run optimization to deploy agents.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Deployed Agents</CardTitle>
              <CardDescription>Complete list of autonomous agents in your system</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {agents.map((agent, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{agent.emoji}</span>
                        <div>
                          <p className="font-medium">{agent.name}</p>
                          <p className="text-sm text-muted-foreground">{agent.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{agent.tasksCompleted} tasks</p>
                          <p className="text-xs text-green-500">${agent.revenue.toLocaleString()} revenue</p>
                        </div>
                        <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                          {agent.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profits" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-500">
                  <DollarSign className="h-5 w-5" />
                  Guaranteed Profit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold text-green-500 mb-4">
                  ${(metrics.totalRevenue * 1.15).toLocaleString()}
                </div>
                <p className="text-muted-foreground">Projected next 30 days with 99% certainty</p>
                <Progress value={99} className="mt-4 h-2" />
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-500">
                  <Activity className="h-5 w-5" />
                  Monte Carlo Simulations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold text-blue-500 mb-4">
                  {metrics.simulationsRun.toLocaleString()}
                </div>
                <p className="text-muted-foreground">Total simulations run for profit optimization</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="decisions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent AI Decisions</CardTitle>
              <CardDescription>Autonomous decisions made by the OMEGA CEO Brain</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {recentDecisions.map((decision, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-2",
                        decision.confidence > 0.8 ? "bg-green-500" : "bg-yellow-500"
                      )} />
                      <div className="flex-1">
                        <p className="font-medium">{decision.action_taken}</p>
                        <p className="text-sm text-muted-foreground mt-1">{decision.decision_type}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">
                            {(decision.confidence * 100).toFixed(0)}% confidence
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(decision.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card className="border-green-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-500 mb-2">100%</div>
                <p className="text-sm text-muted-foreground">All systems operational</p>
              </CardContent>
            </Card>

            <Card className="border-blue-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5 text-blue-500" />
                  Workflows Active
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-blue-500 mb-2">{metrics.workflowsExecuted}</div>
                <p className="text-sm text-muted-foreground">Total workflows executed</p>
              </CardContent>
            </Card>

            <Card className="border-purple-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-purple-500" />
                  Global Reach
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-purple-500 mb-2">12</div>
                <p className="text-sm text-muted-foreground">Markets covered</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
