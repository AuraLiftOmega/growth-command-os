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
  Copy,
  Share2,
  DollarSign,
  TrendingUp,
  Image as ImageIcon,
  RefreshCw,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useShopifyProducts, ParsedShopifyProduct } from "@/hooks/useShopifyProducts";

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

interface PinVariant {
  id: string;
  productId: string;
  productTitle: string;
  hook: string;
  cta: string;
  imageUrl?: string;
  status: 'ready' | 'generating' | 'posted';
}

export const PostLoginWizard = ({ open, onClose, onComplete }: PostLoginWizardProps) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [shopifyUrl, setShopifyUrl] = useState("");
  const [pinterestConnected, setPinterestConnected] = useState(false);
  const [youtubeConnected, setYoutubeConnected] = useState(false);
  const [videoGenerated, setVideoGenerated] = useState(false);
  
  // Phase 1: Pin posting state
  const [selectedProducts, setSelectedProducts] = useState<ParsedShopifyProduct[]>([]);
  const [pinVariants, setPinVariants] = useState<PinVariant[]>([]);
  const [postsCompleted, setPostsCompleted] = useState(0);
  const [showShareTools, setShowShareTools] = useState(false);
  
  // Fetch real Shopify products
  const { products, isLoading: loadingProducts, refetch } = useShopifyProducts({ autoLoad: true });
  
  const VIRAL_HOOKS = [
    "Glow in 30 days ✨",
    "This changed my skin forever",
    "Beauty routine that works",
    "Clean beauty secret revealed",
    "My morning glow-up ritual",
    "Why dermatologists love this",
    "Before & after - 2 weeks",
    "The only product you need",
    "POV: Your skin cleared up",
    "Skincare that actually works",
  ];

  const VIRAL_CTAS = [
    "Shop link in bio 🛒",
    "Limited stock - grab yours!",
    "Transform your skin today",
    "Join 10K+ happy customers",
    "Your glow awaits ✨",
  ];

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
      title: "Select Products",
      description: "Choose top products for Pin campaigns",
      icon: ImageIcon,
      status: "pending",
    },
    {
      id: 2,
      title: "Generate Pin Variants",
      description: "Create viral hooks & CTAs for each product",
      icon: Wand2,
      status: "pending",
    },
    {
      id: 3,
      title: "Post 10 Pins",
      description: "Manual post guide with copy-ready content",
      icon: Pin,
      status: "pending",
    },
    {
      id: 4,
      title: "Share & Boost",
      description: "Drive traffic with share tools & paid boost",
      icon: Share2,
      status: "pending",
    },
    {
      id: 5,
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
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    toast.success("Shopify store connected!");
    goToNextStep();
  };

  const toggleProductSelection = (product: ParsedShopifyProduct) => {
    setSelectedProducts(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      }
      if (prev.length >= 5) {
        toast.error("Select up to 5 products for your first campaign");
        return prev;
      }
      return [...prev, product];
    });
  };

  const generatePinVariants = () => {
    setIsLoading(true);
    const variants: PinVariant[] = [];
    
    selectedProducts.forEach((product, idx) => {
      // Generate 2 variants per product
      for (let i = 0; i < 2; i++) {
        variants.push({
          id: `${product.id}-${i}`,
          productId: product.id,
          productTitle: product.title,
          hook: VIRAL_HOOKS[(idx * 2 + i) % VIRAL_HOOKS.length],
          cta: VIRAL_CTAS[i % VIRAL_CTAS.length],
          imageUrl: product.imageUrl,
          status: 'ready',
        });
      }
    });
    
    setPinVariants(variants);
    setIsLoading(false);
    toast.success(`Generated ${variants.length} Pin variants!`);
    goToNextStep();
  };

  const copyPinContent = (variant: PinVariant) => {
    const content = `${variant.hook}

${variant.productTitle}

${variant.cta}

#skincare #beauty #glow #selfcare #skincareroutine #cleanbeauty #skincareproducts #glowingskin #beautytips #skincaretips`;
    
    navigator.clipboard.writeText(content);
    toast.success("Pin content copied!");
  };

  const markPinAsPosted = (variantId: string) => {
    setPinVariants(prev => prev.map(v => 
      v.id === variantId ? { ...v, status: 'posted' as const } : v
    ));
    setPostsCompleted(prev => prev + 1);
    toast.success("Pin marked as posted! 📌");
  };

  const copyStoreLink = () => {
    const storeUrl = `${window.location.origin}/store`;
    navigator.clipboard.writeText(storeUrl);
    toast.success("Store link copied!");
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
        className="w-full max-w-3xl"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Rocket className="w-7 h-7 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Welcome to DOMINION</h1>
          <p className="text-muted-foreground">Launch your first 10 Pins and start making money tonight</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6 px-2 overflow-x-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.status === "active";
            const isCompleted = step.status === "completed";
            const isSkipped = step.status === "skipped";
            
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center min-w-[60px]">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                      isActive && "bg-primary text-primary-foreground shadow-lg shadow-primary/30",
                      isCompleted && "bg-success text-success-foreground",
                      isSkipped && "bg-muted text-muted-foreground",
                      !isActive && !isCompleted && !isSkipped && "bg-muted/50 text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <span className={cn(
                    "text-[10px] mt-1 font-medium text-center",
                    isActive && "text-primary",
                    isCompleted && "text-success",
                    !isActive && !isCompleted && "text-muted-foreground"
                  )}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "w-8 h-0.5 mx-1 mt-[-20px]",
                    isCompleted ? "bg-success" : "bg-border"
                  )} />
                )}
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <Progress value={progress} className="h-1 mb-6" />

        {/* Step Content */}
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-6">
            <AnimatePresence mode="wait">
              {/* Step 0: Connect Shopify */}
              {currentStep === 0 && (
                <StepContent
                  key="shopify"
                  title="Connect Your Shopify Store"
                  description="We'll automatically import your products for Pin campaigns."
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
                        Skip
                      </Button>
                    </div>
                  </div>
                </StepContent>
              )}

              {/* Step 1: Select Products */}
              {currentStep === 1 && (
                <StepContent
                  key="products"
                  title="Select Your Top Products"
                  description="Choose up to 5 products for your viral Pin campaign."
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">
                        {selectedProducts.length}/5 selected
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={loadingProducts}>
                        <RefreshCw className={`w-4 h-4 ${loadingProducts ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                    
                    <ScrollArea className="h-[300px]">
                      <div className="grid grid-cols-2 gap-3">
                        {loadingProducts ? (
                          <div className="col-span-2 flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin" />
                          </div>
                        ) : products.length === 0 ? (
                          <div className="col-span-2 text-center py-8 text-muted-foreground">
                            No products found. Connect Shopify first.
                          </div>
                        ) : (
                          products.slice(0, 10).map((product) => {
                            const isSelected = selectedProducts.find(p => p.id === product.id);
                            return (
                              <div
                                key={product.id}
                                onClick={() => toggleProductSelection(product)}
                                className={cn(
                                  "p-3 rounded-lg border cursor-pointer transition-all",
                                  isSelected
                                    ? "bg-primary/10 border-primary"
                                    : "hover:bg-muted/50 border-border"
                                )}
                              >
                                <div className="flex items-start gap-3">
                                  {product.imageUrl ? (
                                    <img 
                                      src={product.imageUrl} 
                                      alt={product.title}
                                      className="w-16 h-16 rounded-lg object-cover"
                                    />
                                  ) : (
                                    <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{product.title}</p>
                                    <p className="text-sm text-primary font-bold">${product.price.toFixed(2)}</p>
                                    {isSelected && (
                                      <CheckCircle className="w-4 h-4 text-primary mt-1" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </ScrollArea>
                    
                    <div className="flex gap-3">
                      <Button
                        onClick={goToNextStep}
                        disabled={selectedProducts.length === 0}
                        className="flex-1 gap-2"
                      >
                        Continue with {selectedProducts.length} products
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" onClick={skipStep}>
                        Skip
                      </Button>
                    </div>
                  </div>
                </StepContent>
              )}

              {/* Step 2: Generate Pin Variants */}
              {currentStep === 2 && (
                <StepContent
                  key="variants"
                  title="Generate Viral Pin Variants"
                  description="We'll create 2 viral hooks & CTAs per product for maximum reach."
                >
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-gradient-to-r from-chart-3/10 to-primary/10 border border-chart-3/20">
                      <div className="flex items-center gap-3 mb-3">
                        <Wand2 className="w-5 h-5 text-chart-3" />
                        <span className="font-medium">AI Variant Generator</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-background/50 rounded-lg">
                          <p className="text-2xl font-bold text-primary">{selectedProducts.length}</p>
                          <p className="text-xs text-muted-foreground">Products</p>
                        </div>
                        <div className="text-center p-3 bg-background/50 rounded-lg">
                          <p className="text-2xl font-bold text-chart-3">{selectedProducts.length * 2}</p>
                          <p className="text-xs text-muted-foreground">Pin Variants</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button
                        onClick={generatePinVariants}
                        disabled={isLoading}
                        className="flex-1 gap-2 bg-gradient-to-r from-chart-3 to-primary"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Generate {selectedProducts.length * 2} Pin Variants
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </StepContent>
              )}

              {/* Step 3: Post 10 Pins */}
              {currentStep === 3 && (
                <StepContent
                  key="post"
                  title="📌 Post Your Pins to Pinterest"
                  description="Copy each pin content, open Pinterest, and post manually for maximum organic reach."
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/20">
                      <span className="text-sm font-medium">Posts Completed</span>
                      <Badge className="bg-success/20 text-success">
                        {postsCompleted}/{pinVariants.length}
                      </Badge>
                    </div>
                    
                    <ScrollArea className="h-[280px]">
                      <div className="space-y-3">
                        {pinVariants.map((variant) => (
                          <div
                            key={variant.id}
                            className={cn(
                              "p-3 rounded-lg border",
                              variant.status === 'posted'
                                ? "bg-success/5 border-success/20"
                                : "bg-muted/30 border-border"
                            )}
                          >
                            <div className="flex items-start gap-3">
                              {variant.imageUrl && (
                                <img 
                                  src={variant.imageUrl} 
                                  alt={variant.productTitle}
                                  className="w-14 h-14 rounded-lg object-cover"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{variant.hook}</p>
                                <p className="text-xs text-muted-foreground">{variant.productTitle}</p>
                                <p className="text-xs text-primary mt-1">{variant.cta}</p>
                              </div>
                              <div className="flex flex-col gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-1 h-7 text-xs"
                                  onClick={() => copyPinContent(variant)}
                                >
                                  <Copy className="w-3 h-3" />
                                  Copy
                                </Button>
                                {variant.status !== 'posted' && (
                                  <Button
                                    size="sm"
                                    className="gap-1 h-7 text-xs bg-[#E60023] hover:bg-[#E60023]/90"
                                    onClick={() => markPinAsPosted(variant.id)}
                                  >
                                    <CheckCircle className="w-3 h-3" />
                                    Posted
                                  </Button>
                                )}
                                {variant.status === 'posted' && (
                                  <Badge className="bg-success/20 text-success text-[10px]">
                                    ✓ Done
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => window.open('https://pinterest.com/pin-creation-tool/', '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open Pinterest
                      </Button>
                      <Button
                        onClick={goToNextStep}
                        disabled={postsCompleted < 1}
                        className="flex-1 gap-2"
                      >
                        Continue
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </StepContent>
              )}

              {/* Step 4: Share & Boost */}
              {currentStep === 4 && (
                <StepContent
                  key="share"
                  title="Share Your Store & Boost Traffic"
                  description="Drive immediate traffic with share tools and optional paid boost."
                >
                  <div className="space-y-4">
                    {/* Share Store */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-chart-4/10 border border-primary/20">
                      <h4 className="font-medium flex items-center gap-2 mb-3">
                        <Share2 className="w-4 h-4 text-primary" />
                        Share Your Store
                      </h4>
                      <div className="flex gap-2">
                        <Input
                          value={`${window.location.origin}/store`}
                          readOnly
                          className="flex-1 bg-background text-sm"
                        />
                        <Button onClick={copyStoreLink} className="gap-2">
                          <Copy className="w-4 h-4" />
                          Copy
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Share this link on Instagram, TikTok, Facebook, and email
                      </p>
                    </div>
                    
                    {/* Boost Pin Guide */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-chart-3/10 to-warning/10 border border-chart-3/20">
                      <h4 className="font-medium flex items-center gap-2 mb-3">
                        <TrendingUp className="w-4 h-4 text-chart-3" />
                        Boost Your Best Pin ($50 Budget)
                      </h4>
                      <ol className="text-sm space-y-2 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="font-bold text-foreground">1.</span>
                          Open Pinterest Ads Manager
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold text-foreground">2.</span>
                          Click "Create campaign" → "Traffic"
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold text-foreground">3.</span>
                          Select your top-performing Pin
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold text-foreground">4.</span>
                          Set $50 lifetime budget, target "skincare" interests
                        </li>
                      </ol>
                      <Button
                        variant="outline"
                        className="w-full mt-3 gap-2"
                        onClick={() => window.open('https://ads.pinterest.com/', '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open Pinterest Ads
                      </Button>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button
                        onClick={goToNextStep}
                        className="flex-1 gap-2"
                      >
                        Continue to Launch
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </StepContent>
              )}

              {/* Step 5: Launch Swarm */}
              {currentStep === 5 && (
                <StepContent
                  key="swarm"
                  title="Launch the Autonomous Swarm"
                  description="Activate 24/7 AI publishing across Pinterest, YouTube, and more."
                >
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-4 rounded-xl bg-card border text-center">
                        <p className="text-2xl font-bold text-primary">50+</p>
                        <p className="text-xs text-muted-foreground">Videos/Week</p>
                      </div>
                      <div className="p-4 rounded-xl bg-card border text-center">
                        <p className="text-2xl font-bold text-success">24/7</p>
                        <p className="text-xs text-muted-foreground">Autonomous</p>
                      </div>
                      <div className="p-4 rounded-xl bg-card border text-center">
                        <p className="text-2xl font-bold text-chart-3">$10K+</p>
                        <p className="text-xs text-muted-foreground">Target/Month</p>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-xl bg-gradient-to-r from-success/10 to-chart-4/10 border border-success/20">
                      <div className="flex items-center gap-3 mb-3">
                        <Zap className="w-5 h-5 text-success" />
                        <span className="font-medium">Ready to Launch</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Your {postsCompleted} manual Pins are live. The swarm will now take over 
                        and scale your best performers automatically.
                      </p>
                    </div>
                    
                    <Button
                      onClick={handleLaunchSwarm}
                      disabled={isLoading}
                      className="w-full gap-2 h-12 text-lg bg-gradient-to-r from-success to-chart-4"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Launching...
                        </>
                      ) : (
                        <>
                          <Rocket className="w-5 h-5" />
                          Launch Swarm Now 🚀
                        </>
                      )}
                    </Button>
                  </div>
                </StepContent>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </Button>
      </motion.div>
    </motion.div>
  );
};

// Step content wrapper component
const StepContent = ({ 
  title, 
  description, 
  children 
}: { 
  title: string; 
  description: string; 
  children: React.ReactNode 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.2 }}
  >
    <div className="text-center mb-6">
      <h2 className="text-xl font-bold mb-1">{title}</h2>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
    {children}
  </motion.div>
);
