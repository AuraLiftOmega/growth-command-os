import { motion } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown, 
  MoreHorizontal,
  Play,
  Pause,
  Copy,
  Loader2,
  Trash2,
  AlertCircle
} from "lucide-react";
import { useRealCreatives } from "@/hooks/useRealCreatives";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusStyles: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  generating: "bg-warning/10 text-warning",
  pending_review: "bg-primary/10 text-primary",
  active: "bg-primary/10 text-primary",
  paused: "bg-muted text-muted-foreground",
  scaling: "bg-success/10 text-success",
  killed: "bg-destructive/10 text-destructive",
  rendered: "bg-chart-2/10 text-chart-2",
  queued: "bg-warning/10 text-warning",
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
  const { creatives, isLoading, hasRealData, updateCreativeStatus, refreshCreatives } = useRealCreatives();

  const handleStatusChange = async (creativeId: string, newStatus: string) => {
    try {
      await updateCreativeStatus(creativeId, newStatus);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update creative status");
    }
  };

  const handleKill = async (creativeId: string) => {
    try {
      await updateCreativeStatus(creativeId, "killed", "Manually killed by user");
    } catch (error) {
      console.error("Error killing creative:", error);
      toast.error("Failed to kill creative");
    }
  };

  const handleExport = () => {
    if (!hasRealData) {
      toast.info("No data to export");
      return;
    }

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
              {hasRealData 
                ? `${creatives.length} creatives • ${creatives.filter((c) => c.status === "active" || c.status === "scaling").length} active`
                : 'No creatives yet'
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refreshCreatives}
              className="px-3 py-2 rounded-lg bg-secondary text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              Refresh
            </button>
            <button 
              onClick={handleExport}
              disabled={!hasRealData}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              Export
            </button>
          </div>
        </div>
      </div>

      {!hasRealData ? (
        <div className="p-12 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground font-medium mb-2">INSUFFICIENT DATA</p>
          <p className="text-sm text-muted-foreground">
            Generate videos to see performance metrics here
          </p>
        </div>
      ) : (
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
                      {creative.video_url ? (
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Play className="w-4 h-4 text-primary" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                          <Play className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
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
                    <span className="text-sm font-medium">
                      {creative.impressions > 0 ? formatNumber(creative.impressions) : '—'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-sm font-medium">
                        {creative.ctr > 0 ? `${creative.ctr.toFixed(1)}%` : '—'}
                      </span>
                      {creative.ctr > 0 && (
                        creative.ctr >= 3 ? (
                          <TrendingUp className="w-3 h-3 text-success" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-destructive" />
                        )
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-sm font-medium">
                        {creative.roas > 0 ? `${creative.roas.toFixed(1)}x` : '—'}
                      </span>
                      {creative.roas > 0 && (
                        creative.roas >= 2 ? (
                          <TrendingUp className="w-3 h-3 text-success" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-destructive" />
                        )
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className="text-sm font-medium">
                      {creative.spend > 0 ? formatCurrency(creative.spend) : '—'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className="text-sm font-medium text-success">
                      {creative.revenue > 0 ? formatCurrency(creative.revenue) : '—'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                        statusStyles[creative.status] || statusStyles.draft
                      }`}
                    >
                      {creative.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {creative.status === "active" || creative.status === "scaling" ? (
                        <button
                          onClick={() => handleStatusChange(creative.id, "paused")}
                          className="p-2 rounded-lg hover:bg-secondary transition-colors"
                          title="Pause"
                        >
                          <Pause className="w-4 h-4 text-muted-foreground" />
                        </button>
                      ) : creative.status !== "killed" ? (
                        <button
                          onClick={() => handleStatusChange(creative.id, "active")}
                          className="p-2 rounded-lg hover:bg-secondary transition-colors"
                          title="Activate"
                        >
                          <Play className="w-4 h-4 text-muted-foreground" />
                        </button>
                      ) : null}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {creative.video_url && (
                            <DropdownMenuItem onClick={() => window.open(creative.video_url!, '_blank')}>
                              <Play className="w-4 h-4 mr-2" />
                              Preview Video
                            </DropdownMenuItem>
                          )}
                          {creative.status !== "scaling" && creative.status !== "killed" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(creative.id, "scaling")}>
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
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};
