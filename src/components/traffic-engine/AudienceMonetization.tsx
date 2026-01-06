import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Layers, 
  DollarSign,
  TrendingUp,
  Package,
  Zap,
  Database,
  GraduationCap,
  Sparkles,
  ArrowUp
} from "lucide-react";
import { useTrafficEngineStore } from "@/stores/traffic-engine-store";

export const AudienceMonetization = () => {
  const { monetizationLayers, ownedAudienceSize } = useTrafficEngineStore();

  const totalRevenue = monetizationLayers.reduce((sum, l) => sum + l.revenue, 0);
  const avgLtvImpact = monetizationLayers.reduce((sum, l) => sum + l.ltvImpact, 0) / monetizationLayers.length;

  const getLayerIcon = (type: string) => {
    switch (type) {
      case 'secondary_offer': return <Package className="w-5 h-5" />;
      case 'upgrade': return <ArrowUp className="w-5 h-5" />;
      case 'ecosystem': return <Sparkles className="w-5 h-5" />;
      case 'education': return <GraduationCap className="w-5 h-5" />;
      case 'data': return <Database className="w-5 h-5" />;
      default: return <Layers className="w-5 h-5" />;
    }
  };

  const getLayerColor = (type: string) => {
    switch (type) {
      case 'secondary_offer': return 'text-blue-400';
      case 'upgrade': return 'text-emerald-400';
      case 'ecosystem': return 'text-purple-400';
      case 'education': return 'text-amber-400';
      case 'data': return 'text-pink-400';
      default: return 'text-primary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border-emerald-500/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Layers className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold">AUDIENCE MONETIZATION (BEYOND CORE OFFER)</h3>
                <p className="text-muted-foreground text-sm">
                  Multi-layer LTV expansion • Audience as asset, not just buyer pool
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-2xl font-bold text-emerald-400">${totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Expansion Revenue</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-400">+${avgLtvImpact.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Avg LTV Impact</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-card/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-2xl font-bold">${(totalRevenue / ownedAudienceSize).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Revenue Per Contact</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Layers className="w-5 h-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{monetizationLayers.length}</p>
                <p className="text-xs text-muted-foreground">Active Layers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-2xl font-bold">2.4x</p>
                <p className="text-xs text-muted-foreground">LTV Multiplier</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-2xl font-bold">Auto</p>
                <p className="text-xs text-muted-foreground">Expansion Mode</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monetization Layers */}
      <Card className="bg-card/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            Active Monetization Layers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monetizationLayers.map((layer) => (
              <div 
                key={layer.id} 
                className="p-4 bg-muted/30 rounded-lg border border-border"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center ${getLayerColor(layer.type)}`}>
                      {getLayerIcon(layer.type)}
                    </div>
                    <div>
                      <p className="font-medium">{layer.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs capitalize">
                          {layer.type.replace('_', ' ')}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={
                            layer.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                            layer.status === 'testing' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                            'bg-muted text-muted-foreground'
                          }
                        >
                          {layer.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <p className="text-xl font-bold text-emerald-400">${layer.revenue.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold">{layer.conversionRate}%</p>
                      <p className="text-xs text-muted-foreground">Conv. Rate</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-blue-400">+${layer.ltvImpact}</p>
                      <p className="text-xs text-muted-foreground">LTV Impact</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Conversion Progress</span>
                    <span>{layer.conversionRate}% of audience</span>
                  </div>
                  <Progress value={layer.conversionRate} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Layer Strategy */}
      <Card className="bg-card/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Monetization Strategy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-400" />
                Entry Point → Expansion Path
              </h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>1. Core offer captures customer</p>
                <p>2. Usage triggers upgrade prompts</p>
                <p>3. Success unlocks premium layers</p>
                <p>4. Ecosystem tools increase stickiness</p>
              </div>
            </div>
            
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Automated LTV Expansion
              </h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Data-driven recommendations</p>
                <p>• Behavior-triggered offers</p>
                <p>• Industry-adaptive suggestions</p>
                <p>• Zero manual intervention</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audience Value Visualization */}
      <Card className="bg-card/60">
        <CardHeader>
          <CardTitle>Audience Asset Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8">
            <div className="flex-1">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-3xl font-bold">{ownedAudienceSize.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Contacts</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-3xl font-bold text-emerald-400">$847</p>
                  <p className="text-sm text-muted-foreground">Avg LTV</p>
                </div>
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                  <p className="text-3xl font-bold text-primary">${(ownedAudienceSize * 847 / 1000000).toFixed(1)}M</p>
                  <p className="text-sm text-muted-foreground">Total Asset Value</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Final Rule */}
      <Card className="bg-card/60 border-emerald-500/30">
        <CardContent className="p-4">
          <div className="text-center">
            <p className="font-bold text-emerald-400 mb-1">AUDIENCE MONETIZATION LAW</p>
            <p className="text-xs text-muted-foreground">
              Core offer is the entry point. LTV expansion is automated. The audience itself becomes an asset, not just a buyer pool.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
