import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Webhook,
  CreditCard,
  Users,
  Settings,
  Clock,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { StripeHealthStatus } from '@/lib/payments-spine';

interface StripeObjectsHealthProps {
  stripeHealth?: StripeHealthStatus;
  isLoading: boolean;
}

interface HealthCheck {
  name: string;
  description: string;
  status: 'ok' | 'warn' | 'fail' | 'unknown';
  details?: string;
  icon: typeof Shield;
}

export function StripeObjectsHealth({ stripeHealth, isLoading }: StripeObjectsHealthProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="rounded-2xl">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  const healthChecks: HealthCheck[] = [
    {
      name: 'Stripe API Connectivity',
      description: 'Verifies that the Stripe API is reachable and responding',
      status: stripeHealth?.stripe_api_reachable ? 'ok' : 'fail',
      details: stripeHealth?.stripe_api_reachable 
        ? `Connected successfully (${stripeHealth.validation_duration_ms}ms)`
        : 'Unable to connect to Stripe API',
      icon: CreditCard,
    },
    {
      name: 'Canonical Account Binding',
      description: 'Confirms the platform account matches the configured canonical ID',
      status: stripeHealth?.account_id_matches ? 'ok' : 'fail',
      details: stripeHealth?.platform_account_id 
        ? `Account: ${stripeHealth.platform_account_id}`
        : 'No platform account configured',
      icon: Shield,
    },
    {
      name: 'Webhook Event Flow',
      description: 'Monitors webhook event reception and processing',
      status: stripeHealth?.webhook_health?.healthy ? 'ok' : 
              stripeHealth?.webhook_health?.last_event_time ? 'warn' : 'unknown',
      details: stripeHealth?.webhook_health?.last_event_time
        ? `Last event: ${new Date(stripeHealth.webhook_health.last_event_time).toLocaleString()}`
        : 'No recent webhook events detected',
      icon: Webhook,
    },
    {
      name: 'Overall Health Status',
      description: 'Combined status of all Stripe integration checks',
      status: stripeHealth?.status === 'OK' ? 'ok' : 
              stripeHealth?.status === 'WARN' ? 'warn' : 'fail',
      details: `Status: ${stripeHealth?.status || 'UNKNOWN'}`,
      icon: Settings,
    },
  ];

  const statusColors = {
    ok: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
    warn: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
    fail: 'bg-red-500/10 border-red-500/20 text-red-500',
    unknown: 'bg-muted border-muted text-muted-foreground',
  };

  const statusIcons = {
    ok: CheckCircle,
    warn: AlertTriangle,
    fail: XCircle,
    unknown: Clock,
  };

  return (
    <div className="space-y-6">
      {/* Main Health Card */}
      <Card className="rounded-2xl overflow-hidden">
        <div className={cn(
          'px-6 py-4',
          stripeHealth?.status === 'OK' ? 'bg-emerald-500/10' :
          stripeHealth?.status === 'WARN' ? 'bg-amber-500/10' :
          'bg-red-500/10'
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className={cn(
                'h-8 w-8',
                stripeHealth?.status === 'OK' ? 'text-emerald-500' :
                stripeHealth?.status === 'WARN' ? 'text-amber-500' :
                'text-red-500'
              )} />
              <div>
                <h2 className="text-xl font-bold">Canonical Stripe Configuration</h2>
                <p className="text-sm text-muted-foreground">
                  Platform-wide Stripe integration health
                </p>
              </div>
            </div>
            <Badge className={cn(
              'text-lg px-4 py-1',
              stripeHealth?.status === 'OK' ? 'bg-emerald-500 text-white' :
              stripeHealth?.status === 'WARN' ? 'bg-amber-500 text-white' :
              'bg-red-500 text-white'
            )}>
              {stripeHealth?.status || 'UNKNOWN'}
            </Badge>
          </div>
        </div>
        
        <CardContent className="p-6 space-y-4">
          {healthChecks.map((check, index) => {
            const StatusIcon = statusIcons[check.status];
            
            return (
              <div key={check.name}>
                <div className={cn(
                  'flex items-start gap-4 p-4 rounded-xl border transition-all',
                  statusColors[check.status]
                )}>
                  <check.icon className="h-6 w-6 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold">{check.name}</h3>
                      <Badge variant="outline" className={cn(
                        'gap-1',
                        statusColors[check.status]
                      )}>
                        <StatusIcon className="h-3 w-3" />
                        {check.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {check.description}
                    </p>
                    {check.details && (
                      <p className="text-sm font-mono mt-2 opacity-80">
                        {check.details}
                      </p>
                    )}
                  </div>
                </div>
                {index < healthChecks.length - 1 && (
                  <Separator className="my-4" />
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Quick Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Platform Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-mono font-bold truncate">
              {stripeHealth?.platform_account_id || 'Not configured'}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Last Validation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {stripeHealth?.checked_at 
                ? new Date(stripeHealth.checked_at).toLocaleTimeString()
                : 'Never'}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Validation Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {stripeHealth?.validation_duration_ms 
                ? `${stripeHealth.validation_duration_ms}ms`
                : '-'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Reference */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Configuration Reference</CardTitle>
          <CardDescription>
            Required environment variables for Payments Spine integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 font-mono text-sm">
            {[
              { name: 'STRIPE_SECRET_KEY', description: 'Stripe secret key (sk_live_* or sk_test_*)' },
              { name: 'STRIPE_PUBLISHABLE_KEY', description: 'Stripe publishable key (pk_live_* or pk_test_*)' },
              { name: 'STRIPE_WEBHOOK_SECRET', description: 'Webhook signing secret (whsec_*)' },
              { name: 'STRIPE_PLATFORM_ACCOUNT_ID', description: 'Canonical platform account ID (acct_*)' },
              { name: 'APP_ENV', description: 'Environment (dev | staging | prod)' },
              { name: 'PROJECT_ID', description: 'Unique project identifier' },
              { name: 'PROJECT_NAME', description: 'Human-readable project name' },
            ].map((envVar) => (
              <div 
                key={envVar.name}
                className="flex items-start justify-between p-3 rounded-lg bg-muted/50"
              >
                <code className="text-primary font-semibold">{envVar.name}</code>
                <span className="text-muted-foreground text-xs text-right max-w-[60%]">
                  {envVar.description}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
