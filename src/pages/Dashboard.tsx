import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { ShopifySyncPanel } from "@/components/dashboard/ShopifySyncPanel";
import { VideoAdStudioPage } from "@/components/dashboard/VideoAdStudioPage";
import { SalesAnalyticsPanel } from "@/components/dashboard/SalesAnalyticsPanel";
import { SocialChannelsDashboard } from "@/components/social";
import { SettingsPage } from "@/components/dashboard/SettingsPage";
import { LiveProfitEngine } from "@/components/autonomous";
import { SuperGrokCEODashboard } from "@/components/dashboard/SuperGrokCEODashboard";
import { CJDropshippingDashboard } from "@/components/dashboard/CJDropshippingDashboard";
import { MissionControl } from "@/components/dashboard/MissionControl";
import { Loader2 } from "lucide-react";

const RevenueEngine = lazy(() => import("@/pages/RevenueEngine"));
const IntegrationsPage = lazy(() => import("@/pages/Integrations"));

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-64">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

const Dashboard = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route index element={<MissionControl />} />
        <Route path="home" element={<DashboardHome />} />
        <Route path="mission-control" element={<MissionControl />} />
        <Route path="products" element={<ShopifySyncPanel />} />
        <Route path="video-ad-studio" element={<VideoAdStudioPage />} />
        <Route path="social-channels/*" element={<SocialChannelsDashboard />} />
        <Route path="analytics" element={<SalesAnalyticsPanel />} />
        <Route 
          path="integrations" 
          element={
            <Suspense fallback={<LoadingFallback />}>
              <IntegrationsPage />
            </Suspense>
          } 
        />
        <Route path="profit-engine" element={<LiveProfitEngine />} />
        <Route path="super-grok-ceo" element={<SuperGrokCEODashboard />} />
        <Route path="cj-dropshipping" element={<CJDropshippingDashboard />} />
        <Route 
          path="revenue-engine"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <RevenueEngine />
            </Suspense>
          } 
        />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

export default Dashboard;
