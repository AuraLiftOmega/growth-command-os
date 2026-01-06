import { motion } from "framer-motion";
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  Eye,
  Target
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { AIInsightsPanel } from "@/components/dashboard/AIInsightsPanel";
import { VideoGeneratorPanel } from "@/components/dashboard/VideoGeneratorPanel";
import { CreativePerformanceTable } from "@/components/dashboard/CreativePerformanceTable";
import { CommentAutomationPanel } from "@/components/dashboard/CommentAutomationPanel";
import { ScaleModePanel } from "@/components/dashboard/ScaleModePanel";
import { DataAdvantageEngine } from "@/components/dashboard/DataAdvantageEngine";
import { VerticalIntelligence } from "@/components/dashboard/VerticalIntelligence";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { QualityGatePanel } from "@/components/dashboard/QualityGatePanel";
import { PlatformConnectionsPanel } from "@/components/dashboard/PlatformConnectionsPanel";
import { SystemActivityFeed } from "@/components/dashboard/SystemActivityFeed";
import { useAnalytics } from "@/hooks/useAnalytics";

const Index = () => {
  const { metrics } = useAnalytics();

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-64">
        <Header />
        
        <div className="p-6">
          {/* Top Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
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
              title="Ad Impressions"
              value={formatNumber(metrics.impressions)}
              change={`${metrics.impressionsChange >= 0 ? "+" : ""}${metrics.impressionsChange}%`}
              changeType={metrics.impressionsChange >= 0 ? "positive" : "negative"}
              icon={Eye}
              delay={0.2}
            />
            <MetricCard
              title="Conversion Rate"
              value={`${metrics.conversionRate.toFixed(1)}%`}
              change={`${metrics.conversionRateChange >= 0 ? "+" : ""}${metrics.conversionRateChange}%`}
              changeType={metrics.conversionRateChange >= 0 ? "positive" : "negative"}
              icon={Target}
              delay={0.25}
            />
          </div>

          {/* Scale Mode, Quality Gate & Data Engine Row */}
          <div className="grid grid-cols-12 gap-6 mb-6">
            <div className="col-span-12 lg:col-span-3">
              <ScaleModePanel />
            </div>
            <div className="col-span-12 lg:col-span-3">
              <QualityGatePanel />
            </div>
            <div className="col-span-12 lg:col-span-6">
              <DataAdvantageEngine />
            </div>
          </div>

          {/* Performance Chart Row */}
          <div className="mb-6">
            <PerformanceChart />
          </div>

          {/* Vertical Intelligence */}
          <div className="mb-6">
            <VerticalIntelligence />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column - Main Content */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              <PlatformConnectionsPanel />
              <CreativePerformanceTable />
              <CommentAutomationPanel />
            </div>

            {/* Right Column - Side Panels */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              <AIInsightsPanel />
              <SystemActivityFeed />
              <VideoGeneratorPanel />
            </div>
          </div>
        </div>

        {/* Background Glow Effect */}
        <div className="fixed top-0 right-0 w-[800px] h-[800px] pointer-events-none opacity-30">
          <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-transparent to-transparent blur-3xl" />
        </div>
      </main>
    </div>
  );
};

export default Index;
