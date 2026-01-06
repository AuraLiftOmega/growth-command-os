import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  delay?: number;
}

export const MetricCard = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  delay = 0,
}: MetricCardProps) => {
  const changeColor = {
    positive: "text-success",
    negative: "text-destructive",
    neutral: "text-muted-foreground",
  };

  const changeBg = {
    positive: "bg-success/10",
    negative: "bg-destructive/10",
    neutral: "bg-muted/50",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="metric-card group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
          <Icon className="w-5 h-5" />
        </div>
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${changeBg[changeType]} ${changeColor[changeType]}`}
        >
          {change}
        </span>
      </div>
      <div>
        <p className="text-muted-foreground text-sm mb-1">{title}</p>
        <p className="text-2xl font-display font-semibold tracking-tight">
          {value}
        </p>
      </div>
    </motion.div>
  );
};
