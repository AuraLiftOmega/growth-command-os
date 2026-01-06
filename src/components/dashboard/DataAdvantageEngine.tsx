import { motion } from "framer-motion";
import { Brain, TrendingUp, Sparkles, Database, Activity } from "lucide-react";

interface LearningMetric {
  id: string;
  label: string;
  current: number;
  improvement: number;
  signals: number;
}

const learningMetrics: LearningMetric[] = [
  { id: "hooks", label: "Hook Effectiveness", current: 78, improvement: 12, signals: 24847 },
  { id: "pacing", label: "Video Pacing", current: 85, improvement: 8, signals: 18234 },
  { id: "angles", label: "Creative Angles", current: 71, improvement: 15, signals: 31092 },
  { id: "cta", label: "CTA Conversion", current: 82, improvement: 6, signals: 9847 },
];

const recentLearnings = [
  { time: "2m ago", insight: "POV hooks outperform 'Watch this' by 34% in beauty" },
  { time: "8m ago", insight: "3-second rule: retention drops 45% after slow opens" },
  { time: "15m ago", insight: "Green screen UGC converts 2.1x better than studio" },
  { time: "23m ago", insight: "Question CTAs outperform statements by 18%" },
];

export const DataAdvantageEngine = () => {
  const totalSignals = learningMetrics.reduce((acc, m) => acc + m.signals, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card overflow-hidden"
    >
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/30 to-chart-2/30 flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg">Data Advantage Engine</h3>
              <p className="text-muted-foreground text-sm">Learning from {totalSignals.toLocaleString()} signals</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-success animate-pulse" />
            <span className="text-xs text-success font-medium">LEARNING</span>
          </div>
        </div>
      </div>

      {/* Learning Progress Bars */}
      <div className="p-6 space-y-4">
        {learningMetrics.map((metric, index) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{metric.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">{metric.current}%</span>
                <span className="text-xs text-success flex items-center">
                  <TrendingUp className="w-3 h-3 mr-0.5" />
                  +{metric.improvement}%
                </span>
              </div>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${metric.current}%` }}
                transition={{ duration: 0.8, delay: 0.4 + index * 0.1 }}
                className="h-full bg-gradient-to-r from-primary to-chart-2 rounded-full"
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              {metric.signals.toLocaleString()} data points collected
            </p>
          </motion.div>
        ))}
      </div>

      {/* Recent Learnings */}
      <div className="px-6 pb-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-chart-4" />
          <span className="text-sm font-medium">Recent Learnings</span>
        </div>
        <div className="space-y-2">
          {recentLearnings.map((learning, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
              className="p-3 rounded-lg bg-secondary/30 border border-border/50"
            >
              <div className="flex items-start gap-2">
                <Database className="w-3 h-3 text-muted-foreground mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs text-foreground">{learning.insight}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{learning.time}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Data Flow Visualization */}
      <div className="px-6 pb-6">
        <div className="p-4 rounded-lg bg-gradient-to-r from-primary/5 via-chart-2/5 to-chart-4/5 border border-primary/10">
          <div className="flex items-center justify-between text-xs">
            <div className="text-center">
              <p className="font-bold text-foreground">Video Gen</p>
              <p className="text-muted-foreground">→ Posting</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-foreground">Watch Time</p>
              <p className="text-muted-foreground">→ CTR</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-foreground">Conversions</p>
              <p className="text-muted-foreground">→ Revenue</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-success">→ LEARN</p>
              <p className="text-success">→ IMPROVE</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
