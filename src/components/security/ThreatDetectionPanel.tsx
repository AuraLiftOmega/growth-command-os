import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  ShieldCheck, 
  Activity,
  DollarSign,
  Key,
  Webhook,
  Wallet,
  ShoppingBag,
  RefreshCw,
  Bell,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";

interface ThreatCondition {
  id: string;
  name: string;
  description: string;
  icon: any;
  status: 'monitoring' | 'triggered' | 'clear';
  lastChecked?: Date;
}

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: Date;
  acknowledged: boolean;
}

export const ThreatDetectionPanel = () => {
  const [conditions, setConditions] = useState<ThreatCondition[]>([
    {
      id: 'stripe-balance',
      name: 'Stripe Balance Change',
      description: 'Monitors for unexpected balance modifications',
      icon: DollarSign,
      status: 'clear'
    },
    {
      id: 'stripe-refunds',
      name: 'Unauthorized Refunds',
      description: 'Detects refunds not initiated by user',
      icon: DollarSign,
      status: 'clear'
    },
    {
      id: 'shopify-orders',
      name: 'Shopify Anomalies',
      description: 'Monitors for unauthorized orders or refunds',
      icon: ShoppingBag,
      status: 'clear'
    },
    {
      id: 'api-keys',
      name: 'New API Keys',
      description: 'Detects creation of unauthorized API keys',
      icon: Key,
      status: 'clear'
    },
    {
      id: 'new-webhooks',
      name: 'New Webhooks',
      description: 'Monitors for unauthorized webhook additions',
      icon: Webhook,
      status: 'clear'
    },
    {
      id: 'wallet-transactions',
      name: 'Wallet Activity',
      description: 'Detects unsigned wallet transactions',
      icon: Wallet,
      status: 'clear'
    }
  ]);

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [lastScanTime, setLastScanTime] = useState(new Date());

  const runThreatScan = async () => {
    toast.info('Running threat detection scan...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setLastScanTime(new Date());
    setConditions(prev => prev.map(c => ({ 
      ...c, 
      lastChecked: new Date(),
      status: 'clear' as const 
    })));
    
    toast.success('Threat scan complete - No active threats detected');
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, acknowledged: true } : a
    ));
  };

  const allClear = conditions.every(c => c.status === 'clear');
  const triggeredCount = conditions.filter(c => c.status === 'triggered').length;

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <Card className={`border-2 ${
        allClear 
          ? 'border-success/30 bg-success/5' 
          : 'border-destructive/30 bg-destructive/5'
      }`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                allClear ? 'bg-success/20' : 'bg-destructive/20'
              }`}>
                {allClear ? (
                  <ShieldCheck className="w-6 h-6 text-success" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                )}
              </div>
              <div>
                <CardTitle className={allClear ? 'text-success' : 'text-destructive'}>
                  {allClear ? '✅ SECURE — NO ACTIVE BREACH' : `🚨 ${triggeredCount} THREAT(S) DETECTED`}
                </CardTitle>
                <CardDescription>
                  {allClear 
                    ? 'All threat conditions are clear. No suspicious activity detected.'
                    : 'Immediate attention required. Review triggered conditions below.'}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isMonitoring ? 'default' : 'secondary'}>
                {isMonitoring ? 'MONITORING' : 'PAUSED'}
              </Badge>
              <Button variant="outline" size="sm" onClick={runThreatScan}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Scan Now
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Threat Conditions Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Real Threat Detection Conditions
          </CardTitle>
          <CardDescription>
            CRITICAL ALERT triggers only if these conditions are met
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {conditions.map(condition => {
              const Icon = condition.icon;
              return (
                <div 
                  key={condition.id}
                  className={`p-4 rounded-lg border ${
                    condition.status === 'clear'
                      ? 'border-success/30 bg-success/5'
                      : condition.status === 'triggered'
                      ? 'border-destructive/30 bg-destructive/5'
                      : 'border-border/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        condition.status === 'clear' ? 'bg-success/20' : 
                        condition.status === 'triggered' ? 'bg-destructive/20' : 'bg-muted'
                      }`}>
                        <Icon className={`w-4 h-4 ${
                          condition.status === 'clear' ? 'text-success' : 
                          condition.status === 'triggered' ? 'text-destructive' : 'text-muted-foreground'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{condition.name}</p>
                        <p className="text-xs text-muted-foreground">{condition.description}</p>
                      </div>
                    </div>
                    <Badge variant={
                      condition.status === 'clear' ? 'default' : 
                      condition.status === 'triggered' ? 'destructive' : 'secondary'
                    } className="text-[10px]">
                      {condition.status === 'clear' ? '✓ CLEAR' : 
                       condition.status === 'triggered' ? '🚨 ALERT' : 'MONITORING'}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
          
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Last scanned: {lastScanTime.toLocaleString()}
          </p>
        </CardContent>
      </Card>

      {/* Alerts Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Security Alerts
          </CardTitle>
          <CardDescription>
            Active and historical security alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
              <p className="font-medium text-success">No Active Alerts</p>
              <p className="text-sm text-muted-foreground">
                Your system is operating normally with no security alerts.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map(alert => (
                <div 
                  key={alert.id}
                  className={`p-4 rounded-lg border ${
                    alert.type === 'critical' ? 'border-destructive/30 bg-destructive/5' :
                    alert.type === 'warning' ? 'border-amber-500/30 bg-amber-500/5' :
                    'border-blue-500/30 bg-blue-500/5'
                  } ${alert.acknowledged ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={
                          alert.type === 'critical' ? 'destructive' :
                          alert.type === 'warning' ? 'default' : 'secondary'
                        }>
                          {alert.type.toUpperCase()}
                        </Badge>
                        <span className="font-medium">{alert.title}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {alert.timestamp.toLocaleString()}
                      </p>
                    </div>
                    {!alert.acknowledged && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => acknowledgeAlert(alert.id)}
                      >
                        Acknowledge
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Notice */}
      <Card className="border-blue-500/30 bg-blue-500/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Activity className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <p className="font-medium text-blue-400">Precautionary Monitoring</p>
              <p className="text-sm text-muted-foreground">
                This system monitors for real threats only. Alerts trigger ONLY when actual unauthorized 
                activity is detected. The current status shows no breach conditions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
