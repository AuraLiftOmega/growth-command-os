import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { 
  Users, 
  Zap, 
  Target, 
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Gauge,
  Bot,
  Shield,
  Repeat,
  ArrowRight
} from "lucide-react";

const OrgScalingEngine = () => {
  const [decisionEngine, setDecisionEngine] = useState(true);
  const [performanceGovernance, setPerformanceGovernance] = useState(true);
  const [knowledgeCompounding, setKnowledgeCompounding] = useState(true);

  // Mock metrics
  const metrics = {
    outputPerHuman: 847,
    automationCoverage: 78,
    decisionsEliminated: 156,
    knowledgeEntries: 2341
  };

  const eliminatedRoles = [
    { role: "Managers", replacement: "Execution Rules", status: "eliminated" },
    { role: "Team Leads", replacement: "Module Ownership", status: "eliminated" },
    { role: "Coordinators", replacement: "Auto-Routing", status: "eliminated" },
    { role: "QA Layers", replacement: "Quality Gates", status: "eliminated" },
    { role: "Admin Staff", replacement: "Self-Service Systems", status: "eliminated" }
  ];

  const executionModules = [
    { name: "Sales Execution", objective: "Close qualified leads", inputs: "Qualified prospects", outputs: "Signed contracts", metric: "94%" },
    { name: "Outbound Deployment", objective: "Generate conversations", inputs: "Target profiles", outputs: "Qualified replies", metric: "87%" },
    { name: "Ads Deployment", objective: "Launch winning creatives", inputs: "Approved assets", outputs: "Live campaigns", metric: "91%" },
    { name: "Creative Generation", objective: "Produce converting content", inputs: "Brand DNA + Data", outputs: "Ready assets", metric: "89%" },
    { name: "Proof Extraction", objective: "Capture wins", inputs: "Customer results", outputs: "Case studies", metric: "76%" },
    { name: "Customer Onboarding", objective: "Activate new users", inputs: "Signed contracts", outputs: "Active accounts", metric: "95%" },
    { name: "Customer Success", objective: "Prevent churn", inputs: "Usage signals", outputs: "Retained revenue", metric: "82%" },
    { name: "Pricing Enforcement", objective: "Protect margins", inputs: "Deal terms", outputs: "Standard pricing", metric: "100%" }
  ];

  const performanceMetrics = [
    { name: "Output Speed", weight: "40%", description: "Tasks completed per hour" },
    { name: "Rule Adherence", weight: "35%", description: "Compliance with execution protocols" },
    { name: "Result Contribution", weight: "25%", description: "Revenue impact attribution" }
  ];

  const automatedDecisions = [
    { decision: "Lead qualification", frequency: "2,341/week", status: "automated" },
    { decision: "Content approval", frequency: "487/week", status: "automated" },
    { decision: "Price quoting", frequency: "156/week", status: "automated" },
    { decision: "Meeting scheduling", frequency: "89/week", status: "automated" },
    { decision: "Escalation routing", frequency: "23/week", status: "automated" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Users className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">INTERNAL ORG SCALING ENGINE</h2>
                <p className="text-muted-foreground">
                  Infinite output. Zero org bloat. Replace managers with rules.
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-emerald-400">{metrics.outputPerHuman}%</p>
              <p className="text-sm text-muted-foreground">Output Per Human vs Industry</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core Truth */}
      <Card className="bg-card/60 border-primary/30">
        <CardContent className="p-4">
          <p className="text-center text-lg font-bold text-primary">
            "If growth requires hiring, the system has failed."
          </p>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-card/60">
          <CardContent className="p-4 text-center">
            <Gauge className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{metrics.outputPerHuman}%</p>
            <p className="text-xs text-muted-foreground">Output Per Human</p>
          </CardContent>
        </Card>
        <Card className="bg-card/60">
          <CardContent className="p-4 text-center">
            <Bot className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{metrics.automationCoverage}%</p>
            <p className="text-xs text-muted-foreground">Automation Coverage</p>
          </CardContent>
        </Card>
        <Card className="bg-card/60">
          <CardContent className="p-4 text-center">
            <Zap className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{metrics.decisionsEliminated}</p>
            <p className="text-xs text-muted-foreground">Decisions Eliminated</p>
          </CardContent>
        </Card>
        <Card className="bg-card/60">
          <CardContent className="p-4 text-center">
            <Brain className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{metrics.knowledgeEntries.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Knowledge Entries</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Role Collapse Framework */}
        <Card className="bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-destructive" />
              Role Collapse Framework
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {eliminatedRoles.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 line-through">
                    {item.role}
                  </Badge>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                    {item.replacement}
                  </Badge>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Decision Elimination Engine */}
        <Card className="bg-card/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Repeat className="w-5 h-5 text-primary" />
                Decision Elimination Engine
              </CardTitle>
              <Switch 
                checked={decisionEngine} 
                onCheckedChange={setDecisionEngine}
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">
              If a decision repeats more than twice → automate it
            </p>
            {automatedDecisions.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium">{item.decision}</p>
                  <p className="text-xs text-muted-foreground">{item.frequency}</p>
                </div>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                  <Bot className="w-3 h-3 mr-1" />
                  Automated
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Execution Modules */}
      <Card className="bg-card/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Functional Execution Modules
            <Badge variant="outline" className="ml-auto">Humans operate modules. Humans do not design them.</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {executionModules.map((module, index) => (
              <div key={index} className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold">{module.name}</p>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400">
                    {module.metric}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{module.objective}</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">IN:</span>
                  <span>{module.inputs}</span>
                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">OUT:</span>
                  <span>{module.outputs}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* Performance Governance */}
        <Card className="bg-card/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Gauge className="w-5 h-5 text-primary" />
                Performance Governance
              </CardTitle>
              <Switch 
                checked={performanceGovernance} 
                onCheckedChange={setPerformanceGovernance}
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              No subjective reviews. No culture debates. No "feelings."
            </p>
            {performanceMetrics.map((metric, index) => (
              <div key={index} className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium">{metric.name}</p>
                  <Badge variant="outline">{metric.weight}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{metric.description}</p>
              </div>
            ))}
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
              <p className="text-sm font-bold text-destructive flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Failure to meet output → removal
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Knowledge Compounding */}
        <Card className="bg-card/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                Knowledge Compounding System
              </CardTitle>
              <Switch 
                checked={knowledgeCompounding} 
                onCheckedChange={setKnowledgeCompounding}
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Humans forget. AURAOMEGA compounds.
            </p>
            <div className="space-y-2">
              <p className="text-sm font-medium">Auto-Logged Data:</p>
              <div className="flex flex-wrap gap-2">
                {["Wins", "Losses", "Objections", "Patterns", "Scripts", "Pricing"].map((item) => (
                  <Badge key={item} variant="outline" className="bg-primary/10">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-medium">Feeds Into:</p>
              <div className="flex flex-wrap gap-2">
                {["Sales Scripts", "Ad Creative", "DM Logic", "Pricing Logic"].map((item) => (
                  <Badge key={item} variant="outline" className="bg-emerald-500/10 text-emerald-400">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scaling Rule */}
      <Card className="bg-destructive/10 border-destructive/50">
        <CardContent className="p-6 text-center">
          <Shield className="w-8 h-8 text-destructive mx-auto mb-2" />
          <p className="text-lg font-bold text-destructive">
            NON-NEGOTIABLE SCALING RULE
          </p>
          <p className="text-muted-foreground mt-2">
            Headcount is a last resort, not a strategy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrgScalingEngine;
