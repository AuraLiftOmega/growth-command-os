import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Users,
  ArrowUpRight,
  Zap,
  Shield,
  Crown,
  ToggleLeft,
  ToggleRight,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  Settings2,
  Percent,
  Target,
  Activity,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  useCashEngineStore, 
  calculateSwitchingCost,
  getUpgradeMessage 
} from '@/stores/cash-engine-store';

/**
 * PERPETUAL CASH ENGINE MODE™
 * 
 * Dashboard for managing:
 * - Automatic Price Lifts
 * - Upgrade Gravity
 * - Churn Prevention
 * - Founder Sovereignty
 */

export const CashEngineDashboard = () => {
  const { isActive, activate, deactivate } = useCashEngineStore();

  return (
    <div className="space-y-6">
      {/* Engine Status Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-4 rounded-xl bg-card border border-border"
      >
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            isActive ? "bg-success/20" : "bg-secondary"
          )}>
            <DollarSign className={cn(
              "w-6 h-6",
              isActive ? "text-success" : "text-muted-foreground"
            )} />
          </div>
          <div>
            <h2 className="text-lg font-bold">Perpetual Cash Engine</h2>
            <p className="text-sm text-muted-foreground">
              {isActive ? 'Optimizing for long-term cash flow' : 'Engine inactive'}
            </p>
          </div>
        </div>
        
        <Button
          onClick={isActive ? deactivate : activate}
          variant={isActive ? "outline" : "default"}
          className={isActive ? "" : "bg-success hover:bg-success/90"}
        >
          {isActive ? (
            <>
              <ToggleRight className="w-4 h-4 mr-2" />
              Deactivate
            </>
          ) : (
            <>
              <ToggleLeft className="w-4 h-4 mr-2" />
              Activate Engine
            </>
          )}
        </Button>
      </motion.div>

      {/* Key Metrics */}
      <CashMetricsGrid />

      {/* Main Tabs */}
      <Tabs defaultValue="price-lift" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="price-lift" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Price Lift
          </TabsTrigger>
          <TabsTrigger value="upgrade-gravity" className="gap-2">
            <ArrowUpRight className="w-4 h-4" />
            Upgrade Gravity
          </TabsTrigger>
          <TabsTrigger value="churn-prevention" className="gap-2">
            <Shield className="w-4 h-4" />
            Churn Prevention
          </TabsTrigger>
          <TabsTrigger value="founder-control" className="gap-2">
            <Crown className="w-4 h-4" />
            Founder Control
          </TabsTrigger>
        </TabsList>

        <TabsContent value="price-lift">
          <PriceLiftPanel />
        </TabsContent>

        <TabsContent value="upgrade-gravity">
          <UpgradeGravityPanel />
        </TabsContent>

        <TabsContent value="churn-prevention">
          <ChurnPreventionPanel />
        </TabsContent>

        <TabsContent value="founder-control">
          <FounderSovereigntyPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

/**
 * CASH METRICS GRID
 */
const CashMetricsGrid = () => {
  const { currentMRR, projectedMRR, avgLTV, churnRate, expansionRevenue } = useCashEngineStore();

  const metrics = [
    { 
      label: 'Current MRR', 
      value: `$${currentMRR.toLocaleString()}`, 
      change: '+12.4%',
      positive: true,
      icon: DollarSign 
    },
    { 
      label: 'Projected MRR', 
      value: `$${projectedMRR.toLocaleString()}`, 
      change: '+9.5%',
      positive: true,
      icon: TrendingUp 
    },
    { 
      label: 'Average LTV', 
      value: `$${avgLTV.toLocaleString()}`, 
      change: '+18.2%',
      positive: true,
      icon: Users 
    },
    { 
      label: 'Churn Rate', 
      value: `${churnRate}%`, 
      change: '-0.3%',
      positive: true,
      icon: TrendingDown 
    },
    { 
      label: 'Expansion Revenue', 
      value: `$${expansionRevenue.toLocaleString()}`, 
      change: '+23.1%',
      positive: true,
      icon: ArrowUpRight 
    },
  ];

  return (
    <div className="grid grid-cols-5 gap-4">
      {metrics.map((metric, i) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="p-4 rounded-xl bg-card border border-border"
        >
          <div className="flex items-center gap-2 mb-2">
            <metric.icon className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{metric.label}</span>
          </div>
          <p className="text-xl font-bold">{metric.value}</p>
          <p className={cn(
            "text-xs font-medium",
            metric.positive ? "text-success" : "text-destructive"
          )}>
            {metric.change}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

/**
 * AUTOMATIC PRICE LIFT PANEL
 */
const PriceLiftPanel = () => {
  const { 
    priceLiftRules, 
    togglePriceLiftRule, 
    lastPriceLift, 
    totalPriceLiftsApplied 
  } = useCashEngineStore();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Automatic Price Lift System</h3>
          <p className="text-sm text-muted-foreground">
            Pricing power grows invisibly based on value realization
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">
            Last lift: {lastPriceLift ? new Date(lastPriceLift).toLocaleDateString() : 'Never'}
          </span>
          <Badge variant="secondary">
            {totalPriceLiftsApplied} lifts applied
          </Badge>
        </div>
      </div>

      <div className="space-y-3">
        {priceLiftRules.map((rule) => (
          <motion.div
            key={rule.id}
            layout
            className={cn(
              "p-4 rounded-lg border transition-colors",
              rule.isActive 
                ? "bg-card border-border" 
                : "bg-secondary/30 border-border/50"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  rule.isActive ? "bg-primary/20" : "bg-secondary"
                )}>
                  <Percent className={cn(
                    "w-5 h-5",
                    rule.isActive ? "text-primary" : "text-muted-foreground"
                  )} />
                </div>
                <div>
                  <p className="font-medium">{rule.name}</p>
                  <p className="text-xs text-muted-foreground">
                    +{rule.liftPercentage}% for {rule.appliesTo.replace('_', ' ')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Badge variant={rule.trigger === 'value_realization' ? 'default' : 'secondary'}>
                  {rule.trigger.replace('_', ' ')}
                </Badge>
                <Switch
                  checked={rule.isActive}
                  onCheckedChange={() => togglePriceLiftRule(rule.id)}
                />
              </div>
            </div>

            {rule.conditions && Object.keys(rule.conditions).length > 0 && (
              <div className="mt-3 pt-3 border-t border-border/50 flex gap-4 text-xs text-muted-foreground">
                {rule.conditions.minUsagePercent && (
                  <span>Min usage: {rule.conditions.minUsagePercent}%</span>
                )}
                {rule.conditions.minDaysActive && (
                  <span>Min days: {rule.conditions.minDaysActive}</span>
                )}
                {rule.conditions.minRevenueGenerated && (
                  <span>Min revenue: ${rule.conditions.minRevenueGenerated.toLocaleString()}</span>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
        <p className="text-xs text-primary">
          <span className="font-semibold">Cash Engine Law:</span> Price increases anchor to outcomes, not time
        </p>
      </div>
    </div>
  );
};

/**
 * UPGRADE GRAVITY PANEL
 */
const UpgradeGravityPanel = () => {
  const { upgradeGravityRules, toggleUpgradeGravityRule, upgradeConversionRate } = useCashEngineStore();

  const tierIcons = {
    core: Zap,
    scale: Shield,
    dominion: Crown,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Upgrade Gravity Engine</h3>
          <p className="text-sm text-muted-foreground">
            Customers upgrade voluntarily after experiencing constraint
          </p>
        </div>
        <Badge variant="outline" className="text-success">
          {upgradeConversionRate}% conversion rate
        </Badge>
      </div>

      <div className="space-y-3">
        {upgradeGravityRules.map((rule) => {
          const FromIcon = tierIcons[rule.fromTier as keyof typeof tierIcons] || Zap;
          const ToIcon = tierIcons[rule.toTier as keyof typeof tierIcons] || Crown;

          return (
            <motion.div
              key={rule.id}
              layout
              className={cn(
                "p-4 rounded-lg border transition-colors",
                rule.isActive 
                  ? "bg-card border-border" 
                  : "bg-secondary/30 border-border/50"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Tier flow */}
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                      <FromIcon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-primary" />
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <ToIcon className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                  
                  <div>
                    <p className="font-medium">
                      {rule.fromTier.toUpperCase()} → {rule.toTier.toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getUpgradeMessage(rule.messagingStyle, rule.toTier)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Trigger</p>
                    <p className="text-sm font-medium">
                      {rule.triggerType.replace('_', ' ')} @ {rule.triggerThreshold}
                      {rule.triggerType === 'usage_limit' ? '%' : ''}
                    </p>
                  </div>
                  <Switch
                    checked={rule.isActive}
                    onCheckedChange={() => toggleUpgradeGravityRule(rule.id)}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
        <p className="text-xs text-warning">
          <span className="font-semibold">Gravity Rule:</span> Lower tiers feel constrained only after success
        </p>
      </div>
    </div>
  );
};

/**
 * CHURN PREVENTION PANEL
 */
const ChurnPreventionPanel = () => {
  const { 
    activeChurnSignals, 
    churnInterventionSuccess,
    dependencyMetrics,
    avgDependencyDepth,
    triggerIntervention,
    resolveChurnSignal
  } = useCashEngineStore();

  return (
    <div className="space-y-6">
      {/* Dependency Depth */}
      <div className="p-4 rounded-xl bg-card border border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Dependency Depth</h3>
            <p className="text-sm text-muted-foreground">
              {calculateSwitchingCost(dependencyMetrics)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{avgDependencyDepth}%</p>
            <p className="text-xs text-muted-foreground">Average depth</p>
          </div>
        </div>

        <div className="space-y-3">
          {dependencyMetrics.map((metric) => (
            <div key={metric.category}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span>{metric.category}</span>
                <span className="text-muted-foreground">{metric.depth}%</span>
              </div>
              <Progress value={metric.depth} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Switching cost: <span className={cn(
                  "font-medium",
                  metric.switchingCost === 'extreme' && "text-success",
                  metric.switchingCost === 'high' && "text-primary",
                  metric.switchingCost === 'medium' && "text-warning",
                  metric.switchingCost === 'low' && "text-destructive"
                )}>{metric.switchingCost}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Active Churn Signals */}
      <div className="p-4 rounded-xl bg-card border border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Active Churn Signals</h3>
            <p className="text-sm text-muted-foreground">
              {churnInterventionSuccess}% intervention success rate
            </p>
          </div>
          <Badge variant={activeChurnSignals.length > 0 ? 'destructive' : 'secondary'}>
            {activeChurnSignals.length} active
          </Badge>
        </div>

        {activeChurnSignals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-success" />
            <p className="text-sm">No active churn signals detected</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeChurnSignals.map((signal) => (
              <div
                key={signal.id}
                className={cn(
                  "p-3 rounded-lg border flex items-center justify-between",
                  signal.severity === 'critical' && "bg-destructive/10 border-destructive/30",
                  signal.severity === 'high' && "bg-warning/10 border-warning/30",
                  signal.severity === 'medium' && "bg-secondary border-border",
                  signal.severity === 'low' && "bg-secondary/50 border-border/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className={cn(
                    "w-4 h-4",
                    signal.severity === 'critical' && "text-destructive",
                    signal.severity === 'high' && "text-warning",
                    signal.severity === 'medium' && "text-muted-foreground"
                  )} />
                  <div>
                    <p className="text-sm font-medium">{signal.signalType.replace('_', ' ')}</p>
                    <p className="text-xs text-muted-foreground">{signal.customerId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!signal.interventionTriggered ? (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => triggerIntervention(signal.id)}
                    >
                      Intervene
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => resolveChurnSignal(signal.id)}
                    >
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 rounded-lg bg-success/10 border border-success/20">
        <p className="text-xs text-success">
          <span className="font-semibold">Dependency Law:</span> Churn should feel irresponsible
        </p>
      </div>
    </div>
  );
};

/**
 * FOUNDER SOVEREIGNTY PANEL
 */
const FounderSovereigntyPanel = () => {
  const { founderOverrides, setFounderOverride, instantPriceAdjust } = useCashEngineStore();
  const [adjustmentValue, setAdjustmentValue] = useState(10);

  const overrideItems = [
    { key: 'pricingLocked' as const, label: 'Pricing Control', description: 'Lock pricing structure' },
    { key: 'accessLocked' as const, label: 'Access Control', description: 'Lock access rules' },
    { key: 'limitsLocked' as const, label: 'Limits Control', description: 'Lock usage limits' },
    { key: 'availabilityLocked' as const, label: 'Availability Control', description: 'Lock availability rules' },
  ];

  return (
    <div className="space-y-6">
      {/* Sovereignty Status */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
        <div className="flex items-center gap-3 mb-2">
          <Crown className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Founder Sovereignty Active</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          You control the cash engine. The cash engine does not control you.
        </p>
      </div>

      {/* Override Controls */}
      <div className="p-4 rounded-xl bg-card border border-border">
        <h3 className="font-semibold mb-4">Override Controls</h3>
        <div className="space-y-3">
          {overrideItems.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
            >
              <div className="flex items-center gap-3">
                {founderOverrides[item.key] ? (
                  <Lock className="w-4 h-4 text-warning" />
                ) : (
                  <Unlock className="w-4 h-4 text-success" />
                )}
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
              <Switch
                checked={!founderOverrides[item.key]}
                onCheckedChange={(checked) => setFounderOverride(item.key, !checked)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Instant Adjustment */}
      <div className="p-4 rounded-xl bg-card border border-border">
        <h3 className="font-semibold mb-4">Instant Adjustment</h3>
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={() => instantPriceAdjust({ type: 'percentage', value: adjustmentValue, scope: 'new' })}
          >
            +{adjustmentValue}% New Customers
          </Button>
          <Button
            variant="outline"
            onClick={() => instantPriceAdjust({ type: 'percentage', value: adjustmentValue, scope: 'all' })}
          >
            +{adjustmentValue}% All Customers
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Changes apply immediately without platform approval
        </p>
      </div>

      <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
        <p className="text-xs text-accent-foreground">
          <span className="font-semibold">Final Law:</span> DOMINION is not a startup. It is a private infrastructure monopoly for revenue.
        </p>
      </div>
    </div>
  );
};

export default CashEngineDashboard;
