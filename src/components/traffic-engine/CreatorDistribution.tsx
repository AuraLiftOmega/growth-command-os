import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { 
  Users, 
  Shield, 
  Lock,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Link2,
  MessageSquare,
  TrendingUp,
  Ban
} from "lucide-react";
import { useTrafficEngineStore } from "@/stores/traffic-engine-store";

export const CreatorDistribution = () => {
  const { creators, affiliateEnabled, updateCreator } = useTrafficEngineStore();

  const totalRevenue = creators.reduce((sum, c) => sum + c.revenue, 0);
  const totalConversions = creators.reduce((sum, c) => sum + c.conversions, 0);
  const avgCompliance = creators.reduce((sum, c) => sum + c.messagingCompliance, 0) / creators.length;

  const controlRules = [
    { rule: 'No raw funnel access', description: 'Creators only see public-facing links', status: 'enforced' },
    { rule: 'Locked messaging frameworks', description: 'Cannot alter approved copy', status: 'enforced' },
    { rule: 'No customer data access', description: 'Zero visibility into buyer info', status: 'enforced' },
    { rule: 'Attribution via DOMINION links', description: 'All traffic tracked internally', status: 'enforced' },
    { rule: 'Delayed payouts', description: '60-day hold for fraud prevention', status: 'enforced' }
  ];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'gold': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'silver': return 'bg-slate-400/10 text-slate-400 border-slate-400/30';
      default: return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Banner */}
      <Card className="bg-gradient-to-r from-primary/20 to-purple-500/20 border-primary/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold">CREATOR / AFFILIATE DISTRIBUTION</h3>
                <p className="text-muted-foreground text-sm">
                  Distribution nodes without control surrender • DOMINION remains the control layer
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-emerald-400">${totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Attributed Revenue</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Control Rules */}
      <Card className="bg-card/60 border-amber-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-400" />
            Control Rules (Non-Negotiable)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            {controlRules.map((rule, index) => (
              <div key={index} className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">
                    {rule.status}
                  </Badge>
                </div>
                <p className="font-medium text-sm">{rule.rule}</p>
                <p className="text-xs text-muted-foreground mt-1">{rule.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-card/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{creators.length}</p>
                <p className="text-xs text-muted-foreground">Active Creators</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-2xl font-bold">{totalConversions}</p>
                <p className="text-xs text-muted-foreground">Total Conversions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-2xl font-bold">{avgCompliance.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Messaging Compliance</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-2xl font-bold">${creators.reduce((sum, c) => sum + c.payoutPending, 0).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Pending Payouts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Creator List */}
      <Card className="bg-card/60">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-primary" />
              Distribution Nodes
            </div>
            <Badge variant="outline">{creators.length} active</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {creators.map((creator) => (
              <div 
                key={creator.id} 
                className={`p-4 rounded-lg border ${
                  creator.fraudScore > 20 ? 'bg-destructive/10 border-destructive/30' :
                  creator.messagingCompliance < 90 ? 'bg-amber-500/10 border-amber-500/30' :
                  'bg-muted/30 border-border'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold">
                      {creator.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{creator.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getTierColor(creator.tier)}>
                          {creator.tier}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={creator.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-muted'}
                        >
                          {creator.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-bold">{creator.conversions}</p>
                      <p className="text-xs text-muted-foreground">Conversions</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-400">${creator.revenue.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{creator.payoutRate}%</p>
                      <p className="text-xs text-muted-foreground">Payout Rate</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Messaging Compliance</span>
                      <span className={creator.messagingCompliance < 90 ? 'text-amber-400' : 'text-emerald-400'}>
                        {creator.messagingCompliance}%
                      </span>
                    </div>
                    <Progress value={creator.messagingCompliance} className="h-1.5" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Fraud Score</span>
                      <span className={creator.fraudScore > 20 ? 'text-destructive' : 'text-emerald-400'}>
                        {creator.fraudScore}%
                      </span>
                    </div>
                    <Progress 
                      value={creator.fraudScore} 
                      className={`h-1.5 ${creator.fraudScore > 20 ? '[&>div]:bg-destructive' : ''}`}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    {creator.status === 'active' ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-xs"
                        onClick={() => updateCreator(creator.id, { status: 'suspended' })}
                      >
                        <Ban className="w-3 h-3 mr-1" />
                        Suspend
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-xs"
                        onClick={() => updateCreator(creator.id, { status: 'active' })}
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Activate
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Final Rule */}
      <Card className="bg-card/60 border-primary/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Shield className="w-6 h-6 text-primary" />
            <div>
              <p className="font-bold text-primary">DISTRIBUTION CONTROL LAW</p>
              <p className="text-xs text-muted-foreground">
                Creators act as distribution nodes, not partners with leverage. DOMINION always remains the control layer.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
