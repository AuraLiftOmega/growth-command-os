import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Zap, 
  Play, 
  BarChart3, 
  Workflow,
  Search,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Rocket
} from "lucide-react";

interface Simulation {
  id: string;
  simulation_type: string;
  target_profit: number;
  simulated_profit: number;
  confidence_level: number;
  iterations: number;
  results: Record<string, unknown>;
  status: string;
  created_at: string;
}

interface WorkflowExecution {
  id: string;
  workflow_type: string;
  workflow_name: string;
  status: string;
  output_data: Record<string, unknown>;
  execution_time_ms: number;
  created_at: string;
}

export function ProfitGuaranteeEngine() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowExecution[]>([]);
  const [currentSimulation, setCurrentSimulation] = useState<{
    analysis?: {
      expectedProfit: number;
      successProbability: number;
      confidenceInterval: { low: number; high: number };
      recommendation: string;
    };
    guarantee?: {
      guaranteedAmount: number;
      confidence: string;
      timeframe: string;
      strategies: string[];
      canGuarantee: boolean;
      achievableTarget: number;
    };
  } | null>(null);
  const [marketResearch, setMarketResearch] = useState<{
    source: string;
    research: {
      insights?: string;
      trends?: string[];
      opportunities?: string[];
      citations?: string[];
    };
  } | null>(null);
  
  // Simulation parameters
  const [baseRevenue, setBaseRevenue] = useState(10000);
  const [growthRate, setGrowthRate] = useState(5);
  const [costs, setCosts] = useState(5000);
  const [targetProfit, setTargetProfit] = useState(100000);
  const [researchQuery, setResearchQuery] = useState("US skincare market trends 2025");

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [simsResponse, workflowsResponse] = await Promise.all([
        supabase.functions.invoke('profit-guarantee-engine', {
          body: { action: 'get_simulations', params: { limit: 10 }, userId: user?.id }
        }),
        supabase.functions.invoke('profit-guarantee-engine', {
          body: { action: 'get_workflows', params: { limit: 20 }, userId: user?.id }
        })
      ]);

      if (simsResponse.data?.simulations) {
        setSimulations(simsResponse.data.simulations);
      }
      if (workflowsResponse.data?.workflows) {
        setWorkflows(workflowsResponse.data.workflows);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const runSimulation = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke('profit-guarantee-engine', {
        body: {
          action: 'run_simulation',
          params: {
            baseRevenue,
            growthRate: growthRate / 100,
            costs,
            iterations: 10000,
            months: 12
          },
          userId: user.id
        }
      });

      if (response.error) throw response.error;
      
      setCurrentSimulation(response.data);
      await loadData();
      
      toast({
        title: "Simulation Complete",
        description: `Expected profit: $${response.data.analysis.expectedProfit.toLocaleString()}`
      });
    } catch (error) {
      toast({
        title: "Simulation Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const guaranteeProfit = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke('profit-guarantee-engine', {
        body: {
          action: 'guarantee_profit',
          params: {
            currentRevenue: baseRevenue,
            targetGrowthRate: growthRate / 100,
            operatingCosts: costs,
            targetProfit,
            timeframeMonths: 12
          },
          userId: user.id
        }
      });

      if (response.error) throw response.error;
      
      setCurrentSimulation(response.data);
      await loadData();
      
      const guarantee = response.data.guarantee;
      toast({
        title: guarantee.canGuarantee ? "✅ Profit Guaranteed!" : "⚠️ Target Needs Adjustment",
        description: `Achievable: $${guarantee.achievableTarget.toLocaleString()} with ${guarantee.confidence} confidence`
      });
    } catch (error) {
      toast({
        title: "Guarantee Analysis Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runMarketResearch = async () => {
    if (!user || !researchQuery) return;
    
    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke('profit-guarantee-engine', {
        body: {
          action: 'market_research',
          params: { query: researchQuery },
          userId: user.id
        }
      });

      if (response.error) throw response.error;
      
      setMarketResearch(response.data);
      
      toast({
        title: "Research Complete",
        description: `Found insights from ${response.data.source === 'perplexity' ? 'Perplexity AI' : 'Lovable AI'}`
      });
    } catch (error) {
      toast({
        title: "Research Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const executeWorkflow = async (workflowType: string) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke('profit-guarantee-engine', {
        body: {
          action: 'execute_workflow',
          params: {
            workflowType,
            workflowName: workflowType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            inputData: { timestamp: new Date().toISOString() }
          },
          userId: user.id
        }
      });

      if (response.error) throw response.error;
      
      await loadData();
      
      toast({
        title: "Workflow Executed",
        description: `${workflowType} completed in ${response.data.execution?.execution_time_ms}ms`
      });
    } catch (error) {
      toast({
        title: "Workflow Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-green-500" />
            Profit Guarantee Engine
          </h2>
          <p className="text-muted-foreground">
            Monte Carlo simulations, market research & workflow automation
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            <Shield className="h-3 w-3 mr-1" />
            95% Confidence
          </Badge>
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="simulator" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="simulator" className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4" />
            Simulator
          </TabsTrigger>
          <TabsTrigger value="guarantee" className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            Guarantee
          </TabsTrigger>
          <TabsTrigger value="research" className="flex items-center gap-1">
            <Search className="h-4 w-4" />
            Research
          </TabsTrigger>
          <TabsTrigger value="workflows" className="flex items-center gap-1">
            <Workflow className="h-4 w-4" />
            Workflows
          </TabsTrigger>
        </TabsList>

        {/* Simulator Tab */}
        <TabsContent value="simulator" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Monte Carlo Simulation
                </CardTitle>
                <CardDescription>
                  Run 10,000+ iterations to predict profit outcomes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Base Monthly Revenue ($)</Label>
                    <Input
                      type="number"
                      value={baseRevenue}
                      onChange={(e) => setBaseRevenue(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Growth Rate (%)</Label>
                    <Input
                      type="number"
                      value={growthRate}
                      onChange={(e) => setGrowthRate(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Monthly Costs ($)</Label>
                    <Input
                      type="number"
                      value={costs}
                      onChange={(e) => setCosts(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Timeframe</Label>
                    <Input value="12 months" disabled />
                  </div>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={runSimulation}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Run Simulation
                </Button>
              </CardContent>
            </Card>

            {/* Results Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Simulation Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentSimulation?.analysis ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Expected Profit</p>
                        <p className="text-2xl font-bold text-green-500">
                          ${currentSimulation.analysis.expectedProfit.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Success Rate</p>
                        <p className="text-2xl font-bold text-blue-500">
                          {currentSimulation.analysis.successProbability.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">95% Confidence Range</p>
                      <div className="flex items-center justify-between">
                        <span className="text-red-400">
                          ${currentSimulation.analysis.confidenceInterval.low.toLocaleString()}
                        </span>
                        <Progress 
                          value={currentSimulation.analysis.successProbability} 
                          className="w-32 mx-4"
                        />
                        <span className="text-green-400">
                          ${currentSimulation.analysis.confidenceInterval.high.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className={`p-3 rounded-lg ${
                      currentSimulation.analysis.successProbability >= 80 
                        ? 'bg-green-500/10 text-green-500' 
                        : currentSimulation.analysis.successProbability >= 60
                        ? 'bg-yellow-500/10 text-yellow-500'
                        : 'bg-red-500/10 text-red-500'
                    }`}>
                      <p className="text-sm font-medium">
                        {currentSimulation.analysis.recommendation}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mb-4 opacity-50" />
                    <p>Run a simulation to see results</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Simulations */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Simulations</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                {simulations.length > 0 ? (
                  <div className="space-y-2">
                    {simulations.map((sim) => (
                      <div key={sim.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">
                            {sim.simulation_type}
                          </Badge>
                          <span className="text-sm">
                            {new Date(sim.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-green-500 font-medium">
                            ${sim.simulated_profit?.toLocaleString()}
                          </span>
                          <Badge className={
                            (sim.confidence_level || 0) >= 80 
                              ? 'bg-green-500' 
                              : (sim.confidence_level || 0) >= 60 
                              ? 'bg-yellow-500' 
                              : 'bg-red-500'
                          }>
                            {sim.confidence_level?.toFixed(0)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No simulations yet
                  </p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Guarantee Tab */}
        <TabsContent value="guarantee" className="space-y-4">
          <Card className="border-green-500/20 bg-green-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                Profit Guarantee Calculator
              </CardTitle>
              <CardDescription>
                Calculate your guaranteed profit with 95% statistical confidence
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Current Monthly Revenue ($)</Label>
                  <Input
                    type="number"
                    value={baseRevenue}
                    onChange={(e) => setBaseRevenue(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Target Profit ($)</Label>
                  <Input
                    type="number"
                    value={targetProfit}
                    onChange={(e) => setTargetProfit(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expected Growth Rate (%)</Label>
                  <Input
                    type="number"
                    value={growthRate}
                    onChange={(e) => setGrowthRate(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Operating Costs ($)</Label>
                  <Input
                    type="number"
                    value={costs}
                    onChange={(e) => setCosts(Number(e.target.value))}
                  />
                </div>
              </div>
              
              <Button 
                className="w-full bg-green-600 hover:bg-green-700" 
                size="lg"
                onClick={guaranteeProfit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Rocket className="h-4 w-4 mr-2" />
                )}
                Calculate Guaranteed Profit
              </Button>
              
              {currentSimulation?.guarantee && (
                <div className="mt-6 p-6 bg-background rounded-lg border">
                  <div className="text-center mb-6">
                    <p className="text-sm text-muted-foreground mb-2">
                      Guaranteed Profit (95% Confidence)
                    </p>
                    <p className="text-4xl font-bold text-green-500">
                      ${currentSimulation.guarantee.guaranteedAmount.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Over {currentSimulation.guarantee.timeframe}
                    </p>
                  </div>
                  
                  {currentSimulation.guarantee.strategies?.length > 0 && (
                    <>
                      <Separator className="my-4" />
                      <div>
                        <p className="font-medium mb-3">Recommended Strategies:</p>
                        <ul className="space-y-2">
                          {currentSimulation.guarantee.strategies.map((strategy: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                              {strategy}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Research Tab */}
        <TabsContent value="research" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-500" />
                Real-Time Market Research
              </CardTitle>
              <CardDescription>
                Powered by Perplexity AI for live market insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., US skincare market trends 2025"
                  value={researchQuery}
                  onChange={(e) => setResearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={runMarketResearch} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {marketResearch && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline">
                      Source: {marketResearch.source === 'perplexity' ? 'Perplexity AI' : 'Lovable AI'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {typeof marketResearch.research?.insights === 'string' ? (
                      <p>{marketResearch.research.insights}</p>
                    ) : (
                      <>
                        {marketResearch.research?.trends && (
                          <div className="mb-4">
                            <h4 className="font-medium mb-2">Trends</h4>
                            <ul className="space-y-1">
                              {marketResearch.research.trends.map((t: string, i: number) => (
                                <li key={i} className="text-sm">{t}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {marketResearch.research?.opportunities && (
                          <div className="mb-4">
                            <h4 className="font-medium mb-2">Opportunities</h4>
                            <ul className="space-y-1">
                              {marketResearch.research.opportunities.map((o: string, i: number) => (
                                <li key={i} className="text-sm">{o}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  
                  {marketResearch.research?.citations && marketResearch.research.citations.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs text-muted-foreground mb-2">Citations</p>
                      {marketResearch.research.citations.map((c: string, i: number) => (
                        <a 
                          key={i} 
                          href={c} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:underline block truncate"
                        >
                          {c}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflows Tab */}
        <TabsContent value="workflows" className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { type: 'lead_qualification', name: 'Lead Qualification', icon: Target },
              { type: 'deal_closer', name: 'Deal Closer', icon: DollarSign },
              { type: 'content_optimizer', name: 'Content Optimizer', icon: Zap },
              { type: 'budget_allocator', name: 'Budget Allocator', icon: BarChart3 }
            ].map(({ type, name, icon: Icon }) => (
              <Card key={type} className="cursor-pointer hover:border-primary transition-colors">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-3 bg-primary/10 rounded-full mb-3">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h4 className="font-medium mb-2">{name}</h4>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => executeWorkflow(type)}
                      disabled={isLoading}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Execute
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Workflow Executions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                {workflows.length > 0 ? (
                  <div className="space-y-2">
                    {workflows.map((wf) => (
                      <div key={wf.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          {wf.status === 'completed' ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                          <div>
                            <p className="font-medium text-sm">{wf.workflow_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(wf.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {wf.execution_time_ms}ms
                          </Badge>
                          <Badge className={wf.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}>
                            {wf.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No workflow executions yet
                  </p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}