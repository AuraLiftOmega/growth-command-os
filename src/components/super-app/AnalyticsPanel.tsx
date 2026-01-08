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
  Youtube,
  Play,
  Clock,
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
<h2 className="text-2xl font-display font-bold">Pinterest + YouTube Analytics</h2>
              <p className="text-muted-foreground">Real-time performance • Multi-channel metrics</p>
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
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
          <TabsTrigger value="funnel">Revenue Flow</TabsTrigger>
          <TabsTrigger value="pins">Live Pins</TabsTrigger>
          <TabsTrigger value="youtube">YouTube</TabsTrigger>
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

        <TabsContent value="youtube" className="space-y-6">
          {/* YouTube Analytics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <AnimatedKPICard
              title="YouTube Views"
              value={12400}
              previousValue={8200}
              icon={Eye}
              color="accent"
              live
            />
            <AnimatedKPICard
              title="Shorts Views"
              value={8900}
              previousValue={5400}
              icon={Play}
              color="primary"
            />
            <AnimatedKPICard
              title="Watch Time (hrs)"
              value={342}
              previousValue={245}
              icon={Clock}
              color="success"
            />
            <AnimatedKPICard
              title="CTR"
              value={8.2}
              previousValue={6.8}
              icon={MousePointerClick}
              color="success"
            />
          </div>

          {/* YouTube Upload Log */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-[#FF0000]/10">
                <Youtube className="w-5 h-5 text-[#FF0000]" />
              </div>
              <div>
                <h3 className="font-semibold">Recent YouTube Uploads</h3>
                <p className="text-sm text-muted-foreground">Auto-published by Swarm</p>
              </div>
            </div>
            <div className="space-y-3">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-gradient-to-r from-[#FF0000]/5 to-transparent border border-[#FF0000]/20"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Badge className="mb-2 bg-[#FF0000]/20 text-[#FF0000]">SHORTS</Badge>
                    <h4 className="font-medium">Get the Glow: Radiance Vitamin C Serum Routine 2026 | AuraLift Essentials</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Tags: vitamin c serum, skincare routine, natural glow, auralift
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-sm">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> 2,847 views
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" /> 234 likes
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 8.2% CTR
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-success border-success/30">
                    ✓ LIVE
                  </Badge>
                </div>
                <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Upload ID: yt_short_abc123</span>
                  <span>Published 3 hours ago</span>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-4 rounded-xl bg-muted/30 border"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Badge variant="secondary" className="mb-2">VIDEO</Badge>
                    <h4 className="font-medium">Complete Morning Skincare Routine with AuraLift Vitamin C Serum</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Tags: skincare tutorial, vitamin c benefits, morning routine
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-sm">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> 1,245 views
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" /> 89 likes
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 6.1% CTR
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-success border-success/30">
                    ✓ LIVE
                  </Badge>
                </div>
                <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Upload ID: yt_vid_def456</span>
                  <span>Published yesterday</span>
                </div>
              </motion.div>
            </div>
          </Card>
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
