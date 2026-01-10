/**
 * OMEGA CEO MEGA BRAIN - Self-Thinking CEO Agent
 * Real AI-powered strategic decision engine with Monte Carlo simulations
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Sparkles,
  Send,
  Loader2,
  TrendingUp,
  Target,
  Zap,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  LineChart,
  Rocket,
  Shield,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface CEOResponse {
  strategy: {
    query: string;
    generatedAt: string;
    model: string;
    confidence: number;
  };
  reasoning: string;
  actionPlan: string[];
  riskAssessment: string;
  profitPrediction: {
    simulation: {
      mean: number;
      median: number;
      p10: number;
      p90: number;
    };
    projectedGrowth: string;
    confidenceInterval: string;
  };
}

interface HistoryItem {
  query: string;
  response: CEOResponse;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  { label: "Scale to $1M", prompt: "How do I scale my sales to $1M in the next 6 months?" },
  { label: "Reduce CAC", prompt: "Reduce my customer acquisition cost by 40%" },
  { label: "Market Expansion", prompt: "Expand into 3 new international markets" },
  { label: "Profit Margins", prompt: "Increase profit margins by 25% this quarter" },
];

export function OmegaCEOBrain() {
  const [query, setQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingStage, setThinkingStage] = useState('');
  const [progress, setProgress] = useState(0);
  const [currentResponse, setCurrentResponse] = useState<CEOResponse | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copied, setCopied] = useState(false);

  const thinkingStages = [
    'Analyzing market conditions...',
    'Running Monte Carlo simulations...',
    'Evaluating competitive landscape...',
    'Synthesizing strategic options...',
    'Optimizing action plan...',
    'Finalizing recommendations...',
  ];

  const executeCEOQuery = useCallback(async (queryText: string) => {
    if (!queryText.trim() || isThinking) return;

    setIsThinking(true);
    setProgress(0);
    setCurrentResponse(null);

    // Animate through thinking stages
    const stageInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = Math.min(prev + 15, 85);
        const stageIndex = Math.floor((newProgress / 100) * thinkingStages.length);
        setThinkingStage(thinkingStages[Math.min(stageIndex, thinkingStages.length - 1)]);
        return newProgress;
      });
    }, 500);

    try {
      const { data, error } = await supabase.functions.invoke('omega-ceo-brain', {
        body: {
          action: 'strategize',
          query: queryText,
          context: {
            currentRevenue: 75000,
            targetRevenue: 1000000,
            timeframe: '6 months',
            industry: 'ecommerce',
          },
        },
      });

      clearInterval(stageInterval);
      setProgress(100);
      setThinkingStage('Strategy complete!');

      if (error) throw error;

      if (data?.success && data?.data) {
        const response = data.data as CEOResponse;
        setCurrentResponse(response);
        setHistory(prev => [{
          query: queryText,
          response,
          timestamp: new Date(),
        }, ...prev].slice(0, 10));
        
        toast.success('CEO Brain strategy generated!');
      } else {
        throw new Error(data?.error || 'Failed to generate strategy');
      }
    } catch (err) {
      clearInterval(stageInterval);
      console.error('CEO Brain error:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to process query');
    } finally {
      setIsThinking(false);
      setQuery('');
    }
  }, [isThinking]);

  const copyStrategy = () => {
    if (!currentResponse) return;
    
    const text = `
OMEGA CEO BRAIN STRATEGY
========================
Query: ${currentResponse.strategy.query}
Generated: ${currentResponse.strategy.generatedAt}
Confidence: ${(currentResponse.strategy.confidence * 100).toFixed(0)}%

STRATEGIC ANALYSIS:
${currentResponse.reasoning}

ACTION PLAN:
${currentResponse.actionPlan.join('\n')}

RISK ASSESSMENT:
${currentResponse.riskAssessment}

PROFIT PREDICTION:
- Projected Growth: ${currentResponse.profitPrediction.projectedGrowth}
- Confidence Interval: ${currentResponse.profitPrediction.confidenceInterval}
- Expected Revenue Range: $${currentResponse.profitPrediction.simulation.p10.toFixed(0)} - $${currentResponse.profitPrediction.simulation.p90.toFixed(0)}
    `.trim();
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Strategy copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ rotate: isThinking ? 360 : 0 }}
            transition={{ duration: 2, repeat: isThinking ? Infinity : 0, ease: 'linear' }}
            className="p-3 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary"
          >
            <Brain className="w-8 h-8 text-white" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              OMEGA CEO Brain
              <Badge className="bg-success/20 text-success border-success/30">
                <Zap className="w-3 h-3 mr-1" />
                LIVE
              </Badge>
            </h2>
            <p className="text-muted-foreground text-sm">
              Self-thinking CEO agent with quantum-level profit predictions
            </p>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
        <CardContent className="p-6">
          <div className="flex gap-3">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask the CEO Brain anything... (e.g., 'Scale my business to $1M')"
              className="flex-1 h-12 text-lg bg-background/50"
              onKeyDown={(e) => e.key === 'Enter' && executeCEOQuery(query)}
              disabled={isThinking}
            />
            <Button
              onClick={() => executeCEOQuery(query)}
              disabled={!query.trim() || isThinking}
              size="lg"
              className="h-12 px-6 gap-2"
            >
              {isThinking ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Rocket className="w-5 h-5" />
                  Execute
                </>
              )}
            </Button>
          </div>

          {/* Quick Prompts */}
          <div className="flex flex-wrap gap-2 mt-4">
            {QUICK_PROMPTS.map((qp, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => executeCEOQuery(qp.prompt)}
                disabled={isThinking}
              >
                <Sparkles className="w-3 h-3" />
                {qp.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Thinking Animation */}
      <AnimatePresence>
        {isThinking && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-accent/50 bg-accent/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="p-2 rounded-xl bg-accent/20"
                  >
                    <Brain className="w-6 h-6 text-accent" />
                  </motion.div>
                  <div className="flex-1">
                    <p className="font-medium">{thinkingStage}</p>
                    <p className="text-sm text-muted-foreground">
                      Processing with multi-model AI chain
                    </p>
                  </div>
                  <span className="text-sm font-mono text-accent">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Response Display */}
      <AnimatePresence>
        {currentResponse && !isThinking && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Strategy Header */}
            <Card className="border-success/30 bg-gradient-to-br from-success/5 to-background">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="w-5 h-5 text-success" />
                    Strategic Response
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-success/50 text-success">
                      {(currentResponse.strategy.confidence * 100).toFixed(0)}% Confidence
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyStrategy}
                      className="gap-1"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      Copy
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap text-sm">{currentResponse.reasoning}</p>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Action Plan */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Action Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentResponse.actionPlan.map((action, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                        {i + 1}
                      </div>
                      <span className="text-sm">{action.replace(/^\d+\.\s*/, '')}</span>
                      <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Risk & Predictions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Risk Assessment */}
              <Card className="border-warning/30">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Shield className="w-5 h-5 text-warning" />
                    Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {currentResponse.riskAssessment}
                  </p>
                </CardContent>
              </Card>

              {/* Profit Prediction */}
              <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-background">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <LineChart className="w-5 h-5 text-accent" />
                    Profit Prediction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Projected Growth</span>
                      <Badge className="bg-accent/20 text-accent border-accent/30">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {currentResponse.profitPrediction.projectedGrowth}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Confidence Range</span>
                      <span className="text-sm font-mono">
                        {currentResponse.profitPrediction.confidenceInterval}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Revenue Range</span>
                      <span className="text-sm font-mono">
                        ${currentResponse.profitPrediction.simulation.p10.toLocaleString()} - ${currentResponse.profitPrediction.simulation.p90.toLocaleString()}
                      </span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <BarChart3 className="w-3 h-3" />
                        Based on 1,000 Monte Carlo simulations
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History */}
      {history.length > 0 && !currentResponse && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Queries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {history.slice(0, 5).map((item, i) => (
                <div
                  key={i}
                  onClick={() => setCurrentResponse(item.response)}
                  className="p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                >
                  <p className="text-sm font-medium truncate">{item.query}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
