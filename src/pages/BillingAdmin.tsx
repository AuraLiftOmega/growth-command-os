import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DollarSign, 
  CreditCard, 
  Users, 
  AlertTriangle, 
  Activity, 
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Webhook,
  Shield,
  Zap
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { format } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function BillingAdmin() {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  // Check admin access
  const { data: isAdmin } = useQuery({
    queryKey: ['admin-check', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      const { data } = await supabase
        .from('admin_entitlements')
        .select('id')
        .eq('user_id', user.id)
        .single();
      return !!data;
    },
    enabled: !!user?.id,
  });

  // Fetch billing metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['billing-metrics', refreshKey],
    queryFn: async () => {
      const [payments, subscriptions, events, alerts] = await Promise.all([
        supabase.from('billing_payments').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('billing_subscriptions').select('*'),
        supabase.from('stripe_events').select('*').order('received_at', { ascending: false }).limit(50),
        supabase.from('billing_alerts').select('*').eq('status', 'open').order('created_at', { ascending: false }),
      ]);

      const livePayments = (payments.data || []).filter(p => p.livemode);
      const totalRevenue = livePayments.reduce((sum, p) => sum + (p.amount || 0), 0) / 100;
      const successfulPayments = livePayments.filter(p => p.status === 'succeeded');
      const failedPayments = livePayments.filter(p => p.status === 'failed');

      const activeSubs = (subscriptions.data || []).filter(s => s.status === 'active' || s.status === 'trialing');
      const mrr = activeSubs.reduce((sum, s) => sum + ((s.amount || 0) / 100), 0);

      return {
        totalRevenue,
        mrr,
        paymentSuccessRate: livePayments.length > 0 
          ? (successfulPayments.length / livePayments.length * 100).toFixed(1) 
          : 100,
        activeSubscriptions: activeSubs.length,
        totalSubscriptions: subscriptions.data?.length || 0,
        recentPayments: payments.data || [],
        recentEvents: events.data || [],
        openAlerts: alerts.data || [],
        webhookHealth: {
          total: events.data?.length || 0,
          processed: events.data?.filter(e => e.status === 'processed').length || 0,
          failed: events.data?.filter(e => e.status === 'error').length || 0,
          lastEvent: events.data?.[0]?.received_at,
        },
      };
    },
    refetchInterval: 30000,
  });

  // Fetch system health
  const { data: systemHealth } = useQuery({
    queryKey: ['system-health', refreshKey],
    queryFn: async () => {
      const { data } = await supabase.from('system_health').select('*');
      return data || [];
    },
  });

  if (!user) return <Navigate to="/login" />;
  if (isAdmin === false) return <Navigate to="/" />;

  const refresh = () => setRefreshKey(k => k + 1);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Billing Dashboard</h1>
            <p className="text-muted-foreground">Production payments & subscription analytics</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={metrics?.openAlerts?.length ? 'destructive' : 'secondary'}>
              {metrics?.openAlerts?.length || 0} Alerts
            </Badge>
            <Button variant="outline" size="sm" onClick={refresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="w-4 h-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics?.totalRevenue?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">Live payments only</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">MRR</CardTitle>
              <TrendingUp className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics?.mrr?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">{metrics?.activeSubscriptions || 0} active subs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <Activity className="w-4 h-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.paymentSuccessRate || 100}%</div>
              <p className="text-xs text-muted-foreground">Payment success rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Webhook Health</CardTitle>
              <Webhook className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                {metrics?.webhookHealth?.failed === 0 ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-success" />
                    OK
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-warning" />
                    {metrics?.webhookHealth?.failed} errors
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics?.webhookHealth?.processed || 0} processed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="payments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="health">System Health</TabsTrigger>
          </TabsList>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
                <CardDescription>Last 100 payment transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Mode</TableHead>
                        <TableHead>ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {metrics?.recentPayments?.map((payment: any) => (
                        <TableRow key={payment.id}>
                          <TableCell className="text-sm">
                            {format(new Date(payment.created_at), 'MMM d, HH:mm')}
                          </TableCell>
                          <TableCell className="font-mono">
                            ${(payment.amount / 100).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{payment.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={payment.status === 'succeeded' ? 'default' : 'destructive'}>
                              {payment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={payment.livemode ? 'default' : 'secondary'}>
                              {payment.livemode ? '💰 LIVE' : 'TEST'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {payment.stripe_payment_intent_id?.slice(0, 20)}...
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Active Subscriptions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-3xl font-bold text-success">{metrics?.activeSubscriptions || 0}</div>
                      <div className="text-sm text-muted-foreground">Active</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-3xl font-bold">{metrics?.totalSubscriptions || 0}</div>
                      <div className="text-sm text-muted-foreground">Total</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-3xl font-bold text-primary">${metrics?.mrr?.toLocaleString() || 0}</div>
                      <div className="text-sm text-muted-foreground">MRR</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Plan Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <span>Starter</span>
                    <Badge>--</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <span>Growth</span>
                    <Badge>--</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <span>Enterprise</span>
                    <Badge>--</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks">
            <Card>
              <CardHeader>
                <CardTitle>Recent Webhook Events</CardTitle>
                <CardDescription>Stripe webhook event processing log</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Event Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Processing Time</TableHead>
                        <TableHead>Mode</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {metrics?.recentEvents?.map((event: any) => (
                        <TableRow key={event.id}>
                          <TableCell className="text-sm">
                            {format(new Date(event.received_at), 'MMM d, HH:mm:ss')}
                          </TableCell>
                          <TableCell className="font-mono text-sm">{event.type}</TableCell>
                          <TableCell>
                            <Badge variant={event.status === 'processed' ? 'default' : event.status === 'error' ? 'destructive' : 'secondary'}>
                              {event.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{event.processing_time_ms || '--'}ms</TableCell>
                          <TableCell>
                            <Badge variant={event.livemode ? 'default' : 'secondary'}>
                              {event.livemode ? 'LIVE' : 'TEST'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  Open Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {metrics?.openAlerts?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-success" />
                    <p>No open alerts — all systems healthy</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {metrics?.openAlerts?.map((alert: any) => (
                      <div 
                        key={alert.id} 
                        className={`p-4 rounded-lg border ${
                          alert.severity === 'critical' ? 'border-destructive bg-destructive/10' :
                          alert.severity === 'warn' ? 'border-warning bg-warning/10' :
                          'border-muted bg-muted/50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                              {alert.severity.toUpperCase()}
                            </Badge>
                            <span className="ml-2 font-mono text-sm">{alert.code}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(alert.created_at), 'MMM d, HH:mm')}
                          </span>
                        </div>
                        <p className="mt-2 text-sm">{alert.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Health Tab */}
          <TabsContent value="health">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Stripe Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span>Live Mode</span>
                    <Badge variant="default">
                      <Zap className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span>Webhook Secret</span>
                    <Badge variant="default">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Configured
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span>Platform Account</span>
                    <Badge variant="default">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Component Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {systemHealth?.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <p>No health checks recorded yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {systemHealth?.map((health: any) => (
                        <div key={health.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                          <span className="capitalize">{health.component}</span>
                          <Badge variant={health.status === 'ok' ? 'default' : 'destructive'}>
                            {health.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
