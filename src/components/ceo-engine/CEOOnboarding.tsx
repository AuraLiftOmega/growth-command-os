import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  ChevronRight, 
  ChevronLeft, 
  Target, 
  DollarSign, 
  Users, 
  ShoppingCart,
  Rocket,
  Sparkles,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface CEOOnboardingProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface OnboardingData {
  business_type: string;
  niche: string;
  target_audience: string;
  monthly_revenue: string;
  growth_goal: string;
  products: string;
  budget: string;
  social_platforms: string[];
  pain_points: string;
  automation_level: string;
}

const STEPS = [
  { id: 'business', title: 'Business', icon: Target },
  { id: 'audience', title: 'Audience', icon: Users },
  { id: 'goals', title: 'Goals', icon: DollarSign },
  { id: 'products', title: 'Products', icon: ShoppingCart },
  { id: 'automation', title: 'Automation', icon: Rocket },
];

export function CEOOnboarding({ open, onOpenChange }: CEOOnboardingProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    business_type: '',
    niche: '',
    target_audience: '',
    monthly_revenue: '',
    growth_goal: '',
    products: '',
    budget: '',
    social_platforms: [],
    pain_points: '',
    automation_level: 'balanced',
  });

  const updateData = (key: keyof OnboardingData, value: any) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const nextStep = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Save CEO Brain configuration
      await supabase
        .from('revenue_engine_config')
        .upsert({
          user_id: user?.id,
          industry: data.niche,
          deal_size: data.monthly_revenue,
          is_configured: true,
          is_active: true,
        });

      toast.success('CEO Brain configured!', {
        description: 'Your AI CEO is now optimizing for maximum revenue.',
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Failed to save configuration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle>Configure CEO Brain</DialogTitle>
              <DialogDescription>
                Answer 5-10 questions so the AI can maximize your revenue
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((s, i) => (
              <div
                key={s.id}
                className={`flex items-center gap-1.5 text-xs ${
                  i <= step ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  i < step 
                    ? 'bg-primary text-primary-foreground' 
                    : i === step
                    ? 'bg-primary/20 text-primary border-2 border-primary'
                    : 'bg-muted'
                }`}>
                  {i < step ? <Check className="w-3 h-3" /> : <s.icon className="w-3 h-3" />}
                </div>
                <span className="hidden sm:inline">{s.title}</span>
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-1" />
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-[300px]"
          >
            {step === 0 && (
              <div className="space-y-4">
                <div>
                  <Label>What type of business do you run?</Label>
                  <RadioGroup
                    value={data.business_type}
                    onValueChange={(v) => updateData('business_type', v)}
                    className="grid grid-cols-2 gap-3 mt-2"
                  >
                    {['E-commerce', 'SaaS', 'Agency', 'Coaching', 'Info Products', 'Other'].map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <RadioGroupItem value={type.toLowerCase()} id={type} />
                        <Label htmlFor={type} className="cursor-pointer">{type}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <div>
                  <Label htmlFor="niche">What's your specific niche?</Label>
                  <Input
                    id="niche"
                    placeholder="e.g., Fitness supplements, B2B marketing..."
                    value={data.niche}
                    onChange={(e) => updateData('niche', e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="audience">Describe your ideal customer</Label>
                  <Textarea
                    id="audience"
                    placeholder="Demographics, pain points, buying behavior..."
                    value={data.target_audience}
                    onChange={(e) => updateData('target_audience', e.target.value)}
                    className="mt-2 min-h-[120px]"
                  />
                </div>
                <div>
                  <Label htmlFor="pain_points">What are their biggest frustrations?</Label>
                  <Textarea
                    id="pain_points"
                    placeholder="What keeps them up at night? What problems do you solve?"
                    value={data.pain_points}
                    onChange={(e) => updateData('pain_points', e.target.value)}
                    className="mt-2 min-h-[100px]"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <Label>Current monthly revenue</Label>
                  <RadioGroup
                    value={data.monthly_revenue}
                    onValueChange={(v) => updateData('monthly_revenue', v)}
                    className="grid grid-cols-2 gap-3 mt-2"
                  >
                    {['$0-$10K', '$10K-$50K', '$50K-$100K', '$100K-$500K', '$500K-$1M', '$1M+'].map((range) => (
                      <div key={range} className="flex items-center space-x-2">
                        <RadioGroupItem value={range} id={range} />
                        <Label htmlFor={range} className="cursor-pointer">{range}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <div>
                  <Label htmlFor="growth_goal">What's your 12-month revenue goal?</Label>
                  <Input
                    id="growth_goal"
                    placeholder="e.g., $500K, 2x current revenue..."
                    value={data.growth_goal}
                    onChange={(e) => updateData('growth_goal', e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="budget">Monthly marketing/ad budget</Label>
                  <Input
                    id="budget"
                    placeholder="e.g., $5,000, $20,000..."
                    value={data.budget}
                    onChange={(e) => updateData('budget', e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="products">Describe your main products/services</Label>
                  <Textarea
                    id="products"
                    placeholder="What do you sell? Price points? Bestsellers?"
                    value={data.products}
                    onChange={(e) => updateData('products', e.target.value)}
                    className="mt-2 min-h-[120px]"
                  />
                </div>
                <div>
                  <Label>Which social platforms do you use?</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['Facebook', 'Instagram', 'TikTok', 'X/Twitter', 'LinkedIn', 'YouTube'].map((platform) => (
                      <Badge
                        key={platform}
                        variant={data.social_platforms.includes(platform) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => {
                          const platforms = data.social_platforms.includes(platform)
                            ? data.social_platforms.filter(p => p !== platform)
                            : [...data.social_platforms, platform];
                          updateData('social_platforms', platforms);
                        }}
                      >
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <Label>How autonomous should CEO Brain be?</Label>
                  <RadioGroup
                    value={data.automation_level}
                    onValueChange={(v) => updateData('automation_level', v)}
                    className="space-y-3 mt-3"
                  >
                    <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                      <RadioGroupItem value="conservative" id="conservative" className="mt-0.5" />
                      <div>
                        <Label htmlFor="conservative" className="cursor-pointer font-medium">Conservative</Label>
                        <p className="text-xs text-muted-foreground">Approve most actions manually. Good for starting out.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer bg-primary/5 border-primary/30">
                      <RadioGroupItem value="balanced" id="balanced" className="mt-0.5" />
                      <div>
                        <Label htmlFor="balanced" className="cursor-pointer font-medium">Balanced (Recommended)</Label>
                        <p className="text-xs text-muted-foreground">Auto-execute small decisions, approve big ones.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                      <RadioGroupItem value="aggressive" id="aggressive" className="mt-0.5" />
                      <div>
                        <Label htmlFor="aggressive" className="cursor-pointer font-medium">Full Autonomy</Label>
                        <p className="text-xs text-muted-foreground">CEO Brain runs everything. Maximum revenue, minimum friction.</p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="font-medium text-sm">Ready to maximize revenue</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    CEO Brain will analyze your business and start making income-maximizing decisions immediately.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={step === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          
          {step < STEPS.length - 1 ? (
            <Button onClick={nextStep}>
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              {isSubmitting ? (
                <>Activating...</>
              ) : (
                <>
                  <Rocket className="w-4 h-4 mr-2" />
                  Activate CEO Brain
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
