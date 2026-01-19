import { 
  Shield, 
  FolderCheck, 
  Webhook, 
  TrendingUp, 
  DollarSign, 
  Users, 
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { SpineProject, SpineAlert, MetricsSummary, StripeHealthStatus } from '@/lib/payments-spine';

interface GlobalStatusCardsProps {
  stripeHealth?: StripeHealthStatus;
  metrics?: MetricsSummary;
  projects: SpineProject[];
  alerts: SpineAlert[];
  isLoading: boolean;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(num);
}

export function GlobalStatusCards({
  stripeHealth,
  metrics,
  projects,
  alerts,
  isLoading,
}: GlobalStatusCardsProps) {
  const boundCorrectly = projects.filter(
    p => p.project_stripe_bindings?.some(b => b.status === 'ok')
  ).length;
  const totalProjects = projects.length;
  const bindingPercentage = totalProjects > 0 
    ? Math.round((boundCorrectly / totalProjects) * 100) 
    : 100;

  const openAlerts = alerts.filter(a => a.status === 'open').length;
  const criticalAlerts = alerts.filter(a => a.status === 'open' && a.severity === 'critical').length;

  const paymentSuccessRate = metrics?.totals
    ? Math.round(
        (metrics.totals.successful_payments / 
          (metrics.totals.successful_payments + metrics.totals.failed_payments || 1)) * 100
      )
    : 100;

  const cards = [
    {
      title: 'Canonical Stripe',
      value: stripeHealth?.platform_account_id || 'Not Set',
      subtitle: stripeHealth?.checked_at 
        ? `Verified ${new Date(stripeHealth.checked_at).toLocaleTimeString()}`
        : 'Checking...',
      icon: Shield,
      status: stripeHealth?.status === 'OK' ? 'success' : 
              stripeHealth?.status === 'WARN' ? 'warning' : 
              stripeHealth?.status === 'FAIL' ? 'error' : 'neutral',
    },
    {
      title: 'Projects Bound',
      value: `${boundCorrectly}/${totalProjects}`,
      subtitle: `${bindingPercentage}% correctly bound`,
      icon: FolderCheck,
      status: bindingPercentage === 100 ? 'success' : 
              bindingPercentage >= 80 ? 'warning' : 'error',
    },
    {
      title: 'Webhook Health',
      value: stripeHealth?.webhook_health?.healthy ? 'Healthy' : 'Degraded',
      subtitle: stripeHealth?.webhook_health?.last_event_time
        ? `Last: ${new Date(stripeHealth.webhook_health.last_event_time).toLocaleString()}`
        : 'No recent events',
      icon: Webhook,
      status: stripeHealth?.webhook_health?.healthy ? 'success' : 'warning',
    },
    {
      title: 'Payment Success',
      value: `${paymentSuccessRate}%`,
      subtitle: `${formatNumber(metrics?.totals?.successful_payments || 0)} successful`,
      icon: TrendingUp,
      status: paymentSuccessRate >= 95 ? 'success' : 
              paymentSuccessRate >= 80 ? 'warning' : 'error',
    },
    {
      title: 'MRR',
      value: formatCurrency(metrics?.mrr_cents || 0),
      subtitle: `${formatNumber(metrics?.active_subscriptions || 0)} active subs`,
      icon: DollarSign,
      status: 'neutral',
    },
    {
      title: 'Disputes Open',
      value: metrics?.totals?.disputes_opened || 0,
      subtitle: openAlerts > 0 
        ? `${criticalAlerts} critical alerts`
        : 'All clear',
      icon: criticalAlerts > 0 ? AlertTriangle : CheckCircle,
      status: criticalAlerts > 0 ? 'error' : 
              openAlerts > 0 ? 'warning' : 'success',
    },
  ];

  const statusStyles = {
    success: 'border-emerald-500/20 bg-emerald-500/5',
    warning: 'border-amber-500/20 bg-amber-500/5',
    error: 'border-red-500/20 bg-red-500/5',
    neutral: 'border-border bg-card',
  };

  const iconStyles = {
    success: 'text-emerald-500',
    warning: 'text-amber-500',
    error: 'text-red-500',
    neutral: 'text-muted-foreground',
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <Card 
          key={card.title} 
          className={cn(
            'overflow-hidden transition-all hover:shadow-lg',
            statusStyles[card.status]
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className={cn('h-4 w-4', iconStyles[card.status])} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">{card.value}</div>
            <p className="text-xs text-muted-foreground truncate">{card.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
