import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  Lock,
  Link,
  Brain,
  Layers,
  Megaphone,
  Eye,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Database,
  Workflow,
  Radar
} from "lucide-react";

const MoatHardeningSystem = () => {
  const [copyDetection, setCopyDetection] = useState(true);
  const [narrativeDefense, setNarrativeDefense] = useState(true);

  const moatStrength = {
    overall: 87,
    interdependence: 92,
    dataCompounding: 84,
    executionLock: 89,
    narrativeOwnership: 78
  };

  const moatTypes = [
    {
      id: 1,
      name: "System Interdependence",
      icon: Link,
      description: "No single module delivers full value alone",
      strength: moatStrength.interdependence,
      examples: ["Ads learn from sales", "Sales learn from outbound", "Pricing adapts to demand", "Proof feeds narrative"],
      effect: "Competitors copying one layer fail visibly"
    },
    {
      id: 2,
      name: "Data Compounding Advantage",
      icon: Database,
      description: "Learn from every ad, DM, call, objection, close, loss",
      strength: moatStrength.dataCompounding,
      examples: ["Improve targeting automatically", "Adapt messaging continuously", "Lock learning inside DOMINION"],
      effect: "Customers can leave. They cannot take the intelligence."
    },
    {
      id: 3,
      name: "Execution Integration Lock",
      icon: Workflow,
      description: "Replace workflows, not assist them",
      strength: moatStrength.executionLock,
      examples: ["Remove decisions from users", "Become operationally embedded", "Switching = hiring people again"],
      effect: "That friction is the moat"
    },
    {
      id: 4,
      name: "Narrative Ownership",
      icon: Megaphone,
      description: "Agencies = labor. Tools = work. DOMINION = infrastructure.",
      strength: moatStrength.narrativeOwnership,
      examples: ["Force competitors into weaker categories", "Prevent direct comparison", "Lock framing before features"],
      effect: "Copying feels insufficient"
    }
  ];

  const copyAttempts = [
    { competitor: "Agency Alpha", type: "Messaging convergence", detected: "2h ago", threat: "low" },
    { competitor: "Tool Beta", type: "Feature imitation", detected: "1d ago", threat: "medium" },
    { competitor: "Service Gamma", type: "Positioning shift", detected: "3d ago", threat: "low" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-500/20 to-primary/20 border-purple-500/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Shield className="w-7 h-7 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">ANTI-COPY / MOAT HARDENING</h2>
                <p className="text-muted-foreground">
                  Make replication economically irrational
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-purple-400">{moatStrength.overall}%</p>
              <p className="text-sm text-muted-foreground">Moat Strength</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core Law */}
      <Card className="bg-card/60 border-purple-500/30">
        <CardContent className="p-4">
          <p className="text-center text-lg font-bold text-purple-400">
            "Features can be copied. Systems cannot. Outcomes cannot."
          </p>
        </CardContent>
      </Card>

      {/* Moat Types */}
      <div className="grid grid-cols-2 gap-4">
        {moatTypes.map((moat) => (
          <Card key={moat.id} className="bg-card/60">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <moat.icon className="w-4 h-4 text-purple-400" />
                  </div>
                  Moat {moat.id}: {moat.name}
                </CardTitle>
                <Badge variant="outline" className="bg-purple-500/10 text-purple-400">
                  {moat.strength}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{moat.description}</p>
              <Progress value={moat.strength} className="h-2" />
              <div className="flex flex-wrap gap-1">
                {moat.examples.map((ex, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {ex}
                  </Badge>
                ))}
              </div>
              <div className="p-2 bg-emerald-500/10 rounded border border-emerald-500/30">
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {moat.effect}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Copy Detection */}
      <Card className="bg-card/60">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Radar className="w-5 h-5 text-primary" />
              Copy Detection System
            </CardTitle>
            <Switch 
              checked={copyDetection} 
              onCheckedChange={setCopyDetection}
              className="data-[state=checked]:bg-purple-500"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {copyAttempts.map((attempt, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium">{attempt.competitor}</p>
                  <p className="text-sm text-muted-foreground">{attempt.type}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className={
                    attempt.threat === "medium" 
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  }>
                    {attempt.threat} threat
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{attempt.detected}</p>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Response Protocol</p>
              <p className="text-sm text-muted-foreground">When copying is detected:</p>
            </div>
            <Switch 
              checked={narrativeDefense} 
              onCheckedChange={setNarrativeDefense}
              className="data-[state=checked]:bg-purple-500"
            />
          </div>
          <div className="mt-3 space-y-2">
            {[
              "Escalate narrative differentiation",
              "Increase proof publication",
              "Shift framing away from features",
              "Never engage directly. Outgrow silently."
            ].map((action, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span>{action}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Final Law */}
      <Card className="bg-purple-500/10 border-purple-500/50">
        <CardContent className="p-6 text-center">
          <Lock className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <p className="text-lg font-bold text-purple-400">
            DOMINION's moat is structural, not cosmetic.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MoatHardeningSystem;
