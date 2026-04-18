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
import Pricing from "./pages/Pricing";
import Store from "./pages/Store";
import Home from "./pages/Home";
import About from "./pages/About";
import Collections from "./pages/Collections";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import OAuthCallback from "./pages/OAuthCallback";
import AcceptInvite from "./pages/AcceptInvite";
import ShopifyCallback from "./pages/ShopifyCallback";
import BillingSuccess from "./pages/BillingSuccess";
import BillingCancel from "./pages/BillingCancel";
import CheckoutSuccess from "./pages/checkout/Success";
import CheckoutCancel from "./pages/checkout/Cancel";
import ShopifyControlCenter from "./pages/admin/ShopifyControlCenter";
import { AdminRoute } from "@/components/auth/AdminRoute";
import { FloatingSelfHeal } from "@/components/system/FloatingSelfHeal";

const GrokCEO = React.lazy(() => import("./pages/admin/GrokCEO"));
const BillingAdmin = React.lazy(() => import("./pages/BillingAdmin"));

const queryClient = new QueryClient();

const LazyWrap = ({ children }: { children: React.ReactNode }) => (
  <React.Suspense fallback={
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  }>{children}</React.Suspense>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const Product = React.lazy(() => import("./pages/Product"));

const AppRoutes = () => {
  useCartSync();

  return (
    <Routes>
      {/* Public storefront */}
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/store" element={<Store />} />
      <Route path="/about" element={<About />} />
      <Route path="/collections" element={<Collections />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/product/:handle" element={<LazyWrap><Product /></LazyWrap>} />

      {/* Core dashboard — admin only. Customers can never reach this. */}
      <Route path="/dashboard/*" element={<AdminRoute><Dashboard /></AdminRoute>} />

      {/* OAuth & callbacks */}
      <Route path="/oauth/callback" element={<OAuthCallback />} />
      <Route path="/oauth/shopify-callback" element={<ShopifyCallback />} />
      <Route path="/invite/:token" element={<AcceptInvite />} />

      {/* Billing */}
      <Route path="/billing/success" element={<BillingSuccess />} />
      <Route path="/billing/cancel" element={<BillingCancel />} />
      <Route path="/checkout/success" element={<CheckoutSuccess />} />
      <Route path="/checkout/cancel" element={<CheckoutCancel />} />

      {/* Admin-only */}
      <Route path="/admin/billing" element={<AdminRoute><LazyWrap><BillingAdmin /></LazyWrap></AdminRoute>} />
      <Route path="/admin/shopify-control-center" element={<AdminRoute><ShopifyControlCenter /></AdminRoute>} />
      <Route path="/admin/grok-ceo" element={<AdminRoute><LazyWrap><GrokCEO /></LazyWrap></AdminRoute>} />

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
