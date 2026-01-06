import { motion } from "framer-motion";
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
  ArrowRight
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const DailyCommandView = () => {
  const navigate = useNavigate();

  // Mock data for 30-second scan
  const metrics = {
    activePowerUsers: 12,
    maxUsers: 100,
    winsThisWeek: 3,
    proofAssetsCollected: 8,
    currentPhase: 1,
    phaseName: "Silent Proof Accumulation",
    phaseProgress: 45
  };

  const bottlenecks = [
    { id: 1, issue: "Need 8 more documented wins before Phase 2", priority: "high" },
    { id: 2, issue: "3 users pending qualification review", priority: "medium" }
  ];

  const recentWins = [
    { id: 1, title: "Fashion Brand hit +47% revenue", time: "2 hours ago" },
    { id: 2, title: "DTC Skincare replaced $8k agency", time: "1 day ago" },
    { id: 3, title: "Home Goods Co. case study approved", time: "2 days ago" }
  ];

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
          <Badge className="ml-auto bg-accent text-accent-foreground">
            <Clock className="w-3 h-3 mr-1" />
            Updated just now
          </Badge>
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
            {recentWins.map((win) => (
              <div key={win.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{win.title}</p>
                  <p className="text-xs text-muted-foreground">{win.time}</p>
                </div>
              </div>
            ))}
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
            {bottlenecks.map((item) => (
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
            ))}
          </div>

          {bottlenecks.length === 0 && (
            <div className="p-4 rounded-lg bg-accent/10 border border-accent/30 text-center">
              <CheckCircle2 className="w-8 h-8 text-accent mx-auto mb-2" />
              <p className="text-sm text-accent">No blockers — execution clear</p>
            </div>
          )}
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
          <strong>Next milestone:</strong> Reach 20 active users and 5 documented wins to unlock Phase 2: Controlled Exposure
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
        <Button variant="outline" className="gap-2">
          Review Pending Users
        </Button>
        <Button variant="outline" className="gap-2">
          Add Proof Asset
        </Button>
      </motion.div>
    </div>
  );
};
