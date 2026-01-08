import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Store,
  Pin,
  Video,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Loader2,
  ExternalLink,
  Rocket,
  Zap,
  Play,
  X,
  Youtube,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface WizardStep {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status: "pending" | "active" | "completed" | "skipped";
}

interface PostLoginWizardProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const PostLoginWizard = ({ open, onClose, onComplete }: PostLoginWizardProps) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [shopifyUrl, setShopifyUrl] = useState("");
const [pinterestConnected, setPinterestConnected] = useState(false);
  const [youtubeConnected, setYoutubeConnected] = useState(false);
  const [videoGenerated, setVideoGenerated] = useState(false);
  
  const [steps, setSteps] = useState<WizardStep[]>([
    {
      id: 0,
      title: "Connect Shopify",
      description: "Link your store to auto-import products",
      icon: Store,
      status: "active",
    },
    {
      id: 1,
      title: "Connect Pinterest",
      description: "Authorize video Pin publishing",
      icon: Pin,
      status: "pending",
    },
    {
      id: 2,
      title: "Connect YouTube",
      description: "Upload Shorts & videos automatically",
      icon: Youtube,
      status: "pending",
    },
    {
      id: 3,
      title: "Generate First Pin",
      description: "Create your first viral video Pin",
      icon: Video,
      status: "pending",
    },
    {
      id: 4,
      title: "Launch Swarm",
      description: "Activate autonomous publishing",
      icon: Sparkles,
      status: "pending",
    },
  ]);

  const updateStepStatus = (stepId: number, status: WizardStep["status"]) => {
    setSteps(prev => prev.map(s => 
      s.id === stepId ? { ...s, status } : s
    ));
  };

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      updateStepStatus(currentStep, "completed");
      updateStepStatus(currentStep + 1, "active");
      setCurrentStep(currentStep + 1);
    } else {
      // Complete wizard
      updateStepStatus(currentStep, "completed");
      onComplete();
    }
  };

  const skipStep = () => {
    updateStepStatus(currentStep, "skipped");
    if (currentStep < steps.length - 1) {
      updateStepStatus(currentStep + 1, "active");
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleShopifyConnect = async () => {
    if (!shopifyUrl.trim()) {
      toast.error("Please enter your Shopify store URL");
      return;
    }
    setIsLoading(true);
    // Simulate connection
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    toast.success("Shopify store connected!");
    goToNextStep();
  };

const handlePinterestConnect = async () => {
    setIsLoading(true);
    // Simulate OAuth flow
    await new Promise(resolve => setTimeout(resolve, 2000));
    setPinterestConnected(true);
    setIsLoading(false);
    toast.success("Pinterest account connected!");
    goToNextStep();
  };

  const handleYouTubeConnect = async () => {
    setIsLoading(true);
    // Simulate YouTube OAuth flow
    await new Promise(resolve => setTimeout(resolve, 2000));
    setYoutubeConnected(true);
    setIsLoading(false);
    toast.success("YouTube channel connected!");
    goToNextStep();
  };

  const handleGenerateVideo = async () => {
    setIsLoading(true);
    // Simulate video generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    setVideoGenerated(true);
    setIsLoading(false);
    toast.success("Video Pin generated!");
    goToNextStep();
  };

  const handleLaunchSwarm = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    toast.success("🚀 Swarm activated! Publishing begins now.");
    onComplete();
    navigate("/omega-command");
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Rocket className="w-7 h-7 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Welcome to DOMINION</h1>
          <p className="text-muted-foreground">Let's get you making money in under 5 minutes</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8 px-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.status === "active";
            const isCompleted = step.status === "completed";
            const isSkipped = step.status === "skipped";
            
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                      isActive && "bg-primary text-primary-foreground shadow-lg shadow-primary/30",
                      isCompleted && "bg-success text-success-foreground",
                      isSkipped && "bg-muted text-muted-foreground",
                      !isActive && !isCompleted && !isSkipped && "bg-muted/50 text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={cn(
                    "text-xs mt-2 font-medium",
                    isActive && "text-primary",
                    isCompleted && "text-success",
                    !isActive && !isCompleted && "text-muted-foreground"
                  )}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "w-12 h-0.5 mx-2 mt-[-20px]",
                    isCompleted ? "bg-success" : "bg-border"
                  )} />
                )}
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <Progress value={progress} className="h-1 mb-8" />

        {/* Step Content */}
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-6">
            <AnimatePresence mode="wait">
              {currentStep === 0 && (
                <StepContent
                  key="shopify"
                  title="Connect Your Shopify Store"
                  description="We'll automatically import your products and start generating video Pins for each one."
                >
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Store URL</label>
                      <Input
                        placeholder="yourstore.myshopify.com"
                        value={shopifyUrl}
                        onChange={(e) => setShopifyUrl(e.target.value)}
                        className="bg-background"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={handleShopifyConnect}
                        disabled={isLoading}
                        className="flex-1 gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Store className="w-4 h-4" />
                            Connect Shopify
                          </>
                        )}
                      </Button>
                      <Button variant="ghost" onClick={skipStep}>
                        Skip for now
                      </Button>
                    </div>
                  </div>
                </StepContent>
              )}

{currentStep === 1 && (
                <StepContent
                  key="pinterest"
                  title="Connect Pinterest"
                  description="Authorize DOMINION to publish video Pins on your behalf. This enables autonomous posting."
                >
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-gradient-to-r from-[#E60023]/10 to-[#E60023]/5 border border-[#E60023]/20">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#E60023] flex items-center justify-center">
                          <Pin className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">Pinterest Business Account</p>
                          <p className="text-sm text-muted-foreground">Required for video Pins</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={handlePinterestConnect}
                        disabled={isLoading}
                        className="flex-1 gap-2 bg-[#E60023] hover:bg-[#E60023]/90"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <ExternalLink className="w-4 h-4" />
                            Authorize Pinterest
                          </>
                        )}
                      </Button>
                      <Button variant="ghost" onClick={skipStep}>
                        Skip
                      </Button>
                    </div>
                  </div>
                </StepContent>
              )}

              {currentStep === 2 && (
                <StepContent
                  key="youtube"
                  title="Connect YouTube"
                  description="Upload Shorts and full videos to YouTube automatically. Perfect for repurposing viral content."
                >
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-gradient-to-r from-[#FF0000]/10 to-[#FF0000]/5 border border-[#FF0000]/20">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#FF0000] flex items-center justify-center">
                          <Youtube className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">YouTube Channel</p>
                          <p className="text-sm text-muted-foreground">Brand Accounts supported</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={handleYouTubeConnect}
                        disabled={isLoading}
                        className="flex-1 gap-2 bg-[#FF0000] hover:bg-[#FF0000]/90"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <ExternalLink className="w-4 h-4" />
                            Authorize YouTube
                          </>
                        )}
                      </Button>
                      <Button variant="ghost" onClick={skipStep}>
                        Skip
                      </Button>
                    </div>
                  </div>
                </StepContent>
              )}

              {currentStep === 3 && (
                <StepContent
                  key="video"
                  title="Generate Your First Video Pin"
                  description="Watch DOMINION create a scroll-stopping video Pin in seconds using AI."
                >
                  <div className="space-y-4">
                    {!videoGenerated ? (
                      <div className="aspect-video rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-border/50 flex items-center justify-center">
                        {isLoading ? (
                          <div className="text-center">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
                            <p className="text-sm text-muted-foreground">Generating video...</p>
                            <p className="text-xs text-muted-foreground mt-1">This takes about 30 seconds</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Video className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Your first video Pin awaits</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-video rounded-xl bg-success/10 border border-success/30 flex items-center justify-center">
                        <div className="text-center">
                          <CheckCircle className="w-12 h-12 mx-auto mb-3 text-success" />
                          <p className="font-medium text-success">Video Pin Ready!</p>
                          <p className="text-sm text-muted-foreground">Ready to publish to Pinterest</p>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-3">
                      <Button
                        onClick={handleGenerateVideo}
                        disabled={isLoading || videoGenerated}
                        className="flex-1 gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generating...
                          </>
                        ) : videoGenerated ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Generated!
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4" />
                            Generate Video Pin
                          </>
                        )}
                      </Button>
                      {videoGenerated && (
                        <Button onClick={goToNextStep} className="gap-2">
                          Continue
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      )}
                      {!videoGenerated && (
                        <Button variant="ghost" onClick={skipStep}>
                          Skip
                        </Button>
                      )}
                    </div>
                  </div>
                </StepContent>
              )}

              {currentStep === 4 && (
                <StepContent
                  key="swarm"
                  title="Launch the Pinterest + YouTube Swarm"
                  description="Activate autonomous publishing. DOMINION will continuously create and post to Pinterest & YouTube 24/7."
                >
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-4 rounded-xl bg-card border text-center">
                        <p className="text-2xl font-bold text-primary">50+</p>
                        <p className="text-xs text-muted-foreground">Videos/Week</p>
                      </div>
                      <div className="p-4 rounded-xl bg-card border text-center">
                        <p className="text-2xl font-bold text-success">24/7</p>
                        <p className="text-xs text-muted-foreground">Publishing</p>
                      </div>
                      <div className="p-4 rounded-xl bg-card border text-center">
                        <p className="text-2xl font-bold text-accent">∞</p>
                        <p className="text-xs text-muted-foreground">Potential</p>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <p className="text-sm">
                          <span className="font-medium">Swarm Mode:</span> AI creates viral hooks, 
                          generates videos, posts at peak times, and optimizes based on performance.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={handleLaunchSwarm}
                        disabled={isLoading}
                        className="flex-1 gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Launching...
                          </>
                        ) : (
                          <>
                            <Rocket className="w-4 h-4" />
                            Launch Swarm
                          </>
                        )}
                      </Button>
                      <Button variant="ghost" onClick={onComplete}>
                        Skip to Dashboard
                      </Button>
                    </div>
                  </div>
                </StepContent>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Close button */}
        <div className="text-center mt-6">
          <Button variant="ghost" size="sm" onClick={onClose} className="gap-2 text-muted-foreground">
            <X className="w-3 h-3" />
            I'll set this up later
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Step content wrapper
interface StepContentProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const StepContent = ({ title, description, children }: StepContentProps) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.2 }}
  >
    <h2 className="text-xl font-bold mb-2">{title}</h2>
    <p className="text-muted-foreground mb-6">{description}</p>
    {children}
  </motion.div>
);
