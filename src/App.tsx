import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { useEffect } from "react";
import Index from "./pages/Index";
import Onboarding from "./pages/Onboarding";
import Auth from "./pages/Auth";
import Settings from "./pages/Settings";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import RevenueWarRoom from "./pages/RevenueWarRoom";
import CommandCenter from "./pages/CommandCenter";
import Pricing from "./pages/Pricing";
import DemoEmbed from "./pages/DemoEmbed";
import {
  IntimidationToggle, 
  DemoPhaseController, 
  IntimidationOverlay, 
  ResidualCue,
  DemoView,
  // HIGH-TICKET CLOSE VARIANT™
  HighTicketToggle,
  ClosePhaseController,
  OpportunityCostEscalator,
  DecisionCollapseView,
  ObjectionNeutralizationPanel,
  FinalCloseSequence
} from "@/components/intimidation";

const queryClient = new QueryClient();

// Auth-protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { isCompleted, loadFromDatabase, isLoading } = useOnboardingStore();

  useEffect(() => {
    if (user && !isLoading) {
      loadFromDatabase(user.id);
    }
  }, [user]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

// Onboarding route - requires auth but not completion
const OnboardingRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { isCompleted, loadFromDatabase, isLoading, isSynced } = useOnboardingStore();

  useEffect(() => {
    if (user && !isSynced && !isLoading) {
      loadFromDatabase(user.id);
    }
  }, [user, isSynced, isLoading]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (isCompleted) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Auth route - redirects if already authenticated
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { isCompleted, loadFromDatabase, isLoading, isSynced } = useOnboardingStore();

  useEffect(() => {
    if (user && !isSynced && !isLoading) {
      loadFromDatabase(user.id);
    }
  }, [user, isSynced, isLoading]);

  if (loading || (user && isLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    if (isCompleted) {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

// Protected route - redirects to dashboard instead of root
const ProtectedRouteWithRedirect = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { isCompleted, loadFromDatabase, isLoading } = useOnboardingStore();

  useEffect(() => {
    if (user && !isLoading) {
      loadFromDatabase(user.id);
    }
  }, [user]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route 
        path="/auth" 
        element={
          <AuthRoute>
            <Auth />
          </AuthRoute>
        } 
      />
      <Route 
        path="/onboarding" 
        element={
          <OnboardingRoute>
            <Onboarding />
          </OnboardingRoute>
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRouteWithRedirect>
            <Index />
          </ProtectedRouteWithRedirect>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRouteWithRedirect>
            <Settings />
          </ProtectedRouteWithRedirect>
        } 
      />
      <Route 
        path="/war-room" 
        element={
          <ProtectedRouteWithRedirect>
            <RevenueWarRoom />
          </ProtectedRouteWithRedirect>
        } 
      />
      <Route 
        path="/command-center" 
        element={
          <ProtectedRouteWithRedirect>
            <CommandCenter />
          </ProtectedRouteWithRedirect>
        } 
      />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/embed/demo/:demoId" element={<DemoEmbed />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// Wrapper to conditionally render intimidation components (not on auth/landing pages)
const IntimidationWrapper = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth' || location.pathname === '/';
  
  if (isAuthPage) return null;
  
  return (
    <>
      {/* FOUNDER INTIMIDATION MODE™ - Global Components */}
      <IntimidationOverlay />
      <DemoView />
      <IntimidationToggle />
      <DemoPhaseController />
      <ResidualCue />
      
      {/* HIGH-TICKET CLOSE VARIANT™ - Stacks on Intimidation Mode */}
      <HighTicketToggle />
      <ClosePhaseController />
      <OpportunityCostEscalator />
      <DecisionCollapseView />
      <ObjectionNeutralizationPanel />
      <FinalCloseSequence />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <IntimidationWrapper />
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
