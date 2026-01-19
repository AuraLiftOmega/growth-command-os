-- Payments Spine Database Schema
-- Core tables for canonical Stripe platform management

-- Projects registry table
CREATE TABLE public.spine_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  env TEXT NOT NULL CHECK (env IN ('dev', 'staging', 'prod')),
  domain TEXT,
  version TEXT,
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Canonical Stripe configuration table
CREATE TABLE public.stripe_canonical (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  env TEXT NOT NULL UNIQUE CHECK (env IN ('dev', 'staging', 'prod')),
  stripe_platform_account_id TEXT NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('verified', 'pending', 'failed', 'mismatch')),
  last_check_at TIMESTAMP WITH TIME ZONE,
  check_results JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Project to Stripe bindings
CREATE TABLE public.project_stripe_bindings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES public.spine_projects(project_id) ON DELETE CASCADE,
  env TEXT NOT NULL CHECK (env IN ('dev', 'staging', 'prod')),
  reported_platform_account_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('ok', 'mismatch', 'pending', 'error')),
  last_validated_at TIMESTAMP WITH TIME ZONE,
  validation_results JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, env)
);

-- Stripe webhook events storage
CREATE TABLE public.stripe_webhook_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_event_id TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  created TIMESTAMP WITH TIME ZONE NOT NULL,
  livemode BOOLEAN NOT NULL DEFAULT false,
  api_version TEXT,
  account TEXT,
  request_id TEXT,
  payload_json JSONB NOT NULL,
  received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'processing', 'processed', 'failed', 'skipped')),
  error TEXT,
  processing_time_ms INTEGER,
  project_id TEXT REFERENCES public.spine_projects(project_id)
);

-- Daily metrics aggregation
CREATE TABLE public.stripe_metrics_daily (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  env TEXT NOT NULL CHECK (env IN ('dev', 'staging', 'prod')),
  project_id TEXT REFERENCES public.spine_projects(project_id),
  revenue_cents BIGINT DEFAULT 0,
  mrr_cents BIGINT DEFAULT 0,
  successful_payments INTEGER DEFAULT 0,
  failed_payments INTEGER DEFAULT 0,
  active_subscriptions INTEGER DEFAULT 0,
  new_subscriptions INTEGER DEFAULT 0,
  churned_subscriptions INTEGER DEFAULT 0,
  disputes_opened INTEGER DEFAULT 0,
  disputes_closed INTEGER DEFAULT 0,
  refunds_count INTEGER DEFAULT 0,
  refunds_amount_cents BIGINT DEFAULT 0,
  customers_created INTEGER DEFAULT 0,
  webhook_events_count INTEGER DEFAULT 0,
  webhook_failures INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(date, env, project_id)
);

-- Alerts table
CREATE TABLE public.spine_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warn', 'critical')),
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  env TEXT CHECK (env IN ('dev', 'staging', 'prod')),
  project_id TEXT REFERENCES public.spine_projects(project_id),
  dedupe_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'resolved', 'suppressed')),
  acknowledged_by TEXT,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by TEXT,
  resolution_notes TEXT,
  meta_json JSONB DEFAULT '{}'::jsonb,
  notification_sent BOOLEAN DEFAULT false,
  notification_channels TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Audit log for compliance
CREATE TABLE public.spine_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  actor TEXT NOT NULL,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('user', 'system', 'api', 'webhook')),
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  env TEXT CHECK (env IN ('dev', 'staging', 'prod')),
  project_id TEXT REFERENCES public.spine_projects(project_id),
  ip_address TEXT,
  user_agent TEXT,
  meta_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Boot validation history
CREATE TABLE public.stripe_boot_validations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES public.spine_projects(project_id) ON DELETE CASCADE,
  env TEXT NOT NULL CHECK (env IN ('dev', 'staging', 'prod')),
  validation_mode TEXT NOT NULL CHECK (validation_mode IN ('strict', 'degraded')),
  status TEXT NOT NULL CHECK (status IN ('pass', 'fail', 'warn')),
  stripe_api_reachable BOOLEAN,
  account_id_matches BOOLEAN,
  webhooks_configured BOOLEAN,
  connect_enabled BOOLEAN,
  validation_details JSONB DEFAULT '{}'::jsonb,
  duration_ms INTEGER,
  validated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Webhook health metrics (real-time tracking)
CREATE TABLE public.webhook_health_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  env TEXT NOT NULL CHECK (env IN ('dev', 'staging', 'prod')),
  project_id TEXT REFERENCES public.spine_projects(project_id),
  window_start TIMESTAMP WITH TIME ZONE NOT NULL,
  window_end TIMESTAMP WITH TIME ZONE NOT NULL,
  events_received INTEGER DEFAULT 0,
  events_processed INTEGER DEFAULT 0,
  events_failed INTEGER DEFAULT 0,
  avg_processing_time_ms NUMERIC(10,2),
  signature_failures INTEGER DEFAULT 0,
  unique_event_types TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_spine_projects_project_id ON public.spine_projects(project_id);
CREATE INDEX idx_spine_projects_env ON public.spine_projects(env);
CREATE INDEX idx_stripe_webhook_events_type ON public.stripe_webhook_events(type);
CREATE INDEX idx_stripe_webhook_events_created ON public.stripe_webhook_events(created);
CREATE INDEX idx_stripe_webhook_events_status ON public.stripe_webhook_events(status);
CREATE INDEX idx_stripe_webhook_events_project ON public.stripe_webhook_events(project_id);
CREATE INDEX idx_stripe_metrics_daily_date ON public.stripe_metrics_daily(date);
CREATE INDEX idx_stripe_metrics_daily_project ON public.stripe_metrics_daily(project_id);
CREATE INDEX idx_spine_alerts_status ON public.spine_alerts(status);
CREATE INDEX idx_spine_alerts_severity ON public.spine_alerts(severity);
CREATE INDEX idx_spine_alerts_dedupe ON public.spine_alerts(dedupe_key);
CREATE INDEX idx_spine_audit_log_actor ON public.spine_audit_log(actor);
CREATE INDEX idx_spine_audit_log_action ON public.spine_audit_log(action);
CREATE INDEX idx_stripe_boot_validations_project ON public.stripe_boot_validations(project_id);
CREATE INDEX idx_webhook_health_window ON public.webhook_health_metrics(window_start, window_end);

-- Enable RLS
ALTER TABLE public.spine_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_canonical ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_stripe_bindings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_metrics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spine_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spine_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_boot_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_health_metrics ENABLE ROW LEVEL SECURITY;

-- RLS policies for authenticated users (admin access)
CREATE POLICY "Authenticated users can view spine_projects" ON public.spine_projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage spine_projects" ON public.spine_projects FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view stripe_canonical" ON public.stripe_canonical FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage stripe_canonical" ON public.stripe_canonical FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view project_stripe_bindings" ON public.project_stripe_bindings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage project_stripe_bindings" ON public.project_stripe_bindings FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view stripe_webhook_events" ON public.stripe_webhook_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage stripe_webhook_events" ON public.stripe_webhook_events FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view stripe_metrics_daily" ON public.stripe_metrics_daily FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage stripe_metrics_daily" ON public.stripe_metrics_daily FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view spine_alerts" ON public.spine_alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage spine_alerts" ON public.spine_alerts FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view spine_audit_log" ON public.spine_audit_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert spine_audit_log" ON public.spine_audit_log FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can view stripe_boot_validations" ON public.stripe_boot_validations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage stripe_boot_validations" ON public.stripe_boot_validations FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view webhook_health_metrics" ON public.webhook_health_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage webhook_health_metrics" ON public.webhook_health_metrics FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Service role policies for edge functions
CREATE POLICY "Service role full access spine_projects" ON public.spine_projects FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access stripe_canonical" ON public.stripe_canonical FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access project_stripe_bindings" ON public.project_stripe_bindings FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access stripe_webhook_events" ON public.stripe_webhook_events FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access stripe_metrics_daily" ON public.stripe_metrics_daily FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access spine_alerts" ON public.spine_alerts FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access spine_audit_log" ON public.spine_audit_log FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access stripe_boot_validations" ON public.stripe_boot_validations FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access webhook_health_metrics" ON public.webhook_health_metrics FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_spine_projects_updated_at BEFORE UPDATE ON public.spine_projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_stripe_canonical_updated_at BEFORE UPDATE ON public.stripe_canonical FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_project_stripe_bindings_updated_at BEFORE UPDATE ON public.project_stripe_bindings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_stripe_metrics_daily_updated_at BEFORE UPDATE ON public.stripe_metrics_daily FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_spine_alerts_updated_at BEFORE UPDATE ON public.spine_alerts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();