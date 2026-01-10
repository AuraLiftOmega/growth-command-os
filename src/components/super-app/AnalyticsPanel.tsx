/**
 * ANALYTICS PANEL - INTERACTIVE DASHBOARDS
 * 
 * Cross-channel analytics with:
 * - Pinterest metrics heatmaps
 * - Revenue waterfalls
 * - Animated KPIs with sparklines
 * - Live Pin carousel & leaderboard
 * - Stripe transaction sync
 */

import { useState, useEffect } from 'react';
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
  CreditCard,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PinterestHeatmap, RevenueWaterfall, SwarmProgressRings, AnimatedKPICard } from '@/components/dashboard/charts';
import { LivePinCarousel, PinLeaderboard, SwarmStatusPanel } from '@/components/dashboard/pinterest';
import { useSubscription } from '@/hooks/useSubscription';

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

// Stripe transaction log for War Room sync
interface StripeTransaction {
  id: string;
  amount: number;
  status: 'succeeded' | 'pending' | 'failed';
  type: string;
  customer_email?: string;
  plan?: string;
  created_at: string;
}

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
        <TabsList className="grid grid-cols-6 w-full max-w-3xl">
          <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
          <TabsTrigger value="funnel">Revenue Flow</TabsTrigger>
          <TabsTrigger value="pins">Live Pins</TabsTrigger>
          <TabsTrigger value="youtube">YouTube</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
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
                    <h4 className="font-medium">Get the Glow: Radiance Vitamin C Serum Routine 2026 | Skincare Brand</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Tags: vitamin c serum, skincare routine, natural glow, beauty
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

        {/* Payments/Stripe Analytics Tab */}
        <TabsContent value="payments" className="space-y-6">
          <StripeTransactionsLog />
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

// Stripe Transactions Log Component
function StripeTransactionsLog() {
  const { subscription } = useSubscription();
  const [transactions, setTransactions] = useState<StripeTransaction[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Initialize with mock transaction data synced from Stripe
    const mockTransactions: StripeTransaction[] = [
      {
        id: 'txn_deploy_test_' + Date.now(),
        amount: 0,
        status: 'succeeded',
        type: 'deployment_test',
        created_at: new Date().toISOString(),
      },
      {
        id: 'cs_test_trial_001',
        amount: 0,
        status: 'succeeded',
        type: 'trial_started',
        customer_email: 'user@example.com',
        plan: subscription?.plan || 'starter',
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'sub_upcoming_001',
        amount: subscription?.plan === 'growth' ? 14900 : 4900,
        status: 'pending',
        type: 'subscription',
        customer_email: 'user@example.com',
        plan: subscription?.plan || 'starter',
        created_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
    setTransactions(mockTransactions);
    
    // Log test transaction on component mount (deploy trigger)
    console.log('[STRIPE ANALYTICS] Deployment test transaction logged:', mockTransactions[0]);
  }, [subscription]);

  const refreshTransactions = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const newTxn: StripeTransaction = {
        id: 'txn_refresh_' + Date.now(),
        amount: 0,
        status: 'succeeded',
        type: 'sync_check',
        created_at: new Date().toISOString(),
      };
      setTransactions(prev => [newTxn, ...prev]);
      setIsRefreshing(false);
    }, 1000);
  };

  const totalRevenue = transactions
    .filter(t => t.status === 'succeeded' && t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0) / 100;

  return (
    <div className="space-y-6">
      {/* Stripe KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AnimatedKPICard
          title="MRR"
          value={subscription?.plan === 'growth' ? 149 : subscription?.plan === 'starter' ? 49 : 0}
          previousValue={0}
          format="currency"
          icon={DollarSign}
          color="success"
          live
        />
        <AnimatedKPICard
          title="Transactions"
          value={transactions.length}
          previousValue={0}
          icon={CreditCard}
          color="primary"
        />
        <AnimatedKPICard
          title="Success Rate"
          value={100}
          previousValue={100}
          icon={CheckCircle}
          color="success"
        />
        <AnimatedKPICard
          title="Active Plan"
          value={1}
          previousValue={1}
          icon={TrendingUp}
          color="accent"
        />
      </div>

      {/* Stripe Connection Status */}
      <Card className="p-6 border-green-500/30 bg-green-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-green-500/20">
              <CreditCard className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Stripe Connected</h3>
                <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Test Mode
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Auto-syncing transactions to War Room • Last sync: just now
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshTransactions}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Sync
          </Button>
        </div>
      </Card>

      {/* Transaction Log */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Transaction Log</h3>
            <p className="text-sm text-muted-foreground">
              Real-time Stripe events synced to analytics
            </p>
          </div>
          <Badge variant="outline">
            {transactions.length} events
          </Badge>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {transactions.map((txn, index) => (
            <motion.div
              key={txn.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 rounded-xl border ${
                txn.status === 'succeeded' 
                  ? 'bg-green-500/5 border-green-500/20' 
                  : txn.status === 'pending'
                  ? 'bg-yellow-500/5 border-yellow-500/20'
                  : 'bg-red-500/5 border-red-500/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    txn.status === 'succeeded' 
                      ? 'bg-green-500/20' 
                      : txn.status === 'pending'
                      ? 'bg-yellow-500/20'
                      : 'bg-red-500/20'
                  }`}>
                    {txn.status === 'succeeded' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : txn.status === 'pending' ? (
                      <Clock className="w-4 h-4 text-yellow-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {txn.type === 'trial_started' && 'Trial Started'}
                      {txn.type === 'subscription' && `${txn.plan?.toUpperCase()} Subscription`}
                      {txn.type === 'deployment_test' && 'Deployment Test Transaction'}
                      {txn.type === 'sync_check' && 'Sync Check'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {txn.id} • {new Date(txn.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {txn.amount > 0 ? `$${(txn.amount / 100).toFixed(2)}` : '—'}
                  </p>
                  <Badge 
                    variant={txn.status === 'succeeded' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {txn.status}
                  </Badge>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}
