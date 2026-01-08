/**
 * ANALYTICS PANEL - INTERACTIVE DASHBOARDS
 * 
 * Cross-channel analytics with:
 * - Pinterest metrics heatmaps
 * - Revenue waterfalls
 * - Animated KPIs with sparklines
 * - Live Pin carousel & leaderboard
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
  Heart,
  MousePointerClick,
  Video,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PinterestHeatmap, RevenueWaterfall, SwarmProgressRings, AnimatedKPICard } from '@/components/dashboard/charts';
import { LivePinCarousel, PinLeaderboard, SwarmStatusPanel } from '@/components/dashboard/pinterest';

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
              <h2 className="text-2xl font-display font-bold">Pinterest Analytics</h2>
              <p className="text-muted-foreground">Real-time performance • Live metrics</p>
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
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Animated KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AnimatedKPICard
          title="Pin Impressions"
          value={48500}
          previousValue={42000}
          icon={Eye}
          color="primary"
          live
        />
        <AnimatedKPICard
          title="Total Saves"
          value={2340}
          previousValue={1890}
          icon={Heart}
          color="accent"
        />
        <AnimatedKPICard
          title="Link Clicks"
          value={890}
          previousValue={720}
          icon={MousePointerClick}
          color="success"
        />
        <AnimatedKPICard
          title="Revenue"
          value={19584}
          previousValue={15200}
          format="currency"
          icon={DollarSign}
          color="success"
          live
        />
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="heatmap" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-xl">
          <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
          <TabsTrigger value="funnel">Revenue Flow</TabsTrigger>
          <TabsTrigger value="pins">Live Pins</TabsTrigger>
          <TabsTrigger value="swarm">Swarm</TabsTrigger>
        </TabsList>

        <TabsContent value="heatmap" className="space-y-6">
          <PinterestHeatmap />
          <PinLeaderboard />
        </TabsContent>

        <TabsContent value="funnel" className="space-y-6">
          <RevenueWaterfall />
          <SwarmProgressRings />
        </TabsContent>

        <TabsContent value="pins" className="space-y-6">
          <LivePinCarousel />
          <PinLeaderboard />
        </TabsContent>

        <TabsContent value="swarm" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SwarmProgressRings />
            <SwarmStatusPanel />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
