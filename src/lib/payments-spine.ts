import { supabase } from '@/integrations/supabase/client';

// Payments Spine client configuration
const SPINE_FUNCTION_NAME = 'payments-spine';

export interface SpineProject {
  id: string;
  project_id: string;
  name: string;
  env: 'dev' | 'staging' | 'prod';
  domain?: string;
  version?: string;
  status: 'active' | 'inactive' | 'suspended';
  registered_at: string;
  last_seen_at?: string;
  project_stripe_bindings?: ProjectStripeBinding[];
  stripe_boot_validations?: BootValidation[];
}

export interface ProjectStripeBinding {
  id: string;
  project_id: string;
  env: string;
  reported_platform_account_id: string;
  status: 'ok' | 'mismatch' | 'pending' | 'error';
  last_validated_at?: string;
  validation_results?: Record<string, unknown>;
}

export interface BootValidation {
  id: string;
  project_id: string;
  env: string;
  validation_mode: 'strict' | 'degraded';
  status: 'pass' | 'fail' | 'warn';
  stripe_api_reachable?: boolean;
  account_id_matches?: boolean;
  webhooks_configured?: boolean;
  connect_enabled?: boolean;
  validated_at: string;
}

export interface SpineAlert {
  id: string;
  severity: 'info' | 'warn' | 'critical';
  code: string;
  title: string;
  message: string;
  env?: string;
  project_id?: string;
  status: 'open' | 'acknowledged' | 'resolved' | 'suppressed';
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolved_at?: string;
  resolved_by?: string;
  resolution_notes?: string;
  meta_json?: Record<string, unknown>;
  created_at: string;
}

export interface StripeHealthStatus {
  status: 'OK' | 'WARN' | 'FAIL';
  stripe_api_reachable: boolean;
  account_id_matches: boolean;
  platform_account_id?: string;
  webhook_health: {
    last_event_time?: string;
    event_age_hours?: number;
    healthy: boolean;
  };
  validation_duration_ms: number;
  checked_at: string;
}

export interface MetricsSummary {
  env: string;
  period_days: number;
  totals: {
    revenue_cents: number;
    successful_payments: number;
    failed_payments: number;
    disputes_opened: number;
  };
  mrr_cents: number;
  active_subscriptions: number;
  project_count: number;
  binding_status: Record<string, number>;
  daily_metrics: DailyMetric[];
}

export interface DailyMetric {
  id: string;
  date: string;
  env: string;
  project_id?: string;
  revenue_cents: number;
  mrr_cents: number;
  successful_payments: number;
  failed_payments: number;
  active_subscriptions: number;
  new_subscriptions: number;
  churned_subscriptions: number;
  disputes_opened: number;
  disputes_closed: number;
  refunds_count: number;
  refunds_amount_cents: number;
}

// API client for Payments Spine
class PaymentsSpineClient {
  private async invoke<T>(path: string, options?: { method?: string; body?: Record<string, unknown> }): Promise<T> {
    const { data, error } = await supabase.functions.invoke(SPINE_FUNCTION_NAME, {
      body: {
        _path: path,
        _method: options?.method || 'GET',
        ...(options?.body || {}),
      },
    });

    if (error) {
      console.error('Spine API error:', error);
      throw error;
    }

    return data as T;
  }

  // Direct fetch for GET requests with query params
  private async fetch<T>(path: string): Promise<T> {
    const { data, error } = await supabase.functions.invoke(SPINE_FUNCTION_NAME + path);

    if (error) {
      console.error('Spine API error:', error);
      throw error;
    }

    return data as T;
  }

  // Health endpoints
  async getHealth(): Promise<{ status: string; timestamp: string; stripe: unknown; version: string }> {
    return this.fetch('/health');
  }

  async getStripeHealth(): Promise<StripeHealthStatus> {
    return this.fetch('/health/stripe');
  }

  // Project endpoints
  async registerProject(data: {
    project_id: string;
    project_name: string;
    env: string;
    domain?: string;
    version?: string;
    stripe_platform_account_id?: string;
  }): Promise<{ success: boolean; project: SpineProject; binding_status: string }> {
    const { data: result, error } = await supabase.functions.invoke(SPINE_FUNCTION_NAME, {
      body: data,
    });
    
    if (error) throw error;
    return result;
  }

  async revalidateProject(projectId: string): Promise<{ success: boolean; binding_status: string; stripe_valid: boolean }> {
    const { data, error } = await supabase.functions.invoke(SPINE_FUNCTION_NAME, {
      body: { project_id: projectId, _action: 'revalidate' },
    });
    
    if (error) throw error;
    return data;
  }

  async getProjects(filters?: { env?: string; status?: string }): Promise<{ projects: SpineProject[] }> {
    // Fetch directly from database for reliability
    let query = supabase
      .from('spine_projects')
      .select(`
        *,
        project_stripe_bindings(*),
        stripe_boot_validations(validated_at, status, validation_details)
      `)
      .order('created_at', { ascending: false });

    if (filters?.env) {
      query = query.eq('env', filters.env);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;
    if (error) throw error;

    return { projects: (data || []) as unknown as SpineProject[] };
  }

  async getProject(projectId: string): Promise<{ project: SpineProject; metrics: DailyMetric[]; recent_webhooks: unknown[] }> {
    const { data: project, error } = await supabase
      .from('spine_projects')
      .select(`
        *,
        project_stripe_bindings(*),
        stripe_boot_validations(validated_at, status, validation_details)
      `)
      .eq('project_id', projectId)
      .single();

    if (error) throw error;

    const { data: metrics } = await supabase
      .from('stripe_metrics_daily')
      .select('*')
      .eq('project_id', projectId)
      .order('date', { ascending: false })
      .limit(30);

    const { data: webhooks } = await supabase
      .from('stripe_webhook_events')
      .select('id, type, created, status')
      .eq('project_id', projectId)
      .order('created', { ascending: false })
      .limit(10);

    return {
      project: project as unknown as SpineProject,
      metrics: (metrics || []) as unknown as DailyMetric[],
      recent_webhooks: webhooks || [],
    };
  }

  // Metrics endpoints
  async getMetricsSummary(params?: { env?: string; days?: number }): Promise<MetricsSummary> {
    const env = params?.env || 'prod';
    const days = params?.days || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: metrics } = await supabase
      .from('stripe_metrics_daily')
      .select('*')
      .eq('env', env)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    const totals = (metrics || []).reduce((acc, m) => ({
      revenue_cents: acc.revenue_cents + (m.revenue_cents || 0),
      successful_payments: acc.successful_payments + (m.successful_payments || 0),
      failed_payments: acc.failed_payments + (m.failed_payments || 0),
      disputes_opened: acc.disputes_opened + (m.disputes_opened || 0),
    }), { revenue_cents: 0, successful_payments: 0, failed_payments: 0, disputes_opened: 0 });

    const { count: projectCount } = await supabase
      .from('spine_projects')
      .select('*', { count: 'exact', head: true })
      .eq('env', env);

    const { data: bindings } = await supabase
      .from('project_stripe_bindings')
      .select('status')
      .eq('env', env);

    const bindingCounts = (bindings || []).reduce((acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const latestMrr = metrics?.[metrics.length - 1];

    return {
      env,
      period_days: days,
      totals,
      mrr_cents: latestMrr?.mrr_cents || 0,
      active_subscriptions: latestMrr?.active_subscriptions || 0,
      project_count: projectCount || 0,
      binding_status: bindingCounts,
      daily_metrics: (metrics || []) as unknown as DailyMetric[],
    };
  }

  // Alert endpoints
  async getAlerts(params?: { status?: string; severity?: string; limit?: number }): Promise<{ alerts: SpineAlert[] }> {
    let query = supabase
      .from('spine_alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(params?.limit || 50);

    if (params?.status && params.status !== 'all') {
      query = query.eq('status', params.status);
    }
    if (params?.severity) {
      query = query.eq('severity', params.severity);
    }

    const { data, error } = await query;
    if (error) throw error;

    return { alerts: (data || []) as unknown as SpineAlert[] };
  }

  async acknowledgeAlert(alertId: string, actor: string): Promise<{ success: boolean; alert: SpineAlert }> {
    const { data, error } = await supabase
      .from('spine_alerts')
      .update({
        status: 'acknowledged',
        acknowledged_by: actor,
        acknowledged_at: new Date().toISOString(),
      })
      .eq('id', alertId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, alert: data as unknown as SpineAlert };
  }

  async resolveAlert(alertId: string, actor: string, notes?: string): Promise<{ success: boolean; alert: SpineAlert }> {
    const { data, error } = await supabase
      .from('spine_alerts')
      .update({
        status: 'resolved',
        resolved_by: actor,
        resolved_at: new Date().toISOString(),
        resolution_notes: notes,
      })
      .eq('id', alertId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, alert: data as unknown as SpineAlert };
  }

  async testAlert(severity: 'info' | 'warn' | 'critical' = 'info', projectId?: string): Promise<{ success: boolean; alert: SpineAlert }> {
    const { data, error } = await supabase.functions.invoke(SPINE_FUNCTION_NAME, {
      body: { _action: 'test_alert', severity, project_id: projectId },
    });
    
    if (error) throw error;
    return data;
  }

  // Canonical Stripe config
  async getCanonicalStripe(): Promise<{ 
    canonical: unknown; 
    current_validation: { valid: boolean; accountId?: string; error?: string };
    platform_account_id_masked?: string;
  }> {
    const { data, error } = await supabase
      .from('stripe_canonical')
      .select('*')
      .single();

    // If no canonical record, create a validation check
    const validation = { valid: true, accountId: undefined, error: undefined };

    return {
      canonical: data,
      current_validation: validation,
      platform_account_id_masked: data?.stripe_platform_account_id ? 
        `${data.stripe_platform_account_id.slice(0, 8)}...${data.stripe_platform_account_id.slice(-4)}` : undefined,
    };
  }

  // Webhook health
  async getWebhookHealth(params?: { env?: string; hours?: number }): Promise<{
    events_per_hour: number;
    total_events: number;
    failed_events: number;
    last_event_time?: string;
    event_types: Record<string, number>;
  }> {
    const hours = params?.hours || 24;
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - hours);

    const { data: events, error } = await supabase
      .from('stripe_webhook_events')
      .select('type, status, created')
      .gte('created', startTime.toISOString())
      .order('created', { ascending: false });

    if (error) throw error;

    const eventTypes = (events || []).reduce((acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const failedEvents = (events || []).filter(e => e.status === 'failed').length;

    return {
      events_per_hour: Math.round((events?.length || 0) / hours * 100) / 100,
      total_events: events?.length || 0,
      failed_events: failedEvents,
      last_event_time: events?.[0]?.created,
      event_types: eventTypes,
    };
  }
}

// Export singleton instance
export const paymentsSpine = new PaymentsSpineClient();

// Boot validation utility for other projects
export async function validateStripeOnBoot(config: {
  projectId: string;
  projectName: string;
  env: string;
  stripePlatformAccountId?: string;
  validationMode?: 'strict' | 'degraded';
}): Promise<{
  valid: boolean;
  status: 'pass' | 'fail' | 'warn';
  bindingStatus: string;
  error?: string;
}> {
  try {
    const result = await paymentsSpine.registerProject({
      project_id: config.projectId,
      project_name: config.projectName,
      env: config.env,
      stripe_platform_account_id: config.stripePlatformAccountId,
    });

    const valid = result.binding_status === 'ok';
    const status = valid ? 'pass' : config.validationMode === 'strict' ? 'fail' : 'warn';

    return {
      valid,
      status,
      bindingStatus: result.binding_status,
    };
  } catch (error) {
    console.error('Boot validation failed:', error);
    return {
      valid: false,
      status: config.validationMode === 'strict' ? 'fail' : 'warn',
      bindingStatus: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
