import { motion } from "framer-motion";
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Target,
  Activity,
  RefreshCw
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { LiveMetricCard } from "@/components/dashboard/LiveMetricCard";
import { PipelineTable } from "@/components/dashboard/PipelineTable";
import { LeadsTable } from "@/components/dashboard/LeadsTable";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
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
      <Sidebar />
      
      <main className="ml-64">
        <Header />
        
        <div className="p-6">
          {/* Header with refresh */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Revenue Dashboard</h1>
              <p className="text-sm text-muted-foreground">Real-time metrics and pipeline</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refresh}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Live Status Indicator */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3 rounded-lg bg-success/10 border border-success/30 flex items-center gap-2"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            <span className="text-sm font-medium text-success">Live</span>
            <span className="text-sm text-muted-foreground">• Real-time updates enabled</span>
          </motion.div>

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
              icon={DollarSign}
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
