import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Zap, AlertTriangle } from "lucide-react";

interface Insight {
  id: string;
  type: "scale" | "kill" | "opportunity" | "warning";
  title: string;
  description: string;
  impact: string;
}

const insights: Insight[] = [
  {
    id: "1",
    type: "scale",
    title: "Scale TikTok UGC #47",
    description: "3.2x ROAS, 45% lower CPM than avg. Hook resonates with 18-24 demo.",
    impact: "+$12.4K potential",
  },
  {
    id: "2",
    type: "kill",
    title: "Kill Meta Carousel Set B",
    description: "0.8x ROAS, CTR down 60% week-over-week. Creative fatigue detected.",
    impact: "Save $3.2K/day",
  },
  {
    id: "3",
    type: "opportunity",
    title: "Trending: 'POV' format",
    description: "Competitors seeing 2.5x engagement. Zero presence in your library.",
    impact: "+28% est. reach",
  },
  {
    id: "4",
    type: "warning",
    title: "Low inventory: SKU-2847",
    description: "Best seller has 3 days stock. Top performer in 4 active campaigns.",
    impact: "Risk: $18K/day",
  },
];

const iconMap = {
  scale: TrendingUp,
  kill: TrendingDown,
  opportunity: Zap,
  warning: AlertTriangle,
};

const colorMap = {
  scale: "text-success bg-success/10 border-success/20",
  kill: "text-destructive bg-destructive/10 border-destructive/20",
  opportunity: "text-primary bg-primary/10 border-primary/20",
  warning: "text-warning bg-warning/10 border-warning/20",
};

const labelMap = {
  scale: "SCALE",
  kill: "KILL",
  opportunity: "OPPORTUNITY",
  warning: "WARNING",
};

export const AIInsightsPanel = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card-elevated p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-success animate-pulse" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-lg">AI Command Center</h3>
          <p className="text-muted-foreground text-sm">Real-time decisions</p>
        </div>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => {
          const Icon = iconMap[insight.type];
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
              className={`p-4 rounded-lg border ${colorMap[insight.type]} cursor-pointer transition-all hover:scale-[1.02]`}
            >
              <div className="flex items-start gap-3">
                <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold tracking-wider opacity-70">
                      {labelMap[insight.type]}
                    </span>
                  </div>
                  <h4 className="font-medium text-sm text-foreground mb-1">
                    {insight.title}
                  </h4>
                  <p className="text-xs opacity-80 mb-2">{insight.description}</p>
                  <span className="text-xs font-semibold">{insight.impact}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <button className="w-full mt-4 py-3 rounded-lg bg-primary/10 text-primary font-medium text-sm hover:bg-primary/20 transition-colors">
        View All Recommendations
      </button>
    </motion.div>
  );
};
