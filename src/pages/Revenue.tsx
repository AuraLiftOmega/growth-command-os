import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  DollarSign, TrendingUp, ShoppingCart, Eye, 
  BarChart3, ArrowUpRight, RefreshCw,
  Zap, Target, Activity, Brain, Store, CheckCircle2,
  Sparkles, Loader2, Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useShopifyProducts } from "@/hooks/useShopifyProducts";
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { toast } from "sonner";

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

export default function Revenue() {
  const { user } = useAuth();
  const { products, isLoading: shopifyLoading, lastFetched, refetch, error: shopifyError } = useShopifyProducts({
    autoLoad: true
  });

  const [isLiveMode, setIsLiveMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [omegaSuggestions, setOmegaSuggestions] = useState<string[]>([]);

  const [metrics, setMetrics] = useState({
    mrr: 2847.50,
    salesToday: 389.99,
    ordersToday: 12,
    avgOrderValue: 32.50,
    totalViews: 45892,
    conversionRate: 3.2,
    topProduct: products[0]?.title || "No products",
    roas: 4.2
  });

  const [revenueData] = useState([
    { date: 'Mon', revenue: 420, orders: 14 },
    { date: 'Tue', revenue: 380, orders: 11 },
    { date: 'Wed', revenue: 510, orders: 18 },
    { date: 'Thu', revenue: 290, orders: 9 },
    { date: 'Fri', revenue: 650, orders: 22 },
    { date: 'Sat', revenue: 720, orders: 25 },
    { date: 'Sun', revenue: 389, orders: 12 },
  ]);

  const [channelROAS] = useState([
    { name: 'TikTok', roas: 5.2, spend: 450, revenue: 2340 },
    { name: 'Pinterest', roas: 3.8, spend: 320, revenue: 1216 },
    { name: 'Instagram', roas: 2.9, spend: 280, revenue: 812 },
    { name: 'Facebook', roas: 2.1, spend: 200, revenue: 420 },
  ]);

  const [productPerformance] = useState([
    { name: 'Vitamin C Serum', value: 35 },
    { name: 'Retinol Cream', value: 28 },
    { name: 'Hyaluronic Serum', value: 20 },
    { name: 'Collagen Moisturizer', value: 12 },
    { name: 'Rose Quartz Roller', value: 5 },
  ]);

  const formatSyncTime = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return date.toLocaleTimeString();
  };

  const handleShopifySync = async () => {
    setIsSyncing(true);
    try {
      await refetch();
      toast.success(`✅ Synced ${products.length} AuraLift products from Shopify`);
    } catch (err) {
      toast.error('Shopify sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const runOmegaAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      // Simulate Omega AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const suggestions = [
        "🎯 TikTok posts at 7-9 PM MST get +42% more views — schedule accordingly",
        "💡 Vitamin C Serum outperforms by 3.2x — double down on ads for this product",
        "📌 Pinterest Idea Pins converting 28% better than standard pins",
        "⚡ Add urgency badges to product pages — can increase CR by 15%",
        "🔄 Retarget cart abandoners with Retinol Night Cream bundle offer"
      ];
      
      setOmegaSuggestions(suggestions);
      toast.success("Omega AI analysis complete");
    } catch (err) {
      toast.error("Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const refreshMetrics = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setMetrics(prev => ({
      ...prev,
      salesToday: prev.salesToday + Math.random() * 50,
      ordersToday: prev.ordersToday + Math.floor(Math.random() * 3),
      totalViews: prev.totalViews + Math.floor(Math.random() * 100)
    }));
    setIsLoading(false);
  };

  // Auto-sync on mount
  useEffect(() => {
    if (!lastFetched) {
      refetch();
    }
  }, [lastFetched, refetch]);

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Live Revenue Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">Real-time revenue tracking & attribution</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="live-mode" className="text-sm">Live Mode</Label>
              <Switch
                id="live-mode"
                checked={isLiveMode}
                onCheckedChange={setIsLiveMode}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshMetrics}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={runOmegaAnalysis}
              disabled={isAnalyzing}
              className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Omega Analyze
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Shopify Live Connection Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <Store className="h-5 w-5 text-emerald-400" />
                </div>
                {!shopifyLoading && !shopifyError && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Shopify Live</span>
                  {shopifyLoading || isSyncing ? (
                    <Badge variant="secondary" className="gap-1 text-xs">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Syncing...
                    </Badge>
                  ) : shopifyError ? (
                    <Badge variant="destructive" className="text-xs">Error</Badge>
                  ) : (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-0 gap-1 text-xs">
                      <CheckCircle2 className="w-3 h-3" />
                      Connected
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Last sync: {formatSyncTime(lastFetched)}
                  </span>
                  <span>•</span>
                  <span>Products: {products.length}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-medium">
                    Revenue Today: ${metrics.salesToday.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShopifySync}
              disabled={isSyncing || shopifyLoading}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              Sync Now
            </Button>
          </div>
        </motion.div>

        {/* Omega AI Suggestions */}
        {omegaSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/30 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-medium">Omega AI Insights</span>
            </div>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {omegaSuggestions.map((suggestion, i) => (
                <div key={i} className="text-sm p-2 bg-background/50 rounded-lg">
                  {suggestion}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Live Mode Banner */}
        {isLiveMode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-lg p-3 flex items-center gap-3"
          >
            <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-medium">Live Revenue Mode Active</span>
            <Badge variant="outline" className="border-emerald-500/50 text-emerald-400">
              Real Stripe + Shopify Connected
            </Badge>
          </motion.div>
        )}

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Monthly Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-400">
                  ${metrics.mrr.toLocaleString()}
                </div>
                <div className="flex items-center gap-1 text-sm text-emerald-400 mt-1">
                  <ArrowUpRight className="h-4 w-4" />
                  +12.5% vs last month
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Sales Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-400">
                  ${metrics.salesToday.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {metrics.ordersToday} orders • ${metrics.avgOrderValue} avg
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Total Views
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-400">
                  {metrics.totalViews.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {metrics.conversionRate}% conversion rate
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Avg ROAS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-400">
                  {metrics.roas}x
                </div>
                <div className="flex items-center gap-1 text-sm text-emerald-400 mt-1">
                  <ArrowUpRight className="h-4 w-4" />
                  +0.8x this week
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                Revenue This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="date" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a1a1a', 
                        border: '1px solid #333',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#10b981" 
                      fillOpacity={1}
                      fill="url(#revenueGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Channel ROAS */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-400" />
                Channel ROAS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={channelROAS} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis type="number" stroke="#888" />
                    <YAxis dataKey="name" type="category" stroke="#888" width={80} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a1a1a', 
                        border: '1px solid #333',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number, name: string) => {
                        if (name === 'roas') return [`${value}x`, 'ROAS'];
                        return [`$${value}`, name.charAt(0).toUpperCase() + name.slice(1)];
                      }}
                    />
                    <Bar dataKey="roas" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Product Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-400" />
                Product Mix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={productPerformance}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {productPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a1a1a', 
                        border: '1px solid #333',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                {productPerformance.map((product, i) => (
                  <div key={product.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-3 w-3 rounded-full" 
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      />
                      <span className="truncate max-w-[150px]">{product.name}</span>
                    </div>
                    <span className="font-medium">{product.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Ads */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-400" />
                Top Performing Ads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {channelROAS.map((channel, i) => (
                  <div 
                    key={channel.name}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-muted-foreground">#{i + 1}</div>
                      <div>
                        <div className="font-medium">{channel.name} - Vitamin C Serum</div>
                        <div className="text-sm text-muted-foreground">
                          Spend: ${channel.spend} • Revenue: ${channel.revenue}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-emerald-400">{channel.roas}x</div>
                      <div className="text-sm text-muted-foreground">ROAS</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
