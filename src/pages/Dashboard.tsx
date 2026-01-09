import { Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { ShopifySyncPanel } from "@/components/dashboard/ShopifySyncPanel";
import { VideoAdStudio } from "@/components/super-app/VideoAdStudio";
import { SocialChannelsPanel } from "@/components/dashboard/SocialChannelsPanel";
import { SalesAnalyticsPanel } from "@/components/dashboard/SalesAnalyticsPanel";

const Dashboard = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route index element={<DashboardHome />} />
        <Route path="products" element={<ShopifySyncPanel />} />
        <Route path="video-studio" element={<VideoAdStudio />} />
        <Route path="social/*" element={<SocialChannelsPanel />} />
        <Route path="analytics" element={<SalesAnalyticsPanel />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

export default Dashboard;
