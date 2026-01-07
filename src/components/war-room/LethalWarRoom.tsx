import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, AlertTriangle, ArrowUpRight, ArrowDownRight, 
  Brain, DollarSign, Eye, Target, Zap, Users, ShoppingCart,
  TrendingUp, Play, Pause, RefreshCw, MessageSquare
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAdminEntitlements } from "@/hooks/useAdminEntitlements";

interface WarRoomMetrics {
  revenueToday: number;
  revenueChange: number;
  ordersToday: number;
  avgRoas: number;
  activeCreatives: number;
  pipelineValue: number;
  leadsToday: number;
  engagementRate: number;
}

interface DecisionLogEntry {
  id: string;
  decision_type: string;
  action_taken: string;
  reasoning: string;
  confidence: number;
  created_at: string;
  execution_status: string;
}

interface Alert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const LethalWarRoom = () => {
  const { user } = useAuth();
  const { isAdmin } = useAdminEntitlements();
  const [autoMode, setAutoMode] = useState(true);
  const [metrics, setMetrics] = useState<WarRoomMetrics>({
    revenueToday: 12847.50,
    revenueChange: 23.5,
    ordersToday: 47,
    avgRoas: 4.2,
    activeCreatives: 12,
    pipelineValue: 89500,
    leadsToday: 23,
    engagementRate: 8.7
  });
  const [decisions, setDecisions] = useState<DecisionLogEntry[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDecisions();
      fetchAlerts();
      setupRealtimeSubscription();
    }
  }, [user]);

  const fetchDecisions = async () => {
    const { data } = await supabase
      .from('ai_decision_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setDecisions(data);
  };

  const fetchAlerts = async () => {
    const { data } = await supabase
      .from('war_room_alerts')
      .select('*')
      .eq('is_dismissed', false)
      .order('created_at', { ascending: false })
      .limit(10);
    if (data) setAlerts(data);
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('war-room-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ai_decision_log' }, 
        (payload) => setDecisions(prev => [payload.new as DecisionLogEntry, ...prev.slice(0, 19)]))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'war_room_alerts' },
        (payload) => setAlerts(prev => [payload.new as Alert, ...prev.slice(0, 9)]))
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  const runManualOptimization = async () => {
    setIsProcessing(true);
    await supabase.functions.invoke('run-automation-jobs', {
      body: { manual: true, job_types: ['creative_generation', 'performance_optimization'] }
    });
    setIsProcessing(false);
    fetchDecisions();
  };

  const getDecisionIcon = (type: string) => {
    switch (type) {
      case 'creative_generated': return <Zap className="h-4 w-4 text-yellow-500" />;
      case 'budget_scaled': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'creative_killed': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'social_published': return <Eye className="h-4 w-4 text-blue-500" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* War Room Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-500/20 rounded-lg">
            <Target className="h-8 w-8 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">LETHAL WAR ROOM</h1>
            <p className="text-muted-foreground">Real-time command center • All systems operational</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {isAdmin && (
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold">
              ⚡ GOD MODE ACTIVE
            </Badge>
          )}
          <div className="flex items-center gap-2 bg-card border rounded-lg px-4 py-2">
            <span className="text-sm font-medium">FULL AUTO</span>
            <Switch checked={autoMode} onCheckedChange={setAutoMode} />
            {autoMode ? (
              <Play className="h-4 w-4 text-green-500" />
            ) : (
              <Pause className="h-4 w-4 text-yellow-500" />
            )}
          </div>
          <Button 
            onClick={runManualOptimization} 
            disabled={isProcessing}
            className="bg-red-600 hover:bg-red-700"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
            Force Optimize
          </Button>
        </div>
      </div>

      {/* Real-time Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Revenue Today</p>
                <p className="text-2xl font-bold text-green-500">${metrics.revenueToday.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-1 text-green-500">
                <ArrowUpRight className="h-4 w-4" />
                <span className="text-sm font-medium">+{metrics.revenueChange}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Orders</p>
                <p className="text-2xl font-bold text-blue-500">{metrics.ordersToday}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Avg ROAS</p>
                <p className="text-2xl font-bold text-purple-500">{metrics.avgRoas}x</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Pipeline</p>
                <p className="text-2xl font-bold text-orange-500">${(metrics.pipelineValue / 1000).toFixed(0)}K</p>
              </div>
              <Users className="h-8 w-8 text-orange-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="decisions" className="space-y-4">
        <TabsList className="bg-card border">
          <TabsTrigger value="decisions">
            <Brain className="h-4 w-4 mr-2" />
            AI Decisions
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Alerts ({alerts.filter(a => !a.is_read).length})
          </TabsTrigger>
          <TabsTrigger value="pipeline">
            <DollarSign className="h-4 w-4 mr-2" />
            Pipeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="decisions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI Decision Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {decisions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Brain className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No decisions yet. The AI CEO is analyzing...</p>
                    </div>
                  ) : (
                    decisions.map((decision) => (
                      <div key={decision.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border">
                        {getDecisionIcon(decision.decision_type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{decision.action_taken}</span>
                            <Badge variant="outline" className="text-xs">
                              {(decision.confidence * 100).toFixed(0)}% confident
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{decision.reasoning}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(decision.created_at).toLocaleString()}
                          </p>
                        </div>
                        <Badge 
                          variant={decision.execution_status === 'completed' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {decision.execution_status}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Active Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {alerts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>All systems nominal. No alerts.</p>
                    </div>
                  ) : (
                    alerts.map((alert) => (
                      <div key={alert.id} className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{alert.title}</span>
                          <Badge variant="outline" className="text-xs uppercase">
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="text-sm mt-1 opacity-80">{alert.message}</p>
                        <p className="text-xs mt-2 opacity-60">
                          {new Date(alert.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                Sales Pipeline Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                {['Discovery', 'Qualification', 'Proposal', 'Negotiation', 'Closed'].map((stage, i) => (
                  <div key={stage} className="text-center">
                    <div className={`h-2 rounded-full mb-2 ${
                      i === 4 ? 'bg-green-500' : 'bg-primary/30'
                    }`} />
                    <p className="text-sm font-medium">{stage}</p>
                    <p className="text-2xl font-bold text-foreground">{Math.floor(Math.random() * 10 + 1)}</p>
                    <p className="text-xs text-muted-foreground">
                      ${(Math.random() * 50000).toFixed(0)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
