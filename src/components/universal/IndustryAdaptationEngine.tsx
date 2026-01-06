import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  ShoppingBag, 
  Code2, 
  Users, 
  GraduationCap, 
  Building,
  ArrowRight,
  Check,
  Zap,
  Target,
  DollarSign,
  Loader2,
  Cloud,
  AlertCircle
} from 'lucide-react';
import { useDominionStore, INDUSTRY_TEMPLATES, OfferType, SalesMotion } from '@/stores/dominion-core-store';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

/**
 * INDUSTRY ADAPTATION ENGINE
 * 
 * Full-stack implementation with:
 * - Visual feedback on all interactions
 * - State persistence to database
 * - Downstream logic triggers
 * - Reload recovery
 */

const industries = [
  { id: 'ecommerce', name: 'E-Commerce / DTC', icon: ShoppingBag, description: 'Physical or digital products sold online' },
  { id: 'saas', name: 'SaaS / Software', icon: Code2, description: 'Subscription-based software products' },
  { id: 'agency', name: 'Agency / Services', icon: Users, description: 'Professional services and consulting' },
  { id: 'coaching', name: 'Coaching / Info', icon: GraduationCap, description: 'Courses, coaching, info products' },
  { id: 'enterprise', name: 'Enterprise / B2B', icon: Building, description: 'High-value B2B solutions' },
  { id: 'local_services', name: 'Local Services', icon: Building2, description: 'Plumbers, contractors, local pros' },
  { id: 'high_ticket_consulting', name: 'High-Ticket Consulting', icon: Target, description: '$50K+ strategic advisory' },
];

const offerTypes: { id: OfferType; name: string; description: string }[] = [
  { id: 'physical_product', name: 'Physical Product', description: 'Tangible goods shipped to customers' },
  { id: 'digital_product', name: 'Digital Product', description: 'Downloads, software, digital assets' },
  { id: 'saas', name: 'SaaS Subscription', description: 'Recurring software access' },
  { id: 'service', name: 'Service', description: 'Done-for-you work' },
  { id: 'coaching', name: 'Coaching/Consulting', description: 'Expert guidance and training' },
  { id: 'agency', name: 'Agency Retainer', description: 'Ongoing service relationship' },
];

const salesMotions: { id: SalesMotion; name: string; description: string }[] = [
  { id: 'self_serve', name: 'Self-Serve', description: 'Customer buys without human interaction' },
  { id: 'sales_led', name: 'Sales-Led', description: 'Human-driven sales process' },
  { id: 'product_led', name: 'Product-Led', description: 'Free trial/freemium to paid' },
  { id: 'hybrid', name: 'Hybrid', description: 'Combination of motions' },
];

const dealSizes: { id: 'low' | 'mid' | 'high' | 'enterprise'; name: string; range: string; color: string }[] = [
  { id: 'low', name: 'Low Ticket', range: '$0 - $500', color: 'text-muted-foreground' },
  { id: 'mid', name: 'Mid Ticket', range: '$500 - $5,000', color: 'text-foreground' },
  { id: 'high', name: 'High Ticket', range: '$5,000 - $50,000', color: 'text-primary' },
  { id: 'enterprise', name: 'Enterprise', range: '$50,000+', color: 'text-accent' },
];

interface IndustryAdaptationEngineProps {
  onComplete?: () => void;
  redirectToDashboard?: boolean;
}

export const IndustryAdaptationEngine = ({ 
  onComplete, 
  redirectToDashboard = true 
}: IndustryAdaptationEngineProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    setIndustry, 
    setOfferType, 
    setSalesMotion, 
    setDealSize,
    setBuyingCycle,
    industry,
    offerType,
    salesMotion,
    dealSize,
    buyingCycle,
    industryConfig,
    activateEngine,
    saveToDatabase,
    loadFromDatabase,
    setUserId,
    isLoading,
    isSynced,
    isConfigured,
    isActive,
  } = useDominionStore();
  
  const [step, setStep] = useState(0);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(industry);
  const [selectedOffer, setSelectedOffer] = useState<OfferType | null>(offerType);
  const [selectedMotion, setSelectedMotion] = useState<SalesMotion | null>(salesMotion);
  const [selectedDealSize, setSelectedDealSize] = useState<'low' | 'mid' | 'high' | 'enterprise'>(dealSize);
  const [isActivating, setIsActivating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load from database on mount
  useEffect(() => {
    if (user?.id) {
      setUserId(user.id);
      loadFromDatabase(user.id);
    }
  }, [user?.id]);

  // Sync local state with store on load
  useEffect(() => {
    if (isSynced) {
      setSelectedIndustry(industry);
      setSelectedOffer(offerType);
      setSelectedMotion(salesMotion);
      setSelectedDealSize(dealSize);
    }
  }, [isSynced, industry, offerType, salesMotion, dealSize]);

  const handleIndustrySelect = async (id: string) => {
    setSelectedIndustry(id);
    const template = INDUSTRY_TEMPLATES[id];
    if (template) {
      setIndustry(id, template);
      // Auto-set buying cycle based on industry
      setBuyingCycle(template.buyerPsychology.cycleLength);
      
      // Save immediately
      setIsSaving(true);
      await saveToDatabase();
      setIsSaving(false);
      toast.success(`Industry set to ${template.name}`);
    }
  };

  const handleOfferSelect = async (offer: OfferType) => {
    setSelectedOffer(offer);
    setOfferType(offer);
    setIsSaving(true);
    await saveToDatabase();
    setIsSaving(false);
  };

  const handleMotionSelect = async (motion: SalesMotion) => {
    setSelectedMotion(motion);
    setSalesMotion(motion);
    setIsSaving(true);
    await saveToDatabase();
    setIsSaving(false);
  };

  const handleDealSizeSelect = async (size: 'low' | 'mid' | 'high' | 'enterprise') => {
    setSelectedDealSize(size);
    setDealSize(size);
    setIsSaving(true);
    await saveToDatabase();
    setIsSaving(false);
  };

  const handleComplete = async () => {
    setIsActivating(true);
    
    try {
      // Ensure all selections are applied
      if (selectedOffer) setOfferType(selectedOffer);
      if (selectedMotion) setSalesMotion(selectedMotion);
      setDealSize(selectedDealSize);
      
      // Activate the engine (persists to database)
      const success = await activateEngine();
      
      if (success) {
        toast.success("DOMINION activated! Revenue engine is now live.", {
          description: "All systems configured and ready for execution."
        });
        
        onComplete?.();
        
        if (redirectToDashboard) {
          navigate('/dashboard');
        }
      } else {
        toast.error("Failed to activate engine. Please try again.");
      }
    } catch (error) {
      console.error("Activation error:", error);
      toast.error("An error occurred during activation.");
    } finally {
      setIsActivating(false);
    }
  };

  const handleSkipWithDefaults = async () => {
    setIsActivating(true);
    
    try {
      // Apply ecommerce defaults
      const defaultIndustry = 'ecommerce';
      const template = INDUSTRY_TEMPLATES[defaultIndustry];
      
      setIndustry(defaultIndustry, template);
      setOfferType('physical_product');
      setSalesMotion('self_serve');
      setDealSize('mid');
      setBuyingCycle(template.buyerPsychology.cycleLength);
      
      const success = await activateEngine();
      
      if (success) {
        toast.success("DOMINION activated with industry defaults!", {
          description: "You can customize settings anytime in Command Center."
        });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Skip activation error:", error);
      toast.error("Failed to apply defaults.");
    } finally {
      setIsActivating(false);
    }
  };

  const steps = [
    { title: 'Industry', subtitle: 'What market do you operate in?' },
    { title: 'Offer Type', subtitle: 'What are you selling?' },
    { title: 'Sales Motion', subtitle: 'How do you sell?' },
    { title: 'Deal Size', subtitle: 'What is your average transaction value?' },
  ];

  const canProceed = () => {
    switch (step) {
      case 0: return !!selectedIndustry;
      case 1: return !!selectedOffer;
      case 2: return !!selectedMotion;
      case 3: return true;
      default: return false;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6"
          >
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">Industry Adaptation Engine</span>
            {isSaving && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" />
                Saving...
              </span>
            )}
            {isSynced && !isSaving && (
              <span className="flex items-center gap-1 text-xs text-success">
                <Cloud className="w-3 h-3" />
                Synced
              </span>
            )}
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Configure Your Revenue Engine
          </motion.h1>
          
          <p className="text-muted-foreground max-w-lg mx-auto mb-4">
            DOMINION adapts to your industry. Same core engine. Different execution layer.
          </p>

          {/* Skip option */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkipWithDefaults}
            disabled={isActivating}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Skip and use industry defaults
          </Button>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center">
              <button
                onClick={() => setStep(i)}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all cursor-pointer hover:scale-110",
                  i < step ? "bg-success text-success-foreground" :
                  i === step ? "bg-primary text-primary-foreground" :
                  "bg-secondary text-muted-foreground hover:bg-secondary/80"
                )}
              >
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </button>
              {i < steps.length - 1 && (
                <div className={cn(
                  "w-12 h-0.5 mx-1 transition-colors",
                  i < step ? "bg-success" : "bg-border"
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold mb-2">{steps[step].title}</h2>
              <p className="text-muted-foreground">{steps[step].subtitle}</p>
            </div>

            {step === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {industries.map((ind) => (
                  <motion.button
                    key={ind.id}
                    onClick={() => handleIndustrySelect(ind.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "p-6 rounded-lg border text-left transition-all duration-200",
                      selectedIndustry === ind.id
                        ? "bg-primary/10 border-primary/50 shadow-[0_0_30px_-10px_hsl(var(--primary)/0.5)]"
                        : "bg-card/50 border-border/50 hover:border-border hover:bg-card/80"
                    )}
                  >
                    <ind.icon className={cn(
                      "w-8 h-8 mb-3 transition-colors",
                      selectedIndustry === ind.id ? "text-primary" : "text-muted-foreground"
                    )} />
                    <h3 className="font-semibold mb-1">{ind.name}</h3>
                    <p className="text-sm text-muted-foreground">{ind.description}</p>
                    {selectedIndustry === ind.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2"
                      >
                        <Check className="w-5 h-5 text-primary" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            )}

            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {offerTypes.map((offer) => (
                  <motion.button
                    key={offer.id}
                    onClick={() => handleOfferSelect(offer.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "p-5 rounded-lg border text-left transition-all duration-200 relative",
                      selectedOffer === offer.id
                        ? "bg-primary/10 border-primary/50"
                        : "bg-card/50 border-border/50 hover:border-border hover:bg-card/80"
                    )}
                  >
                    <h3 className="font-semibold mb-1">{offer.name}</h3>
                    <p className="text-sm text-muted-foreground">{offer.description}</p>
                    {selectedOffer === offer.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2"
                      >
                        <Check className="w-5 h-5 text-primary" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {salesMotions.map((motionItem) => (
                  <motion.button
                    key={motionItem.id}
                    onClick={() => handleMotionSelect(motionItem.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "p-5 rounded-lg border text-left transition-all duration-200 relative",
                      selectedMotion === motionItem.id
                        ? "bg-primary/10 border-primary/50"
                        : "bg-card/50 border-border/50 hover:border-border hover:bg-card/80"
                    )}
                  >
                    <h3 className="font-semibold mb-1">{motionItem.name}</h3>
                    <p className="text-sm text-muted-foreground">{motionItem.description}</p>
                    {selectedMotion === motionItem.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2"
                      >
                        <Check className="w-5 h-5 text-primary" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                {dealSizes.map((size) => (
                  <motion.button
                    key={size.id}
                    onClick={() => handleDealSizeSelect(size.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "p-5 rounded-lg border text-center transition-all duration-200 relative",
                      selectedDealSize === size.id
                        ? "bg-primary/10 border-primary/50 shadow-lg"
                        : "bg-card/50 border-border/50 hover:border-border hover:bg-card/80"
                    )}
                  >
                    <DollarSign className={cn("w-6 h-6 mx-auto mb-2", size.color)} />
                    <h3 className="font-semibold mb-1">{size.name}</h3>
                    <p className="text-xs text-muted-foreground">{size.range}</p>
                    {selectedDealSize === size.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2"
                      >
                        <Check className="w-5 h-5 text-primary" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-12">
          <Button
            variant="outline"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0 || isActivating}
            className="gap-2"
          >
            Back
          </Button>
          
          {step < 3 ? (
            <Button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              className="gap-2 btn-power"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={isActivating}
              className="gap-2 btn-power"
            >
              {isActivating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Activating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Activate DOMINION
                </>
              )}
            </Button>
          )}
        </div>

        {/* Preview of Adaptation */}
        {selectedIndustry && INDUSTRY_TEMPLATES[selectedIndustry] && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 p-6 rounded-lg bg-card/50 border border-border/50"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Adaptation Preview: {INDUSTRY_TEMPLATES[selectedIndustry].name}
              </h3>
              {isConfigured && isActive && (
                <span className="flex items-center gap-1.5 text-xs text-success">
                  <Check className="w-3 h-3" />
                  Active
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Primary KPIs</p>
                <p className="text-sm font-medium">
                  {INDUSTRY_TEMPLATES[selectedIndustry].kpis.primary.slice(0, 2).join(', ')}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Tone</p>
                <p className="text-sm font-medium capitalize">
                  {INDUSTRY_TEMPLATES[selectedIndustry].language.tone}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Buying Cycle</p>
                <p className="text-sm font-medium capitalize">
                  {INDUSTRY_TEMPLATES[selectedIndustry].buyerPsychology.cycleLength}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Integrations</p>
                <p className="text-sm font-medium">
                  {INDUSTRY_TEMPLATES[selectedIndustry].integrations.length} available
                </p>
              </div>
            </div>

            {/* Additional config details when all steps complete */}
            {selectedOffer && selectedMotion && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 md:grid-cols-3 gap-4"
              >
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Offer Type</p>
                  <p className="text-sm font-medium capitalize">
                    {selectedOffer.replace(/_/g, ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Sales Motion</p>
                  <p className="text-sm font-medium capitalize">
                    {selectedMotion.replace(/_/g, ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Deal Size</p>
                  <p className="text-sm font-medium">
                    {dealSizes.find(d => d.id === selectedDealSize)?.range}
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default IndustryAdaptationEngine;
