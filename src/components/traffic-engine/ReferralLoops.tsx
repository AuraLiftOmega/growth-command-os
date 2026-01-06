import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Gift, 
  Lock,
  DollarSign,
  Star,
  Zap,
  Key,
  Crown,
  TrendingUp,
  AlertTriangle,
  Users
} from "lucide-react";
import { useTrafficEngineStore } from "@/stores/traffic-engine-store";

export const ReferralLoops = () => {
  const { 
    referralIncentives, 
    cashPayoutCap, 
    cashPayoutDelay 
  } = useTrafficEngineStore();

  const totalUsage = referralIncentives.reduce((sum, i) => sum + i.usageCount, 0);
  const totalCost = referralIncentives.reduce((sum, i) => sum + i.costToDate, 0);
  const nonCashIncentives = referralIncentives.filter(i => i.type !== 'cash');

  const getIncentiveIcon = (type: string) => {
    switch (type) {
      case 'access': return <Key className="w-4 h-4" />;
      case 'status': return <Crown className="w-4 h-4" />;
      case 'priority': return <Zap className="w-4 h-4" />;
      case 'feature': return <Star className="w-4 h-4" />;
      case 'credit': return <Gift className="w-4 h-4" />;
      case 'cash': return <DollarSign className="w-4 h-4" />;
      default: return <Gift className="w-4 h-4" />;
    }
  };

  const getIncentiveColor = (type: string) => {
    switch (type) {
      case 'access': return 'text-blue-400';
      case 'status': return 'text-purple-400';
      case 'priority': return 'text-amber-400';
      case 'feature': return 'text-emerald-400';
      case 'credit': return 'text-pink-400';
      case 'cash': return 'text-destructive';
      default: return 'text-primary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-pink-500/20 flex items-center justify-center">
                <Gift className="w-7 h-7 text-pink-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold">REFERRAL LOOPS (ZERO COMMISSION LEAKAGE)</h3>
                <p className="text-muted-foreground text-sm">
                  Non-cash-first incentives • Self-propagating • Cost decreases over time
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-2xl font-bold text-emerald-400">{totalUsage}</p>
                <p className="text-xs text-muted-foreground">Total Referrals</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-pink-400">${totalCost.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Cost</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cash Protection Rules */}
      <Card className="bg-card/60 border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-destructive" />
            Cash Payout Protection (Anti-Leakage)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/30">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <span className="font-medium text-sm">Max Cash Payout</span>
              </div>
              <p className="text-2xl font-bold text-destructive">${cashPayoutCap}</p>
              <p className="text-xs text-muted-foreground">Per referral cap</p>
            </div>
            
            <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <span className="font-medium text-sm">Payout Delay</span>
              </div>
              <p className="text-2xl font-bold text-amber-400">{cashPayoutDelay} days</p>
              <p className="text-xs text-muted-foreground">Fraud prevention hold</p>
            </div>
            
            <div className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="font-medium text-sm">Non-Cash Ratio</span>
              </div>
              <p className="text-2xl font-bold text-emerald-400">
                {((nonCashIncentives.length / referralIncentives.length) * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-muted-foreground">Of all incentives</p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <span className="font-bold text-destructive">Rule:</span> If cash is used, it is capped, delayed, and conditional on retention or revenue realization. No open-ended commissions. No margin erosion.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Incentive Hierarchy */}
      <Card className="bg-card/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            Incentive Hierarchy (Non-Cash First)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {referralIncentives.map((incentive, index) => (
              <div 
                key={incentive.id} 
                className={`p-4 rounded-lg border ${
                  incentive.type === 'cash' ? 'bg-destructive/5 border-destructive/20' : 'bg-muted/30 border-border'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center ${getIncentiveColor(incentive.type)}`}>
                      {getIncentiveIcon(incentive.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{incentive.name}</p>
                        <Badge variant="outline" className="text-xs capitalize">{incentive.type}</Badge>
                        {incentive.type === 'cash' && (
                          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-xs">
                            Restricted
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{incentive.value}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <p className="font-bold">{incentive.usageCount}</p>
                      <p className="text-xs text-muted-foreground">Uses</p>
                    </div>
                    <div>
                      <p className={`font-bold ${incentive.costToDate > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        ${incentive.costToDate.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">Cost</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">Conditions:</span>
                  {incentive.conditions.map((condition, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {condition}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Loop Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-card/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-5 h-5 text-primary" />
              <span className="font-medium">Organic Compound Rate</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Self-propagation</span>
                <span className="text-emerald-400">+23%</span>
              </div>
              <Progress value={73} className="h-2" />
              <p className="text-xs text-muted-foreground">Referrals generating referrals</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span className="font-medium">Cost Trend</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cost per referral</span>
                <span className="text-emerald-400">-12% MoM</span>
              </div>
              <Progress value={30} className="h-2" />
              <p className="text-xs text-muted-foreground">Decreasing as designed</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Gift className="w-5 h-5 text-pink-400" />
              <span className="font-medium">Incentive Efficiency</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">LTV per $ spent</span>
                <span className="text-pink-400">$47.20</span>
              </div>
              <Progress value={85} className="h-2" />
              <p className="text-xs text-muted-foreground">ROI on referral incentives</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Final Rule */}
      <Card className="bg-card/60 border-pink-500/30">
        <CardContent className="p-4">
          <div className="text-center">
            <p className="font-bold text-pink-400 mb-1">REFERRAL LOOP LAW</p>
            <p className="text-xs text-muted-foreground">
              Referral loops must: Compound organically • Self-propagate • Cost less over time, not more
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
