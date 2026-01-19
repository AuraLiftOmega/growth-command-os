import { 
  Webhook, 
  Activity, 
  Clock, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';

interface WebhookHealth {
  events_per_hour: number;
  total_events: number;
  failed_events: number;
  last_event_time?: string;
  event_types: Record<string, number>;
}

interface WebhookHealthPanelProps {
  webhookHealth?: WebhookHealth;
  isLoading: boolean;
}

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(diff / 86400000);
  return `${days}d ago`;
}

export function WebhookHealthPanel({ webhookHealth, isLoading }: WebhookHealthPanelProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-2xl lg:col-span-1">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>
        <Card className="rounded-2xl lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const successRate = webhookHealth 
    ? ((webhookHealth.total_events - webhookHealth.failed_events) / webhookHealth.total_events * 100) || 100
    : 100;

  const eventTypeData = Object.entries(webhookHealth?.event_types || {})
    .map(([type, count]) => ({
      type: type.replace('customer.subscription.', 'sub.').replace('payment_intent.', 'pi.'),
      fullType: type,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const stats = [
    {
      label: 'Events/Hour',
      value: webhookHealth?.events_per_hour?.toFixed(1) || '0',
      icon: Activity,
      color: 'text-blue-500',
    },
    {
      label: 'Total Events',
      value: webhookHealth?.total_events?.toLocaleString() || '0',
      icon: Webhook,
      color: 'text-emerald-500',
    },
    {
      label: 'Failed Events',
      value: webhookHealth?.failed_events?.toLocaleString() || '0',
      icon: webhookHealth?.failed_events ? XCircle : CheckCircle,
      color: webhookHealth?.failed_events ? 'text-red-500' : 'text-emerald-500',
    },
    {
      label: 'Last Event',
      value: formatRelativeTime(webhookHealth?.last_event_time),
      icon: Clock,
      color: 'text-amber-500',
    },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Stats Panel */}
      <Card className="rounded-2xl lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Webhook Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Success Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Success Rate</span>
              <span className="font-semibold">{successRate.toFixed(1)}%</span>
            </div>
            <Progress 
              value={successRate} 
              className={cn(
                'h-2',
                successRate >= 95 ? '[&>div]:bg-emerald-500' :
                successRate >= 80 ? '[&>div]:bg-amber-500' :
                '[&>div]:bg-red-500'
              )}
            />
          </div>

          {/* Stat Cards */}
          {stats.map((stat) => (
            <div 
              key={stat.label}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <stat.icon className={cn('h-5 w-5', stat.color)} />
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
              <span className="font-semibold">{stat.value}</span>
            </div>
          ))}

          {/* Health Status */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Health</span>
              <Badge className={cn(
                successRate >= 95 && webhookHealth?.total_events 
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : successRate >= 80 
                  ? 'bg-amber-500/10 text-amber-500'
                  : 'bg-red-500/10 text-red-500'
              )}>
                {successRate >= 95 && webhookHealth?.total_events ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Healthy
                  </>
                ) : successRate >= 80 ? (
                  <>
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Degraded
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3 mr-1" />
                    Critical
                  </>
                )}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Types Chart */}
      <Card className="rounded-2xl lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Event Types Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          {eventTypeData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-center">
              <Webhook className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No Webhook Events</h3>
              <p className="text-muted-foreground text-sm">
                No webhook events have been received in the selected period.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={eventTypeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis 
                  type="category" 
                  dataKey="type" 
                  className="text-xs"
                  width={120}
                />
                <Tooltip
                  formatter={(value: number, name: string, props: any) => [
                    value,
                    props.payload.fullType
                  ]}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '0.5rem',
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill="hsl(var(--primary))" 
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
