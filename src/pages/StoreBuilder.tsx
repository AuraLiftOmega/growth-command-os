import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ExitIntentPopup } from "@/components/storefront/ExitIntentPopup";
import { TimedMobilePopup } from "@/components/storefront/TimedMobilePopup";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Zap, 
  Clock, 
  CheckCircle2,
  ArrowRight,
  Store,
  Sparkles,
  Shield,
  TrendingUp,
  Eye,
  Package,
  Rocket,
  Star,
  Timer,
  Check,
  Play,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";

/**
 * STORE BUILDER LANDING - "Store in 30 Minutes" Positioning
 * 
 * - Speed to outcome focus
 * - LTV-optimized 3-tier pricing
 * - Conversion-focused copy
 * - Kill-shot onboarding entry
 */

const StoreBuilder = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [quickStartData, setQuickStartData] = useState({
    storeName: '',
    industry: ''
  });

  const handleQuickStart = () => {
    if (!quickStartData.storeName.trim()) {
      toast.error("Enter your store name to continue");
      return;
    }
    navigate('/onboarding');
  };

  const plans = [
    {
      tier: 'starter',
      name: "Starter",
      tagline: "Launch with confidence",
      description: "Perfect for new stores ready to go live fast",
      price: billingCycle === 'monthly' ? 29 : 24,
      features: [
        "Up to 25 products",
        "AI content assistance",
        "Professional storefront",
        "Basic SEO setup",
        "Standard templates",
        "Email support"
      ],
      cta: "Start Building",
      popular: false,
      savings: "Replaces $500+ in setup costs"
    },
    {
      tier: 'growth',
      name: "Growth",
      tagline: "Scale with power",
      description: "For growing brands ready to optimize and expand",
      price: billingCycle === 'monthly' ? 79 : 64,
      features: [
        "Up to 500 products",
        "Advanced AI content & SEO",
        "Conversion optimization",
        "Marketing automation",
        "Analytics dashboard",
        "Priority support",
        "A/B testing tools"
      ],
      cta: "Start Growing",
      popular: true,
      savings: "Replaces $2,000+/mo in tools"
    },
    {
      tier: 'scale',
      name: "Scale",
      tagline: "Dominate your market",
      description: "For serious operators ready to maximize revenue",
      price: billingCycle === 'monthly' ? 199 : 159,
      features: [
        "Unlimited products",
        "Advanced optimization AI",
        "Custom integrations",
        "Dedicated success manager",
        "White-label options",
        "API access",
        "Custom analytics",
        "SLA guarantee"
      ],
      cta: "Start Scaling",
      popular: false,
      savings: "Replaces $5,000+/mo in labor"
    }
  ];

  const processSteps = [
    {
      step: 1,
      title: "Tell us about your business",
      description: "2-minute intake captures your industry, products, and goals",
      duration: "~2 min"
    },
    {
      step: 2,
      title: "AI generates your store",
      description: "Our AI creates products, content, and optimized layouts",
      duration: "~10 min"
    },
    {
      step: 3,
      title: "Preview & approve",
      description: "Review everything before anything goes live",
      duration: "~5 min"
    },
    {
      step: 4,
      title: "Launch & sell",
      description: "Go live with a professional, conversion-ready store",
      duration: "Instant"
    }
  ];

  const benefits = [
    {
      icon: Clock,
      title: "30-Minute Setup",
      description: "From zero to launch-ready store in under 30 minutes. No technical skills required."
    },
    {
      icon: Sparkles,
      title: "AI-Powered Content",
      description: "SEO-optimized product descriptions, titles, and metadata generated for you."
    },
    {
      icon: Shield,
      title: "You're Always in Control",
      description: "Preview everything before it goes live. Approve changes with one click."
    },
    {
      icon: TrendingUp,
      title: "Built for Conversions",
      description: "Every layout, element, and flow is optimized to turn visitors into customers."
    },
    {
      icon: Eye,
      title: "Professional Design",
      description: "Premium templates that make your brand look established from day one."
    },
    {
      icon: Package,
      title: "Seamless Fulfillment",
      description: "Connect to Shopify, manage inventory, and process orders effortlessly."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-chart-4 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">DOMINION</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <Link to="/store" className="text-muted-foreground hover:text-foreground transition-colors">Live Demo</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/auth">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-primary hover:bg-primary/90">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-chart-4/10 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
              <Timer className="w-3 h-3 mr-1" />
              Launch in 30 Minutes or Less
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Build Your Professional<br />
              <span className="bg-gradient-to-r from-primary to-chart-4 bg-clip-text text-transparent">
                Online Store
              </span>
              <br />Without the Overwhelm
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              AI-assisted store setup that does the heavy lifting. 
              You focus on your products—we handle the technical complexity.
            </p>

            {/* Quick Start Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-md mx-auto"
            >
              <Card className="bg-card/80 backdrop-blur border-border/50">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="text-left">
                      <Label htmlFor="storeName">What's your store called?</Label>
                      <Input
                        id="storeName"
                        placeholder="My Awesome Store"
                        value={quickStartData.storeName}
                        onChange={(e) => setQuickStartData(prev => ({ ...prev, storeName: e.target.value }))}
                        className="mt-1.5"
                      />
                    </div>
                    <Button 
                      onClick={handleQuickStart}
                      className="w-full bg-primary hover:bg-primary/90"
                      size="lg"
                    >
                      Start Building — It's Free
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      No credit card required • Preview before you publish
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Social Proof Bar */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-16 flex flex-wrap items-center justify-center gap-8 text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full bg-secondary border-2 border-background" />
                ))}
              </div>
              <span className="text-sm">1,200+ stores launched</span>
            </div>
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-sm ml-1">4.9/5 rating</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-chart-2/10 text-chart-2 border-chart-2/20">
              <Rocket className="w-3 h-3 mr-1" />
              Streamlined Process
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              From Zero to Launch in 30 Minutes
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our guided process eliminates the guesswork. AI does the work, you stay in control.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full bg-card/50 backdrop-blur border-border/50 relative overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {step.step}
                      </div>
                      <Badge variant="outline" className="text-xs">{step.duration}</Badge>
                    </div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </CardHeader>
                  {index < processSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                      <ChevronRight className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We handle the complexity so you can focus on what matters—your products and customers.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full bg-card/50 backdrop-blur border-border/50 hover:border-primary/30 transition-colors">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <benefit.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{benefit.title}</CardTitle>
                    <CardDescription className="text-base">
                      {benefit.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-chart-3/10 text-chart-3 border-chart-3/20">
              <Store className="w-3 h-3 mr-1" />
              Simple Pricing
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Plans That Scale With You
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Start free, upgrade when you're ready. No hidden fees, no surprises.
            </p>
            
            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-4 bg-background/50 p-1 rounded-xl border border-border/50">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  billingCycle === 'monthly' 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  billingCycle === 'yearly' 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Yearly
                <Badge className="ml-2 bg-chart-3/10 text-chart-3 border-chart-3/20 text-xs">
                  Save 20%
                </Badge>
              </button>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.tier}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`h-full relative ${
                  plan.popular 
                    ? 'border-primary bg-gradient-to-b from-primary/5 to-transparent' 
                    : 'border-border/50'
                }`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground border-0">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <p className="text-sm text-primary font-medium">{plan.tagline}</p>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-5xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <p className="text-xs text-chart-3 mt-2">{plan.savings}</p>
                  </CardHeader>
                  <CardContent>
                    <Link to="/auth">
                      <Button 
                        className={`w-full mb-6 ${
                          plan.popular 
                            ? 'bg-primary hover:bg-primary/90' 
                            : ''
                        }`}
                        variant={plan.popular ? 'default' : 'outline'}
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-chart-3 flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Launch Your Store?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of merchants who launched professional stores 
              in under 30 minutes. Start building for free.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth">
                <Button size="lg" className="bg-primary hover:bg-primary/90 px-8">
                  Start Building Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/store">
                <Button size="lg" variant="outline" className="px-8">
                  <Play className="mr-2 w-5 h-5" />
                  View Live Demo
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required • Preview before you publish
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-chart-4 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">DOMINION</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link to="/refund" className="hover:text-foreground transition-colors">Refunds</Link>
              <Link to="/shipping" className="hover:text-foreground transition-colors">Shipping</Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} DOMINION. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Exit Intent Popup (Desktop) */}
      <ExitIntentPopup />
      
      {/* Timed Mobile Popup */}
      <TimedMobilePopup delaySeconds={20} />
    </div>
  );
};

export default StoreBuilder;
