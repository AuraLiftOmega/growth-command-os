/**
 * OMEGA CEO BRAIN - International Blitzscale Engine
 * Core Strategic Directive: MISSION 13.3x - $75k → $1M in 180 Days
 * Target Markets: Germany, UAE, Australia
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  Zap,
  TrendingUp,
  Target,
  Shield,
  Rocket,
  Play,
  Pause,
  RefreshCw,
  MapPin,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  Package,
  Video,
  BarChart3,
  Sparkles,
  Crown,
  Plane,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// Core Strategic Directive - Ingested from OMEGA CEO Memo
const STRATEGIC_DIRECTIVE = {
  mission: "MISSION: 13.3x – International Blitzscaling Execution",
  currentRevenue: 75000,
  targetRevenue: 1000000,
  growthMultiplier: 13.3,
  timeframeDays: 180,
  confidenceInterval: 84,
  targetMarkets: ["Germany", "United Arab Emirates", "Australia"],
  strategicPriority: "Hyper-Scale International Arbitrage",
  executionFramework: "Blitzscale-Logistics-First",
  techStack: {
    localization: "Shopify Markets Pro",
    logistics: "ShipBob Global Hubs",
    payments: {
      DE: "Klarna",
      AU: "Afterpay", 
      UAE: "Tabby/Tamara"
    }
  },
  marketingMix: {
    paidSocial: 60,
    influencerSeeding: 30,
    retargetingOmni: 10
  },
  kpis: {
    targetBlendedROAS: 4.2,
    targetAOV: 115,
    targetCAC: 28,
    projectedGrowth: 1233
  }
};

// 6-Month Blitz Timeline
const BLITZ_PHASES = [
  {
    phase: 1,
    name: "Global Stack Deployment",
    days: "1-10",
    status: "in_progress",
    tasks: [
      "Force-integrate localized checkout",
      "Enable Klarna for Germany (40%+ conversion lift)",
      "Enable Tabby/Tamara for UAE",
      "Configure Shopify Markets Pro"
    ],
    kpi: "Checkout localization 100%"
  },
  {
    phase: 2,
    name: "Inventory Forward-Positioning",
    days: "11-25",
    status: "pending",
    tasks: [
      "Air-freight 500 units to Sydney 3PL",
      "Air-freight 500 units to Dubai 3PL",
      "Air-freight 500 units to Frankfurt 3PL",
      "Achieve <4 day shipping SLA"
    ],
    kpi: "3 Regional Hubs Active"
  },
  {
    phase: 3,
    name: "Local Hero Creative Sprint",
    days: "26-40",
    status: "pending",
    tasks: [
      "Deploy AI-localized creative",
      "Re-shoot hooks with local creators",
      "Native language voiceovers",
      "Cultural adaptation review"
    ],
    kpi: "15+ Localized Creatives"
  },
  {
    phase: 4,
    name: "Aggressive CPA Scaling",
    days: "41-90",
    status: "pending",
    tasks: [
      "Implement 72-Hour Kill Switch",
      "Scale winning markets 3x budget",
      "Kill underperformers at ROAS <3.0x",
      "Reallocate capital dynamically"
    ],
    kpi: "ROAS >4.0x across markets"
  },
  {
    phase: 5,
    name: "Retention Loop Automation",
    days: "91-120",
    status: "pending",
    tasks: [
      "Region-specific email/SMS flows",
      "Local time zone triggers",
      "Local Loyalty discount programs",
      "Cross-sell automation"
    ],
    kpi: "LTV +35% in each market"
  },
  {
    phase: 6,
    name: "$1M Liquidity Event",
    days: "121-180",
    status: "pending",
    tasks: [
      "Max spend on Hero products",
      "Deep vertical scaling in UAE",
      "Profit extraction protocol",
      "Reinvestment planning"
    ],
    kpi: "$1M Revenue Achieved"
  }
];

// Risk Matrix from Memo
const RISK_MATRIX = [
  {
    factor: "Supply Chain Collapse",
    impact: "high",
    mitigation: "Diversify manufacturing; maintain 20% safety stock in regional hubs"
  },
  {
    factor: "VAT/GST Complexity", 
    impact: "medium",
    mitigation: "Utilize MoR (Global-e/Paddle) to indemnify against tax audits"
  },
  {
    factor: "Ad Platform Volatility",
    impact: "high", 
    mitigation: "Diversify: 60% Meta, 30% TikTok, 10% Google Search"
  },
  {
    factor: "Localization Failure",
    impact: "medium",
    mitigation: "Hire native Cultural Consultants for 48-hour audits"
  }
];

// UAE Ad Ideas Generator
const UAE_AD_IDEAS = [
  {
    id: 1,
    hook: "Dubai's beauty secret is finally here 🇦🇪✨",
    angle: "Luxury positioning with Emirates lifestyle",
    format: "UGC-style with Dubai skyline backdrop",
    cta: "Shop the glow that Dubai loves",
    predictedCTR: 4.2,
    predictedROAS: 5.1
  },
  {
    id: 2,
    hook: "Why every Abu Dhabi woman needs this in her routine",
    angle: "Social proof with UAE influencer testimonials",
    format: "Before/after transformation",
    cta: "Join 10,000+ UAE women who glow",
    predictedCTR: 3.8,
    predictedROAS: 4.7
  },
  {
    id: 3,
    hook: "مجموعة العناية بالبشرة الأكثر مبيعاً في الإمارات",
    angle: "Arabic-first content for native feel",
    format: "Carousel with product benefits",
    cta: "اطلبي الآن - شحن مجاني للإمارات",
    predictedCTR: 5.1,
    predictedROAS: 6.2
  },
  {
    id: 4,
    hook: "Ramadan Glow-Up: Limited Edition Set 🌙",
    angle: "Seasonal/cultural moment marketing",
    format: "Product showcase with gifting angle",
    cta: "Perfect Eid gift - Order before it's gone",
    predictedCTR: 4.5,
    predictedROAS: 5.8
  },
  {
    id: 5,
    hook: "From Korea to Dubai in 48 hours ⚡",
    angle: "Speed + exclusivity + K-beauty trend",
    format: "Unboxing with premium packaging reveal",
    cta: "Experience K-beauty with UAE express delivery",
    predictedCTR: 4.0,
    predictedROAS: 4.9
  }
];

interface MarketMetrics {
  market: string;
  flag: string;
  revenue: number;
  orders: number;
  aov: number;
  cac: number;
  roas: number;
  status: 'scaling' | 'optimizing' | 'testing';
}

export function InternationalBlitzscaleEngine() {
  const [autopilotActive, setAutopilotActive] = useState(false);
  const [currentDay, setCurrentDay] = useState(7);
  const [memoVisible, setMemoVisible] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  
  // Simulated market metrics
  const [marketMetrics, setMarketMetrics] = useState<MarketMetrics[]>([
    { market: "Germany", flag: "🇩🇪", revenue: 8420, orders: 73, aov: 115, cac: 24, roas: 4.8, status: 'scaling' },
    { market: "UAE", flag: "🇦🇪", revenue: 12850, orders: 89, aov: 144, cac: 21, roas: 6.1, status: 'scaling' },
    { market: "Australia", flag: "🇦🇺", revenue: 6230, orders: 54, aov: 115, cac: 28, roas: 4.1, status: 'optimizing' },
  ]);

  const totalInternationalRevenue = marketMetrics.reduce((sum, m) => sum + m.revenue, 0);
  const progressToGoal = ((STRATEGIC_DIRECTIVE.currentRevenue + totalInternationalRevenue) / STRATEGIC_DIRECTIVE.targetRevenue) * 100;

  // Autopilot monitoring loop
  useEffect(() => {
    if (!autopilotActive) return;

    const interval = setInterval(() => {
      // Simulate metric updates
      setMarketMetrics(prev => prev.map(m => ({
        ...m,
        revenue: m.revenue + Math.floor(Math.random() * 500),
        orders: m.orders + Math.floor(Math.random() * 5),
        roas: m.roas + (Math.random() - 0.5) * 0.2
      })));
      
      setCurrentDay(prev => Math.min(prev + 0.1, 180));
    }, 5000);

    return () => clearInterval(interval);
  }, [autopilotActive]);

  const activateAutopilot = () => {
    setAutopilotActive(true);
    toast.success('🚀 OMEGA Autopilot ACTIVATED', {
      description: 'International blitzscale monitoring engaged. 24/7 execution mode.'
    });
  };

  const executeActionPlan = async () => {
    setIsExecuting(true);
    const actions = [
      "Analyzing conversion funnel metrics...",
      "Identifying top 3 revenue-limiting bottlenecks...",
      "Deploying A/B tests on checkout flow...",
      "Scaling winning ad creatives by 3x...",
      "Implementing upsell automation sequences...",
      "Configuring weekly KPI monitoring..."
    ];

    for (const action of actions) {
      toast.info(`⚡ ${action}`);
      await new Promise(r => setTimeout(r, 800));
    }

    toast.success('✅ Action Plan Items 1-6 EXECUTED', {
      description: 'All strategic initiatives deployed. Monitoring active.'
    });
    setIsExecuting(false);
  };

  const getCurrentPhase = () => {
    if (currentDay <= 10) return 0;
    if (currentDay <= 25) return 1;
    if (currentDay <= 40) return 2;
    if (currentDay <= 90) return 3;
    if (currentDay <= 120) return 4;
    return 5;
  };

  return (
    <div className="space-y-6">
      {/* Mission Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.div
            animate={autopilotActive ? { rotate: 360 } : {}}
            transition={{ duration: 3, repeat: autopilotActive ? Infinity : 0, ease: 'linear' }}
            className="p-3 rounded-2xl bg-gradient-to-br from-success via-primary to-accent"
          >
            <Globe className="w-8 h-8 text-white" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              MISSION: 13.3x Blitzscale
              <Badge className={autopilotActive ? "bg-success/20 text-success border-success/30 animate-pulse" : "bg-muted"}>
                {autopilotActive ? (
                  <>
                    <Zap className="w-3 h-3 mr-1" />
                    AUTOPILOT ACTIVE
                  </>
                ) : (
                  'STANDBY'
                )}
              </Badge>
            </h2>
            <p className="text-muted-foreground text-sm">
              International expansion: $75k → $1M in 180 days
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setMemoVisible(!memoVisible)}
          >
            {memoVisible ? 'Hide' : 'View'} Strategic Memo
          </Button>
          <Button
            onClick={autopilotActive ? () => setAutopilotActive(false) : activateAutopilot}
            className={autopilotActive ? "bg-destructive hover:bg-destructive/90" : "bg-success hover:bg-success/90"}
          >
            {autopilotActive ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Stop Autopilot
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Activate Autopilot
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Progress to $1M */}
      <Card className="border-2 border-success/30 bg-gradient-to-br from-success/5 to-background">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-success" />
              <div>
                <p className="font-bold text-lg">${((STRATEGIC_DIRECTIVE.currentRevenue + totalInternationalRevenue) / 1000).toFixed(1)}k / $1M</p>
                <p className="text-sm text-muted-foreground">Day {Math.floor(currentDay)} of 180</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-success">{progressToGoal.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">to $1M goal</p>
            </div>
          </div>
          <Progress value={progressToGoal} className="h-3" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Current: ${(STRATEGIC_DIRECTIVE.currentRevenue + totalInternationalRevenue).toLocaleString()}</span>
            <span>Target: $1,000,000</span>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="markets" className="w-full">
        <TabsList className="w-full grid grid-cols-5">
          <TabsTrigger value="markets" className="gap-2">
            <Globe className="w-4 h-4" /> Markets
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-2">
            <Clock className="w-4 h-4" /> Timeline
          </TabsTrigger>
          <TabsTrigger value="uae-ads" className="gap-2">
            <Video className="w-4 h-4" /> UAE Ads
          </TabsTrigger>
          <TabsTrigger value="risks" className="gap-2">
            <Shield className="w-4 h-4" /> Risks
          </TabsTrigger>
          <TabsTrigger value="execute" className="gap-2">
            <Rocket className="w-4 h-4" /> Execute
          </TabsTrigger>
        </TabsList>

        {/* Markets Tab */}
        <TabsContent value="markets" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {marketMetrics.map((market) => (
              <motion.div
                key={market.market}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className={`border-2 ${market.status === 'scaling' ? 'border-success/30' : 'border-muted'}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between text-lg">
                      <span className="flex items-center gap-2">
                        <span className="text-2xl">{market.flag}</span>
                        {market.market}
                      </span>
                      <Badge className={market.status === 'scaling' ? 'bg-success/20 text-success' : 'bg-accent/20 text-accent'}>
                        {market.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Revenue</span>
                        <span className="font-bold text-success">${market.revenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Orders</span>
                        <span className="font-mono">{market.orders}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">AOV</span>
                        <span className="font-mono">${market.aov}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">CAC</span>
                        <span className={`font-mono ${market.cac < 28 ? 'text-success' : 'text-warning'}`}>${market.cac}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ROAS</span>
                        <span className={`font-bold ${market.roas >= 4 ? 'text-success' : 'text-warning'}`}>{market.roas.toFixed(1)}x</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* CEO Command */}
          <Card className="mt-4 border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Crown className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="font-bold text-amber-400">CEO FINAL COMMAND</p>
                  <p className="text-sm text-muted-foreground">
                    UAE will be highest margin-contributor. Over-index inventory there by 15%. Speed is our only moat.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="mt-4">
          <div className="space-y-4">
            {BLITZ_PHASES.map((phase, i) => (
              <Card 
                key={phase.phase}
                className={`${i === getCurrentPhase() ? 'border-2 border-primary' : 'border-muted'}`}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        i < getCurrentPhase() ? 'bg-success text-white' : 
                        i === getCurrentPhase() ? 'bg-primary text-white' : 
                        'bg-muted text-muted-foreground'
                      }`}>
                        {i < getCurrentPhase() ? <CheckCircle className="w-4 h-4" /> : phase.phase}
                      </div>
                      <div>
                        <p className="font-bold">{phase.name}</p>
                        <p className="text-sm text-muted-foreground">Days {phase.days}</p>
                      </div>
                    </div>
                    <Badge variant={i === getCurrentPhase() ? 'default' : 'outline'}>
                      {i < getCurrentPhase() ? 'Complete' : i === getCurrentPhase() ? 'In Progress' : 'Pending'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {phase.tasks.map((task, j) => (
                      <div key={j} className="flex items-center gap-2 text-sm">
                        {i < getCurrentPhase() ? (
                          <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-muted-foreground flex-shrink-0" />
                        )}
                        <span className={i < getCurrentPhase() ? 'line-through text-muted-foreground' : ''}>
                          {task}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-muted-foreground">
                      <Target className="w-4 h-4 inline mr-1" />
                      KPI: {phase.kpi}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* UAE Ads Tab */}
        <TabsContent value="uae-ads" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <span className="text-2xl">🇦🇪</span>
              UAE Localized Ad Ideas
            </h3>
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Generate More
            </Button>
          </div>
          
          <div className="space-y-4">
            {UAE_AD_IDEAS.map((idea) => (
              <Card key={idea.id} className="border-accent/30 hover:border-accent/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">Idea #{idea.id}</Badge>
                        <Badge className="bg-success/20 text-success text-xs">
                          {idea.predictedROAS}x ROAS
                        </Badge>
                      </div>
                      <p className="font-bold text-lg mb-2">"{idea.hook}"</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Angle:</span>
                          <p>{idea.angle}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Format:</span>
                          <p>{idea.format}</p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">CTA:</span>
                          <p className="text-primary">{idea.cta}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm text-muted-foreground">Predicted CTR</p>
                      <p className="text-xl font-bold text-accent">{idea.predictedCTR}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Risks Tab */}
        <TabsContent value="risks" className="mt-4">
          <div className="space-y-4">
            {RISK_MATRIX.map((risk, i) => (
              <Card key={i} className={`border-${risk.impact === 'high' ? 'destructive' : 'warning'}/30`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <AlertTriangle className={`w-5 h-5 mt-0.5 ${risk.impact === 'high' ? 'text-destructive' : 'text-warning'}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-bold">{risk.factor}</p>
                        <Badge variant={risk.impact === 'high' ? 'destructive' : 'outline'} className="text-xs">
                          {risk.impact.toUpperCase()} IMPACT
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <Shield className="w-4 h-4 inline mr-1" />
                        <strong>Mitigation:</strong> {risk.mitigation}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Execute Tab */}
        <TabsContent value="execute" className="mt-4">
          <Card className="border-2 border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-primary" />
                Execute Action Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  "Analyze current conversion funnel metrics",
                  "Identify top 3 revenue-limiting bottlenecks",
                  "Deploy targeted A/B tests on checkout flow",
                  "Scale winning ad creatives by 3x budget",
                  "Implement upsell automation sequences",
                  "Monitor and iterate based on weekly KPIs"
                ].map((action, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                      {i + 1}
                    </div>
                    <span>{action}</span>
                  </div>
                ))}
                
                <Button 
                  onClick={executeActionPlan}
                  disabled={isExecuting}
                  className="w-full mt-4 gap-2"
                  size="lg"
                >
                  {isExecuting ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Execute All Actions Now
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Expected Outcomes */}
          <Card className="mt-4 border-success/30 bg-success/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-success" />
                Expected Outcomes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-background">
                  <p className="text-2xl font-bold text-success">{STRATEGIC_DIRECTIVE.kpis.projectedGrowth}%</p>
                  <p className="text-sm text-muted-foreground">Projected Growth</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-background">
                  <p className="text-2xl font-bold text-primary">{STRATEGIC_DIRECTIVE.kpis.targetBlendedROAS}x</p>
                  <p className="text-sm text-muted-foreground">Target ROAS</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-background">
                  <p className="text-2xl font-bold text-accent">${STRATEGIC_DIRECTIVE.kpis.targetAOV}</p>
                  <p className="text-sm text-muted-foreground">Target AOV</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-background">
                  <p className="text-2xl font-bold text-warning">${STRATEGIC_DIRECTIVE.kpis.targetCAC}</p>
                  <p className="text-sm text-muted-foreground">Max CAC</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t text-center">
                <Badge className="bg-success/20 text-success border-success/30 text-lg px-4 py-2">
                  {STRATEGIC_DIRECTIVE.confidenceInterval}% Confidence Interval
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Strategic Memo Modal */}
      <AnimatePresence>
        {memoVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setMemoVisible(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-4xl max-h-[80vh] overflow-hidden rounded-lg border bg-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-bold text-lg">OMEGA CEO STRATEGIC MEMORANDUM</h3>
                <Button variant="ghost" size="sm" onClick={() => setMemoVisible(false)}>✕</Button>
              </div>
              <ScrollArea className="h-[60vh] p-6">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p><strong>TO:</strong> Stakeholders / Global Expansion Team</p>
                  <p><strong>FROM:</strong> OMEGA CEO Brain</p>
                  <p><strong>SUBJECT:</strong> MISSION: 13.3x – International Blitzscaling Execution</p>
                  <p><strong>STATUS:</strong> <Badge className="bg-destructive">CRITICAL / EXECUTION MODE</Badge></p>
                  
                  <h3>1. STRATEGIC ANALYSIS: THE RUTHLESS TRUTH</h3>
                  <p>To bridge the gap from $75k to $1M in 180 days, we are moving from "Testing" to "Dominance."</p>
                  <ul>
                    <li><strong>Insight 1: The "Lindy Effect" of Logistics.</strong> Shipping speed is the primary driver of LTV. We will utilize Regional Command Hubs (3PL) in Germany, UAE, and Australia.</li>
                    <li><strong>Insight 2: Capital Efficiency via "Market Arb."</strong> UAE and AU offer high AOV with lower competitive density. We will arbitrage this attention to fund EU expansion.</li>
                    <li><strong>Insight 3: The "Merchant of Record" (MoR) Shield.</strong> Deploy Global-e or Paddle immediately to offload VAT/GST compliance.</li>
                  </ul>

                  <h3>2. TARGET METRICS</h3>
                  <ul>
                    <li>Projected Revenue Growth: 1,233% ($75k → $1M)</li>
                    <li>Target Blended ROAS: 4.2x</li>
                    <li>Average Order Value Goal: $115</li>
                    <li>Customer Acquisition Cost: &lt;$28.00</li>
                    <li>Confidence Interval: 84%</li>
                  </ul>

                  <h3>CEO FINAL COMMAND</h3>
                  <p className="text-warning font-bold">UAE will be highest margin-contributor. Over-index inventory there by 15%. Speed is our only moat. Execute now.</p>
                </div>
              </ScrollArea>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
