import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { 
  Bot, 
  MessageSquare, 
  Target, 
  TrendingUp, 
  DollarSign,
  Send,
  CheckCircle2,
  Loader2,
  Zap,
  Globe,
  ShoppingCart,
  Heart,
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BotActivity {
  id: string;
  botId: string;
  botName: string;
  team: "sales" | "ads" | "domains" | "engagement" | "revenue";
  action: string;
  target: string;
  status: "running" | "completed" | "success" | "failed";
  revenueImpact?: number;
  timestamp: Date;
}

const BOT_TEAMS = {
  sales: { color: "#22c55e", icon: DollarSign, label: "Sales" },
  ads: { color: "#3b82f6", icon: Target, label: "Ads" },
  domains: { color: "#a855f7", icon: Globe, label: "Domains" },
  engagement: { color: "#f97316", icon: Heart, label: "Engage" },
  revenue: { color: "#eab308", icon: TrendingUp, label: "Revenue" },
};

const SAMPLE_ACTIONS = {
  sales: [
    { action: "Closing WhatsApp deal", target: "Hot lead - Sarah M." },
    { action: "Sending upsell sequence", target: "Recent buyer - John D." },
    { action: "Cart recovery DM", target: "Abandoned cart - $149 set" },
    { action: "VIP concierge response", target: "High-value customer" },
    { action: "Bundle offer sent", target: "Multi-product viewer" },
  ],
  ads: [
    { action: "Scaling TikTok winner", target: "Vitamin C Serum - 4.2x ROAS" },
    { action: "Killing underperformer", target: "Retinol ad - 0.8x ROAS" },
    { action: "A/B testing creative", target: "Before/After variant" },
    { action: "Optimizing bid strategy", target: "Google Ads - skincare" },
    { action: "Retargeting audience", target: "Website visitors 7d" },
  ],
  domains: [
    { action: "Listing on OpenSea", target: "auralift.crypto" },
    { action: "DM to whale buyer", target: "@crypto_investor" },
    { action: "Price negotiation", target: "Vegas pack offer - $2,500" },
    { action: "Creating X thread", target: "NFT domain trending" },
    { action: "Portfolio update", target: "15 domains valued" },
  ],
  engagement: [
    { action: "Replying to comment", target: "TikTok - glow up video" },
    { action: "Welcome DM sent", target: "New Instagram follower" },
    { action: "Review response", target: "5-star Vitamin C review" },
    { action: "Viral content amplify", target: "10k views trending" },
    { action: "FAQ auto-response", target: "Shipping question" },
  ],
  revenue: [
    { action: "Stripe payout optimized", target: "Daily settlement" },
    { action: "LTV calculation", target: "Q1 cohort analysis" },
    { action: "Flash sale triggered", target: "30% off slow movers" },
    { action: "Margin analysis", target: "Product profitability" },
    { action: "Churn prediction alert", target: "3 at-risk customers" },
  ],
};

export function LiveBotActivityFeed() {
  const [activities, setActivities] = useState<BotActivity[]>([]);
  const [teamStats, setTeamStats] = useState({
    sales: { active: 10, completed: 0, revenue: 0 },
    ads: { active: 10, completed: 0, revenue: 0 },
    domains: { active: 10, completed: 0, revenue: 0 },
    engagement: { active: 10, completed: 0, revenue: 0 },
    revenue: { active: 10, completed: 0, revenue: 0 },
  });
  const activityIdCounter = useRef(0);

  // Simulate live bot activities
  useEffect(() => {
    const teams = Object.keys(BOT_TEAMS) as Array<keyof typeof BOT_TEAMS>;
    
    const addActivity = () => {
      const team = teams[Math.floor(Math.random() * teams.length)];
      const actions = SAMPLE_ACTIONS[team];
      const actionData = actions[Math.floor(Math.random() * actions.length)];
      const botNumber = Math.floor(Math.random() * 10) + 1;
      
      const newActivity: BotActivity = {
        id: `act-${++activityIdCounter.current}`,
        botId: `${team}-${botNumber}`,
        botName: `${BOT_TEAMS[team].label} Bot #${botNumber}`,
        team,
        action: actionData.action,
        target: actionData.target,
        status: "running",
        timestamp: new Date(),
      };

      setActivities(prev => [newActivity, ...prev].slice(0, 100));

      // Update to completed after 2-5 seconds
      setTimeout(() => {
        const revenueImpact = team === "sales" 
          ? Math.random() * 150 + 30 
          : team === "ads" 
            ? Math.random() * 50 
            : Math.random() * 20;

        setActivities(prev => 
          prev.map(a => 
            a.id === newActivity.id 
              ? { ...a, status: Math.random() > 0.1 ? "success" : "completed", revenueImpact } 
              : a
          )
        );

        setTeamStats(prev => ({
          ...prev,
          [team]: {
            ...prev[team],
            completed: prev[team].completed + 1,
            revenue: prev[team].revenue + revenueImpact,
          }
        }));
      }, 2000 + Math.random() * 3000);
    };

    // Add initial activities
    for (let i = 0; i < 5; i++) {
      setTimeout(() => addActivity(), i * 500);
    }

    // Then add new activity every 3-8 seconds
    const interval = setInterval(addActivity, 3000 + Math.random() * 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: BotActivity["status"]) => {
    switch (status) {
      case "running": return <Loader2 className="w-3 h-3 animate-spin" />;
      case "completed": return <CheckCircle2 className="w-3 h-3 text-muted-foreground" />;
      case "success": return <CheckCircle2 className="w-3 h-3 text-green-500" />;
      case "failed": return <CheckCircle2 className="w-3 h-3 text-destructive" />;
    }
  };

  const totalCompleted = Object.values(teamStats).reduce((sum, t) => sum + t.completed, 0);
  const totalRevenue = Object.values(teamStats).reduce((sum, t) => sum + t.revenue, 0);

  return (
    <div className="space-y-4">
      {/* Team Stats */}
      <div className="grid grid-cols-5 gap-2">
        {(Object.entries(BOT_TEAMS) as Array<[keyof typeof BOT_TEAMS, typeof BOT_TEAMS[keyof typeof BOT_TEAMS]]>).map(([key, team]) => {
          const Icon = team.icon;
          const stats = teamStats[key];
          return (
            <Card key={key} className="p-2">
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${team.color}20` }}
                >
                  <Icon className="w-4 h-4" style={{ color: team.color }} />
                </div>
                <div>
                  <p className="text-xs font-medium">{team.label}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {stats.active} active • {stats.completed} done
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Summary Bar */}
      <Card className="border-primary/30">
        <CardContent className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge className="bg-green-500 animate-pulse">50 BOTS ACTIVE</Badge>
              <span className="text-sm text-muted-foreground">
                {totalCompleted} tasks completed
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-500">
                +${totalRevenue.toFixed(0)} impact
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Activity Feed */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bot className="w-4 h-4 text-primary animate-pulse" />
            Live Bot Activity
            <Badge variant="outline" className="text-xs">
              Real-time
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <AnimatePresence>
              <div className="space-y-2">
                {activities.map((activity, index) => {
                  const teamConfig = BOT_TEAMS[activity.team];
                  const Icon = teamConfig.icon;
                  
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex items-center justify-between p-2 rounded-lg border ${
                        activity.status === "running" 
                          ? "border-primary/30 bg-primary/5" 
                          : activity.status === "success"
                            ? "border-green-500/20 bg-green-500/5"
                            : "border-transparent bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div 
                          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${teamConfig.color}20` }}
                        >
                          <Icon className="w-3 h-3" style={{ color: teamConfig.color }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-medium truncate">
                              {activity.action}
                            </p>
                            {activity.revenueImpact && activity.revenueImpact > 50 && (
                              <Badge className="text-[10px] bg-green-500/20 text-green-600 px-1">
                                +${activity.revenueImpact.toFixed(0)}
                              </Badge>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {activity.botName} → {activity.target}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] text-muted-foreground">
                          {activity.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                        {getStatusIcon(activity.status)}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
