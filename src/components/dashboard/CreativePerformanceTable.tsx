import { motion } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown, 
  MoreHorizontal,
  Play,
  Pause,
  Copy
} from "lucide-react";

interface Creative {
  id: string;
  name: string;
  platform: string;
  hook: string;
  impressions: string;
  ctr: string;
  ctrChange: number;
  roas: string;
  roasChange: number;
  spend: string;
  revenue: string;
  status: "active" | "paused" | "scaling";
}

const creatives: Creative[] = [
  {
    id: "1",
    name: "POV Morning Routine",
    platform: "TikTok",
    hook: "POV: You finally found...",
    impressions: "2.4M",
    ctr: "4.2%",
    ctrChange: 12,
    roas: "5.1x",
    roasChange: 18,
    spend: "$12.4K",
    revenue: "$63.2K",
    status: "scaling",
  },
  {
    id: "2",
    name: "Unboxing Experience",
    platform: "Reels",
    hook: "Wait for it...",
    impressions: "1.8M",
    ctr: "3.8%",
    ctrChange: -5,
    roas: "3.9x",
    roasChange: 8,
    spend: "$8.2K",
    revenue: "$32.0K",
    status: "active",
  },
  {
    id: "3",
    name: "Before/After Transform",
    platform: "Meta",
    hook: "I can't believe this...",
    impressions: "3.1M",
    ctr: "2.1%",
    ctrChange: -22,
    roas: "1.8x",
    roasChange: -15,
    spend: "$15.8K",
    revenue: "$28.4K",
    status: "paused",
  },
  {
    id: "4",
    name: "GRWM Testimonial",
    platform: "TikTok",
    hook: "Obsessed with these",
    impressions: "980K",
    ctr: "5.6%",
    ctrChange: 34,
    roas: "6.2x",
    roasChange: 28,
    spend: "$4.1K",
    revenue: "$25.4K",
    status: "scaling",
  },
];

const statusStyles = {
  active: "bg-primary/10 text-primary",
  paused: "bg-muted text-muted-foreground",
  scaling: "bg-success/10 text-success",
};

export const CreativePerformanceTable = () => {
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
            <p className="text-sm text-muted-foreground">Top performing ads across platforms</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 rounded-lg bg-secondary text-sm font-medium hover:bg-secondary/80 transition-colors">
              Filter
            </button>
            <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
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
                transition={{ duration: 0.3, delay: 0.6 + index * 0.05 }}
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
                  <span className="text-sm text-muted-foreground italic">"{creative.hook}"</span>
                </td>
                <td className="py-4 px-6 text-right">
                  <span className="text-sm font-medium">{creative.impressions}</span>
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-sm font-medium">{creative.ctr}</span>
                    <span
                      className={`flex items-center text-xs ${
                        creative.ctrChange >= 0 ? "text-success" : "text-destructive"
                      }`}
                    >
                      {creative.ctrChange >= 0 ? (
                        <TrendingUp className="w-3 h-3 mr-0.5" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-0.5" />
                      )}
                      {Math.abs(creative.ctrChange)}%
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-sm font-medium">{creative.roas}</span>
                    <span
                      className={`flex items-center text-xs ${
                        creative.roasChange >= 0 ? "text-success" : "text-destructive"
                      }`}
                    >
                      {creative.roasChange >= 0 ? (
                        <TrendingUp className="w-3 h-3 mr-0.5" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-0.5" />
                      )}
                      {Math.abs(creative.roasChange)}%
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6 text-right">
                  <span className="text-sm font-medium">{creative.spend}</span>
                </td>
                <td className="py-4 px-6 text-right">
                  <span className="text-sm font-medium text-success">{creative.revenue}</span>
                </td>
                <td className="py-4 px-6 text-center">
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusStyles[creative.status]}`}
                  >
                    {creative.status}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {creative.status === "active" ? (
                      <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                        <Pause className="w-4 h-4 text-muted-foreground" />
                      </button>
                    ) : (
                      <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                        <Play className="w-4 h-4 text-muted-foreground" />
                      </button>
                    )}
                    <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                      <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};
