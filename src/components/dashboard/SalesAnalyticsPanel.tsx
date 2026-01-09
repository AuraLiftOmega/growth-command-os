import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Users,
  Target,
  ArrowUpRight,
  Calendar,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { useLiveMetrics } from "@/hooks/useLiveMetrics";

function formatCurrency(num: number): string {
  if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
  if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
  return `$${num.toFixed(0)}`;
}

export function SalesAnalyticsPanel() {
  const { metrics } = useLiveMetrics();

  const topProducts = [
    { name: "Radiance Vitamin C Serum", revenue: 12450, orders: 156, growth: 24 },
    { name: "Hydra-Glow Retinol Cream", revenue: 9820, orders: 98, growth: 18 },
    { name: "Ultra Hydration Serum", revenue: 7650, orders: 85, growth: -5 },
    { name: "Collagen Moisturizer", revenue: 6420, orders: 72, growth: 12 },
    { name: "Rose Quartz Roller Set", revenue: 4890, orders: 63, growth: 31 },
  ];

  const salesByChannel = [
    { name: "Direct", value: 45, revenue: 32400 },
    { name: "TikTok", value: 28, revenue: 20160 },
    { name: "Instagram", value: 15, revenue: 10800 },
    { name: "Pinterest", value: 12, revenue: 8640 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Sales Analytics</h1>
          <p className="text-muted-foreground">
            Track revenue, orders, and sales performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="7d">
            <SelectTrigger className="w-[140px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card className="metric-card">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl lg:text-3xl font-bold font-mono mt-1">
                    {formatCurrency(metrics.mrr * 12)}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowUpRight className="w-3.5 h-3.5 text-success" />
                    <span className="text-xs text-success font-medium">
                      +{metrics.mrrChange}%
                    </span>
                    <span className="text-xs text-muted-foreground">vs last period</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card className="metric-card">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl lg:text-3xl font-bold font-mono mt-1">
                    {metrics.totalDeals}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowUpRight className="w-3.5 h-3.5 text-success" />
                    <span className="text-xs text-success font-medium">+12%</span>
                    <span className="text-xs text-muted-foreground">vs last period</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-accent/10">
                  <ShoppingCart className="w-5 h-5 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="metric-card">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Order Value</p>
                  <p className="text-2xl lg:text-3xl font-bold font-mono mt-1">
                    $87.50
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowUpRight className="w-3.5 h-3.5 text-success" />
                    <span className="text-xs text-success font-medium">+8%</span>
                    <span className="text-xs text-muted-foreground">vs last period</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-success/10">
                  <Target className="w-5 h-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="metric-card">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Customers</p>
                  <p className="text-2xl lg:text-3xl font-bold font-mono mt-1">
                    {metrics.totalLeads}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowUpRight className="w-3.5 h-3.5 text-success" />
                    <span className="text-xs text-success font-medium">
                      +{metrics.leadsChange}
                    </span>
                    <span className="text-xs text-muted-foreground">new this week</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-warning/10">
                  <Users className="w-5 h-5 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <RevenueChart />
        </motion.div>

        {/* Sales by Channel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="glass-card h-full">
            <CardHeader>
              <CardTitle className="text-lg">Sales by Channel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {salesByChannel.map((channel, index) => (
                  <div key={channel.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{channel.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(channel.revenue)}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${channel.value}%` }}
                        transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-right">
                      {channel.value}%
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top Products */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Top Selling Products</span>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground border-b border-border">
                    <th className="pb-3 font-medium">Product</th>
                    <th className="pb-3 font-medium text-right">Revenue</th>
                    <th className="pb-3 font-medium text-right">Orders</th>
                    <th className="pb-3 font-medium text-right">Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product, index) => (
                    <tr
                      key={product.name}
                      className="border-b border-border/50 last:border-0"
                    >
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          <span className="font-medium text-sm">{product.name}</span>
                        </div>
                      </td>
                      <td className="py-4 text-right font-mono font-medium">
                        {formatCurrency(product.revenue)}
                      </td>
                      <td className="py-4 text-right text-muted-foreground">
                        {product.orders}
                      </td>
                      <td className="py-4 text-right">
                        <Badge
                          variant="outline"
                          className={
                            product.growth >= 0
                              ? "border-success/30 text-success bg-success/10"
                              : "border-destructive/30 text-destructive bg-destructive/10"
                          }
                        >
                          {product.growth >= 0 ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          ) : (
                            <TrendingDown className="w-3 h-3 mr-1" />
                          )}
                          {Math.abs(product.growth)}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
