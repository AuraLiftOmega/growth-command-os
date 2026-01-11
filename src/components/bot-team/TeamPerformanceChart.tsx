import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp } from "lucide-react";

interface TeamStats {
  revenue: number;
  tasks: number;
  errors: number;
}

interface TeamPerformanceChartProps {
  stats: Record<string, TeamStats>;
}

const TEAM_COLORS: Record<string, string> = {
  sales: "#22c55e",
  ads: "#3b82f6",
  domains: "#a855f7",
  engagement: "#f97316",
  revenue: "#eab308",
};

const TEAM_NAMES: Record<string, string> = {
  sales: "Sales",
  ads: "Ads",
  domains: "Domains",
  engagement: "Engage",
  revenue: "Revenue",
};

export function TeamPerformanceChart({ stats }: TeamPerformanceChartProps) {
  const chartData = Object.entries(stats).map(([team, data]) => ({
    team: TEAM_NAMES[team] || team,
    revenue: data.revenue,
    tasks: data.tasks,
    color: TEAM_COLORS[team] || "#888",
  }));

  const totalRevenue = Object.values(stats).reduce((sum, s) => sum + s.revenue, 0);
  const totalTasks = Object.values(stats).reduce((sum, s) => sum + s.tasks, 0);

  return (
    <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Team Performance
          </CardTitle>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-500">${totalRevenue.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{totalTasks} total tasks</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
            <XAxis 
              type="number" 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tickFormatter={(value) => `$${value}`}
            />
            <YAxis 
              type="category" 
              dataKey="team" 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
              width={60}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
            />
            <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
