import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Settings from "./pages/Settings";
import Pricing from "./pages/Pricing";
import Store from "./pages/Store";
import NotFound from "./pages/NotFound";
import OmegaCommand from "./pages/OmegaCommand";
import CEOBrain from "./pages/CEOBrain";
import WarRoom from "./pages/WarRoom";
import OAuthCallback from "./pages/OAuthCallback";
import Revenue from "./pages/Revenue";
import { FloatingSelfHeal } from "@/components/system/FloatingSelfHeal";

const queryClient = new QueryClient();

// Auth-protected route component - simplified, no onboarding requirement
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

// Auth route - redirects if already authenticated
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Root redirects to dashboard (which will redirect to auth if not logged in) */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      <Route 
        path="/auth" 
        element={
          <AuthRoute>
            <Auth />
          </AuthRoute>
        } 
      />
      
      {/* Dashboard routes with nested paths */}
      <Route 
        path="/dashboard/*" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/omega-command" 
        element={
          <ProtectedRoute>
            <OmegaCommand />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/ceo-brain" 
        element={
          <ProtectedRoute>
            <CEOBrain />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/war-room" 
        element={
          <ProtectedRoute>
            <WarRoom />
          </ProtectedRoute>
        } 
      />
      
      {/* Revenue Dashboard */}
      <Route 
        path="/dashboard/revenue" 
        element={
          <ProtectedRoute>
            <Revenue />
          </ProtectedRoute>
        } 
      />
      
      {/* Public routes for store and pricing */}
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/store" element={<Store />} />
      
      {/* OAuth callback route */}
      <Route path="/oauth/callback" element={<OAuthCallback />} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <FloatingSelfHeal />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
