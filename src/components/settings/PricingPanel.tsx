import { motion } from "framer-motion";
import { Check, Crown, Zap, Rocket, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSubscription, PLAN_FEATURES } from "@/hooks/useSubscription";
import { cn } from "@/lib/utils";

const planIcons = {
  free: Zap,
  starter: Rocket,
  growth: Crown,
  enterprise: Building2,
};

const planColors = {
  free: "from-slate-500/20 to-slate-600/20",
  starter: "from-blue-500/20 to-cyan-500/20",
  growth: "from-amber-500/20 to-orange-500/20",
  enterprise: "from-purple-500/20 to-pink-500/20",
};

export function PricingPanel() {
  const { subscription, isTrialing, trialDaysLeft } = useSubscription();
  const currentPlan = subscription?.plan || "free";

  const plans = Object.entries(PLAN_FEATURES) as [keyof typeof PLAN_FEATURES, typeof PLAN_FEATURES.free][];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Choose Your Plan</h2>
        <p className="text-muted-foreground">
          Scale your ecommerce empire with the right plan
        </p>
        {isTrialing && (
          <Badge className="mt-2 bg-primary/20 text-primary">
            {trialDaysLeft} days left in trial
          </Badge>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map(([planKey, plan], index) => {
          const Icon = planIcons[planKey];
          const isCurrentPlan = currentPlan === planKey;
          const isPopular = planKey === "growth";

          return (
            <motion.div
              key={planKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "relative p-6 rounded-xl border transition-all",
                isCurrentPlan
                  ? "border-primary bg-primary/5"
                  : "border-border/50 hover:border-border",
                isPopular && !isCurrentPlan && "ring-2 ring-primary/50"
              )}
            >
              {isPopular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                  Most Popular
                </Badge>
              )}

              <div className={`p-3 rounded-xl bg-gradient-to-br ${planColors[planKey]} w-fit mb-4`}>
                <Icon className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
              
              <div className="flex items-baseline gap-1 mb-4">
                {plan.price === 0 ? (
                  <span className="text-3xl font-bold">Free</span>
                ) : (
                  <>
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/mo</span>
                  </>
                )}
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={isCurrentPlan ? "outline" : isPopular ? "default" : "secondary"}
                disabled={isCurrentPlan}
              >
                {isCurrentPlan ? "Current Plan" : "Upgrade"}
              </Button>
            </motion.div>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground mt-6">
        All plans include 14-day free trial. No credit card required to start.
      </p>
    </motion.div>
  );
}
