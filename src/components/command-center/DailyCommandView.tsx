import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  Eye, 
  Users, 
  Trophy, 
  FileText, 
  Rocket, 
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CommandMetrics {
  activePowerUsers: number;
  maxUsers: number;
  winsThisWeek: number;
  proofAssetsCollected: number;
  currentPhase: number;
  phaseName: string;
  phaseProgress: number;
}

interface Bottleneck {
  id: string;
  issue: string;
  priority: 'high' | 'medium' | 'low';
}

interface RecentWin {
  id: string;
  title: string;
  time: string;
}

export const DailyCommandView = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<CommandMetrics>({
    activePowerUsers: 0,
    maxUsers: 100,
    winsThisWeek: 0,
    proofAssetsCollected: 0,
    currentPhase: 1,
    phaseName: "Silent Proof Accumulation",
    phaseProgress: 0
  });
  const [bottlenecks, setBottlenecks] = useState<Bottleneck[]>([]);
  const [recentWins, setRecentWins] = useState<RecentWin[]>([]);

  useEffect(() => {
    if (user) {
      fetchCommandData();
    }
  }, [user]);

  const fetchCommandData = async () => {
    if (!user) return;

    try {
      // Fetch power user applications (approved = active users)
      const { data: powerUsers, error: powerUsersError } = await supabase
        .from('power_user_applications')
        .select('*')
        .eq('status', 'approved');

      if (powerUsersError) throw powerUsersError;

      // Fetch proof assets
      const { data: proofAssets, error: proofError } = await supabase
        .from('proof_assets')
        .select('*')
        .eq('is_approved', true);

      if (proofError) throw proofError;

      // Fetch rollout status
      const { data: rolloutData, error: rolloutError } = await supabase
        .from('rollout_status')
        .select('*')
        .order('phase', { ascending: false })
        .limit(1)
        .single();

      // Fetch pending applications as bottleneck
      const { data: pendingApps, error: pendingError } = await supabase
        .from('power_user_applications')
        .select('*')
        .eq('status', 'pending');

      // Calculate wins this week (proof assets created in last 7 days)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const winsThisWeek = proofAssets?.filter(p => 
        new Date(p.created_at) >= oneWeekAgo
      ).length || 0;

      // Calculate phase progress
      const activePowerUsers = powerUsers?.length || 0;
      const proofsCollected = proofAssets?.length || 0;
      const phaseProgress = Math.min(100, Math.round(((activePowerUsers / 20) * 50) + ((proofsCollected / 10) * 50)));

      setMetrics({
        activePowerUsers,
        maxUsers: 100,
        winsThisWeek,
        proofAssetsCollected: proofsCollected,
        currentPhase: rolloutData?.phase || 1,
        phaseName: rolloutData?.phase_name || "Silent Proof Accumulation",
        phaseProgress
      });

      // Set bottlenecks
      const newBottlenecks: Bottleneck[] = [];
      
      if (proofsCollected < 10) {
        newBottlenecks.push({
          id: '1',
          issue: `Need ${10 - proofsCollected} more documented wins before Phase 2`,
          priority: 'high'
        });
      }
      
      if (pendingApps && pendingApps.length > 0) {
        newBottlenecks.push({
          id: '2',
          issue: `${pendingApps.length} users pending qualification review`,
          priority: 'medium'
        });
      }

      setBottlenecks(newBottlenecks);

      // Set recent wins from proof assets
      const wins: RecentWin[] = (proofAssets || []).slice(0, 3).map(p => ({
        id: p.id,
        title: p.title,
        time: formatTimeAgo(new Date(p.created_at))
      }));

      setRecentWins(wins);

    } catch (error) {
      console.error("Error fetching command data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await fetchCommandData();
    setIsRefreshing(false);
    toast.success('Command view refreshed');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 30-Second Scan Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-elevated p-6 border-l-4 border-l-primary"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Eye className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl">CEO Daily Command View</h2>
            <p className="text-sm text-muted-foreground">30-second situational awareness</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={refreshData}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Badge className="bg-accent text-accent-foreground">
              <Clock className="w-3 h-3 mr-1" />
              Updated just now
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Active Power Users</p>
          </div>
          <p className="text-3xl font-bold text-primary">{metrics.activePowerUsers}</p>
          <p className="text-xs text-muted-foreground mt-1">of {metrics.maxUsers} max</p>
          <Progress value={(metrics.activePowerUsers / metrics.maxUsers) * 100} className="h-2 mt-2" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-accent" />
            </div>
            <p className="text-sm text-muted-foreground">Wins This Week</p>
          </div>
          <p className="text-3xl font-bold text-accent">{metrics.winsThisWeek}</p>
          <p className="text-xs text-muted-foreground mt-1">documented results</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-warning" />
            </div>
            <p className="text-sm text-muted-foreground">Proof Assets</p>
          </div>
          <p className="text-3xl font-bold text-warning">{metrics.proofAssetsCollected}</p>
          <p className="text-xs text-muted-foreground mt-1">ready for deployment</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-destructive" />
            </div>
            <p className="text-sm text-muted-foreground">Rollout Phase</p>
          </div>
          <p className="text-3xl font-bold">Phase {metrics.currentPhase}</p>
          <p className="text-xs text-muted-foreground mt-1">{metrics.phaseProgress}% complete</p>
          <Progress value={metrics.phaseProgress} className="h-2 mt-2" />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Wins */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-display font-semibold text-lg">Recent Wins</h3>
            </div>
            <Button variant="ghost" size="sm" className="gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-3">
            {recentWins.length > 0 ? (
              recentWins.map((win) => (
                <div key={win.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{win.title}</p>
                    <p className="text-xs text-muted-foreground">{win.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No wins recorded yet</p>
                <p className="text-xs">Add proof assets to track your wins</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Bottlenecks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <h3 className="font-display font-semibold text-lg">Bottlenecks</h3>
          </div>

          <div className="space-y-3">
            {bottlenecks.length > 0 ? (
              bottlenecks.map((item) => (
                <div 
                  key={item.id} 
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    item.priority === "high" 
                      ? "bg-destructive/10 border-destructive/30" 
                      : "bg-warning/10 border-warning/30"
                  }`}
                >
                  <AlertTriangle className={`w-5 h-5 shrink-0 ${
                    item.priority === "high" ? "text-destructive" : "text-warning"
                  }`} />
                  <p className="text-sm">{item.issue}</p>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-lg bg-accent/10 border border-accent/30 text-center">
                <CheckCircle2 className="w-8 h-8 text-accent mx-auto mb-2" />
                <p className="text-sm text-accent">No blockers — execution clear</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Current Phase Detail */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Rollout Phase</p>
              <h3 className="font-display font-semibold text-lg">
                Phase {metrics.currentPhase}: {metrics.phaseName}
              </h3>
            </div>
          </div>
          <Button onClick={() => navigate('/command-center?tab=rollout')} variant="outline" size="sm" className="gap-1">
            View Details <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Progress value={metrics.phaseProgress} className="h-3" />
          </div>
          <span className="text-lg font-bold text-primary">{metrics.phaseProgress}%</span>
        </div>

        <p className="text-sm text-muted-foreground mt-4">
          <strong>Next milestone:</strong> Reach 20 active users and 10 documented wins to unlock Phase 2: Controlled Exposure
        </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="flex flex-wrap gap-3"
      >
        <Button onClick={() => navigate('/war-room')} className="gap-2">
          Open Revenue War Room
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => navigate('/command-center?tab=power-users')}>
          Review Pending Users
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => navigate('/command-center?tab=proof')}>
          Add Proof Asset
        </Button>
      </motion.div>
    </div>
  );
};
