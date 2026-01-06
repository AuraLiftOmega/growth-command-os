import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { 
  ShieldAlert, 
  Globe,
  Scale,
  FileWarning,
  Database,
  Zap,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingDown,
  Activity,
  RefreshCw,
  Lock,
  Eye
} from "lucide-react";

const RiskInsulationEngine = () => {
  const [shockResponseMode, setShockResponseMode] = useState(false);
  const [claimSanitization, setClaimSanitization] = useState(true);
  const [trafficDiversification, setTrafficDiversification] = useState(true);

  const riskMetrics = {
    overall: 23,
    platformDependency: 31,
    regulatoryExposure: 18,
    trafficConcentration: 27
  };

  const platformHealth = [
    { platform: "Meta Ads", dependency: 34, status: "healthy", spend: "$12.4k" },
    { platform: "TikTok Ads", dependency: 28, status: "healthy", spend: "$8.2k" },
    { platform: "Google Ads", dependency: 22, status: "healthy", spend: "$6.1k" },
    { platform: "Email", dependency: 16, status: "healthy", spend: "Owned" }
  ];

  const trafficSources = [
    { source: "Paid Social", percentage: 42, status: "balanced" },
    { source: "Outbound DM", percentage: 24, status: "balanced" },
    { source: "Inbound Organic", percentage: 18, status: "growing" },
    { source: "Referral", percentage: 16, status: "stable" }
  ];

  const claimExamples = [
    { bad: "Guaranteed results", good: "Consistently outperforms labor-based systems", status: "sanitized" },
    { bad: "You will 10x revenue", good: "Users report significant revenue increases", status: "sanitized" },
    { bad: "Never fails", good: "Designed for reliability and adaptation", status: "sanitized" }
  ];

  const shockTriggers = [
    "Platform bans",
    "Ad account shutdowns",
    "Regulatory inquiries",
    "Public scrutiny"
  ];

  const shockResponses = [
    "Reduce exposure automatically",
    "Shift channels",
    "Lock messaging",
    "Alert CEO instantly"
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <ShieldAlert className="w-7 h-7 text-amber-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">RISK INSULATION ENGINE</h2>
                <p className="text-muted-foreground">
                  Survive rule changes, platform shifts, and scrutiny
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-emerald-400">{100 - riskMetrics.overall}%</p>
              <p className="text-sm text-muted-foreground">Resilience Score</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shock Response Mode */}
      <Card className={`${shockResponseMode ? 'bg-destructive/20 border-destructive' : 'bg-card/60'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className={`w-6 h-6 ${shockResponseMode ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`} />
              <div>
                <p className="font-bold">SHOCK RESPONSE MODE</p>
                <p className="text-sm text-muted-foreground">
                  {shockResponseMode ? 'ACTIVE - Defensive protocols engaged' : 'Standby - All systems normal'}
                </p>
              </div>
            </div>
            <Switch 
              checked={shockResponseMode} 
              onCheckedChange={setShockResponseMode}
              className="data-[state=checked]:bg-destructive"
            />
          </div>
        </CardContent>
      </Card>

      {/* Risk Overview */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-card/60">
          <CardContent className="p-4 text-center">
            <Globe className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{riskMetrics.platformDependency}%</p>
            <p className="text-xs text-muted-foreground">Platform Dependency</p>
            <Progress value={riskMetrics.platformDependency} className="mt-2 h-1" />
          </CardContent>
        </Card>
        <Card className="bg-card/60">
          <CardContent className="p-4 text-center">
            <Scale className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{riskMetrics.regulatoryExposure}%</p>
            <p className="text-xs text-muted-foreground">Regulatory Exposure</p>
            <Progress value={riskMetrics.regulatoryExposure} className="mt-2 h-1" />
          </CardContent>
        </Card>
        <Card className="bg-card/60">
          <CardContent className="p-4 text-center">
            <Activity className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{riskMetrics.trafficConcentration}%</p>
            <p className="text-xs text-muted-foreground">Traffic Concentration</p>
            <Progress value={riskMetrics.trafficConcentration} className="mt-2 h-1" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Platform Dependency */}
        <Card className="bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Platform Dependency Minimization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {platformHealth.map((platform, index) => (
              <div key={index} className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{platform.platform}</p>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">
                      {platform.status}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">{platform.spend}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={platform.dependency} className="h-1 flex-1" />
                  <span className="text-xs text-muted-foreground w-8">{platform.dependency}%</span>
                </div>
              </div>
            ))}
            <div className="p-2 bg-emerald-500/10 rounded border border-emerald-500/30">
              <p className="text-xs text-emerald-400">
                If a platform changes rules → DOMINION adapts → Competitors scramble
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Traffic Diversification */}
        <Card className="bg-card/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-primary" />
                Traffic Diversification Engine
              </CardTitle>
              <Switch 
                checked={trafficDiversification} 
                onCheckedChange={setTrafficDiversification}
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {trafficSources.map((source, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium">{source.source}</p>
                  <Badge variant="outline" className="text-xs mt-1">
                    {source.status}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{source.percentage}%</p>
                </div>
              </div>
            ))}
            <div className="p-2 bg-primary/10 rounded border border-primary/30">
              <p className="text-xs text-primary flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                No single point of failure allowed
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Claim Sanitization */}
      <Card className="bg-card/60">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileWarning className="w-5 h-5 text-primary" />
              Claim Sanitization System
            </CardTitle>
            <Switch 
              checked={claimSanitization} 
              onCheckedChange={setClaimSanitization}
              className="data-[state=checked]:bg-emerald-500"
            />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Review outbound messaging. Flag risky claims. Replace with proof-based framing.
          </p>
          <div className="space-y-3">
            {claimExamples.map((claim, index) => (
              <div key={index} className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <XCircle className="w-4 h-4 text-destructive" />
                      <span className="text-sm line-through text-muted-foreground">"{claim.bad}"</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm text-emerald-400">"{claim.good}"</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                    sanitized
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Privacy & Shock Response */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              Data & Privacy Insulation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "Minimize storage of unnecessary personal data",
              "Abstract user data behind internal layers",
              "Allow modular compliance adjustments",
              "Compliance is configurable, not manual"
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-destructive" />
              Shock Response Protocol
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-sm font-medium text-muted-foreground mb-2">Triggers:</p>
              <div className="flex flex-wrap gap-1">
                {shockTriggers.map((trigger, i) => (
                  <Badge key={i} variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-xs">
                    {trigger}
                  </Badge>
                ))}
              </div>
            </div>
            <Separator className="my-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Responses:</p>
              <div className="space-y-2">
                {shockResponses.map((response, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Activity className="w-4 h-4 text-amber-400" />
                    <span>{response}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 p-2 bg-primary/10 rounded border border-primary/30">
              <p className="text-sm font-bold text-primary text-center">
                No panic. Only execution.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Final Laws */}
      <Card className="bg-gradient-to-r from-card/80 to-amber-500/10 border-amber-500/30">
        <CardContent className="p-6">
          <div className="text-center space-y-3">
            <ShieldAlert className="w-8 h-8 text-amber-400 mx-auto" />
            <p className="text-lg font-bold">FINAL DEFENSIVE LAWS (IMMUTABLE)</p>
            <div className="space-y-1 text-muted-foreground">
              <p>Never rely on what you don't control.</p>
              <p>Never win by features alone.</p>
              <p>Never scale faster than your defenses.</p>
              <p className="text-amber-400 font-medium pt-2">DOMINION must feel: Calm under pressure. Adaptive under attack. Stronger after shocks.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskInsulationEngine;
