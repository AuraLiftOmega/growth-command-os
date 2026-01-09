import { useState } from "react";
import { motion } from "framer-motion";
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Target,
  Activity,
  RefreshCw,
  Wallet,
  Video,
  ShoppingBag,
  LayoutDashboard
} from "lucide-react";
import { SmartSidebar } from "@/components/layout/SmartSidebar";
import { Header } from "@/components/layout/Header";
import { LiveMetricCard } from "@/components/dashboard/LiveMetricCard";
import { PipelineTable } from "@/components/dashboard/PipelineTable";
import { LeadsTable } from "@/components/dashboard/LeadsTable";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { ProductionStatusBanner } from "@/components/dashboard/ProductionStatusBanner";
import { ShareStoreButton } from "@/components/dashboard/ShareStoreButton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useLiveMetrics } from "@/hooks/useLiveMetrics";
import { useAuth } from "@/hooks/useAuth";
import { VideoAdStudio } from "@/components/super-app/VideoAdStudio";
import { ShopifySyncPanel } from "@/components/dashboard/ShopifySyncPanel";

const Dashboard = () => {
  const { metrics, isLoading, refresh } = useLiveMetrics();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const formatCurrency = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num.toFixed(0)}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <SmartSidebar />
      
      <main className="ml-64 transition-all duration-300">
        <Header />
        
        <div className="p-6">
          {/* Header with user info */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Revenue Command Center</h1>
              <p className="text-sm text-muted-foreground">
                {user?.email ? `Welcome back, ${user.email.split('@')[0]}` : 'Real-time metrics, pipeline, and leads'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-success border-success/30 bg-success/10">
                Shopify Connected
              </Badge>
              <ShareStoreButton />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refresh}
                disabled={isLoading}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Production Status Banner */}
          <ProductionStatusBanner />

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="grid w-full max-w-[600px] grid-cols-3 mb-6">
              <TabsTrigger value="overview" className="gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="shopify" className="gap-2">
                <ShoppingBag className="w-4 h-4" />
                Shopify Sync
              </TabsTrigger>
              <TabsTrigger value="adgen" className="gap-2">
                <Video className="w-4 h-4" />
                Ad Generator
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Top Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <LiveMetricCard
                  title="MRR"
                  value={formatCurrency(metrics.mrr)}
                  change={`+${metrics.mrrChange}%`}
                  changeType="positive"
                  icon={DollarSign}
                  delay={0}
                />
                <LiveMetricCard
                  title="Today's Revenue"
                  value={formatCurrency(metrics.todayRevenue)}
                  icon={TrendingUp}
                  delay={0.05}
                />
                <LiveMetricCard
                  title="Total Leads"
                  value={metrics.totalLeads.toString()}
                  change={`+${metrics.leadsChange} this week`}
                  changeType="positive"
                  icon={Users}
                  delay={0.1}
                />
                <LiveMetricCard
                  title="Pipeline Value"
                  value={formatCurrency(metrics.pipelineValue)}
                  change={`+${metrics.pipelineChange}%`}
                  changeType="positive"
                  icon={Target}
                  delay={0.15}
                />
                <LiveMetricCard
                  title="Conversion Rate"
                  value={`${metrics.conversionRate.toFixed(1)}%`}
                  icon={Activity}
                  delay={0.2}
                />
                <LiveMetricCard
                  title="Won Deals"
                  value={`${metrics.wonDeals}/${metrics.totalDeals}`}
                  icon={Wallet}
                  delay={0.25}
                />
              </div>

              {/* Revenue Chart */}
              <div>
                <RevenueChart />
              </div>

              {/* Pipeline and Leads Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PipelineTable />
                <LeadsTable />
              </div>
            </TabsContent>

            {/* Shopify Sync Tab */}
            <TabsContent value="shopify">
              <ShopifySyncPanel />
            </TabsContent>

            {/* Ad Generator Tab */}
            <TabsContent value="adgen">
              <VideoAdStudio />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
