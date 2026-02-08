import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useCartSync } from "@/hooks/useCartSync";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Settings from "./pages/Settings";
import Pricing from "./pages/Pricing";
import Store from "./pages/Store";
import Home from "./pages/Home";
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
import BillingAdmin from "./pages/BillingAdmin";
import BillingSuccess from "./pages/BillingSuccess";
import BillingCancel from "./pages/BillingCancel";
import CheckoutSuccess from "./pages/checkout/Success";
import CheckoutCancel from "./pages/checkout/Cancel";
import ShopifyControlCenter from "./pages/admin/ShopifyControlCenter";
import { FloatingSelfHeal } from "@/components/system/FloatingSelfHeal";

// MASTER_OS Pages
const MasterDashboard = React.lazy(() => import("./pages/master/MasterDashboard"));
const ProjectsPage = React.lazy(() => import("./pages/master/ProjectsPage"));
const AutomationsPage = React.lazy(() => import("./pages/master/AutomationsPage"));
const ExperiencesPage = React.lazy(() => import("./pages/master/ExperiencesPage"));
const BrainPage = React.lazy(() => import("./pages/master/BrainPage"));
const SettingsAccountPage = React.lazy(() => import("./pages/master/SettingsAccountPage"));
const SettingsIntegrationsPage = React.lazy(() => import("./pages/master/SettingsIntegrationsPage"));
const RevenueCommandPage = React.lazy(() => import("./pages/master/RevenueCommandPage"));
const CommsPage = React.lazy(() => import("./pages/master/CommsPage"));
const CoreConsolePage = React.lazy(() => import("./pages/master/CoreConsolePage"));

const queryClient = new QueryClient();

const LazyWrap = ({ children }: { children: React.ReactNode }) => (
  <React.Suspense fallback={
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  }>{children}</React.Suspense>
);

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
  useCartSync();
  
  // Lazy load Product page
  const Product = React.lazy(() => import("./pages/Product"));

  return (
    <Routes>
      {/* Public homepage with products */}
      <Route path="/" element={<Home />} />
      
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
      
      {/* Product detail page - public */}
      <Route 
        path="/product/:handle" 
        element={
          <React.Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          }>
            <Product />
          </React.Suspense>
        } 
      />
      
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
      
      {/* Billing Admin Dashboard (protected) */}
      <Route 
        path="/admin/billing" 
        element={
          <ProtectedRoute>
            <BillingAdmin />
          </ProtectedRoute>
        } 
      />
      
      {/* Billing Success/Cancel pages */}
      <Route path="/billing/success" element={<BillingSuccess />} />
      <Route path="/billing/cancel" element={<BillingCancel />} />
      
      {/* Checkout Success/Cancel pages (Stripe product checkout) */}
      <Route path="/checkout/success" element={<CheckoutSuccess />} />
      <Route path="/checkout/cancel" element={<CheckoutCancel />} />
      
      {/* Shopify Control Center (Admin) */}
      <Route 
        path="/admin/shopify-control-center" 
        element={
          <ProtectedRoute>
            <ShopifyControlCenter />
          </ProtectedRoute>
        } 
      />

      {/* ===== MASTER_OS ROUTES ===== */}
      <Route path="/master" element={<ProtectedRoute><LazyWrap><MasterDashboard /></LazyWrap></ProtectedRoute>} />
      <Route path="/projects" element={<ProtectedRoute><LazyWrap><ProjectsPage /></LazyWrap></ProtectedRoute>} />
      <Route path="/projects/:projectId/*" element={<ProtectedRoute><LazyWrap><ProjectsPage /></LazyWrap></ProtectedRoute>} />
      <Route path="/automations" element={<ProtectedRoute><LazyWrap><AutomationsPage /></LazyWrap></ProtectedRoute>} />
      <Route path="/automations/:automationId" element={<ProtectedRoute><LazyWrap><AutomationsPage /></LazyWrap></ProtectedRoute>} />
      <Route path="/automations/new" element={<ProtectedRoute><LazyWrap><AutomationsPage /></LazyWrap></ProtectedRoute>} />
      <Route path="/experiences" element={<ProtectedRoute><LazyWrap><ExperiencesPage /></LazyWrap></ProtectedRoute>} />
      <Route path="/experiences/new" element={<ProtectedRoute><LazyWrap><ExperiencesPage /></LazyWrap></ProtectedRoute>} />
      <Route path="/experiences/:experienceId/*" element={<ProtectedRoute><LazyWrap><ExperiencesPage /></LazyWrap></ProtectedRoute>} />
      <Route path="/brain" element={<ProtectedRoute><LazyWrap><BrainPage /></LazyWrap></ProtectedRoute>} />
      <Route path="/brain/reports" element={<ProtectedRoute><LazyWrap><BrainPage /></LazyWrap></ProtectedRoute>} />
      <Route path="/settings/account" element={<ProtectedRoute><LazyWrap><SettingsAccountPage /></LazyWrap></ProtectedRoute>} />
      <Route path="/settings/billing" element={<ProtectedRoute><LazyWrap><SettingsAccountPage /></LazyWrap></ProtectedRoute>} />
      <Route path="/settings/integrations" element={<ProtectedRoute><LazyWrap><SettingsIntegrationsPage /></LazyWrap></ProtectedRoute>} />
      <Route path="/crm/*" element={<ProtectedRoute><LazyWrap><MasterDashboard /></LazyWrap></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute><LazyWrap><MasterDashboard /></LazyWrap></ProtectedRoute>} />
      <Route path="/admin/organizations" element={<ProtectedRoute><LazyWrap><MasterDashboard /></LazyWrap></ProtectedRoute>} />
      <Route path="/admin/logs" element={<ProtectedRoute><LazyWrap><MasterDashboard /></LazyWrap></ProtectedRoute>} />
      <Route path="/products" element={<ProtectedRoute><LazyWrap><MasterDashboard /></LazyWrap></ProtectedRoute>} />
      <Route path="/products/:productId" element={<ProtectedRoute><LazyWrap><MasterDashboard /></LazyWrap></ProtectedRoute>} />
      <Route path="/revenue-command" element={<ProtectedRoute><LazyWrap><RevenueCommandPage /></LazyWrap></ProtectedRoute>} />
      <Route path="/comms" element={<ProtectedRoute><LazyWrap><CommsPage /></LazyWrap></ProtectedRoute>} />
      <Route path="/console" element={<ProtectedRoute><LazyWrap><CoreConsolePage /></LazyWrap></ProtectedRoute>} />

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
