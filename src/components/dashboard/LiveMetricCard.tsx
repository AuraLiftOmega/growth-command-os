import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface LiveMetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  isLive?: boolean;
  delay?: number;
}

export const LiveMetricCard = ({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  isLive = true,
  delay = 0,
}: LiveMetricCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <Card className="p-4 bg-card hover:bg-card/80 transition-colors relative overflow-hidden group">
        {isLive && (
          <div className="absolute top-2 right-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
          </div>
        )}
        
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {change && (
              <p className={`text-xs font-medium ${
                changeType === "positive" ? "text-success" :
                changeType === "negative" ? "text-destructive" :
                "text-muted-foreground"
              }`}>
                {change}
              </p>
            )}
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
