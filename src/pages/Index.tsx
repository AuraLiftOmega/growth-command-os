import { Loader2 } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { SuperDashboard } from "@/components/super-app";
import { useRevenueEngine } from "@/hooks/useRevenueEngine";
import { useConfigNotifications } from "@/hooks/useConfigNotifications";

const Index = () => {
  const { isLoading, isAuthenticated } = useRevenueEngine();
  useConfigNotifications();

  if (isLoading && isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading AURAOMEGA Super App...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64">
        <Header />
        <div className="p-6">
          <SuperDashboard />
        </div>
      </main>
    </div>
  );
};

export default Index;
