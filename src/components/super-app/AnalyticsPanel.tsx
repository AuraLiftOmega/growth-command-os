/**
 * ANALYTICS PANEL
 * 
 * Cross-channel analytics with:
 * - Revenue attribution
 * - Channel comparison
 * - Customer journey mapping
 * - Cohort analysis
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  ShoppingCart,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  Filter
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';

// Demo data
const revenueData = [
  { date: 'Mon', revenue: 2840, orders: 34, visitors: 1250 },
  { date: 'Tue', revenue: 3180, orders: 41, visitors: 1480 },
  { date: 'Wed', revenue: 2950, orders: 38, visitors: 1320 },
  { date: 'Thu', revenue: 4200, orders: 52, visitors: 1890 },
  { date: 'Fri', revenue: 4850, orders: 61, visitors: 2140 },
  { date: 'Sat', revenue: 5620, orders: 72, visitors: 2580 },
  { date: 'Sun', revenue: 4980, orders: 63, visitors: 2210 },
];

const channelData = [
  { name: 'TikTok', revenue: 12450, percentage: 35, color: '#ff0050' },
  { name: 'Instagram', revenue: 8920, percentage: 25, color: '#C13584' },
  { name: 'Facebook', revenue: 6240, percentage: 18, color: '#4267B2' },
  { name: 'YouTube', revenue: 4180, percentage: 12, color: '#FF0000' },
  { name: 'Pinterest', revenue: 2140, percentage: 6, color: '#E60023' },
  { name: 'Direct', revenue: 1420, percentage: 4, color: '#6366f1' },
];

const productData = [
  { name: 'Vitamin C Serum', revenue: 8450, units: 169, trend: 12 },
  { name: 'Retinol Night Cream', revenue: 6890, units: 106, trend: 8 },
  { name: 'Hyaluronic Serum', revenue: 5420, units: 98, trend: -3 },
  { name: 'Collagen Moisturizer', revenue: 4980, units: 66, trend: 15 },
  { name: 'Face Roller Set', revenue: 3210, units: 80, trend: 5 },
];

const customerMetrics = [
  { label: 'New Customers', value: 342, change: 12, icon: Users },
  { label: 'Repeat Rate', value: '28%', change: 4, icon: ArrowUpRight },
  { label: 'Avg Order Value', value: '$67.50', change: 8, icon: ShoppingCart },
  { label: 'Customer LTV', value: '$142', change: 15, icon: DollarSign },
];

export function AnalyticsPanel() {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedChannel, setSelectedChannel] = useState('all');

  const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = revenueData.reduce((sum, d) => sum + d.orders, 0);
  const totalVisitors = revenueData.reduce((sum, d) => sum + d.visitors, 0);
  const conversionRate = ((totalOrders / totalVisitors) * 100).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-br from-chart-1/10 to-chart-2/10 border-chart-1/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-chart-1 to-chart-2 flex items-center justify-center">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold">Cross-Channel Analytics</h2>
              <p className="text-muted-foreground">Real-time performance across all channels</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {customerMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Icon className="w-5 h-5 text-primary" />
                  <Badge variant="outline" className={`text-xs ${metric.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {metric.change >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                    {Math.abs(metric.change)}%
                  </Badge>
                </div>
                <p className="text-2xl font-bold">{metric.value}</p>
                <p className="text-xs text-muted-foreground">{metric.label}</p>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Revenue Chart */}
        <div className="col-span-12 lg:col-span-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold">Revenue Overview</h3>
                <p className="text-sm text-muted-foreground">
                  Total: ${totalRevenue.toLocaleString()} • {totalOrders} orders • {conversionRate}% CVR
                </p>
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(val) => `$${val}`} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border rounded-lg p-3 shadow-lg">
                            <p className="font-semibold">{label}</p>
                            <p className="text-success">Revenue: ${payload[0].value}</p>
                            <p className="text-muted-foreground text-sm">Orders: {payload[0].payload.orders}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Channel Breakdown */}
        <div className="col-span-12 lg:col-span-4">
          <Card className="p-6 h-full">
            <h3 className="font-semibold mb-4">Revenue by Channel</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="revenue"
                  >
                    {channelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {channelData.slice(0, 4).map((channel) => (
                <div key={channel.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: channel.color }} />
                    <span>{channel.name}</span>
                  </div>
                  <span className="font-medium">{channel.percentage}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Top Products */}
        <div className="col-span-12">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Top Performing Products</h3>
            <div className="space-y-4">
              {productData.map((product, index) => (
                <div key={product.name} className="flex items-center gap-4">
                  <span className="text-lg font-bold text-muted-foreground w-6">#{index + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium">{product.name}</p>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className={product.trend >= 0 ? 'text-success' : 'text-destructive'}>
                          {product.trend >= 0 ? '+' : ''}{product.trend}%
                        </Badge>
                        <span className="font-bold text-success">${product.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Progress value={(product.revenue / productData[0].revenue) * 100} className="flex-1 h-2" />
                      <span className="text-xs text-muted-foreground w-20">{product.units} units</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
