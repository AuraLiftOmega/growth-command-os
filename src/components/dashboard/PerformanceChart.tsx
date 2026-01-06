import { motion } from "framer-motion";
import { TrendingUp, DollarSign, Eye, Target } from "lucide-react";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAnalytics } from "@/hooks/useAnalytics";

type MetricType = "revenue" | "roas" | "impressions" | "conversions";

const metricConfig: Record<MetricType, { label: string; icon: typeof DollarSign; color: string; format: (v: number) => string }> = {
  revenue: {
    label: "Revenue",
    icon: DollarSign,
    color: "hsl(160, 84%, 39%)",
    format: (v) => `$${(v / 1000).toFixed(1)}K`,
  },
  roas: {
    label: "ROAS",
    icon: TrendingUp,
    color: "hsl(217, 91%, 60%)",
    format: (v) => `${v.toFixed(1)}x`,
  },
  impressions: {
    label: "Impressions",
    icon: Eye,
    color: "hsl(280, 87%, 65%)",
    format: (v) => `${(v / 1000).toFixed(0)}K`,
  },
  conversions: {
    label: "Conversions",
    icon: Target,
    color: "hsl(38, 92%, 50%)",
    format: (v) => v.toString(),
  },
};

export const PerformanceChart = () => {
  const [activeMetric, setActiveMetric] = useState<MetricType>("revenue");
  const { performanceData, isLoading } = useAnalytics();

  const config = metricConfig[activeMetric];
  const Icon = config.icon;

  const formatXAxis = (value: string) => {
    const date = new Date(value);
    return date.getHours() + ":00";
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="h-[300px] flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg">Real-Time Performance</h3>
            <p className="text-muted-foreground text-sm">Last 24 hours • Auto-refreshes every 5 min</p>
          </div>
        </div>

        {/* Metric Selector */}
        <div className="flex gap-1 p-1 bg-secondary/50 rounded-lg">
          {(Object.keys(metricConfig) as MetricType[]).map((key) => {
            const MetricIcon = metricConfig[key].icon;
            return (
              <button
                key={key}
                onClick={() => setActiveMetric(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeMetric === key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <MetricIcon className="w-3 h-3" />
                {metricConfig[key].label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart */}
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={performanceData}>
            <defs>
              <linearGradient id={`gradient-${activeMetric}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={config.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={config.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(222, 47%, 16%)"
              vertical={false}
            />
            <XAxis
              dataKey="hour"
              tickFormatter={formatXAxis}
              stroke="hsl(215, 20%, 55%)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickFormatter={config.format}
              stroke="hsl(215, 20%, 55%)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              width={50}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(222, 47%, 10%)",
                border: "1px solid hsl(222, 47%, 20%)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number) => [config.format(value), config.label]}
              labelFormatter={(label) => {
                const date = new Date(label);
                return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
              }}
            />
            <Area
              type="monotone"
              dataKey={activeMetric}
              stroke={config.color}
              strokeWidth={2}
              fill={`url(#gradient-${activeMetric})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-border/50">
        {performanceData.length > 0 && (
          <>
            <div className="text-center">
              <p className="text-lg font-display font-bold text-success">
                ${(performanceData.reduce((a, p) => a + p.revenue, 0) / 1000).toFixed(1)}K
              </p>
              <p className="text-[10px] text-muted-foreground">Total Revenue</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-display font-bold text-primary">
                {(
                  performanceData.reduce((a, p) => a + p.revenue, 0) /
                  performanceData.reduce((a, p) => a + p.spend, 0)
                ).toFixed(1)}x
              </p>
              <p className="text-[10px] text-muted-foreground">Avg ROAS</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-display font-bold text-foreground">
                {(performanceData.reduce((a, p) => a + p.impressions, 0) / 1000000).toFixed(1)}M
              </p>
              <p className="text-[10px] text-muted-foreground">Impressions</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-display font-bold text-warning">
                {performanceData.reduce((a, p) => a + p.conversions, 0)}
              </p>
              <p className="text-[10px] text-muted-foreground">Conversions</p>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};
