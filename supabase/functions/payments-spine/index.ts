import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  createStripeClient,
  validateStripeOnBoot,
  corsHeaders,
  handleCorsPreflightRequest,
  createErrorResponse,
  createSuccessResponse,
} from "../_shared/stripe-config.ts";

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Get platform account ID from env
const STRIPE_PLATFORM_ACCOUNT_ID = Deno.env.get('STRIPE_PLATFORM_ACCOUNT_ID');
const PAYMENTS_SPINE_SHARED_SECRET = Deno.env.get('PAYMENTS_SPINE_SHARED_SECRET') || 'default-spine-secret';

// Use shared Stripe client
const stripeClient = createStripeClient();
const stripe = stripeClient?.stripe || null;
const stripeConfig = stripeClient?.config || null;

// HMAC signature verification
async function verifySignature(projectId: string, signature: string, timestamp: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(PAYMENTS_SPINE_SHARED_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
  
  const message = `${projectId}:${timestamp}`;
  const signatureBuffer = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
  
  try {
    return await crypto.subtle.verify('HMAC', key, signatureBuffer, encoder.encode(message));
  } catch {
    return false;
  }
}

// Audit logging
async function logAudit(action: string, actor: string, details: Record<string, unknown>) {
  await supabase.from('spine_audit_log').insert({
    actor,
    actor_type: 'api',
    action,
    meta_json: details,
    env: Deno.env.get('APP_ENV') || 'prod',
  });
}

// Alert creation with deduplication
async function createAlert(
  severity: 'info' | 'warn' | 'critical',
  code: string,
  title: string,
  message: string,
  projectId?: string,
  meta?: Record<string, unknown>
) {
  const dedupeKey = `${code}:${projectId || 'global'}`;
  
  // Check for existing open alert with same dedupe key
  const { data: existingAlert } = await supabase
    .from('spine_alerts')
    .select('id')
    .eq('dedupe_key', dedupeKey)
    .eq('status', 'open')
    .single();
  
  if (existingAlert) {
    console.log(`Alert already exists: ${dedupeKey}`);
    return existingAlert;
  }
  
  const { data, error } = await supabase.from('spine_alerts').insert({
    severity,
    code,
    title,
    message,
    project_id: projectId,
    dedupe_key: dedupeKey,
    meta_json: meta || {},
    env: Deno.env.get('APP_ENV') || 'prod',
  }).select().single();
  
  if (error) {
    console.error('Failed to create alert:', error);
    return null;
  }
  
  // Send notification (Slack webhook if configured)
  const slackWebhook = Deno.env.get('ALERT_SLACK_WEBHOOK_URL');
  if (slackWebhook && severity === 'critical') {
    try {
      await fetch(slackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 *${severity.toUpperCase()}* - ${title}`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*${title}*\n${message}\n\nProject: ${projectId || 'Global'}\nCode: \`${code}\``,
              },
            },
          ],
        }),
      });
    } catch (e) {
      console.error('Failed to send Slack notification:', e);
    }
  }
  
  return data;
}

// Validate Stripe account matches canonical
async function validateStripeAccount(): Promise<{
  valid: boolean;
  accountId?: string;
  error?: string;
}> {
  if (!stripe) {
    return { valid: false, error: 'Stripe not configured' };
  }
  
  try {
    const account = await stripe.accounts.retrieve();
    const isValid = !STRIPE_PLATFORM_ACCOUNT_ID || account.id === STRIPE_PLATFORM_ACCOUNT_ID;
    
    if (!isValid) {
      await createAlert(
        'critical',
        'STRIPE_ACCOUNT_MISMATCH',
        'Stripe Account Mismatch Detected',
        `Expected: ${STRIPE_PLATFORM_ACCOUNT_ID}, Got: ${account.id}`,
        undefined,
        { expected: STRIPE_PLATFORM_ACCOUNT_ID, actual: account.id }
      );
    }
    
    return {
      valid: isValid,
      accountId: account.id,
      error: isValid ? undefined : 'Account ID mismatch',
    };
  } catch (e) {
    return { valid: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

// Route handlers
const routes: Record<string, (req: Request, url: URL) => Promise<Response>> = {
  // Health check
  'GET:/health': async () => {
    const stripeValidation = await validateStripeAccount();
    
    return new Response(JSON.stringify({
      status: stripeValidation.valid ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      stripe: {
        configured: !!stripe,
        accountValid: stripeValidation.valid,
        platformAccountId: STRIPE_PLATFORM_ACCOUNT_ID ? 
          `${STRIPE_PLATFORM_ACCOUNT_ID.slice(0, 8)}...` : 'not set',
      },
      version: '1.0.0',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  },
  
  // Stripe-specific health
  'GET:/health/stripe': async () => {
    const startTime = Date.now();
    const validation = await validateStripeAccount();
    const duration = Date.now() - startTime;
    
    // Check webhooks health
    const { data: recentEvents } = await supabase
      .from('stripe_webhook_events')
      .select('id, created')
      .order('created', { ascending: false })
      .limit(1);
    
    const lastEventTime = recentEvents?.[0]?.created;
    const eventAge = lastEventTime ? 
      Date.now() - new Date(lastEventTime).getTime() : null;
    
    const status = validation.valid && 
      (!eventAge || eventAge < 24 * 60 * 60 * 1000) ? 'OK' : 
      validation.valid ? 'WARN' : 'FAIL';
    
    return new Response(JSON.stringify({
      status,
      stripe_api_reachable: validation.valid || !!validation.accountId,
      account_id_matches: validation.valid,
      platform_account_id: STRIPE_PLATFORM_ACCOUNT_ID ? 
        `${STRIPE_PLATFORM_ACCOUNT_ID.slice(0, 8)}...${STRIPE_PLATFORM_ACCOUNT_ID.slice(-4)}` : null,
      webhook_health: {
        last_event_time: lastEventTime,
        event_age_hours: eventAge ? Math.round(eventAge / (60 * 60 * 1000)) : null,
        healthy: !eventAge || eventAge < 24 * 60 * 60 * 1000,
      },
      validation_duration_ms: duration,
      checked_at: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  },
  
  // Register project
  'POST:/projects/register': async (req) => {
    const body = await req.json();
    const { project_id, project_name, env, domain, version, stripe_platform_account_id, timestamp, signature } = body;
    
    if (!project_id || !project_name || !env) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Verify signature if provided
    if (signature && timestamp) {
      const valid = await verifySignature(project_id, signature, timestamp);
      if (!valid) {
        return new Response(JSON.stringify({ error: 'Invalid signature' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }
    
    // Upsert project
    const { data: project, error: projectError } = await supabase
      .from('spine_projects')
      .upsert({
        project_id,
        name: project_name,
        env,
        domain,
        version,
        last_seen_at: new Date().toISOString(),
      }, { onConflict: 'project_id' })
      .select()
      .single();
    
    if (projectError) {
      console.error('Failed to register project:', projectError);
      return new Response(JSON.stringify({ error: 'Failed to register project' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Check Stripe binding
    const bindingStatus = stripe_platform_account_id === STRIPE_PLATFORM_ACCOUNT_ID ? 'ok' : 'mismatch';
    
    if (bindingStatus === 'mismatch') {
      await createAlert(
        'critical',
        'STRIPE_BINDING_MISMATCH',
        'Project Stripe Binding Mismatch',
        `Project ${project_name} (${project_id}) reported account ${stripe_platform_account_id} but canonical is ${STRIPE_PLATFORM_ACCOUNT_ID}`,
        project_id,
        { reported: stripe_platform_account_id, canonical: STRIPE_PLATFORM_ACCOUNT_ID }
      );
    }
    
    // Upsert binding
    await supabase
      .from('project_stripe_bindings')
      .upsert({
        project_id,
        env,
        reported_platform_account_id: stripe_platform_account_id || 'not_provided',
        status: bindingStatus,
        last_validated_at: new Date().toISOString(),
      }, { onConflict: 'project_id,env' });
    
    await logAudit('project.registered', project_id, { env, domain, version, binding_status: bindingStatus });
    
    return new Response(JSON.stringify({
      success: true,
      project,
      binding_status: bindingStatus,
      canonical_account: STRIPE_PLATFORM_ACCOUNT_ID ? 
        `${STRIPE_PLATFORM_ACCOUNT_ID.slice(0, 8)}...` : null,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  },
  
  // Revalidate project
  'POST:/projects/revalidate': async (req) => {
    const body = await req.json();
    const { project_id } = body;
    
    if (!project_id) {
      return new Response(JSON.stringify({ error: 'project_id required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Get project binding
    const { data: binding } = await supabase
      .from('project_stripe_bindings')
      .select('*')
      .eq('project_id', project_id)
      .single();
    
    if (!binding) {
      return new Response(JSON.stringify({ error: 'Project not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const stripeValidation = await validateStripeAccount();
    const bindingValid = binding.reported_platform_account_id === STRIPE_PLATFORM_ACCOUNT_ID;
    
    // Update binding status
    await supabase
      .from('project_stripe_bindings')
      .update({
        status: bindingValid ? 'ok' : 'mismatch',
        last_validated_at: new Date().toISOString(),
        validation_results: {
          stripe_api_valid: stripeValidation.valid,
          account_matches: bindingValid,
        },
      })
      .eq('project_id', project_id);
    
    // Record validation
    await supabase.from('stripe_boot_validations').insert({
      project_id,
      env: binding.env,
      validation_mode: 'strict',
      status: bindingValid && stripeValidation.valid ? 'pass' : 'fail',
      stripe_api_reachable: stripeValidation.valid || !!stripeValidation.accountId,
      account_id_matches: bindingValid,
      validation_details: { stripeValidation, bindingValid },
    });
    
    return new Response(JSON.stringify({
      success: true,
      project_id,
      binding_status: bindingValid ? 'ok' : 'mismatch',
      stripe_valid: stripeValidation.valid,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  },
  
  // List projects
  'GET:/projects': async (req, url) => {
    const env = url.searchParams.get('env');
    const status = url.searchParams.get('status');
    
    let query = supabase
      .from('spine_projects')
      .select(`
        *,
        project_stripe_bindings(*),
        stripe_boot_validations(*)
      `)
      .order('created_at', { ascending: false });
    
    if (env) query = query.eq('env', env);
    if (status) query = query.eq('status', status);
    
    const { data, error } = await query;
    
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ projects: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  },
  
  // Get single project
  'GET:/projects/:id': async (req, url) => {
    const projectId = url.pathname.split('/').pop();
    
    const { data: project, error } = await supabase
      .from('spine_projects')
      .select(`
        *,
        project_stripe_bindings(*),
        stripe_boot_validations(validated_at, status, validation_details)
      `)
      .eq('project_id', projectId)
      .single();
    
    if (error || !project) {
      return new Response(JSON.stringify({ error: 'Project not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Get recent metrics
    const { data: metrics } = await supabase
      .from('stripe_metrics_daily')
      .select('*')
      .eq('project_id', projectId)
      .order('date', { ascending: false })
      .limit(30);
    
    // Get recent webhook events
    const { data: webhookEvents } = await supabase
      .from('stripe_webhook_events')
      .select('id, type, created, status')
      .eq('project_id', projectId)
      .order('created', { ascending: false })
      .limit(10);
    
    return new Response(JSON.stringify({
      project,
      metrics: metrics || [],
      recent_webhooks: webhookEvents || [],
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  },
  
  // Get metrics summary
  'GET:/metrics/summary': async (req, url) => {
    const env = url.searchParams.get('env') || 'prod';
    const days = parseInt(url.searchParams.get('days') || '30');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get aggregated metrics
    const { data: metrics } = await supabase
      .from('stripe_metrics_daily')
      .select('*')
      .eq('env', env)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true });
    
    // Calculate totals
    const totals = (metrics || []).reduce((acc, m) => ({
      revenue_cents: acc.revenue_cents + (m.revenue_cents || 0),
      successful_payments: acc.successful_payments + (m.successful_payments || 0),
      failed_payments: acc.failed_payments + (m.failed_payments || 0),
      disputes_opened: acc.disputes_opened + (m.disputes_opened || 0),
    }), { revenue_cents: 0, successful_payments: 0, failed_payments: 0, disputes_opened: 0 });
    
    // Get project count
    const { count: projectCount } = await supabase
      .from('spine_projects')
      .select('*', { count: 'exact', head: true })
      .eq('env', env);
    
    // Get binding status counts
    const { data: bindings } = await supabase
      .from('project_stripe_bindings')
      .select('status')
      .eq('env', env);
    
    const bindingCounts = (bindings || []).reduce((acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Get latest MRR
    const { data: latestMrr } = await supabase
      .from('stripe_metrics_daily')
      .select('mrr_cents, active_subscriptions')
      .eq('env', env)
      .order('date', { ascending: false })
      .limit(1);
    
    return new Response(JSON.stringify({
      env,
      period_days: days,
      totals,
      mrr_cents: latestMrr?.[0]?.mrr_cents || 0,
      active_subscriptions: latestMrr?.[0]?.active_subscriptions || 0,
      project_count: projectCount || 0,
      binding_status: bindingCounts,
      daily_metrics: metrics || [],
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  },
  
  // Get alerts
  'GET:/alerts': async (req, url) => {
    const status = url.searchParams.get('status') || 'open';
    const severity = url.searchParams.get('severity');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    
    let query = supabase
      .from('spine_alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (status !== 'all') query = query.eq('status', status);
    if (severity) query = query.eq('severity', severity);
    
    const { data, error } = await query;
    
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ alerts: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  },
  
  // Acknowledge/resolve alert
  'POST:/alerts/:id/action': async (req, url) => {
    const alertId = url.pathname.split('/')[3];
    const body = await req.json();
    const { action, actor, notes } = body;
    
    if (!['acknowledge', 'resolve'].includes(action)) {
      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const updates: Record<string, unknown> = action === 'acknowledge' 
      ? { status: 'acknowledged', acknowledged_by: actor, acknowledged_at: new Date().toISOString() }
      : { status: 'resolved', resolved_by: actor, resolved_at: new Date().toISOString(), resolution_notes: notes };
    
    const { data, error } = await supabase
      .from('spine_alerts')
      .update(updates)
      .eq('id', alertId)
      .select()
      .single();
    
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    await logAudit(`alert.${action}d`, actor || 'system', { alert_id: alertId, notes });
    
    return new Response(JSON.stringify({ success: true, alert: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  },
  
  // Test alert
  'POST:/alerts/test': async (req) => {
    const body = await req.json();
    const { severity = 'info', project_id } = body;
    
    const alert = await createAlert(
      severity,
      'TEST_ALERT',
      'Test Alert',
      'This is a test alert to verify the alerting system is working correctly.',
      project_id,
      { test: true, timestamp: new Date().toISOString() }
    );
    
    return new Response(JSON.stringify({ success: true, alert }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  },
  
  // Get canonical Stripe config
  'GET:/stripe/canonical': async () => {
    const validation = await validateStripeAccount();
    
    // Get or create canonical record
    const env = Deno.env.get('APP_ENV') || 'prod';
    let { data: canonical } = await supabase
      .from('stripe_canonical')
      .select('*')
      .eq('env', env)
      .single();
    
    if (!canonical && STRIPE_PLATFORM_ACCOUNT_ID) {
      const { data: newCanonical } = await supabase
        .from('stripe_canonical')
        .upsert({
          env,
          stripe_platform_account_id: STRIPE_PLATFORM_ACCOUNT_ID,
          verified_at: validation.valid ? new Date().toISOString() : null,
          status: validation.valid ? 'verified' : 'pending',
          last_check_at: new Date().toISOString(),
          check_results: validation,
        }, { onConflict: 'env' })
        .select()
        .single();
      canonical = newCanonical;
    }
    
    return new Response(JSON.stringify({
      canonical,
      current_validation: validation,
      platform_account_id_masked: STRIPE_PLATFORM_ACCOUNT_ID ? 
        `${STRIPE_PLATFORM_ACCOUNT_ID.slice(0, 8)}...${STRIPE_PLATFORM_ACCOUNT_ID.slice(-4)}` : null,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  },
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  const url = new URL(req.url);
  const path = url.pathname.replace('/payments-spine', '');
  
  // Find matching route
  let handler: ((req: Request, url: URL) => Promise<Response>) | undefined;
  let routeKey = `${req.method}:${path}`;
  
  // Direct match
  handler = routes[routeKey];
  
  // Pattern matching for :id routes
  if (!handler) {
    for (const [pattern, h] of Object.entries(routes)) {
      const [method, routePath] = pattern.split(':');
      if (method !== req.method) continue;
      
      const routeParts = routePath.split('/');
      const pathParts = path.split('/');
      
      if (routeParts.length !== pathParts.length) continue;
      
      let matches = true;
      for (let i = 0; i < routeParts.length; i++) {
        if (routeParts[i].startsWith(':')) continue;
        if (routeParts[i] !== pathParts[i]) {
          matches = false;
          break;
        }
      }
      
      if (matches) {
        handler = h;
        break;
      }
    }
  }
  
  if (!handler) {
    return new Response(JSON.stringify({ 
      error: 'Not found',
      path,
      method: req.method,
    }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  
  try {
    return await handler(req, url);
  } catch (error) {
    console.error('Route handler error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
