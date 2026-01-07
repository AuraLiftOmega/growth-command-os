import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, 
  ChevronLeft, 
  Store, 
  Package, 
  Palette, 
  Eye, 
  CheckCircle2,
  Loader2,
  Sparkles,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useStoreSetup, StoreSetupData } from "@/hooks/useStoreSetup";
import { supabase } from "@/integrations/supabase/client";

interface SetupWizardProps {
  onComplete?: (data: StoreSetupData) => void;
  onSkip?: () => void;
  initialStoreName?: string;
}

const industries = [
  { id: 'fashion', label: 'Fashion & Apparel', icon: '👕' },
  { id: 'electronics', label: 'Electronics & Tech', icon: '📱' },
  { id: 'beauty', label: 'Beauty & Skincare', icon: '💄' },
  { id: 'home', label: 'Home & Living', icon: '🏠' },
  { id: 'fitness', label: 'Sports & Fitness', icon: '🏋️' },
  { id: 'food', label: 'Food & Beverage', icon: '🍕' },
  { id: 'pets', label: 'Pets & Animals', icon: '🐕' },
  { id: 'other', label: 'Other', icon: '📦' }
];

const steps = [
  { id: 1, title: 'Store Info', icon: Store },
  { id: 2, title: 'Industry', icon: Package },
  { id: 3, title: 'Details', icon: Palette },
  { id: 4, title: 'Preview', icon: Eye },
];

export function StoreSetupWizard({ onComplete, onSkip, initialStoreName = '' }: SetupWizardProps) {
  const navigate = useNavigate();
  const { isLoading, saveSetup, generateStoreConfig, updateSetupWithConfig } = useStoreSetup();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [data, setData] = useState<StoreSetupData>({
    storeName: initialStoreName,
    industry: '',
    description: '',
    targetAudience: '',
    email: '',
    products: []
  });

  const updateData = (field: keyof StoreSetupData, value: string | string[] | Array<{ name: string; price: string; description: string }>) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return data.storeName.trim().length > 0;
      case 2: return data.industry.length > 0;
      case 3: return data.email.trim().length > 0 && data.email.includes('@');
      case 4: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsGenerating(true);
    
    try {
      // Capture lead first
      await supabase.functions.invoke('capture-lead', {
        body: {
          email: data.email,
          source: 'store_setup_wizard',
          storeName: data.storeName,
          industry: data.industry,
          metadata: { targetAudience: data.targetAudience },
        },
      });

      // Save setup to database
      const setupId = await saveSetup(data);
      
      if (setupId) {
        // Generate store configuration
        const config = await generateStoreConfig(data);
        await updateSetupWithConfig(setupId, config);
        
        toast.success("Your store is ready! Review and approve to go live.");
        
        if (onComplete) {
          onComplete(data);
        } else {
          // Navigate to the success page with the setup ID
          navigate(`/store-generated?id=${setupId}`);
        }
      }
    } catch (error) {
      console.error('Error completing setup:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold">Store Setup Wizard</h1>
              <p className="text-sm text-muted-foreground">Step {currentStep} of {steps.length}</p>
            </div>
            <div className="flex items-center gap-1">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    index + 1 === currentStep
                      ? "bg-primary/10 text-primary"
                      : index + 1 < currentStep
                      ? "text-chart-3"
                      : "text-muted-foreground"
                  }`}
                >
                  <step.icon className="w-4 h-4" />
                  <span className="text-xs font-medium hidden sm:inline">{step.title}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Progress Bar */}
          <div className="h-1 bg-secondary mt-4 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / steps.length) * 100}%` }}
              className="h-full bg-primary"
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <StepWrapper key="step1">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Store className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">What's your store called?</h2>
                  <p className="text-muted-foreground">This will be displayed throughout your store</p>
                </div>
                <div className="max-w-md mx-auto space-y-4">
                  <div>
                    <Label htmlFor="storeName">Store Name</Label>
                    <Input
                      id="storeName"
                      placeholder="e.g., Urban Style Co."
                      value={data.storeName}
                      onChange={(e) => updateData('storeName', e.target.value)}
                      className="mt-1.5 text-lg h-12"
                      autoFocus
                    />
                  </div>
                </div>
              </StepWrapper>
            )}

            {currentStep === 2 && (
              <StepWrapper key="step2">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">What do you sell?</h2>
                  <p className="text-muted-foreground">This helps us optimize your store for your industry</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {industries.map((industry) => (
                    <button
                      key={industry.id}
                      onClick={() => updateData('industry', industry.id)}
                      className={`p-4 rounded-xl border text-center transition-all ${
                        data.industry === industry.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="text-2xl mb-2">{industry.icon}</div>
                      <div className="text-sm font-medium">{industry.label}</div>
                    </button>
                  ))}
                </div>
              </StepWrapper>
            )}

            {currentStep === 3 && (
              <StepWrapper key="step3">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Almost there!</h2>
                  <p className="text-muted-foreground">Enter your email to receive your store setup</p>
                </div>
                <div className="space-y-4 max-w-lg mx-auto">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@yourstore.com"
                      value={data.email}
                      onChange={(e) => updateData('email', e.target.value)}
                      className="mt-1.5 h-12"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Store Description (optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="What makes your store unique? What's your brand story?"
                      value={data.description}
                      onChange={(e) => updateData('description', e.target.value)}
                      className="mt-1.5 min-h-[100px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="targetAudience">Target Audience (optional)</Label>
                    <Input
                      id="targetAudience"
                      placeholder="e.g., Young professionals, fitness enthusiasts"
                      value={data.targetAudience}
                      onChange={(e) => updateData('targetAudience', e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </StepWrapper>
            )}

            {currentStep === 4 && (
              <StepWrapper key="step4">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-chart-3/10 flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-8 h-8 text-chart-3" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Ready to generate your store?</h2>
                  <p className="text-muted-foreground">Review your selections before we build</p>
                </div>

                <Card className="max-w-lg mx-auto">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-muted-foreground">Store Name</span>
                      <span className="font-medium">{data.storeName}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-muted-foreground">Industry</span>
                      <span className="font-medium capitalize">
                        {industries.find(i => i.id === data.industry)?.label || 'Not selected'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-muted-foreground">Email</span>
                      <span className="font-medium">{data.email}</span>
                    </div>
                    {data.description && (
                      <div className="py-2 border-b border-border">
                        <span className="text-muted-foreground block mb-1">Description</span>
                        <span className="text-sm">{data.description}</span>
                      </div>
                    )}
                    {data.targetAudience && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-muted-foreground">Audience</span>
                        <span className="font-medium">{data.targetAudience}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/20 max-w-lg mx-auto">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium">AI will generate:</p>
                      <p className="text-muted-foreground">Store layout, sample products, SEO content, and optimized pages</p>
                    </div>
                  </div>
                </div>
              </StepWrapper>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background/95 backdrop-blur sticky bottom-0">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 1 || isGenerating}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <div className="flex items-center gap-2">
              {onSkip && currentStep === 1 && (
                <Button variant="ghost" onClick={onSkip}>
                  Skip Setup
                </Button>
              )}
              <Button
                onClick={handleNext}
                disabled={!canProceed() || isGenerating || isLoading}
                className="min-w-[140px]"
              >
                {isGenerating || isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : currentStep === steps.length ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Generate Store
                  </>
                ) : (
                  <>
                    Continue
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const StepWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);
