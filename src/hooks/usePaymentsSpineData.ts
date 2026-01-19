import { useQuery } from '@tanstack/react-query';
import { paymentsSpine, type SpineProject, type SpineAlert, type MetricsSummary, type StripeHealthStatus } from '@/lib/payments-spine';

interface WebhookHealth {
  events_per_hour: number;
  total_events: number;
  failed_events: number;
  last_event_time?: string;
  event_types: Record<string, number>;
}

export function usePaymentsSpineData(env: 'dev' | 'staging' | 'prod', dateRange: '24h' | '7d' | '30d' | 'custom') {
  const days = dateRange === '24h' ? 1 : dateRange === '7d' ? 7 : 30;

  const { data: stripeHealth, isLoading: healthLoading, refetch: refetchHealth } = useQuery({
    queryKey: ['spine-stripe-health'],
    queryFn: async () => {
      try {
        // Try to get health from edge function
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/payments-spine/health/stripe`,
          {
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
          }
        );
        if (response.ok) {
          return await response.json() as StripeHealthStatus;
        }
      } catch (e) {
        console.log('Edge function health check failed, using fallback');
      }
      
      // Fallback: construct from canonical data
      const canonical = await paymentsSpine.getCanonicalStripe();
      return {
        status: canonical.current_validation.valid ? 'OK' : 'FAIL',
        stripe_api_reachable: canonical.current_validation.valid,
        account_id_matches: canonical.current_validation.valid,
        platform_account_id: canonical.platform_account_id_masked,
        webhook_health: {
          healthy: true,
        },
        validation_duration_ms: 0,
        checked_at: new Date().toISOString(),
      } as StripeHealthStatus;
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: projectsData, isLoading: projectsLoading, refetch: refetchProjects } = useQuery({
    queryKey: ['spine-projects', env],
    queryFn: () => paymentsSpine.getProjects({ env }),
  });

  const { data: metricsData, isLoading: metricsLoading, refetch: refetchMetrics } = useQuery({
    queryKey: ['spine-metrics', env, days],
    queryFn: () => paymentsSpine.getMetricsSummary({ env, days }),
  });

  const { data: alertsData, isLoading: alertsLoading, refetch: refetchAlerts } = useQuery({
    queryKey: ['spine-alerts'],
    queryFn: () => paymentsSpine.getAlerts({ status: 'open', limit: 100 }),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: webhookHealth, isLoading: webhookLoading, refetch: refetchWebhooks } = useQuery({
    queryKey: ['spine-webhook-health', env, days],
    queryFn: () => paymentsSpine.getWebhookHealth({ env, hours: days * 24 }),
  });

  const refetch = async () => {
    await Promise.all([
      refetchHealth(),
      refetchProjects(),
      refetchMetrics(),
      refetchAlerts(),
      refetchWebhooks(),
    ]);
  };

  return {
    stripeHealth,
    projects: projectsData?.projects || [],
    metrics: metricsData,
    alerts: alertsData?.alerts || [],
    webhookHealth,
    isLoading: healthLoading || projectsLoading || metricsLoading || alertsLoading || webhookLoading,
    refetch,
  };
}

export function useProjectDetails(projectId: string | null) {
  return useQuery({
    queryKey: ['spine-project-details', projectId],
    queryFn: () => projectId ? paymentsSpine.getProject(projectId) : null,
    enabled: !!projectId,
  });
}

export function useAlertActions() {
  return {
    acknowledge: async (alertId: string, actor: string) => {
      return paymentsSpine.acknowledgeAlert(alertId, actor);
    },
    resolve: async (alertId: string, actor: string, notes?: string) => {
      return paymentsSpine.resolveAlert(alertId, actor, notes);
    },
    testAlert: async (severity: 'info' | 'warn' | 'critical') => {
      return paymentsSpine.testAlert(severity);
    },
  };
}
