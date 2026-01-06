import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Crosshair, 
  Target, 
  Skull,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Megaphone,
  DollarSign,
  FileText,
  Scale,
  Radar,
  Activity,
  ArrowDown,
  Flame
} from "lucide-react";

const CompetitiveKillSwitch = () => {
  const [killSwitch1, setKillSwitch1] = useState(true);
  const [killSwitch2, setKillSwitch2] = useState(true);
  const [killSwitch3, setKillSwitch3] = useState(true);
  const [killSwitch4, setKillSwitch4] = useState(true);
  const [competitorMonitoring, setCompetitorMonitoring] = useState(true);

  const competitorCategories = [
    { 
      type: "Agencies", 
      count: 47,
      weaknesses: ["Linear labor", "Retainers", "Slow iteration", "No compounding learning"],
      pressure: 89
    },
    { 
      type: "SaaS Tools", 
      count: 23,
      weaknesses: ["Fragmentation", "User burden", "Learning on customer"],
      pressure: 72
    },
    { 
      type: "Hybrid Services", 
      count: 12,
      weaknesses: ["Identity confusion", "Margin pressure", "Scale limits"],
      pressure: 65
    },
    { 
      type: "Freelancers", 
      count: 156,
      weaknesses: ["No leverage", "Time bound", "Quality variance"],
      pressure: 94
    }
  ];

  const killSwitches = [
    {
      id: 1,
      name: "Narrative Lock",
      icon: Megaphone,
      description: "Public narrative: 'If it requires people, it can't scale.'",
      effect: "Competitors forced to defend labor",
      effectiveness: 87,
      active: killSwitch1,
      setActive: setKillSwitch1
    },
    {
      id: 2,
      name: "Pricing Trap",
      icon: DollarSign,
      description: "Always lower than teams, higher than tools. Framed as replacement infrastructure.",
      effect: "Competitors cannot compete without collapsing margins",
      effectiveness: 92,
      active: killSwitch2,
      setActive: setKillSwitch2
    },
    {
      id: 3,
      name: "Proof Saturation",
      icon: FileText,
      description: "Flood market with agency replacement stories, time compression wins, learning speed advantages.",
      effect: "Competitors look outdated by comparison",
      effectiveness: 78,
      active: killSwitch3,
      setActive: setKillSwitch3
    },
    {
      id: 4,
      name: "Comparison Reframe",
      icon: Scale,
      description: "Force comparison: Intelligence vs people. Systems vs services. Compounding vs guessing.",
      effect: "Never feature-by-feature battles",
      effectiveness: 85,
      active: killSwitch4,
      setActive: setKillSwitch4
    }
  ];

  const competitorResponses = [
    { competitor: "Agency Alpha", response: "Price drop 20%", type: "defensive", date: "2h ago" },
    { competitor: "Tool Beta", response: "Added AI features", type: "reactive", date: "1d ago" },
    { competitor: "Service Gamma", response: "Repositioned messaging", type: "defensive", date: "3d ago" },
    { competitor: "Agency Delta", response: "Lost 3 clients to DOMINION", type: "collapse", date: "5d ago" }
  ];

  const marketPressure = {
    overall: 84,
    agencyChurn: 12.4,
    toolFragmentation: 67,
    pricingPressure: 89
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-destructive/20 to-orange-500/20 border-destructive/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-destructive/20 flex items-center justify-center">
                <Crosshair className="w-7 h-7 text-destructive" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">COMPETITIVE KILL-SWITCH STRATEGY</h2>
                <p className="text-muted-foreground">
                  Systematic market neutralization. Not advertising — market engineering.
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-destructive">{marketPressure.overall}%</p>
              <p className="text-sm text-muted-foreground">Market Pressure Index</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core Truth */}
      <Card className="bg-card/60 border-destructive/30">
        <CardContent className="p-4">
          <p className="text-center text-lg font-bold text-destructive">
            "DOMINION does not chase. DOMINION compresses."
          </p>
        </CardContent>
      </Card>

      {/* Competitor Classification */}
      <Card className="bg-card/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Competitor Classification Engine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {competitorCategories.map((cat, index) => (
              <div key={index} className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-bold">{cat.type}</p>
                    <p className="text-sm text-muted-foreground">{cat.count} tracked</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-destructive">{cat.pressure}%</p>
                    <p className="text-xs text-muted-foreground">Pressure</p>
                  </div>
                </div>
                <Progress value={cat.pressure} className="h-2 mb-3" />
                <div className="flex flex-wrap gap-1">
                  {cat.weaknesses.map((weakness, i) => (
                    <Badge key={i} variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/30">
                      {weakness}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Kill-Switch Mechanisms */}
      <Card className="bg-card/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Skull className="w-5 h-5 text-destructive" />
            Kill-Switch Mechanisms
            <Badge variant="outline" className="ml-auto bg-destructive/10 text-destructive">DEPLOYED CONTINUOUSLY</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {killSwitches.map((ks) => (
              <div key={ks.id} className="p-4 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                      <ks.icon className="w-5 h-5 text-destructive" />
                    </div>
                    <div>
                      <p className="font-bold">Kill-Switch {ks.id}: {ks.name}</p>
                      <p className="text-xs text-muted-foreground">{ks.effectiveness}% effectiveness</p>
                    </div>
                  </div>
                  <Switch 
                    checked={ks.active} 
                    onCheckedChange={ks.setActive}
                    className="data-[state=checked]:bg-destructive"
                  />
                </div>
                <p className="text-sm text-muted-foreground mb-2">{ks.description}</p>
                <div className="p-2 bg-emerald-500/10 rounded border border-emerald-500/30">
                  <p className="text-xs text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {ks.effect}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* Competitor Response Monitoring */}
        <Card className="bg-card/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Radar className="w-5 h-5 text-primary" />
                Competitor Response Monitoring
              </CardTitle>
              <Switch 
                checked={competitorMonitoring} 
                onCheckedChange={setCompetitorMonitoring}
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {competitorResponses.map((response, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium">{response.competitor}</p>
                  <p className="text-sm text-muted-foreground">{response.response}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className={
                    response.type === "collapse" 
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : response.type === "defensive"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                  }>
                    {response.type}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{response.date}</p>
                </div>
              </div>
            ))}
            <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg mt-4">
              <p className="text-sm text-primary flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Any defensive move = confirmation of dominance
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Market Exit Pressure */}
        <Card className="bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-destructive" />
              Market Exit Pressure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Goal: Force exits, pivots, or irrelevance
            </p>
            
            <div className="space-y-3">
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">Agency Churn Rate</p>
                  <p className="text-lg font-bold text-destructive">{marketPressure.agencyChurn}%</p>
                </div>
                <Progress value={marketPressure.agencyChurn * 5} className="h-2" />
              </div>

              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">Tool Fragmentation</p>
                  <p className="text-lg font-bold text-amber-400">{marketPressure.toolFragmentation}%</p>
                </div>
                <Progress value={marketPressure.toolFragmentation} className="h-2" />
              </div>

              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">Competitor Pricing Pressure</p>
                  <p className="text-lg font-bold text-emerald-400">{marketPressure.pricingPressure}%</p>
                </div>
                <Progress value={marketPressure.pricingPressure} className="h-2" />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-sm font-medium">Pressure Objectives:</p>
              <div className="space-y-2">
                {[
                  "Make their business model unattractive",
                  "Increase their churn",
                  "Increase their internal stress",
                  "Force exits, pivots, or irrelevance"
                ].map((obj, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Flame className="w-4 h-4 text-destructive" />
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Final Law */}
      <Card className="bg-gradient-to-r from-card/80 to-primary/10 border-primary/30">
        <CardContent className="p-6">
          <div className="text-center space-y-3">
            <Activity className="w-8 h-8 text-primary mx-auto" />
            <p className="text-lg font-bold">FINAL LAWS (IMMUTABLE)</p>
            <div className="space-y-1 text-muted-foreground">
              <p>Compete structurally, not tactically.</p>
              <p>Never outwork competitors — out-design them.</p>
              <p className="text-primary font-medium pt-2">DOMINION must always feel: Calm. Inevitable. Unavoidable.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompetitiveKillSwitch;
