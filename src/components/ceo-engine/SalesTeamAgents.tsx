/**
 * Sales Team Agents Dashboard
 * Hierarchical autonomous agents for sales and marketing
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Bot,
  Target,
  TrendingUp,
  MessageSquare,
  Play,
  Pause,
  RefreshCw,
  Loader2,
  CheckCircle,
  AlertCircle,
  Crown,
  Briefcase,
  Megaphone,
  Search,
  Handshake,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Zap,
  Brain,
  Settings2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Agent {
  id: string;
  agent_name: string;
  agent_role: string;
  agent_type: string;
  status: string;
  current_task: string | null;
  last_activity_at: string | null;
  performance_metrics: Record<string, any>;
  debate_logs: any[];
}

interface Debate {
  id: string;
  debate_topic: string;
  participants: string[];
  debate_transcript: any[];
  consensus_reached: boolean;
  consensus_output: any;
  final_strategy: any;
  execution_status: string;
  created_at: string;
  completed_at: string | null;
}

const AGENT_ICONS: Record<string, React.ReactNode> = {
  ceo_brain: <Crown className="w-5 h-5" />,
  sales_head: <Briefcase className="w-5 h-5" />,
  marketing_head: <Megaphone className="w-5 h-5" />,
  lead_gen_agent: <Search className="w-5 h-5" />,
  deal_closer: <Handshake className="w-5 h-5" />,
  analytics_agent: <BarChart3 className="w-5 h-5" />,
};

const AGENT_COLORS: Record<string, string> = {
  ceo_brain: 'from-amber-500 to-orange-500',
  sales_head: 'from-blue-500 to-cyan-500',
  marketing_head: 'from-purple-500 to-pink-500',
  lead_gen_agent: 'from-green-500 to-emerald-500',
  deal_closer: 'from-red-500 to-rose-500',
  analytics_agent: 'from-indigo-500 to-violet-500',
};

export function SalesTeamAgents() {
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [debates, setDebates] = useState<Debate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isDebating, setIsDebating] = useState(false);
  const [selectedDebate, setSelectedDebate] = useState<Debate | null>(null);
  const [debateProgress, setDebateProgress] = useState(0);
  const [debateTopic, setDebateTopic] = useState('');

  useEffect(() => {
    if (user) {
      fetchAgents();
      fetchDebates();
    }
  }, [user]);

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('sales_team_agents')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAgents((data as Agent[]) || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDebates = async () => {
    try {
      const { data, error } = await supabase
        .from('agent_debates')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setDebates((data as Debate[]) || []);
    } catch (error) {
      console.error('Error fetching debates:', error);
    }
  };

  const deployAgents = useCallback(async () => {
    if (!user) return;
    setIsDeploying(true);

    try {
      const { data, error } = await supabase.functions.invoke('omega-ceo-brain', {
        body: {
          action: 'deploy_agents',
          query: 'Initialize sales team for revenue optimization',
          agentConfig: {
            agents: ['sales_head', 'marketing_head', 'lead_gen_agent', 'deal_closer', 'analytics_agent'],
          },
        },
      });

      if (error) throw error;

      toast.success(`Deployed ${data?.data?.agents?.length || 0} autonomous agents!`);
      fetchAgents();
    } catch (error) {
      console.error('Error deploying agents:', error);
      toast.error('Failed to deploy agents');
    } finally {
      setIsDeploying(false);
    }
  }, [user]);

  const runDebate = useCallback(async (topic: string) => {
    if (!user || !topic.trim()) return;
    setIsDebating(true);
    setDebateProgress(0);

    const progressInterval = setInterval(() => {
      setDebateProgress(prev => Math.min(prev + 8, 85));
    }, 500);

    try {
      const { data, error } = await supabase.functions.invoke('omega-ceo-brain', {
        body: {
          action: 'run_debate',
          query: topic,
          agentConfig: {
            debateTopic: topic,
            agents: ['sales_head', 'marketing_head', 'analytics_agent'],
          },
          context: {
            currentRevenue: 75000,
            targetRevenue: 1000000,
            industry: 'ecommerce',
          },
        },
      });

      clearInterval(progressInterval);
      setDebateProgress(100);

      if (error) throw error;

      toast.success('Debate complete! Consensus reached.');
      setDebateTopic('');
      fetchDebates();
      
      // Auto-select the new debate
      if (data?.data) {
        const newDebate: Debate = {
          id: data.data.debateId || crypto.randomUUID(),
          debate_topic: topic,
          participants: data.data.participants || [],
          debate_transcript: data.data.transcript || [],
          consensus_reached: true,
          consensus_output: { summary: data.data.consensus },
          final_strategy: data.data.finalStrategy,
          execution_status: 'ready',
          created_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        };
        setSelectedDebate(newDebate);
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Error running debate:', error);
      toast.error('Failed to run debate');
    } finally {
      setIsDebating(false);
      setDebateProgress(0);
    }
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success/20 text-success border-success/30';
      case 'idle': return 'bg-muted text-muted-foreground border-muted';
      case 'busy': return 'bg-warning/20 text-warning border-warning/30';
      case 'error': return 'bg-destructive/20 text-destructive border-destructive/30';
      default: return 'bg-muted text-muted-foreground border-muted';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600">
            <Users className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              Sales Team Agents
              <Badge className="bg-accent/20 text-accent border-accent/30">
                <Zap className="w-3 h-3 mr-1" />
                AUTONOMOUS
              </Badge>
            </h2>
            <p className="text-muted-foreground text-sm">
              Hierarchical AI agents debating and executing sales strategies
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchAgents}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={deployAgents}
            disabled={isDeploying}
            className="bg-gradient-to-r from-blue-500 to-purple-600"
          >
            {isDeploying ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Bot className="w-4 h-4 mr-2" />
            )}
            Deploy Agents
          </Button>
        </div>
      </div>

      <Tabs defaultValue="agents" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="agents" className="gap-2">
            <Users className="w-4 h-4" /> Agents
          </TabsTrigger>
          <TabsTrigger value="debates" className="gap-2">
            <MessageSquare className="w-4 h-4" /> Debates
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-2">
            <TrendingUp className="w-4 h-4" /> Performance
          </TabsTrigger>
        </TabsList>

        {/* Agents Tab */}
        <TabsContent value="agents" className="mt-6">
          {agents.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Bot className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Agents Deployed</h3>
                <p className="text-muted-foreground mb-4">
                  Deploy your autonomous sales team to start executing strategies
                </p>
                <Button onClick={deployAgents} disabled={isDeploying}>
                  {isDeploying ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Bot className="w-4 h-4 mr-2" />
                  )}
                  Deploy Sales Team
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map((agent, index) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:border-primary/50 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl bg-gradient-to-br ${AGENT_COLORS[agent.agent_type] || 'from-gray-500 to-gray-600'}`}>
                            {AGENT_ICONS[agent.agent_type] || <Bot className="w-5 h-5 text-white" />}
                          </div>
                          <div>
                            <CardTitle className="text-base">{agent.agent_name}</CardTitle>
                            <CardDescription className="text-xs">{agent.agent_role}</CardDescription>
                          </div>
                        </div>
                        <Badge className={getStatusColor(agent.status)}>
                          {agent.status === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {agent.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {agent.current_task && (
                        <div className="mb-3 p-2 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground">Current Task:</p>
                          <p className="text-sm truncate">{agent.current_task}</p>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Last active:</span>
                        <span>
                          {agent.last_activity_at
                            ? new Date(agent.last_activity_at).toLocaleTimeString()
                            : 'Never'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Debates Tab */}
        <TabsContent value="debates" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Start New Debate */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  Start Agent Debate
                </CardTitle>
                <CardDescription>
                  Agents will discuss and reach consensus on your topic
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={debateTopic}
                    onChange={(e) => setDebateTopic(e.target.value)}
                    placeholder="e.g., 'Target US skincare market via TikTok'"
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    disabled={isDebating}
                  />
                  
                  {isDebating && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Agents debating...</span>
                        <span className="font-mono text-primary">{debateProgress}%</span>
                      </div>
                      <Progress value={debateProgress} className="h-2" />
                    </div>
                  )}

                  <div className="flex gap-2">
                    {['Scale to $1M', 'Reduce CAC 40%', 'TikTok Strategy'].map((preset) => (
                      <Button
                        key={preset}
                        variant="outline"
                        size="sm"
                        onClick={() => setDebateTopic(preset)}
                        disabled={isDebating}
                      >
                        {preset}
                      </Button>
                    ))}
                  </div>

                  <Button
                    onClick={() => runDebate(debateTopic)}
                    disabled={!debateTopic.trim() || isDebating}
                    className="w-full"
                  >
                    {isDebating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <MessageSquare className="w-4 h-4 mr-2" />
                    )}
                    {isDebating ? 'Running Debate...' : 'Start Debate'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Debates */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Debates</CardTitle>
                <CardDescription>Past agent discussions and outcomes</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {debates.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No debates yet. Start one above!
                      </p>
                    ) : (
                      debates.map((debate) => (
                        <div
                          key={debate.id}
                          onClick={() => setSelectedDebate(debate)}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                            selectedDebate?.id === debate.id ? 'border-primary bg-primary/5' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-sm truncate flex-1">
                              {debate.debate_topic}
                            </p>
                            <Badge variant="outline" className="ml-2">
                              {debate.consensus_reached ? (
                                <CheckCircle className="w-3 h-3 mr-1 text-success" />
                              ) : (
                                <AlertCircle className="w-3 h-3 mr-1 text-warning" />
                              )}
                              {debate.consensus_reached ? 'Consensus' : 'Ongoing'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Users className="w-3 h-3" />
                            {debate.participants?.length || 0} participants
                            <span className="mx-1">•</span>
                            {new Date(debate.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Selected Debate Detail */}
          <AnimatePresence>
            {selectedDebate && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-6"
              >
                <Card className="border-accent/30">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <MessageSquare className="w-5 h-5 text-accent" />
                          Debate: {selectedDebate.debate_topic}
                        </CardTitle>
                        <CardDescription>
                          {selectedDebate.participants?.join(', ')}
                        </CardDescription>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedDebate(null)}>
                        Close
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-4">
                        {selectedDebate.debate_transcript?.map((entry: any, index: number) => (
                          <div key={index} className="p-4 rounded-lg bg-muted/50 border">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-accent">
                                <Bot className="w-4 h-4 text-white" />
                              </div>
                              <span className="font-semibold">{entry.agent}</span>
                              <Badge variant="outline" className="ml-auto">
                                {Math.round((entry.confidence || 0.8) * 100)}% confidence
                              </Badge>
                            </div>
                            <p className="text-sm whitespace-pre-wrap mb-3">{entry.response}</p>
                            {entry.recommendations?.length > 0 && (
                              <div className="pt-2 border-t">
                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                  Recommendations:
                                </p>
                                <ul className="text-xs space-y-1">
                                  {entry.recommendations.map((rec: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2">
                                      <ChevronRight className="w-3 h-3 mt-0.5 text-primary" />
                                      {rec}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}

                        {selectedDebate.consensus_output && (
                          <div className="p-4 rounded-lg bg-success/10 border border-success/30">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="w-5 h-5 text-success" />
                              <span className="font-semibold text-success">Consensus Reached</span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">
                              {selectedDebate.consensus_output.summary}
                            </p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-success/20">
                    <Target className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Debates Run</p>
                    <p className="text-2xl font-bold">{debates.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Agents</p>
                    <p className="text-2xl font-bold">
                      {agents.filter(a => a.status === 'active').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-accent/20">
                    <CheckCircle className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Consensus Rate</p>
                    <p className="text-2xl font-bold">
                      {debates.length > 0
                        ? Math.round((debates.filter(d => d.consensus_reached).length / debates.length) * 100)
                        : 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-warning/20">
                    <TrendingUp className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Strategies Executed</p>
                    <p className="text-2xl font-bold">
                      {debates.filter(d => d.execution_status === 'executed').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}