/**
 * CEO AGENT PANEL
 * 
 * Autonomous AI CEO that:
 * - Analyzes data and trends
 * - Makes budget/strategy decisions
 * - Creates and runs ads automatically
 * - Optimizes campaigns in real-time
 * - Logs all decisions for transparency
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Zap,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  BarChart3,
  Play,
  Pause,
  Settings,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  Flame,
  Crown,
  Rocket,
  Eye
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface CEODecision {
  id: string;
  type: 'budget' | 'creative' | 'targeting' | 'bid' | 'pause' | 'scale';
  action: string;
  reasoning: string;
  impact: string;
  confidence: number;
  timestamp: Date;
  status: 'pending' | 'executed' | 'failed';
}

interface Campaign {
  id: string;
  name: string;
  platform: string;
  budget: number;
  spend: number;
  revenue: number;
  roas: number;
  status: 'scaling' | 'testing' | 'paused' | 'killed';
  ceoRecommendation: string;
}

interface CEOAgentPanelProps {
  autonomyLevel: number;
  onAutonomyChange: (level: number) => void;
}

export function CEOAgentPanel({ autonomyLevel, onAutonomyChange }: CEOAgentPanelProps) {
  const [isActive, setIsActive] = useState(true);
  const [decisions, setDecisions] = useState<CEODecision[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    { id: '1', name: 'Vitamin C Serum - TikTok', platform: 'tiktok', budget: 100, spend: 78, revenue: 624, roas: 8.0, status: 'scaling', ceoRecommendation: 'Increase budget by 50%' },
    { id: '2', name: 'Retinol Night Cream - Instagram', platform: 'instagram', budget: 75, spend: 52, revenue: 312, roas: 6.0, status: 'scaling', ceoRecommendation: 'Keep current pace' },
    { id: '3', name: 'Hyaluronic Serum - Facebook', platform: 'facebook', budget: 50, spend: 45, revenue: 180, roas: 4.0, status: 'testing', ceoRecommendation: 'Monitor for 24h' },
    { id: '4', name: 'Face Roller Set - Pinterest', platform: 'pinterest', budget: 25, spend: 22, revenue: 44, roas: 2.0, status: 'paused', ceoRecommendation: 'Pause - below threshold' },
  ]);
  const [revenueGoal, setRevenueGoal] = useState(5000);
  const [currentRevenue, setCurrentRevenue] = useState(1160);
  const [autoDecisions, setAutoDecisions] = useState(true);
  const [autoBudget, setAutoBudget] = useState(true);
  const [autoCreative, setAutoCreative] = useState(true);
  const [autoKill, setAutoKill] = useState(true);

  // Simulate CEO agent making decisions
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      const decisionTypes: CEODecision['type'][] = ['budget', 'creative', 'targeting', 'bid', 'scale'];
      const type = decisionTypes[Math.floor(Math.random() * decisionTypes.length)];
      
      const decisions_templates = {
        budget: {
          action: 'Increased TikTok daily budget by $25',
          reasoning: 'ROAS exceeded 6x threshold for 4 consecutive hours',
          impact: '+$180 projected daily revenue'
        },
        creative: {
          action: 'Generated 3 new video variations',
          reasoning: 'Winner creative showing fatigue (CTR dropped 15%)',
          impact: 'Maintain engagement while testing new hooks'
        },
        targeting: {
          action: 'Expanded to Lookalike 1-3% audiences',
          reasoning: 'Core audience CAC increased 20%',
          impact: '-15% CAC expected, +30% reach'
        },
        bid: {
          action: 'Switched to lowest cost bidding',
          reasoning: 'Competition decreased in last 2 hours',
          impact: 'Estimated 18% CPM reduction'
        },
        scale: {
          action: 'Scaling winner campaign to $150/day',
          reasoning: '24hr performance: 7.2x ROAS, <$15 CAC',
          impact: '+$400 daily revenue potential'
        }
      };

      const template = decisions_templates[type];
      
      const newDecision: CEODecision = {
        id: `decision-${Date.now()}`,
        type,
        action: template.action,
        reasoning: template.reasoning,
        impact: template.impact,
        confidence: 75 + Math.floor(Math.random() * 20),
        timestamp: new Date(),
        status: autoDecisions ? 'executed' : 'pending'
      };

      setDecisions(prev => [newDecision, ...prev].slice(0, 50));
      
      if (type === 'budget' || type === 'scale') {
        setCurrentRevenue(prev => prev + Math.floor(Math.random() * 50 + 20));
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [isActive, autoDecisions]);

  const getDecisionIcon = (type: CEODecision['type']) => {
    switch (type) {
      case 'budget': return <DollarSign className="w-4 h-4 text-success" />;
      case 'creative': return <Flame className="w-4 h-4 text-chart-3" />;
      case 'targeting': return <Target className="w-4 h-4 text-primary" />;
      case 'bid': return <TrendingUp className="w-4 h-4 text-chart-2" />;
      case 'pause': return <Pause className="w-4 h-4 text-warning" />;
      case 'scale': return <Rocket className="w-4 h-4 text-success" />;
    }
  };

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'scaling': return 'bg-success/20 text-success';
      case 'testing': return 'bg-primary/20 text-primary';
      case 'paused': return 'bg-warning/20 text-warning';
      case 'killed': return 'bg-destructive/20 text-destructive';
    }
  };

  const handleApproveDecision = (decisionId: string) => {
    setDecisions(prev => prev.map(d =>
      d.id === decisionId ? { ...d, status: 'executed' } : d
    ));
    toast.success('Decision approved and executed!');
  };

  return (
    <div className="space-y-6">
      {/* CEO Agent Header */}
      <Card className="p-6 bg-gradient-to-br from-chart-4/10 to-primary/10 border-chart-4/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-chart-4/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <motion.div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                isActive 
                  ? 'bg-gradient-to-br from-chart-4 to-primary shadow-lg shadow-chart-4/25' 
                  : 'bg-muted'
              }`}
              animate={isActive ? { scale: [1, 1.05, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Brain className={`w-8 h-8 ${isActive ? 'text-white' : 'text-muted-foreground'}`} />
            </motion.div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-display font-bold">CEO AGENT</h2>
                <Badge className={`${isActive ? 'bg-success/20 text-success animate-pulse' : 'bg-muted text-muted-foreground'}`}>
                  {isActive ? 'ACTIVE' : 'PAUSED'}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Autonomous decision-making • {autonomyLevel}% autonomy level
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-success">${currentRevenue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Today's Revenue</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{decisions.filter(d => d.status === 'executed').length}</p>
              <p className="text-xs text-muted-foreground">Decisions Made</p>
            </div>
            <Button
              variant={isActive ? "outline" : "default"}
              size="lg"
              onClick={() => setIsActive(!isActive)}
              className="gap-2"
            >
              {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isActive ? 'Pause Agent' : 'Activate'}
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-12 gap-6">
        {/* Controls Panel */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Autonomy Level */}
          <Card className="p-6">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-chart-4" />
              Autonomy Controls
            </h3>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Autonomy Level</label>
                  <span className="text-sm text-muted-foreground">{autonomyLevel}%</span>
                </div>
                <Slider
                  value={[autonomyLevel]}
                  onValueChange={([val]) => onAutonomyChange(val)}
                  min={0}
                  max={100}
                  step={5}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Higher = more autonomous decisions
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Auto-Execute Decisions</p>
                    <p className="text-xs text-muted-foreground">Run without approval</p>
                  </div>
                  <Switch checked={autoDecisions} onCheckedChange={setAutoDecisions} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Auto Budget Allocation</p>
                    <p className="text-xs text-muted-foreground">Move spend to winners</p>
                  </div>
                  <Switch checked={autoBudget} onCheckedChange={setAutoBudget} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Auto Creative Generation</p>
                    <p className="text-xs text-muted-foreground">Replace fatigued ads</p>
                  </div>
                  <Switch checked={autoCreative} onCheckedChange={setAutoCreative} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Auto Kill Underperformers</p>
                    <p className="text-xs text-muted-foreground">Pause low ROAS campaigns</p>
                  </div>
                  <Switch checked={autoKill} onCheckedChange={setAutoKill} />
                </div>
              </div>
            </div>
          </Card>

          {/* Revenue Goal */}
          <Card className="p-6">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-success" />
              Revenue Goal
            </h3>
            <div className="text-center mb-4">
              <p className="text-4xl font-bold text-success">${currentRevenue.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">of ${revenueGoal.toLocaleString()} daily goal</p>
            </div>
            <Progress value={(currentRevenue / revenueGoal) * 100} className="h-3" />
            <p className="text-xs text-center text-muted-foreground mt-2">
              {Math.round((currentRevenue / revenueGoal) * 100)}% complete
            </p>
          </Card>
        </div>

        {/* Campaigns & Decisions */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Active Campaigns */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-primary" />
                Active Campaigns
              </h3>
              <Badge variant="outline">{campaigns.length} running</Badge>
            </div>

            <div className="space-y-3">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <p className="font-medium">{campaign.name}</p>
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className={`font-bold ${campaign.roas >= 4 ? 'text-success' : campaign.roas >= 2 ? 'text-primary' : 'text-warning'}`}>
                      {campaign.roas.toFixed(1)}x ROAS
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">
                        Spend: ${campaign.spend}/${campaign.budget}
                      </span>
                      <span className="text-success">
                        Revenue: ${campaign.revenue}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground italic">
                      CEO: {campaign.ceoRecommendation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Decision Log */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-chart-4" />
                Decision Log
              </h3>
              <Badge variant="outline">{decisions.length} decisions</Badge>
            </div>

            <ScrollArea className="h-[300px]">
              <AnimatePresence>
                {decisions.map((decision, index) => (
                  <motion.div
                    key={decision.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-muted/30 mb-2"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded-md bg-background">
                        {getDecisionIcon(decision.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{decision.action}</p>
                          <Badge variant={decision.status === 'executed' ? 'default' : 'outline'} className="text-[10px]">
                            {decision.status === 'executed' ? (
                              <><CheckCircle className="w-3 h-3 mr-1" /> Executed</>
                            ) : (
                              <><Clock className="w-3 h-3 mr-1" /> Pending</>
                            )}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {decision.reasoning}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-success">{decision.impact}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {decision.confidence}% confidence
                            </span>
                            {decision.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 text-xs"
                                onClick={() => handleApproveDecision(decision.id)}
                              >
                                Approve
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Import for Megaphone icon (adding here for completeness)
import { Megaphone } from 'lucide-react';
