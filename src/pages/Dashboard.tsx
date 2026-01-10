import { Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { ShopifySyncPanel } from "@/components/dashboard/ShopifySyncPanel";
import { VideoAdStudio } from "@/components/super-app/VideoAdStudio";
import { VideoAdStudioPage } from "@/components/dashboard/VideoAdStudioPage";
import { SalesAnalyticsPanel } from "@/components/dashboard/SalesAnalyticsPanel";
import { SocialChannelsDashboard } from "@/components/social";
import { SettingsPage } from "@/components/dashboard/SettingsPage";

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
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

export default Dashboard;
