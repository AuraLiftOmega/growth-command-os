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
import { PlatformIntegrations } from "@/components/dashboard/PlatformIntegrations";
import { VideoGeneratorPanel } from "@/components/dashboard/VideoGeneratorPanel";
import { CreativePerformanceTable } from "@/components/dashboard/CreativePerformanceTable";
import { CommentAutomationPanel } from "@/components/dashboard/CommentAutomationPanel";
import { ScaleModePanel } from "@/components/dashboard/ScaleModePanel";
import { DataAdvantageEngine } from "@/components/dashboard/DataAdvantageEngine";
import { VerticalIntelligence } from "@/components/dashboard/VerticalIntelligence";
import { AutomationActivityFeed } from "@/components/dashboard/AutomationActivityFeed";

const Index = () => {
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
              value="$47,284"
              change="+12.4%"
              changeType="positive"
              icon={DollarSign}
              delay={0}
            />
            <MetricCard
              title="Blended ROAS"
              value="4.2x"
              change="+8.2%"
              changeType="positive"
              icon={TrendingUp}
              delay={0.05}
            />
            <MetricCard
              title="Orders"
              value="847"
              change="+23.1%"
              changeType="positive"
              icon={ShoppingCart}
              delay={0.1}
            />
            <MetricCard
              title="New Customers"
              value="312"
              change="-4.2%"
              changeType="negative"
              icon={Users}
              delay={0.15}
            />
            <MetricCard
              title="Ad Impressions"
              value="2.4M"
              change="+18.7%"
              changeType="positive"
              icon={Eye}
              delay={0.2}
            />
            <MetricCard
              title="Conversion Rate"
              value="3.8%"
              change="+0.4%"
              changeType="positive"
              icon={Target}
              delay={0.25}
            />
          </div>

          {/* Scale Mode & Data Engine Row */}
          <div className="grid grid-cols-12 gap-6 mb-6">
            <div className="col-span-12 lg:col-span-4">
              <ScaleModePanel />
            </div>
            <div className="col-span-12 lg:col-span-8">
              <DataAdvantageEngine />
            </div>
          </div>

          {/* Vertical Intelligence */}
          <div className="mb-6">
            <VerticalIntelligence />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column - Main Content */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              <PlatformIntegrations />
              <CreativePerformanceTable />
              <CommentAutomationPanel />
            </div>

            {/* Right Column - Side Panels */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              <AIInsightsPanel />
              <AutomationActivityFeed />
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
