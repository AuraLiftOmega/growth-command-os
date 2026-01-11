import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { ShopifySyncPanel } from "@/components/dashboard/ShopifySyncPanel";
import { VideoAdStudio } from "@/components/super-app/VideoAdStudio";
import { VideoAdStudioPage } from "@/components/dashboard/VideoAdStudioPage";
import { SalesAnalyticsPanel } from "@/components/dashboard/SalesAnalyticsPanel";
import { SocialChannelsDashboard } from "@/components/social";
import { SettingsPage } from "@/components/dashboard/SettingsPage";
import { IntegrationsHub } from "@/components/integrations";
import { LiveProfitEngine } from "@/components/autonomous";
import { EmergingLayerDashboard } from "@/components/omega";
import { SuperGrokCEODashboard } from "@/components/dashboard/SuperGrokCEODashboard";
import { CJDropshippingDashboard } from "@/components/dashboard/CJDropshippingDashboard";
import { DomainSalesManager } from "@/components/dashboard/DomainSalesManager";
import { Loader2 } from "lucide-react";

// Lazy load heavy dashboards for better performance
const ElevenLabsDashboard = lazy(() => import("@/pages/ElevenLabsDashboard"));
const RevenueEngine = lazy(() => import("@/pages/RevenueEngine"));

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-64">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

const Dashboard = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route index element={<DashboardHome />} />
        <Route path="products" element={<ShopifySyncPanel />} />
        <Route path="video-studio" element={<VideoAdStudio />} />
        <Route path="video-ad-studio" element={<VideoAdStudioPage />} />
        <Route path="social/*" element={<SocialChannelsDashboard />} />
        <Route path="social-channels/*" element={<SocialChannelsDashboard />} />
        <Route path="analytics" element={<SalesAnalyticsPanel />} />
        <Route path="integrations" element={<IntegrationsHub />} />
        <Route path="profit-engine" element={<LiveProfitEngine />} />
        <Route path="emerging-layer" element={<EmergingLayerDashboard />} />
        <Route path="super-grok-ceo" element={<SuperGrokCEODashboard />} />
        <Route path="cj-dropshipping" element={<CJDropshippingDashboard />} />
        <Route path="domain-sales" element={<DomainSalesManager />} />
        <Route 
          path="revenue-engine"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <RevenueEngine />
            </Suspense>
          } 
        />
        <Route 
          path="elevenlabs"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ElevenLabsDashboard />
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
