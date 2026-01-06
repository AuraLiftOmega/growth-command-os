import { motion } from "framer-motion";
import { 
  Zap, 
  Trash2, 
  Rocket, 
  RefreshCw, 
  Copy,
  CheckCircle,
  XCircle,
  TrendingUp
} from "lucide-react";

interface Activity {
  id: string;
  type: "killed" | "scaled" | "regenerated" | "reposted" | "created";
  title: string;
  description: string;
  time: string;
  impact?: string;
}

const activities: Activity[] = [
  {
    id: "1",
    type: "killed",
    title: "Auto-killed: Meta Carousel #284",
    description: "ROAS dropped below 1.5x threshold for 4 hours",
    time: "12s ago",
    impact: "Saved $847/day",
  },
  {
    id: "2",
    type: "scaled",
    title: "Scaling: TikTok UGC #47",
    description: "Budget increased 3x, ROAS sustained at 5.2x",
    time: "2m ago",
    impact: "+$12.4K potential",
  },
  {
    id: "3",
    type: "regenerated",
    title: "Regenerated: Weak hook variants",
    description: "5 creatives scored below 60, new versions queued",
    time: "4m ago",
  },
  {
    id: "4",
    type: "reposted",
    title: "Reposted winner to Reels",
    description: "POV Morning Routine crossing 1M views, expanding",
    time: "8m ago",
    impact: "Est. +$8K revenue",
  },
  {
    id: "5",
    type: "created",
    title: "Generated 10 variations",
    description: "New product launch batch ready for testing",
    time: "15m ago",
  },
  {
    id: "6",
    type: "killed",
    title: "Auto-killed: Pinterest Static #12",
    description: "CTR 0.3%, below 1% threshold",
    time: "23m ago",
    impact: "Saved $234/day",
  },
  {
    id: "7",
    type: "scaled",
    title: "Scaling: Reels Testimonial #8",
    description: "Conversion rate 8.2%, highest this week",
    time: "31m ago",
    impact: "+$6.2K potential",
  },
];

const iconMap = {
  killed: Trash2,
  scaled: Rocket,
  regenerated: RefreshCw,
  reposted: Copy,
  created: Zap,
};

const colorMap = {
  killed: "text-destructive bg-destructive/10",
  scaled: "text-success bg-success/10",
  regenerated: "text-warning bg-warning/10",
  reposted: "text-primary bg-primary/10",
  created: "text-chart-2 bg-chart-2/10",
};

export const AutomationActivityFeed = () => {
  const killedCount = activities.filter(a => a.type === "killed").length;
  const scaledCount = activities.filter(a => a.type === "scaled").length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-card-elevated p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-chart-2/30 to-success/30 flex items-center justify-center">
              <Zap className="w-5 h-5 text-chart-2" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-success animate-pulse" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg">Live Automation</h3>
            <p className="text-muted-foreground text-sm">Running 24/7 autonomously</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-destructive" />
            <span className="text-sm font-medium">{killedCount} Killed</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Last hour</p>
        </div>
        <div className="p-3 rounded-lg bg-success/5 border border-success/20">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-sm font-medium">{scaledCount} Scaling</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Active now</p>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin pr-1">
        {activities.map((activity, index) => {
          const Icon = iconMap[activity.type];
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.5 + index * 0.05 }}
              className="p-3 rounded-lg bg-secondary/20 border border-border/30 hover:bg-secondary/40 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className={`p-1.5 rounded-lg ${colorMap[activity.type]}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{activity.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-muted-foreground">{activity.time}</span>
                    {activity.impact && (
                      <span className={`text-[10px] font-medium ${
                        activity.type === "killed" ? "text-success" : "text-primary"
                      }`}>
                        {activity.impact}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" />
            <span className="text-xs text-muted-foreground">System running optimally</span>
          </div>
          <button className="text-xs text-primary hover:underline">View all</button>
        </div>
      </div>
    </motion.div>
  );
};
