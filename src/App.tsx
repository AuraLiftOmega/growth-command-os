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
import CEOControl from "./pages/CEOControl";
import WarRoom from "./pages/WarRoom";
import OAuthCallback from "./pages/OAuthCallback";
import Revenue from "./pages/Revenue";
import AcceptInvite from "./pages/AcceptInvite";
import UsersManagement from "./pages/UsersManagement";
import ShopifyCallback from "./pages/ShopifyCallback";
import SocialChannelsDashboard from "./pages/SocialChannelsDashboard";
import LiveChat from "./pages/LiveChat";
import SecurityAudit from "./pages/SecurityAudit";
import PaymentsSpine from "./pages/PaymentsSpine";
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
      
      {/* CEO Control Dashboard */}
      <Route 
        path="/ceo-control" 
        element={
          <ProtectedRoute>
            <CEOControl />
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
      
      {/* OAuth callback routes */}
      <Route path="/oauth/callback" element={<OAuthCallback />} />
      <Route path="/oauth/shopify-callback" element={<ShopifyCallback />} />
      
      {/* Invite acceptance route (public) */}
      <Route path="/invite/:token" element={<AcceptInvite />} />
      
      {/* Users Management (protected) */}
      <Route 
        path="/dashboard/users" 
        element={
          <ProtectedRoute>
            <UsersManagement />
          </ProtectedRoute>
        } 
      />
      
      {/* Social Channels Dashboard (protected) */}
      <Route 
        path="/dashboard/social-channels" 
        element={
          <ProtectedRoute>
            <SocialChannelsDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Live Chat Dashboard (protected) */}
      <Route 
        path="/dashboard/live-chat" 
        element={
          <ProtectedRoute>
            <LiveChat />
          </ProtectedRoute>
        } 
      />
      
      {/* Security Audit Dashboard (protected) */}
      <Route 
        path="/dashboard/security-audit" 
        element={
          <ProtectedRoute>
            <SecurityAudit />
          </ProtectedRoute>
        } 
      />
      
      {/* Payments Spine Dashboard (protected) */}
      <Route 
        path="/dashboard/payments-spine" 
        element={
          <ProtectedRoute>
            <PaymentsSpine />
          </ProtectedRoute>
        } 
      />
      
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
