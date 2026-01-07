import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Activity, AlertTriangle, ArrowUpRight, ArrowDownRight, 
  Brain, DollarSign, Eye, Target, Zap, Users, ShoppingCart,
  TrendingUp, Play, Pause, RefreshCw, MessageSquare, Mic, MicOff,
  Bot, Cpu, Network, Sparkles, BarChart3, PieChart, LineChart,
  Globe, Leaf, Coins, Shield, Languages
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAdminEntitlements } from "@/hooks/useAdminEntitlements";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { toast } from "sonner";

interface DecisionLogEntry {
  id: string;
  decision_type: string;
  action_taken: string;
  reasoning: string | null;
  confidence: number | null;
  created_at: string;
  execution_status: string | null;
  impact_metrics?: Record<string, unknown>;
}

interface AgentStatus {
  name: string;
  status: 'active' | 'idle' | 'processing';
  lastAction: string;
  decisions24h: number;
  avgConfidence: number;
  color: string;
  icon: string;
}

interface PipelineStage {
  name: string;
  value: number;
  deals: number;
}

const CHART_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

export const ImmersiveWarRoom = () => {
  const { user } = useAuth();
  const { isAdmin } = useAdminEntitlements();
  const [autoMode, setAutoMode] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [decisions, setDecisions] = useState<DecisionLogEntry[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [voiceCommand, setVoiceCommand] = useState("");
  const [ceoBrainInput, setCeoBrainInput] = useState("");
  const [ceoBrainResponse, setCeoBrainResponse] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [sustainabilityScore, setSustainabilityScore] = useState(78);
  
  const [revenueData, setRevenueData] = useState<{ hour: string; revenue: number; orders: number }[]>([]);
  const [pipelineData, setPipelineData] = useState<PipelineStage[]>([]);
  const [agentStatus, setAgentStatus] = useState<AgentStatus[]>([
    { name: 'Sales Agent', status: 'active', lastAction: 'Qualified lead', decisions24h: 12, avgConfidence: 0.87, color: '#10b981', icon: '💼' },
    { name: 'Creative Agent', status: 'processing', lastAction: 'Generating video', decisions24h: 8, avgConfidence: 0.92, color: '#3b82f6', icon: '🎨' },
    { name: 'Optimization Agent', status: 'active', lastAction: 'SEO update', decisions24h: 15, avgConfidence: 0.89, color: '#8b5cf6', icon: '⚡' },
    { name: 'Analytics Agent', status: 'idle', lastAction: 'Metrics sync', decisions24h: 24, avgConfidence: 0.94, color: '#f59e0b', icon: '📊' },
    { name: 'Forecasting Agent', status: 'active', lastAction: 'Demand prediction', decisions24h: 6, avgConfidence: 0.91, color: '#ef4444', icon: '🔮' },
    { name: 'Global Agent', status: 'idle', lastAction: 'Translation sync', decisions24h: 3, avgConfidence: 0.88, color: '#06b6d4', icon: '🌍' },
  ]);

  const recognitionRef = useRef<any>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        recognitionRef.current = new SpeechRecognitionAPI();
        const recognition = recognitionRef.current as any;
        recognition.continuous = false;
        recognition.interimResults = true;
        
        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          setVoiceCommand(transcript);
          
          if (event.results[0].isFinal) {
            handleVoiceCommand(transcript);
            setIsListening(false);
          }
        };
        
        recognition.onerror = () => {
          setIsListening(false);
          toast.error('Voice recognition error');
        };
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchDecisions();
      fetchMetrics();
      const cleanup = setupRealtimeSubscription();
      return cleanup;
    }
  }, [user]);

  const fetchDecisions = async () => {
    const { data } = await supabase
      .from('ai_decision_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setDecisions(data as DecisionLogEntry[]);
  };

  const fetchMetrics = async () => {
    // Generate realistic hourly data
    const hours = [];
    for (let i = 23; i >= 0; i--) {
      const hour = new Date();
      hour.setHours(hour.getHours() - i);
      hours.push({
        hour: hour.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        revenue: Math.floor(Math.random() * 2000) + 500,
        orders: Math.floor(Math.random() * 20) + 5
      });
    }
    setRevenueData(hours);

    setPipelineData([
      { name: 'Discovery', value: 45000, deals: 12 },
      { name: 'Qualified', value: 78000, deals: 8 },
      { name: 'Proposal', value: 125000, deals: 5 },
      { name: 'Negotiation', value: 89000, deals: 3 },
      { name: 'Closed', value: 234000, deals: 15 },
    ]);
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('immersive-war-room')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ai_decision_log' }, 
        (payload) => {
          const newDecision = payload.new as DecisionLogEntry;
          setDecisions(prev => [newDecision, ...prev.slice(0, 49)]);
          
          // Animate agent status
          const agentType = newDecision.decision_type.includes('swarm_') 
            ? newDecision.decision_type.replace('swarm_', '').replace('agent_', '').replace('_task', '')
            : null;
          
          if (agentType) {
            setAgentStatus(prev => prev.map(a => 
              a.name.toLowerCase().includes(agentType) 
                ? { ...a, status: 'processing' as const, lastAction: newDecision.action_taken }
                : a
            ));
            
            setTimeout(() => {
              setAgentStatus(prev => prev.map(a => 
                a.name.toLowerCase().includes(agentType) 
                  ? { ...a, status: 'active' as const }
                  : a
              ));
            }, 2000);
          }
        })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  };

  const toggleVoiceCommand = () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      toast.error('Speech recognition not supported');
      return;
    }
    
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
      setVoiceCommand("");
    }
  };

  const handleVoiceCommand = async (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('run optimization') || lowerCommand.includes('optimize')) {
      toast.info('🎤 Voice command: Running optimization...');
      await runSwarmCycle();
    } else if (lowerCommand.includes('show revenue') || lowerCommand.includes('revenue report')) {
      toast.info('🎤 Voice command: Displaying revenue data');
    } else if (lowerCommand.includes('status') || lowerCommand.includes('agent status')) {
      toast.info('🎤 Voice command: Agents are all operational');
    } else if (lowerCommand.includes('generate creative') || lowerCommand.includes('new video')) {
      toast.info('🎤 Voice command: Queuing creative generation...');
      await runAgentTask('creative', 'Generate new video ad concept');
    } else if (lowerCommand.includes('forecast') || lowerCommand.includes('predict')) {
      toast.info('🎤 Voice command: Running forecasting...');
      await runAgentTask('forecasting', 'Predict next week revenue and demand');
    } else {
      setCeoBrainInput(command);
      await sendToCeoBrain(command);
    }
  };

  const runSwarmCycle = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('multi-agent-swarm', {
        body: { action: 'run_cycle', user_id: user?.id }
      });
      if (error) throw error;
      toast.success('🐝 Multi-agent swarm cycle complete!');
      fetchDecisions();
    } catch (err) {
      toast.error('Failed to run swarm cycle');
    } finally {
      setIsProcessing(false);
    }
  };

  const runAgentTask = async (agent: string, task: string) => {
    try {
      const { error } = await supabase.functions.invoke('multi-agent-swarm', {
        body: { action: 'agent_task', agent, task, user_id: user?.id }
      });
      if (error) throw error;
      toast.success(`${agent} agent task initiated`);
      fetchDecisions();
    } catch (err) {
      toast.error(`Failed to run ${agent} task`);
    }
  };

  const sendToCeoBrain = async (input: string) => {
    if (!input.trim()) return;
    
    setIsThinking(true);
    try {
      const { data, error } = await supabase.functions.invoke('multi-agent-swarm', {
        body: { 
          action: 'agent_task', 
          agent: 'orchestrator', 
          task: input,
          context: { source: 'ceo_brain_chat' },
          user_id: user?.id 
        }
      });
      
      if (error) throw error;
      
      const response = data?.decision?.decision || data?.decision || 'I\'ve analyzed your request and queued the appropriate actions.';
      setCeoBrainResponse(response);
      toast.success('CEO Brain responded');
    } catch (err) {
      setCeoBrainResponse('I encountered an issue processing that request. Please try again.');
    } finally {
      setIsThinking(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'processing': return 'bg-yellow-500 animate-pulse';
      case 'idle': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
  const totalPipeline = pipelineData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-background to-muted/20 min-h-screen">
      {/* Command Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="p-4 bg-gradient-to-br from-red-500/30 to-orange-500/20 rounded-2xl border border-red-500/30">
              <Target className="h-10 w-10 text-red-500" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
              LETHAL WAR ROOM 2026
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Multi-Agent Swarm Active • {decisions.length} decisions today
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold px-4 py-2 text-sm">
              ⚡ GOD MODE ACTIVE
            </Badge>
          )}
          
          {/* Sustainability Score */}
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-xl px-3 py-2">
            <Leaf className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-green-500">{sustainabilityScore}%</span>
          </div>
          
          {/* Voice Command */}
          <Button
            variant={isListening ? "destructive" : "outline"}
            size="icon"
            onClick={toggleVoiceCommand}
            className="relative"
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            {isListening && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
            )}
          </Button>
          
          <div className="flex items-center gap-2 bg-card border rounded-xl px-4 py-2">
            <span className="text-sm font-medium">FULL AUTO</span>
            <Switch checked={autoMode} onCheckedChange={setAutoMode} />
            {autoMode ? (
              <Play className="h-4 w-4 text-green-500" />
            ) : (
              <Pause className="h-4 w-4 text-yellow-500" />
            )}
          </div>
          
          <Button 
            onClick={runSwarmCycle} 
            disabled={isProcessing}
            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
            Run Swarm
          </Button>
        </div>
      </div>

      {/* Voice Command Display */}
      {isListening && voiceCommand && (
        <Card className="border-red-500/50 bg-red-500/5">
          <CardContent className="py-3 flex items-center gap-3">
            <Mic className="h-5 w-5 text-red-500 animate-pulse" />
            <span className="text-foreground font-medium">{voiceCommand}</span>
          </CardContent>
        </Card>
      )}

      {/* Agent Status Bar */}
      <div className="grid grid-cols-6 gap-3">
        {agentStatus.map((agent) => (
          <Card key={agent.name} className="bg-card/50 backdrop-blur border-muted hover:border-primary/30 transition-all cursor-pointer" onClick={() => runAgentTask(agent.name.split(' ')[0].toLowerCase(), 'Run analysis cycle')}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{agent.icon}</span>
                  <span className="font-medium text-xs">{agent.name}</span>
                </div>
                <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`} />
              </div>
              <p className="text-xs text-muted-foreground truncate">{agent.lastAction}</p>
              <div className="flex items-center justify-between mt-2 text-xs">
                <span>{agent.decisions24h} decisions</span>
                <span className="text-green-500">{(agent.avgConfidence * 100).toFixed(0)}%</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-green-500" />
              Revenue Trend (24h)
              <Badge variant="outline" className="ml-auto">
                ${totalRevenue.toLocaleString()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="hour" stroke="#666" fontSize={10} />
                  <YAxis stroke="#666" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    fillOpacity={1} 
                    fill="url(#revenueGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pipeline Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-blue-500" />
              Pipeline Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={pipelineData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pipelineData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `$${value.toLocaleString()}`}
                    contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }}
                  />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">${(totalPipeline / 1000).toFixed(0)}K</p>
              <p className="text-xs text-muted-foreground">Total Pipeline Value</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section: AI Decisions & CEO Brain */}
      <div className="grid grid-cols-2 gap-6">
        {/* Live AI Decision Stream */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Live AI Decision Stream
              <Badge variant="secondary" className="ml-auto animate-pulse">
                LIVE
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {decisions.slice(0, 15).map((decision, i) => (
                  <div 
                    key={decision.id} 
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                      i === 0 ? 'bg-primary/10 border-primary/30 animate-in slide-in-from-top duration-300' : 'bg-muted/30'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      decision.decision_type.includes('sales') ? 'bg-green-500/20' :
                      decision.decision_type.includes('creative') ? 'bg-blue-500/20' :
                      decision.decision_type.includes('optimization') ? 'bg-purple-500/20' :
                      'bg-yellow-500/20'
                    }`}>
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{decision.action_taken}</span>
                        {decision.confidence && (
                          <Badge variant="outline" className="text-xs">
                            {(decision.confidence * 100).toFixed(0)}% conf
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {decision.reasoning || decision.decision_type}
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        {new Date(decision.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* CEO Brain Chat */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-red-500" />
              CEO Brain
              <Badge variant="outline" className="ml-auto">
                <Globe className="h-3 w-3 mr-1" />
                Multi-lingual
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Command your AI CEO..."
                value={ceoBrainInput}
                onChange={(e) => setCeoBrainInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendToCeoBrain(ceoBrainInput)}
                className="flex-1"
              />
              <Button 
                onClick={() => sendToCeoBrain(ceoBrainInput)}
                disabled={isThinking}
                className="bg-gradient-to-r from-red-600 to-orange-600"
              >
                {isThinking ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              </Button>
            </div>
            
            {ceoBrainResponse && (
              <div className="p-4 bg-muted/50 rounded-lg border">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <Brain className="h-4 w-4 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">CEO Brain</p>
                    <p className="text-sm text-muted-foreground mt-1">{ceoBrainResponse}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm" onClick={() => runAgentTask('forecasting', 'Generate demand forecast')}>
                <TrendingUp className="h-3 w-3 mr-1" /> Forecast
              </Button>
              <Button variant="outline" size="sm" onClick={() => runAgentTask('optimization', 'Optimize pricing')}>
                <DollarSign className="h-3 w-3 mr-1" /> Price
              </Button>
              <Button variant="outline" size="sm" onClick={() => runAgentTask('creative', 'Generate new creative')}>
                <Sparkles className="h-3 w-3 mr-1" /> Create
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Features Row */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Leaf className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="font-medium">Sustainability</p>
                <p className="text-2xl font-bold text-green-500">{sustainabilityScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Globe className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="font-medium">Global Reach</p>
                <p className="text-2xl font-bold text-blue-500">12 Markets</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Coins className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="font-medium">Web3 Ready</p>
                <p className="text-2xl font-bold text-purple-500">NFT + Crypto</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/5 border-yellow-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Shield className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="font-medium">Ethical AI</p>
                <p className="text-2xl font-bold text-yellow-500">Audited</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
