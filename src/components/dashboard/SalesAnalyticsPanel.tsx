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
  Loader2,
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
import { useStripeAnalytics } from "@/hooks/useStripeAnalytics";

function formatCurrency(num: number): string {
  if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
  if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
  return `$${num.toFixed(0)}`;
}

export function SalesAnalyticsPanel() {
  const { metrics: stripeMetrics, isLoading, isLive } = useStripeAnalytics();

  // Use real Stripe data for top products
  const topProducts = stripeMetrics.topProducts.length > 0
    ? stripeMetrics.topProducts
    : [];

  // Calculate sales by channel from revenue events
  const channelRevenue: Record<string, number> = {};
  stripeMetrics.revenueEvents.forEach(event => {
    const channel = event.channel || 'Direct';
    channelRevenue[channel] = (channelRevenue[channel] || 0) + event.amount;
  });

  const totalChannelRevenue = Object.values(channelRevenue).reduce((sum, v) => sum + v, 0);
  const salesByChannel = Object.entries(channelRevenue)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, revenue]) => ({
      name,
      value: totalChannelRevenue > 0 ? Math.round((revenue / totalChannelRevenue) * 100) : 0,
      revenue,
    }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
            Sales Analytics
            {isLive && <Badge className="bg-green-500 text-xs">💰 LIVE</Badge>}
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          </h1>
          <p className="text-muted-foreground">
            Real-time revenue, orders, and sales performance from Stripe
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
                    {formatCurrency(stripeMetrics.monthRevenue)}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowUpRight className="w-3.5 h-3.5 text-success" />
                    <span className="text-xs text-success font-medium">
                      ${stripeMetrics.todayRevenue.toFixed(0)} today
                    </span>
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
                    {stripeMetrics.weekConversions}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowUpRight className="w-3.5 h-3.5 text-success" />
                    <span className="text-xs text-success font-medium">{stripeMetrics.todayConversions} today</span>
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
                    ${stripeMetrics.avgOrderValue.toFixed(2)}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-xs text-muted-foreground">From Stripe data</span>
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
                    {stripeMetrics.totalCustomers}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-xs text-muted-foreground">From Stripe</span>
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
              {salesByChannel.length > 0 ? (
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
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No sales data yet</p>
                  <p className="text-xs mt-1">Sales will appear from Stripe</p>
                </div>
              )}
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
            {topProducts.length > 0 ? (
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
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No product data yet</p>
                <p className="text-xs mt-1">Product sales will appear from Stripe</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
