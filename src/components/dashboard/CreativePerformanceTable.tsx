import { motion } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown, 
  MoreHorizontal,
  Play,
  Pause,
  Copy,
  Loader2,
  Trash2
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { creativeService, Creative, systemEventService } from "@/services/creative-service";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusStyles = {
  draft: "bg-muted text-muted-foreground",
  generating: "bg-warning/10 text-warning",
  pending_review: "bg-primary/10 text-primary",
  active: "bg-primary/10 text-primary",
  paused: "bg-muted text-muted-foreground",
  scaling: "bg-success/10 text-success",
  killed: "bg-destructive/10 text-destructive",
};

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const formatCurrency = (num: number) => {
  if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
  return `$${num.toFixed(0)}`;
};

export const CreativePerformanceTable = () => {
  const { user } = useAuth();
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const loadCreatives = async () => {
      if (!user) return;

      try {
        const data = await creativeService.fetchCreatives(user.id);
        if (data.length > 0) {
          setCreatives(data);
        } else {
          // Demo data when no creatives exist
          setCreatives([
            {
              id: "demo-1",
              user_id: user.id,
              name: "POV Morning Routine",
              platform: "TikTok",
              hook: "POV: You finally found...",
              script: null,
              video_url: null,
              thumbnail_url: null,
              style: "ugc",
              emotional_trigger: "curiosity",
              quality_score: 85,
              hook_score: 88,
              engagement_score: 82,
              conversion_score: 79,
              passed_quality_gate: true,
              auto_regenerated: false,
              regeneration_count: 0,
              impressions: 2400000,
              views: 1800000,
              watch_time_seconds: 45000,
              avg_watch_percentage: 68,
              clicks: 72000,
              ctr: 4.2,
              conversions: 1247,
              revenue: 63200,
              spend: 12400,
              roas: 5.1,
              status: "scaling",
              kill_reason: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              published_at: new Date().toISOString(),
              killed_at: null,
            },
            {
              id: "demo-2",
              user_id: user.id,
              name: "Unboxing Experience",
              platform: "Reels",
              hook: "Wait for it...",
              script: null,
              video_url: null,
              thumbnail_url: null,
              style: "unboxing",
              emotional_trigger: "anticipation",
              quality_score: 78,
              hook_score: 75,
              engagement_score: 80,
              conversion_score: 72,
              passed_quality_gate: true,
              auto_regenerated: false,
              regeneration_count: 0,
              impressions: 1800000,
              views: 1200000,
              watch_time_seconds: 32000,
              avg_watch_percentage: 55,
              clicks: 45600,
              ctr: 3.8,
              conversions: 820,
              revenue: 32000,
              spend: 8200,
              roas: 3.9,
              status: "active",
              kill_reason: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              published_at: new Date().toISOString(),
              killed_at: null,
            },
          ] as Creative[]);
        }
      } catch (error) {
        console.error("Error loading creatives:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCreatives();
  }, [user]);

  const handleStatusChange = async (creativeId: string, newStatus: Creative["status"], currentStatus: Creative["status"]) => {
    if (!user || creativeId.startsWith("demo-")) {
      toast.info("This is demo data. Create real creatives to manage them.");
      return;
    }

    setActionLoading(creativeId);

    try {
      await creativeService.updateCreativeStatus(creativeId, newStatus);
      await systemEventService.logEvent(
        user.id,
        `creative_${newStatus}`,
        "creative",
        `Creative status changed to ${newStatus}`,
        `Changed from ${currentStatus} to ${newStatus}`
      );

      setCreatives((prev) =>
        prev.map((c) => (c.id === creativeId ? { ...c, status: newStatus } : c))
      );

      toast.success(`Creative ${newStatus === "active" ? "activated" : newStatus === "paused" ? "paused" : "updated"}!`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update creative status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDuplicate = async (creative: Creative) => {
    if (!user || creative.id.startsWith("demo-")) {
      toast.info("This is demo data. Create real creatives to duplicate them.");
      return;
    }

    setActionLoading(creative.id);

    try {
      const newCreative = await creativeService.createCreative(user.id, {
        name: `${creative.name} (Copy)`,
        platform: creative.platform,
        hook: creative.hook,
        script: creative.script,
        style: creative.style,
        emotional_trigger: creative.emotional_trigger,
      });

      if (newCreative) {
        setCreatives((prev) => [newCreative, ...prev]);
        toast.success("Creative duplicated successfully!");
      }
    } catch (error) {
      console.error("Error duplicating:", error);
      toast.error("Failed to duplicate creative");
    } finally {
      setActionLoading(null);
    }
  };

  const handleKill = async (creativeId: string) => {
    if (!user || creativeId.startsWith("demo-")) {
      toast.info("This is demo data. Create real creatives to manage them.");
      return;
    }

    setActionLoading(creativeId);

    try {
      await creativeService.updateCreativeStatus(creativeId, "killed", "Manually killed by user");
      setCreatives((prev) =>
        prev.map((c) => (c.id === creativeId ? { ...c, status: "killed" } : c))
      );
      toast.success("Creative killed");
    } catch (error) {
      console.error("Error killing creative:", error);
      toast.error("Failed to kill creative");
    } finally {
      setActionLoading(null);
    }
  };

  const handleExport = () => {
    const csvContent = [
      ["Name", "Platform", "Impressions", "CTR", "ROAS", "Spend", "Revenue", "Status"].join(","),
      ...creatives.map((c) =>
        [c.name, c.platform, c.impressions, `${c.ctr}%`, `${c.roas}x`, c.spend, c.revenue, c.status].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "creative-performance.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export downloaded!");
  };

  if (isLoading) {
    return (
      <div className="glass-card p-6 flex items-center justify-center min-h-[300px]">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="glass-card overflow-hidden"
    >
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-semibold text-lg">Creative Performance</h3>
            <p className="text-sm text-muted-foreground">
              {creatives.length} creatives • {creatives.filter((c) => c.status === "active" || c.status === "scaling").length} active
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleExport}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Creative
              </th>
              <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Hook
              </th>
              <th className="text-right py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Impressions
              </th>
              <th className="text-right py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                CTR
              </th>
              <th className="text-right py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                ROAS
              </th>
              <th className="text-right py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Spend
              </th>
              <th className="text-right py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Revenue
              </th>
              <th className="text-center py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="py-4 px-6"></th>
            </tr>
          </thead>
          <tbody>
            {creatives.map((creative, index) => (
              <motion.tr
                key={creative.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                className="border-b border-border/50 hover:bg-secondary/30 transition-colors group"
              >
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <Play className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{creative.name}</p>
                      <p className="text-xs text-muted-foreground">{creative.platform}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="text-sm text-muted-foreground italic">
                    "{creative.hook || "No hook"}"
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <span className="text-sm font-medium">{formatNumber(creative.impressions)}</span>
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-sm font-medium">{creative.ctr.toFixed(1)}%</span>
                    {creative.ctr >= 3 ? (
                      <TrendingUp className="w-3 h-3 text-success" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-destructive" />
                    )}
                  </div>
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-sm font-medium">{creative.roas.toFixed(1)}x</span>
                    {creative.roas >= 2 ? (
                      <TrendingUp className="w-3 h-3 text-success" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-destructive" />
                    )}
                  </div>
                </td>
                <td className="py-4 px-6 text-right">
                  <span className="text-sm font-medium">{formatCurrency(creative.spend)}</span>
                </td>
                <td className="py-4 px-6 text-right">
                  <span className="text-sm font-medium text-success">{formatCurrency(creative.revenue)}</span>
                </td>
                <td className="py-4 px-6 text-center">
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                      statusStyles[creative.status as keyof typeof statusStyles] || statusStyles.draft
                    }`}
                  >
                    {creative.status.replace("_", " ")}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {actionLoading === creative.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    ) : (
                      <>
                        {creative.status === "active" || creative.status === "scaling" ? (
                          <button
                            onClick={() => handleStatusChange(creative.id, "paused", creative.status)}
                            className="p-2 rounded-lg hover:bg-secondary transition-colors"
                            title="Pause"
                          >
                            <Pause className="w-4 h-4 text-muted-foreground" />
                          </button>
                        ) : creative.status !== "killed" ? (
                          <button
                            onClick={() => handleStatusChange(creative.id, "active", creative.status)}
                            className="p-2 rounded-lg hover:bg-secondary transition-colors"
                            title="Activate"
                          >
                            <Play className="w-4 h-4 text-muted-foreground" />
                          </button>
                        ) : null}
                        <button
                          onClick={() => handleDuplicate(creative)}
                          className="p-2 rounded-lg hover:bg-secondary transition-colors"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {creative.status !== "scaling" && creative.status !== "killed" && (
                              <DropdownMenuItem onClick={() => handleStatusChange(creative.id, "scaling", creative.status)}>
                                <TrendingUp className="w-4 h-4 mr-2" />
                                Scale Now
                              </DropdownMenuItem>
                            )}
                            {creative.status !== "killed" && (
                              <DropdownMenuItem 
                                onClick={() => handleKill(creative.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Kill Creative
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {creatives.length === 0 && (
        <div className="p-12 text-center">
          <Play className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No creatives yet. Generate your first video!</p>
        </div>
      )}
    </motion.div>
  );
};
