import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Zap, Building2, Crown, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSubscription, PLAN_FEATURES } from '@/hooks/useSubscription';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';

const tierIcons = {
  free: Zap,
  starter: Zap,
  pro: Crown,
  growth: Crown,
  business: Building2,
  enterprise: Building2,
};

const tierColors = {
  free: 'from-gray-500 to-gray-600',
  starter: 'from-blue-500 to-blue-600',
  pro: 'from-purple-500 to-pink-500',
  growth: 'from-purple-500 to-pink-500',
  business: 'from-amber-500 to-orange-500',
  enterprise: 'from-amber-500 to-orange-500',
};

export function BillingPanel() {
  const { subscription, isLoading: subLoading, isTrialing, trialDaysLeft, planFeatures, isAdmin } = useSubscription();
  const { createCheckoutSession, isLoading: checkoutLoading } = useStripeCheckout();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const currentPlan = subscription?.plan || 'free';

  const handleUpgrade = async (plan: 'starter' | 'growth' | 'enterprise') => {
    setSelectedPlan(plan);
    await createCheckoutSession(plan, 'monthly');
    setSelectedPlan(null);
  };

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      description: 'Get started with basic features',
      features: [
        '1 Shopify store connection',
        '5 AI videos per month',
        '10 social posts per month',
        'Basic analytics',
        'Email support',
      ],
    },
    {
      id: 'starter',
      name: 'Starter',
      price: 49,
      description: 'For growing businesses',
      features: [
        '3 Shopify store connections',
        '50 AI videos per month',
        'Unlimited social posts',
        'Advanced analytics',
        'Priority support',
        'CJ Dropshipping integration',
      ],
      popular: false,
    },
    {
      id: 'growth',
      name: 'Pro',
      price: 99,
      description: 'For scaling businesses',
      features: [
        '10 Shopify store connections',
        'Unlimited AI videos',
        'Unlimited social posts',
        'Super Grok CEO AI',
        'Autonomous campaigns',
        'White-label options',
        'Priority support',
      ],
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'Business',
      price: 299,
      description: 'For large operations',
      features: [
        'Unlimited store connections',
        'Unlimited everything',
        'Custom AI training',
        'Dedicated account manager',
        'SLA guarantees',
        'Custom integrations',
        'Multi-user RBAC',
        'API access',
      ],
    },
  ];

  if (subLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Status */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${tierColors[currentPlan as keyof typeof tierColors] || tierColors.free}`}>
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Current Plan</CardTitle>
                <CardDescription>
                  {isAdmin ? 'Lifetime Admin Access' : isTrialing ? `Trial - ${trialDaysLeft} days remaining` : 'Active subscription'}
                </CardDescription>
              </div>
            </div>
            <Badge className={`bg-gradient-to-r ${tierColors[currentPlan as keyof typeof tierColors] || tierColors.free} text-white`}>
              {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{planFeatures?.stores || 1}</p>
              <p className="text-sm text-muted-foreground">Stores</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{planFeatures?.videoCredits === -1 ? '∞' : planFeatures?.videoCredits || 5}</p>
              <p className="text-sm text-muted-foreground">Videos/mo</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{planFeatures?.aiCredits === -1 ? '∞' : planFeatures?.aiCredits || 10}</p>
              <p className="text-sm text-muted-foreground">AI Credits</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Options */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan, index) => {
          const Icon = tierIcons[plan.id as keyof typeof tierIcons] || Zap;
          const isCurrentPlan = currentPlan === plan.id;
          const isUpgrade = plans.findIndex(p => p.id === currentPlan) < index;
          
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`relative h-full flex flex-col ${plan.popular ? 'border-primary shadow-lg' : 'border-border/50'} ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                
                <CardHeader className="pb-4">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${tierColors[plan.id as keyof typeof tierColors]} flex items-center justify-center mb-3`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="pt-2">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/mo</span>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-2 flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="pt-4 mt-auto">
                    {isCurrentPlan ? (
                      <Button disabled className="w-full" variant="outline">
                        Current Plan
                      </Button>
                    ) : isUpgrade && plan.id !== 'free' ? (
                      <Button 
                        className="w-full" 
                        onClick={() => handleUpgrade(plan.id as 'starter' | 'growth' | 'enterprise')}
                        disabled={checkoutLoading && selectedPlan === plan.id}
                      >
                        {checkoutLoading && selectedPlan === plan.id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Processing...
                          </>
                        ) : (
                          'Upgrade'
                        )}
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full" disabled>
                        {plan.id === 'free' ? 'Free Forever' : 'Downgrade'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
