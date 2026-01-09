import { motion } from "framer-motion";
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Target,
  Activity,
  RefreshCw,
  Wallet,
  ArrowUpRight
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
import { useLiveMetrics } from "@/hooks/useLiveMetrics";

const Dashboard = () => {
  const { metrics, isLoading, refresh } = useLiveMetrics();

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
          {/* Header with refresh */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Revenue Command Center</h1>
              <p className="text-sm text-muted-foreground">Real-time metrics, pipeline, and leads</p>
            </div>
            <div className="flex items-center gap-2">
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

          {/* Top Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
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
          <div className="mb-6">
            <RevenueChart />
          </div>

          {/* Pipeline and Leads Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PipelineTable />
            <LeadsTable />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
