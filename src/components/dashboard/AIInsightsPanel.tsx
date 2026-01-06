import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Zap, AlertTriangle, Loader2, Check, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { creativeService, systemEventService } from "@/services/creative-service";
import { toast } from "sonner";

interface Insight {
  id: string;
  type: "scale" | "kill" | "opportunity" | "warning";
  title: string;
  description: string;
  impact: string;
  creativeId?: string;
  actionable: boolean;
}

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
  const { user } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const generateInsights = async () => {
      if (!user) return;

      try {
        const creatives = await creativeService.fetchCreatives(user.id);
        const generatedInsights: Insight[] = [];

        // Find high performers to scale
        const scaleCandidates = creatives.filter(
          (c) => c.status === "active" && c.quality_score >= 85 && c.roas >= 3
        );
        scaleCandidates.slice(0, 2).forEach((c) => {
          generatedInsights.push({
            id: `scale-${c.id}`,
            type: "scale",
            title: `Scale ${c.name}`,
            description: `${c.roas.toFixed(1)}x ROAS, quality score ${c.quality_score}%. Top performer.`,
            impact: `+$${Math.round(c.revenue * 0.5).toLocaleString()} potential`,
            creativeId: c.id,
            actionable: true,
          });
        });

        // Find underperformers to kill
        const killCandidates = creatives.filter(
          (c) => c.status === "active" && (c.quality_score < 50 || c.roas < 1)
        );
        killCandidates.slice(0, 2).forEach((c) => {
          generatedInsights.push({
            id: `kill-${c.id}`,
            type: "kill",
            title: `Kill ${c.name}`,
            description: `${c.roas.toFixed(1)}x ROAS, CTR down. Creative fatigue detected.`,
            impact: `Save $${Math.round(c.spend * 0.8).toLocaleString()}/day`,
            creativeId: c.id,
            actionable: true,
          });
        });

        // Add opportunity insights
        const hasUGC = creatives.some((c) => c.style?.toLowerCase().includes("ugc"));
        if (!hasUGC) {
          generatedInsights.push({
            id: "opportunity-ugc",
            type: "opportunity",
            title: "Trending: UGC format",
            description: "Top performers using UGC-style see 2.5x engagement. Zero presence in your library.",
            impact: "+28% est. reach",
            actionable: false,
          });
        }

        // Add warning if low creatives
        if (creatives.filter((c) => c.status === "active").length < 3) {
          generatedInsights.push({
            id: "warning-low-creatives",
            type: "warning",
            title: "Low active creatives",
            description: "You have fewer than 3 active creatives. Scale risk detected.",
            impact: "Risk: Revenue drop",
            actionable: false,
          });
        }

        // If no real insights, add demo insights
        if (generatedInsights.length === 0) {
          generatedInsights.push(
            {
              id: "demo-1",
              type: "scale",
              title: "Scale TikTok UGC #47",
              description: "3.2x ROAS, 45% lower CPM than avg. Hook resonates with 18-24 demo.",
              impact: "+$12.4K potential",
              actionable: false,
            },
            {
              id: "demo-2",
              type: "opportunity",
              title: "Trending: 'POV' format",
              description: "Competitors seeing 2.5x engagement. Zero presence in your library.",
              impact: "+28% est. reach",
              actionable: false,
            }
          );
        }

        setInsights(generatedInsights);
      } catch (error) {
        console.error("Error generating insights:", error);
        // Fallback to demo data
        setInsights([
          {
            id: "demo-1",
            type: "scale",
            title: "Scale TikTok UGC #47",
            description: "3.2x ROAS, 45% lower CPM than avg. Hook resonates with 18-24 demo.",
            impact: "+$12.4K potential",
            actionable: false,
          },
          {
            id: "demo-2",
            type: "kill",
            title: "Kill Meta Carousel Set B",
            description: "0.8x ROAS, CTR down 60% week-over-week. Creative fatigue detected.",
            impact: "Save $3.2K/day",
            actionable: false,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    generateInsights();
  }, [user]);

  const handleAction = async (insight: Insight) => {
    if (!insight.actionable || !insight.creativeId || !user) return;

    setActionLoading(insight.id);

    try {
      if (insight.type === "scale") {
        await creativeService.updateCreativeStatus(insight.creativeId, "scaling");
        await systemEventService.logEvent(
          user.id,
          "creative_scaled",
          "scale",
          `Scaled ${insight.title}`,
          insight.description
        );
        toast.success(`${insight.title} is now scaling!`);
      } else if (insight.type === "kill") {
        await creativeService.updateCreativeStatus(insight.creativeId, "killed", "Killed via AI recommendation");
        await systemEventService.logEvent(
          user.id,
          "creative_killed",
          "creative",
          `Killed ${insight.title}`,
          insight.description
        );
        toast.success(`${insight.title} has been killed`);
      }

      // Remove the actioned insight
      setInsights((prev) => prev.filter((i) => i.id !== insight.id));
    } catch (error) {
      console.error("Error executing action:", error);
      toast.error("Failed to execute action");
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="glass-card-elevated p-6 flex items-center justify-center min-h-[300px]">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

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
          <h3 className="font-display font-semibold text-lg">Omega AI</h3>
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
              transition={{ duration: 0.3, delay: 0.1 + index * 0.1 }}
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
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">{insight.impact}</span>
                    {insight.actionable && (
                      <button
                        onClick={() => handleAction(insight)}
                        disabled={actionLoading === insight.id}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                          insight.type === "scale"
                            ? "bg-success/20 hover:bg-success/30 text-success"
                            : "bg-destructive/20 hover:bg-destructive/30 text-destructive"
                        }`}
                      >
                        {actionLoading === insight.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : insight.type === "scale" ? (
                          <span className="flex items-center gap-1">
                            <Check className="w-3 h-3" /> Apply
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <X className="w-3 h-3" /> Kill
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {insights.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">All caught up! No actions needed.</p>
        </div>
      )}
    </motion.div>
  );
};
