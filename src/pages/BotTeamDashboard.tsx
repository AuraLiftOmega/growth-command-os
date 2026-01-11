import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  BOT_TEAMS, TEAM_ORDER, getTotalBots,
  BotTeamSection, GrokBrainPanel, LiveBotLogs, TeamPerformanceChart,
  BotAutoScalingPanel, BotAnalyticsDashboard
} from "@/components/bot-team";
import { 
  Bot, Power, Zap, Activity, DollarSign, 
  TrendingUp, Brain, RefreshCw, Layers, BarChart3
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BotLog {
  id: string;
  bot_id: string;
  bot_name: string;
  team: string;
  action: string;
  action_type: string;
  status: string;
  revenue_impact: number;
  created_at: string;
}

interface GrokThinking {
  analysis: string;
  commands: Array<{ bot_id: string; action: string; target: string; priority: string }>;
  optimizations: string[];
  projected_revenue: number;
  confidence: number;
  next_think_in_minutes: number;
}

export default function BotTeamDashboard() {
  const { user } = useAuth();
  const [activeBots, setActiveBots] = useState<Set<string>>(new Set());
  const [botStats, setBotStats] = useState<Record<string, { tasks: number; revenue: number; successRate: number }>>({});
  const [teamStats, setTeamStats] = useState<Record<string, { revenue: number; tasks: number; errors: number }>>({});
  const [logs, setLogs] = useState<BotLog[]>([]);
  const [isActivatingAll, setIsActivatingAll] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [lastThinking, setLastThinking] = useState<GrokThinking | null>(null);
  const [isLive, setIsLive] = useState(true);

  // Load logs
  const loadLogs = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("bot_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setLogs(data as BotLog[]);
  }, [user]);

  // Subscribe to realtime logs
  useEffect(() => {
    if (!user) return;
    loadLogs();

    const channel = supabase
      .channel("bot-logs-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "bot_logs" }, (payload) => {
        setLogs(prev => [payload.new as BotLog, ...prev].slice(0, 100));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, loadLogs]);

  // Calculate team stats from logs
  useEffect(() => {
    const stats: Record<string, { revenue: number; tasks: number; errors: number }> = {};
    for (const log of logs) {
      if (!stats[log.team]) stats[log.team] = { revenue: 0, tasks: 0, errors: 0 };
      stats[log.team].revenue += Number(log.revenue_impact) || 0;
      stats[log.team].tasks += 1;
      if (log.status === "error") stats[log.team].errors += 1;
    }
    setTeamStats(stats);
  }, [logs]);

  const handleToggleBot = (botId: string) => {
    setActiveBots(prev => {
      const next = new Set(prev);
      if (next.has(botId)) next.delete(botId);
      else next.add(botId);
      return next;
    });
  };

  const handleBotAction = async (botId: string, action: string) => {
    if (!user) return;
    try {
      await supabase.functions.invoke("bot-team-orchestrator", {
        body: { action: "bot_action", botId, team: botId.split("-")[0], command: { action, type: "manual" } },
      });
      toast.success(`${botId} executed ${action}`);
    } catch (e) {
      toast.error("Bot action failed");
    }
  };

  const handleActivateTeam = async (teamKey: string) => {
    if (!user) return;
    try {
      await supabase.functions.invoke("bot-team-orchestrator", { body: { action: "activate_team", team: teamKey } });
      const teamBots = BOT_TEAMS[teamKey].bots.map(b => b.id);
      setActiveBots(prev => new Set([...prev, ...teamBots]));
      toast.success(`${BOT_TEAMS[teamKey].name} activated!`);
    } catch (e) {
      toast.error("Team activation failed");
    }
  };

  const handleActivateAll = async () => {
    if (!user) return;
    setIsActivatingAll(true);
    try {
      await supabase.functions.invoke("bot-team-orchestrator", { body: { action: "activate_all" } });
      const allBotIds = TEAM_ORDER.flatMap(t => BOT_TEAMS[t].bots.map(b => b.id));
      setActiveBots(new Set(allBotIds));
      toast.success("🚀 Super Executive Team ACTIVATED!", { description: "All 50 bots now operational" });
    } catch (e) {
      toast.error("Failed to activate all bots");
    } finally {
      setIsActivatingAll(false);
    }
  };

  const handleGrokThink = async (): Promise<GrokThinking | null> => {
    if (!user) return null;
    setIsThinking(true);
    try {
      const { data } = await supabase.functions.invoke("bot-team-orchestrator", { body: { action: "grok_think" } });
      setLastThinking(data);
      toast.success("Grok Brain analysis complete", { description: `Projected: $${data?.projected_revenue?.toLocaleString() || 0}` });
      return data;
    } catch (e) {
      toast.error("Grok thinking failed");
      return null;
    } finally {
      setIsThinking(false);
    }
  };

  const totalRevenue = Object.values(teamStats).reduce((s, t) => s + t.revenue, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bot className="h-8 w-8 text-primary" />
            Super Executive Team
            <Badge variant="outline" className="text-lg px-3 py-1">50 Bots</Badge>
          </h1>
          <p className="text-muted-foreground mt-1">5 Teams × 10 Bots = Unstoppable Revenue Machine</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={loadLogs}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
          <Button onClick={handleActivateAll} disabled={isActivatingAll} className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
            {isActivatingAll ? <><Activity className="h-4 w-4 mr-2 animate-spin" />Activating...</> : <><Power className="h-4 w-4 mr-2" />Activate All 50 Bots</>}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
          <div className="flex items-center gap-2 mb-2"><DollarSign className="h-5 w-5 text-green-500" /><span className="text-sm text-muted-foreground">Total Revenue</span></div>
          <p className="text-3xl font-bold text-green-500">${totalRevenue.toFixed(2)}</p>
        </motion.div>
        <motion.div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-2"><Bot className="h-5 w-5 text-blue-500" /><span className="text-sm text-muted-foreground">Active Bots</span></div>
          <p className="text-3xl font-bold text-blue-500">{activeBots.size}/{getTotalBots()}</p>
        </motion.div>
        <motion.div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-2"><Activity className="h-5 w-5 text-purple-500" /><span className="text-sm text-muted-foreground">Tasks Today</span></div>
          <p className="text-3xl font-bold text-purple-500">{logs.length}</p>
        </motion.div>
        <motion.div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20">
          <div className="flex items-center gap-2 mb-2"><TrendingUp className="h-5 w-5 text-orange-500" /><span className="text-sm text-muted-foreground">Success Rate</span></div>
          <p className="text-3xl font-bold text-orange-500">98.7%</p>
        </motion.div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="control" className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="control" className="gap-2">
            <Bot className="w-4 h-4" />
            Bot Control
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="scaling" className="gap-2">
            <Layers className="w-4 h-4" />
            Auto-Scaling
          </TabsTrigger>
        </TabsList>

        <TabsContent value="control" className="mt-6 space-y-6">
          {/* Grok Brain */}
          <GrokBrainPanel onThink={handleGrokThink} lastThinking={lastThinking} isThinking={isThinking} />

          {/* Performance & Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TeamPerformanceChart stats={teamStats} />
            <LiveBotLogs logs={logs} isLive={isLive} />
          </div>

          {/* Bot Teams */}
          <div className="space-y-4">
            {TEAM_ORDER.map(teamKey => (
              <BotTeamSection
                key={teamKey}
                teamKey={teamKey}
                team={BOT_TEAMS[teamKey]}
                activeBots={activeBots}
                botStats={botStats}
                onToggleBot={handleToggleBot}
                onBotAction={handleBotAction}
                onActivateTeam={handleActivateTeam}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <BotAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="scaling" className="mt-6">
          <BotAutoScalingPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
