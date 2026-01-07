import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  Building2, 
  Users, 
  Shield, 
  Palette, 
  Video, 
  Zap, 
  Gauge, 
  CheckCircle,
  Rocket,
  Cloud,
  LogOut,
  FastForward,
  Play
} from "lucide-react";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useEffect, useCallback, useRef, useState } from "react";
import { OnboardingModeSelector, OnboardingMode, MODE_PRESETS } from "./OnboardingModeSelector";

// Import steps
import { BusinessDNAStep } from "./steps/BusinessDNAStep";
import { CustomerIntelligenceStep } from "./steps/CustomerIntelligenceStep";
import { ProductTruthStep } from "./steps/ProductTruthStep";
import { BrandControlStep } from "./steps/BrandControlStep";
import { CreativeDirectionStep } from "./steps/CreativeDirectionStep";
import { AutomationStep } from "./steps/AutomationStep";
import { RiskSpeedStep } from "./steps/RiskSpeedStep";
import { AuthorizationStep } from "./steps/AuthorizationStep";

const steps = [
  { id: 0, label: "Business DNA", icon: Building2, component: BusinessDNAStep },
  { id: 1, label: "Customer Intel", icon: Users, component: CustomerIntelligenceStep },
  { id: 2, label: "Product Truth", icon: Shield, component: ProductTruthStep },
  { id: 3, label: "Brand Control", icon: Palette, component: BrandControlStep },
  { id: 4, label: "Creative", icon: Video, component: CreativeDirectionStep },
  { id: 5, label: "Automation", icon: Zap, component: AutomationStep },
  { id: 6, label: "Risk & Speed", icon: Gauge, component: RiskSpeedStep },
  { id: 7, label: "Authorize", icon: CheckCircle, component: AuthorizationStep },
];

export const OnboardingForm = () => {
  const { 
    currentStep, 
    setStep, 
    data, 
    setCompleted, 
    calculateQualityScore, 
    saveToDatabase, 
    isSynced,
    applyIndustryDefaults,
    enableDemoMode
  } = useOnboardingStore();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<OnboardingMode | null>(null);
  const [showModeSelector, setShowModeSelector] = useState(true);
  const CurrentStepComponent = steps[currentStep].component;
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Handle mode selection
  const handleModeSelect = async (mode: OnboardingMode) => {
    setSelectedMode(mode);
    const preset = MODE_PRESETS[mode];

    if (mode === 'done_for_you') {
      // Auto-fill everything and go to dashboard
      applyIndustryDefaults();
      await saveToDatabase();
      toast.success("DOMINION configured with optimal defaults. Ready to generate revenue!");
      navigate("/");
      return;
    }

    if (mode === 'fastest_revenue') {
      // Apply defaults but let them customize key items
      applyIndustryDefaults();
      setShowModeSelector(false);
      setStep(5); // Go to Automation step
      toast.success("Fast track mode! Focus on what matters for revenue.");
      return;
    }

    // Custom control - show full onboarding
    setShowModeSelector(false);
  };

  // Auto-save with debounce
  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      if (user) {
        saveToDatabase();
      }
    }, 1000);
  }, [user, saveToDatabase]);

  // Skip directly to dashboard with industry defaults
  const handleSkipToDashboard = async () => {
    applyIndustryDefaults();
    await saveToDatabase();
    toast.success("Using industry defaults. You can customize later in Settings.");
    navigate("/");
  };

  // Enable demo mode with mock data
  const handleDemoMode = () => {
    enableDemoMode();
    toast.success("Demo mode activated. Explore all features with sample data.");
    navigate("/");
  };

  // Save on data changes
  useEffect(() => {
    if (isSynced) {
      debouncedSave();
    }
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [data, debouncedSave, isSynced]);

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setStep(currentStep + 1);
    } else {
      // Final step - complete onboarding
      if (!data.authorization.authorizeAutomation) {
        toast.error("Please authorize automation to continue");
        return;
      }
      
      const score = calculateQualityScore();
      setCompleted(true);
      await saveToDatabase();
      
      if (score >= 60) {
        toast.success("Onboarding complete! Full automation enabled.");
      } else {
        toast.warning("Onboarding complete with limited automation. Add more data to unlock full power.");
      }
      
      navigate("/");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setStep(currentStep - 1);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  // Show mode selector first
  if (showModeSelector) {
    return (
      <div className="min-h-screen bg-background">
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-chart-4 flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="font-display font-bold text-lg">DOMINION Setup</h1>
                  <p className="text-xs text-muted-foreground">Choose your path</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        <main className="pt-28 pb-16 px-6">
          <div className="max-w-5xl mx-auto">
            <OnboardingModeSelector
              onSelect={handleModeSelect}
              selectedMode={selectedMode || undefined}
            />
            
            {/* Demo Mode Option */}
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Just want to explore? Try demo mode with sample data.
              </p>
              <Button
                variant="ghost"
                onClick={handleDemoMode}
                className="gap-2"
              >
                <Play className="w-4 h-4" />
                Enter Demo Mode
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-chart-4 flex items-center justify-center">
                <Rocket className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg">AI Intelligence Intake</h1>
                <p className="text-xs text-muted-foreground">Step {currentStep + 1} of {steps.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Sync indicator */}
              <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                <Cloud className="w-4 h-4 text-success" />
                <span>Synced</span>
              </div>
              <div className="hidden md:flex items-center gap-1">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = index === currentStep;
                  const isCompleted = index < currentStep;
                  return (
                    <button
                      key={step.id}
                      onClick={() => setStep(index)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : isCompleted
                          ? "text-success"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-xs font-medium hidden lg:inline">{step.label}</span>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="h-1 bg-secondary">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
            className="h-full bg-gradient-to-r from-primary to-chart-2"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-28 pb-32 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Quick Action Buttons - Show on first step */}
          {currentStep === 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 rounded-xl bg-card/50 border border-border/50"
            >
              <p className="text-sm text-muted-foreground mb-3 text-center">
                Want to skip ahead? Use industry defaults or try demo mode.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={handleSkipToDashboard}
                  className="gap-2"
                >
                  <FastForward className="w-4 h-4" />
                  Skip to Dashboard (Use Defaults)
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleDemoMode}
                  className="gap-2"
                >
                  <Play className="w-4 h-4" />
                  Demo Mode (Sample Data)
                </Button>
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            <CurrentStepComponent key={currentStep} />
          </AnimatePresence>
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>

            <div className="flex items-center gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentStep
                      ? "bg-primary w-6"
                      : index < currentStep
                      ? "bg-success"
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  Complete Setup
                  <CheckCircle className="w-4 h-4" />
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};
