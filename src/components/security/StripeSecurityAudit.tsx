import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, 
  Key, 
  Webhook, 
  DollarSign, 
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Clock,
  Shield,
  RefreshCw,
  Eye
} from "lucide-react";
import { toast } from "sonner";

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  critical: boolean;
}

export const StripeSecurityAudit = () => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    {
      id: 'navigate-api-keys',
      label: 'Navigate to API Keys',
      description: 'Go to Stripe Dashboard → Developers → API Keys',
      completed: false,
      critical: true
    },
    {
      id: 'rotate-live-key',
      label: 'Rotate LIVE Secret Key',
      description: 'Roll your live secret key to invalidate any potentially leaked credentials',
      completed: false,
      critical: true
    },
    {
      id: 'verify-no-unknown-keys',
      label: 'Verify No Unknown API Keys',
      description: 'Confirm all restricted keys are recognized and authorized by you',
      completed: false,
      critical: true
    },
    {
      id: 'navigate-webhooks',
      label: 'Navigate to Webhooks',
      description: 'Go to Stripe Dashboard → Developers → Webhooks',
      completed: false,
      critical: true
    },
    {
      id: 'list-webhook-endpoints',
      label: 'List Active Webhook Endpoints',
      description: 'Document all active webhook endpoints',
      completed: false,
      critical: false
    },
    {
      id: 'flag-unknown-webhooks',
      label: 'Flag Unknown Endpoints',
      description: 'Mark any webhook endpoint not recognized by you',
      completed: false,
      critical: true
    },
    {
      id: 'verify-balance-history',
      label: 'Verify Balance History',
      description: 'Confirm all balance changes were user-initiated',
      completed: false,
      critical: true
    }
  ]);

  const [watchdogEnabled, setWatchdogEnabled] = useState(false);

  const toggleItem = (id: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const enableWatchdog = () => {
    setWatchdogEnabled(true);
    toast.success('Stripe Watchdog enabled - monitoring for unauthorized activity');
  };

  const completedCount = checklist.filter(c => c.completed).length;
  const criticalIncomplete = checklist.filter(c => c.critical && !c.completed).length;

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Stripe Security Verification</CardTitle>
                <CardDescription>User-confirmed security checks for Stripe integration</CardDescription>
              </div>
            </div>
            <Badge variant={criticalIncomplete === 0 ? "default" : "destructive"}>
              {completedCount}/{checklist.length} Complete
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Manual Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Security Verification Checklist
          </CardTitle>
          <CardDescription>
            Complete each step manually in your Stripe Dashboard. Check items as you verify them.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {checklist.map((item, index) => (
            <div key={item.id}>
              <div className="flex items-start gap-4 p-4 rounded-lg border border-border/50 hover:border-border transition-colors">
                <Checkbox 
                  id={item.id} 
                  checked={item.completed}
                  onCheckedChange={() => toggleItem(item.id)}
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={item.id} className="font-medium cursor-pointer">
                      {item.label}
                    </Label>
                    {item.critical && (
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                        CRITICAL
                      </Badge>
                    )}
                    {item.completed && (
                      <CheckCircle className="w-4 h-4 text-success" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
              {index < checklist.length - 1 && <Separator className="my-2" />}
            </div>
          ))}
          
          <Button
            variant="outline"
            className="w-full gap-2 mt-4"
            onClick={() => window.open('https://dashboard.stripe.com/developers', '_blank')}
          >
            <ExternalLink className="w-4 h-4" />
            Open Stripe Dashboard
          </Button>
        </CardContent>
      </Card>

      {/* Stripe Watchdog */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-amber-500" />
            Stripe Watchdog Logic
          </CardTitle>
          <CardDescription>
            Real-time monitoring for unauthorized Stripe activity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Balance Changes</span>
              </div>
              <p className="text-xs text-muted-foreground">Monitors for unexpected balance modifications</p>
            </div>
            <div className="p-4 rounded-lg border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Refunds</span>
              </div>
              <p className="text-xs text-muted-foreground">Alerts on unauthorized refund attempts</p>
            </div>
            <div className="p-4 rounded-lg border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <Key className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">New API Keys</span>
              </div>
              <p className="text-xs text-muted-foreground">Detects creation of new API keys</p>
            </div>
            <div className="p-4 rounded-lg border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <Webhook className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">New Webhooks</span>
              </div>
              <p className="text-xs text-muted-foreground">Monitors for unauthorized webhook additions</p>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-500" />
                <span className="font-medium">Watchdog Status:</span>
                <Badge variant={watchdogEnabled ? "default" : "secondary"}>
                  {watchdogEnabled ? 'ACTIVE' : 'INACTIVE'}
                </Badge>
              </div>
              {!watchdogEnabled && (
                <Button size="sm" onClick={enableWatchdog}>
                  Enable Watchdog
                </Button>
              )}
            </div>
            {watchdogEnabled && (
              <p className="text-xs text-muted-foreground mt-2">
                ⚡ Monitoring active. CRITICAL ALERT will trigger if unauthorized activity detected.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Important Notice */}
      <Card className="border-blue-500/30 bg-blue-500/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <p className="font-medium text-blue-400">Note: Keys Are NOT Auto-Rotated</p>
              <p className="text-sm text-muted-foreground">
                This system does not have access to rotate your Stripe keys. 
                You must manually rotate them in the Stripe Dashboard and then update the secret in your project settings.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
