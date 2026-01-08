/**
 * SUPER DASHBOARD - Central Command Hub
 * 
 * All-in-one dashboard with tabs for:
 * - Overview (metrics, charts)
 * - Store Builder
 * - Channels & Integrations
 * - Video Ad Studio
 * - Ad Campaigns
 * - Autonomy Agent (CEO Mode)
 * - Analytics
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Store,
  Plug,
  Video,
  Megaphone,
  Brain,
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Eye,
  Target,
  Zap,
  Activity,
  RefreshCw
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { PerformanceChart } from '@/components/dashboard/PerformanceChart';
import { useAnalytics } from '@/hooks/useAnalytics';
import { MultiChannelHub } from './MultiChannelHub';
import { VideoAdStudio } from './VideoAdStudio';
import { AdCampaignsPanel } from './AdCampaignsPanel';
import { CEOAgentPanel } from './CEOAgentPanel';
import { AnalyticsPanel } from './AnalyticsPanel';
import { VoiceChatAgent } from './VoiceChatAgent';
import { StoreOnboardingBanner } from '@/components/dashboard/StoreOnboardingBanner';
import { LiveProfitEngine } from '@/components/autonomous/LiveProfitEngine';
import { RealVideoSwarm } from '@/components/autonomous/RealVideoSwarm';

interface SuperDashboardProps {
  className?: string;
}

export function SuperDashboard({ className }: SuperDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const { metrics, refreshAnalytics, isLoading } = useAnalytics();
  const [autonomyLevel, setAutonomyLevel] = useState(85);
  const [isLive, setIsLive] = useState(true);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'store', label: 'Store Builder', icon: Store },
    { id: 'channels', label: 'Channels', icon: Plug, badge: '12' },
    { id: 'video', label: 'Video Studio', icon: Video, badge: 'AI' },
    { id: 'ads', label: 'Ad Campaigns', icon: Megaphone },
    { id: 'ceo', label: 'CEO Agent', icon: Brain, badge: 'LIVE' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className={className}>
      {/* Top Status Bar */}
      <Card className="mb-6 p-4 bg-gradient-to-r from-success/10 via-primary/5 to-chart-2/10 border-success/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-success to-primary flex items-center justify-center"
              animate={isLive ? { scale: [1, 1.05, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Zap className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-display font-bold">DOMINION SUPER APP</h2>
                <Badge className="bg-success/20 text-success animate-pulse">LIVE</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {autonomyLevel}% Autonomous • 15 Products • 12 Channels Connected
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-2xl font-bold text-success">${formatNumber(metrics.todayRevenue)}</p>
              <p className="text-xs text-muted-foreground">Today's Revenue</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshAnalytics}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Sync
            </Button>
          </div>
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-7 w-full bg-muted/50 p-1 rounded-xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Icon className="w-4 h-4" />
                <span className="hidden lg:inline">{tab.label}</span>
                {tab.badge && (
                  <Badge 
                    variant="secondary" 
                    className={`text-[10px] px-1 py-0 ${
                      tab.badge === 'LIVE' ? 'bg-success/20 text-success' :
                      tab.badge === 'AI' ? 'bg-primary/20 text-primary' :
                      ''
                    }`}
                  >
                    {tab.badge}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <AnimatePresence mode="wait">
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <StoreOnboardingBanner />
            
            {/* Top Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <MetricCard
                title="Today's Revenue"
                value={`$${formatNumber(metrics.todayRevenue)}`}
                change={`${metrics.todayRevenueChange >= 0 ? "+" : ""}${metrics.todayRevenueChange}%`}
                changeType={metrics.todayRevenueChange >= 0 ? "positive" : "negative"}
                icon={DollarSign}
                delay={0}
              />
              <MetricCard
                title="Blended ROAS"
                value={`${metrics.blendedRoas.toFixed(1)}x`}
                change={`${metrics.roasChange >= 0 ? "+" : ""}${metrics.roasChange}%`}
                changeType={metrics.roasChange >= 0 ? "positive" : "negative"}
                icon={TrendingUp}
                delay={0.05}
              />
              <MetricCard
                title="Orders"
                value={formatNumber(metrics.orders)}
                change={`${metrics.ordersChange >= 0 ? "+" : ""}${metrics.ordersChange}%`}
                changeType={metrics.ordersChange >= 0 ? "positive" : "negative"}
                icon={ShoppingCart}
                delay={0.1}
              />
              <MetricCard
                title="New Customers"
                value={formatNumber(metrics.newCustomers)}
                change={`${metrics.customersChange >= 0 ? "+" : ""}${metrics.customersChange}%`}
                changeType={metrics.customersChange >= 0 ? "positive" : "negative"}
                icon={Users}
                delay={0.15}
              />
              <MetricCard
                title="Impressions"
                value={formatNumber(metrics.impressions)}
                change={`${metrics.impressionsChange >= 0 ? "+" : ""}${metrics.impressionsChange}%`}
                changeType={metrics.impressionsChange >= 0 ? "positive" : "negative"}
                icon={Eye}
                delay={0.2}
              />
              <MetricCard
                title="Conversion"
                value={`${metrics.conversionRate.toFixed(1)}%`}
                change={`${metrics.conversionRateChange >= 0 ? "+" : ""}${metrics.conversionRateChange}%`}
                changeType={metrics.conversionRateChange >= 0 ? "positive" : "negative"}
                icon={Target}
                delay={0.25}
              />
            </div>

            {/* Performance Chart */}
            <PerformanceChart />

            {/* Live Profit Engine */}
            <LiveProfitEngine />

            {/* Real Video Swarm */}
            <RealVideoSwarm />
          </TabsContent>

          {/* Store Builder Tab */}
          <TabsContent value="store" className="space-y-6">
            <Card className="p-8 text-center bg-gradient-to-br from-primary/10 to-chart-2/10">
              <Store className="w-16 h-16 mx-auto text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-2">30-Minute Store Builder</h3>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                AI-powered store setup with business intake, product generation, layout optimization, and SEO
              </p>
              <Button size="lg" className="gap-2">
                <Zap className="w-5 h-5" />
                Launch Store Builder
              </Button>
            </Card>
            <StoreOnboardingBanner />
          </TabsContent>

          {/* Channels Tab */}
          <TabsContent value="channels" className="space-y-6">
            <MultiChannelHub />
          </TabsContent>

          {/* Video Studio Tab */}
          <TabsContent value="video" className="space-y-6">
            <VideoAdStudio />
          </TabsContent>

          {/* Ad Campaigns Tab */}
          <TabsContent value="ads" className="space-y-6">
            <AdCampaignsPanel />
          </TabsContent>

          {/* CEO Agent Tab */}
          <TabsContent value="ceo" className="space-y-6">
            <CEOAgentPanel 
              autonomyLevel={autonomyLevel}
              onAutonomyChange={setAutonomyLevel}
            />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsPanel />
          </TabsContent>
        </AnimatePresence>
      </Tabs>

      {/* Floating Voice/Chat Agent */}
      <VoiceChatAgent />
    </div>
  );
}
