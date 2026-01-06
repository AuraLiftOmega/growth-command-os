import { motion } from "framer-motion";
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  Eye,
  Target,
  AlertCircle,
  Settings,
  Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";
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
import { ShopifyProductsPanel } from "@/components/dashboard/ShopifyProductsPanel";
import { UnifiedInbox } from "@/components/dashboard/UnifiedInbox";
import { KPIAnalyticsDashboard } from "@/components/dashboard/KPIAnalyticsDashboard";
import { Button } from "@/components/ui/button";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { useDominionStore, INDUSTRY_TEMPLATES } from "@/stores/dominion-core-store";
import { useConfigNotifications } from "@/hooks/useConfigNotifications";

const Index = () => {
  const navigate = useNavigate();
  const { metrics } = useAnalytics();
  const { isDemoMode } = useOnboardingStore();
  const { 
    industry, 
    industryConfig, 
    isConfigured, 
    isActive, 
    dealSize,
    buyingCycle,
    offerType,
    salesMotion 
  } = useDominionStore();

  // Enable config change notifications
  useConfigNotifications();

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
          {/* Demo Mode Banner */}
          {isDemoMode && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-accent/10 border border-accent/30 flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-accent" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Demo Mode Active</p>
                <p className="text-xs text-muted-foreground">
                  Exploring with sample data. Connect your real store in Settings to go live.
                </p>
              </div>
            </motion.div>
          )}

          {/* Revenue Engine Status Banner */}
          {!isConfigured && !isDemoMode && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Configure Your Revenue Engine</p>
                  <p className="text-xs text-muted-foreground">
                    Set up industry adaptation for personalized KPIs, tone, and automation.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => navigate('/command-center')}
                size="sm"
                className="gap-2"
              >
                <Settings className="w-4 h-4" />
                Configure
              </Button>
            </motion.div>
          )}

          {/* Active Engine Status */}
          {isConfigured && isActive && industryConfig && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-success/10 border border-success/30"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      DOMINION Active: {industryConfig.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {dealSize.charAt(0).toUpperCase() + dealSize.slice(1)} ticket • {buyingCycle} cycle • {industryConfig.language.tone} tone
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="text-right">
                    <span className="text-muted-foreground">Primary KPIs</span>
                    <p className="font-medium">{industryConfig.kpis.primary.slice(0, 2).join(', ')}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/command-center')}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

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

          {/* Shopify Products */}
          <div className="mb-6">
            <ShopifyProductsPanel />
          </div>

          {/* KPI Analytics Dashboard - shows when engine is configured */}
          {isConfigured && isActive && (
            <div className="mb-6">
              <KPIAnalyticsDashboard />
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column - Main Content */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              <PlatformConnectionsPanel />
              <UnifiedInbox />
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
