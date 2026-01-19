-- ============================================================================
-- BILLING DATA MODEL - Production-grade Stripe payments
-- ============================================================================

-- Billing customers - link users to Stripe customers
CREATE TABLE IF NOT EXISTS public.billing_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  stripe_customer_id TEXT UNIQUE,
  email TEXT,
  name TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Billing entitlements - what users have access to
CREATE TABLE IF NOT EXISTS public.billing_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  entitlement_key TEXT NOT NULL,
  plan TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  source TEXT DEFAULT 'stripe',
  source_id TEXT,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, entitlement_key)
);

-- Billing subscriptions - Stripe subscription tracking
CREATE TABLE IF NOT EXISTS public.billing_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  plan TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  billing_cycle TEXT DEFAULT 'monthly',
  amount INTEGER,
  currency TEXT DEFAULT 'usd',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Billing payments - all payment records
CREATE TABLE IF NOT EXISTS public.billing_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_session_id TEXT,
  stripe_invoice_id TEXT,
  stripe_charge_id TEXT,
  type TEXT NOT NULL DEFAULT 'payment',
  status TEXT NOT NULL DEFAULT 'pending',
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  description TEXT,
  product_name TEXT,
  livemode BOOLEAN DEFAULT false,
  receipt_url TEXT,
  failure_code TEXT,
  failure_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Stripe events - dedupe and audit all webhook events
CREATE TABLE IF NOT EXISTS public.stripe_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  api_version TEXT,
  livemode BOOLEAN DEFAULT false,
  account TEXT,
  request_id TEXT,
  payload_json JSONB,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  error TEXT,
  processing_time_ms INTEGER,
  project_id TEXT
);

-- System health tracking
CREATE TABLE IF NOT EXISTS public.system_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'unknown',
  message TEXT,
  last_checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  meta_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Billing alerts
CREATE TABLE IF NOT EXISTS public.billing_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  severity TEXT NOT NULL DEFAULT 'info',
  code TEXT NOT NULL,
  message TEXT NOT NULL,
  dedupe_key TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  user_id UUID,
  project_id TEXT,
  meta_json JSONB DEFAULT '{}',
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Daily billing metrics
CREATE TABLE IF NOT EXISTS public.billing_metrics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  env TEXT DEFAULT 'prod',
  project_id TEXT,
  revenue_cents INTEGER DEFAULT 0,
  mrr_cents INTEGER DEFAULT 0,
  successful_payments INTEGER DEFAULT 0,
  failed_payments INTEGER DEFAULT 0,
  active_subscriptions INTEGER DEFAULT 0,
  new_subscriptions INTEGER DEFAULT 0,
  churned_subscriptions INTEGER DEFAULT 0,
  disputes INTEGER DEFAULT 0,
  refunds_cents INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(date, env, project_id)
);

-- Enable RLS
ALTER TABLE public.billing_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_metrics_daily ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can read their own billing data
CREATE POLICY "Users can view own billing customer" ON public.billing_customers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own entitlements" ON public.billing_entitlements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own billing subscriptions" ON public.billing_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own payments" ON public.billing_payments
  FOR SELECT USING (auth.uid() = user_id);

-- Admin policies - admins can view all
CREATE POLICY "Admins can view all billing customers" ON public.billing_customers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_entitlements WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can view all entitlements" ON public.billing_entitlements
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_entitlements WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can view all billing subscriptions" ON public.billing_subscriptions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_entitlements WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can view all payments" ON public.billing_payments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_entitlements WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can view stripe events" ON public.stripe_events
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_entitlements WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can view system health" ON public.system_health
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_entitlements WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can view billing alerts" ON public.billing_alerts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_entitlements WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can view billing metrics" ON public.billing_metrics_daily
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_entitlements WHERE user_id = auth.uid())
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_billing_customers_user ON public.billing_customers(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_customers_stripe ON public.billing_customers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_billing_entitlements_user ON public.billing_entitlements(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_subscriptions_user ON public.billing_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_subscriptions_stripe ON public.billing_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_billing_payments_user ON public.billing_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_events_event_id ON public.stripe_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_stripe_events_type ON public.stripe_events(type);
CREATE INDEX IF NOT EXISTS idx_stripe_events_created ON public.stripe_events(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_billing_metrics_date ON public.billing_metrics_daily(date DESC);