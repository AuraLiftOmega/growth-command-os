import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Radio,
  Zap,
  TrendingUp,
  AlertTriangle,
  Shield,
  Users,
  Mail,
  MessageSquare,
  Video,
  DollarSign,
  RefreshCw,
  Lock,
  Gift,
  Layers,
  Activity,
  Target,
  Eye,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { useTrafficEngineStore } from "@/stores/traffic-engine-store";
import { TrafficHealthMonitor } from "./TrafficHealthMonitor";
import { PlatformShockResponse } from "./PlatformShockResponse";
import { CreatorDistribution } from "./CreatorDistribution";
import { ReferralLoops } from "./ReferralLoops";
import { AudienceMonetization } from "./AudienceMonetization";
import { MessageInsulation } from "./MessageInsulation";
import { OwnedAudiencePanel } from "./OwnedAudiencePanel";
import { OrganicContentEngine } from "./OrganicContentEngine";

const TrafficEngineDashboard = () => {
  const {
    isActive,
    setActive,
    shockResponseMode,
    trafficStreams,
    ownedAudienceSize,
    emailCaptureRate
  } = useTrafficEngineStore();

  const [activeModule, setActiveModule] = useState("overview");

  // Calculate totals
  const totalLeadsToday = trafficStreams.reduce((sum, s) => sum + s.leadsToday, 0);
  const totalLeadsWeek = trafficStreams.reduce((sum, s) => sum + s.leadsWeek, 0);
  const avgConversionRate = trafficStreams.reduce((sum, s) => sum + s.conversionRate, 0) / trafficStreams.length;
  const paidDependency = trafficStreams
    .filter(s => s.source === 'paid')
    .reduce((sum, s) => sum + s.dependencyPercent, 0);

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'paid': return <DollarSign className="w-4 h-4" />;
      case 'organic': return <Video className="w-4 h-4" />;
      case 'outbound': return <MessageSquare className="w-4 h-4" />;
      case 'owned': return <Mail className="w-4 h-4" />;
      case 'proof': return <TrendingUp className="w-4 h-4" />;
      default: return <Radio className="w-4 h-4" />;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'paid': return 'text-blue-400';
      case 'organic': return 'text-purple-400';
      case 'outbound': return 'text-amber-400';
      case 'owned': return 'text-emerald-400';
      case 'proof': return 'text-pink-400';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Engine Status Header */}
      <Card className="bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 border-emerald-500/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/30 to-blue-500/30 flex items-center justify-center">
                <Radio className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">AD-ACCOUNT-INDEPENDENT TRAFFIC ENGINE</h2>
                <p className="text-muted-foreground">
                  Self-reinforcing demand generation • Platform power = Zero • Control = Absolute
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              {shockResponseMode && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/20 border border-destructive/50 animate-pulse">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  <span className="text-sm font-bold text-destructive">SHOCK RESPONSE ACTIVE</span>
                </div>
              )}
              <div className="text-right mr-4">
                <p className="text-sm text-muted-foreground">Engine Status</p>
                <p className={`font-bold ${isActive ? 'text-emerald-400' : 'text-destructive'}`}>
                  {isActive ? 'OPERATIONAL' : 'PAUSED'}
                </p>
              </div>
              <Switch 
                checked={isActive} 
                onCheckedChange={setActive}
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core Traffic Law */}
      <Card className="bg-card/60 border-amber-500/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Lock className="w-6 h-6 text-amber-400" />
            <div>
              <p className="text-sm font-bold text-amber-400">CORE TRAFFIC LAW (IMMUTABLE)</p>
              <p className="text-xs text-muted-foreground">
                Rented traffic is leverage. Owned traffic is control. DOMINION never depends on what it does not own.
              </p>
            </div>
            <Badge variant="outline" className={`ml-auto ${paidDependency > 40 ? 'bg-destructive/10 text-destructive border-destructive/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>
              Paid Dependency: {paidDependency}%
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="bg-card/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{totalLeadsToday}</p>
                <p className="text-xs text-muted-foreground">Leads Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-2xl font-bold">{totalLeadsWeek}</p>
                <p className="text-xs text-muted-foreground">Leads This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-2xl font-bold">{avgConversionRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Avg Conversion</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-2xl font-bold">{ownedAudienceSize.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Owned Audience</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-2xl font-bold">{emailCaptureRate}%</p>
                <p className="text-xs text-muted-foreground">Capture Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Stream Overview */}
      <Card className="bg-card/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-primary" />
            Traffic Stack (No Stream {">"} 40% Dependency)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {trafficStreams.map((stream) => (
              <div 
                key={stream.id} 
                className={`p-4 rounded-lg border ${
                  stream.status === 'critical' ? 'bg-destructive/10 border-destructive/50' :
                  stream.status === 'warning' ? 'bg-amber-500/10 border-amber-500/50' :
                  stream.status === 'paused' ? 'bg-muted/30 border-border' :
                  'bg-card/80 border-border'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={getSourceColor(stream.source)}>
                      {getSourceIcon(stream.source)}
                    </div>
                    <span className="font-medium">{stream.name}</span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={
                      stream.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                      stream.status === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                      stream.status === 'paused' ? 'bg-muted text-muted-foreground border-border' :
                      'bg-destructive/10 text-destructive border-destructive/30'
                    }
                  >
                    {stream.status}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Dependency</span>
                    <span className={stream.dependencyPercent > 40 ? 'text-destructive font-bold' : ''}>
                      {stream.dependencyPercent}%
                    </span>
                  </div>
                  <Progress 
                    value={stream.dependencyPercent} 
                    className={`h-2 ${stream.dependencyPercent > 40 ? '[&>div]:bg-destructive' : ''}`}
                  />
                  
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border/50">
                    <div>
                      <p className="text-xs text-muted-foreground">Today</p>
                      <p className="font-bold">{stream.leadsToday} leads</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Conv. Rate</p>
                      <p className="font-bold">{stream.conversionRate}%</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {stream.platforms.map((platform, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Module Tabs */}
      <Tabs value={activeModule} onValueChange={setActiveModule} className="space-y-4">
        <TabsList className="bg-card/60 border border-border p-1 flex-wrap h-auto">
          <TabsTrigger value="overview" className="gap-2">
            <Activity className="w-4 h-4" />
            Health Monitor
          </TabsTrigger>
          <TabsTrigger value="organic" className="gap-2">
            <Video className="w-4 h-4" />
            Organic Engine
          </TabsTrigger>
          <TabsTrigger value="owned" className="gap-2">
            <Mail className="w-4 h-4" />
            Owned Audience
          </TabsTrigger>
          <TabsTrigger value="shock" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            Shock Response
          </TabsTrigger>
          <TabsTrigger value="creators" className="gap-2">
            <Users className="w-4 h-4" />
            Creators
          </TabsTrigger>
          <TabsTrigger value="referral" className="gap-2">
            <Gift className="w-4 h-4" />
            Referrals
          </TabsTrigger>
          <TabsTrigger value="monetization" className="gap-2">
            <Layers className="w-4 h-4" />
            Monetization
          </TabsTrigger>
          <TabsTrigger value="insulation" className="gap-2">
            <Shield className="w-4 h-4" />
            Message Insulation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <TrafficHealthMonitor />
        </TabsContent>

        <TabsContent value="organic">
          <OrganicContentEngine />
        </TabsContent>

        <TabsContent value="owned">
          <OwnedAudiencePanel />
        </TabsContent>

        <TabsContent value="shock">
          <PlatformShockResponse />
        </TabsContent>

        <TabsContent value="creators">
          <CreatorDistribution />
        </TabsContent>

        <TabsContent value="referral">
          <ReferralLoops />
        </TabsContent>

        <TabsContent value="monetization">
          <AudienceMonetization />
        </TabsContent>

        <TabsContent value="insulation">
          <MessageInsulation />
        </TabsContent>
      </Tabs>

      {/* Final Law */}
      <Card className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border-emerald-500/30">
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-sm font-bold text-emerald-400 mb-1">FINAL TRAFFIC LAW (IMMUTABLE)</p>
            <p className="text-xs text-muted-foreground">
              If ads disappear tomorrow, DOMINION must still generate leads, sales, and cash flow.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Paid traffic should feel: <span className="text-emerald-400 font-medium">Powerful when on</span> • <span className="text-blue-400 font-medium">Irrelevant when off</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrafficEngineDashboard;
