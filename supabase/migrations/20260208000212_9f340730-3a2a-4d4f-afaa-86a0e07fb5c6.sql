
-- =============================================
-- MULTI-SUPPLIER SOURCING SYSTEM
-- =============================================

-- Supplier registry (CJ, DSers, Spocket, Zendrop, AliExpress, etc.)
CREATE TABLE IF NOT EXISTS public.supplier_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  supplier_name TEXT NOT NULL, -- cj_dropshipping, dsers, spocket, zendrop, aliexpress, printful, etc.
  supplier_type TEXT NOT NULL DEFAULT 'dropship', -- dropship, print_on_demand, wholesale
  api_endpoint TEXT,
  api_key_ref TEXT, -- reference to secret name, never store raw keys
  is_active BOOLEAN DEFAULT true,
  auto_source BOOLEAN DEFAULT true, -- auto-pick cheapest supplier
  priority_rank INTEGER DEFAULT 1, -- lower = higher priority
  avg_shipping_days INTEGER DEFAULT 7,
  avg_cost_multiplier NUMERIC DEFAULT 1.0,
  total_products_sourced INTEGER DEFAULT 0,
  total_orders_fulfilled INTEGER DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  success_rate NUMERIC DEFAULT 100,
  last_sync_at TIMESTAMPTZ,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.supplier_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own suppliers" ON public.supplier_connections FOR ALL USING (auth.uid() = user_id);

-- Product sourcing log (which supplier fulfills which product)
CREATE TABLE IF NOT EXISTS public.product_sourcing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  shopify_product_id TEXT,
  product_name TEXT NOT NULL,
  supplier_id UUID REFERENCES public.supplier_connections(id),
  supplier_name TEXT NOT NULL,
  supplier_product_id TEXT, -- ID in the supplier's system
  supplier_sku TEXT,
  cost_price NUMERIC NOT NULL DEFAULT 0,
  shipping_cost NUMERIC NOT NULL DEFAULT 0,
  total_cost NUMERIC GENERATED ALWAYS AS (cost_price + shipping_cost) STORED,
  selling_price NUMERIC NOT NULL DEFAULT 0,
  profit_margin NUMERIC GENERATED ALWAYS AS (
    CASE WHEN selling_price > 0 THEN ((selling_price - (cost_price + shipping_cost)) / selling_price * 100) ELSE 0 END
  ) STORED,
  meets_60pct_margin BOOLEAN GENERATED ALWAYS AS (
    CASE WHEN selling_price > 0 THEN ((selling_price - (cost_price + shipping_cost)) / selling_price >= 0.60) ELSE false END
  ) STORED,
  stock_status TEXT DEFAULT 'in_stock',
  auto_reorder BOOLEAN DEFAULT true,
  sourcing_status TEXT DEFAULT 'active', -- active, paused, out_of_stock, discontinued
  last_price_check TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.product_sourcing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sourcing" ON public.product_sourcing FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- EMAIL CAMPAIGN ENGINE
-- =============================================

-- Email lists/segments
CREATE TABLE IF NOT EXISTS public.email_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  segment_rules JSONB DEFAULT '{}', -- dynamic segment criteria
  subscriber_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.email_lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own lists" ON public.email_lists FOR ALL USING (auth.uid() = user_id);

-- Email subscribers
CREATE TABLE IF NOT EXISTS public.email_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  source TEXT DEFAULT 'manual', -- manual, checkout, popup, lead_magnet, referral
  tags TEXT[] DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active', -- active, unsubscribed, bounced, complained
  subscribed_at TIMESTAMPTZ DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ,
  last_email_at TIMESTAMPTZ,
  total_emails_sent INTEGER DEFAULT 0,
  total_opens INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  engagement_score NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own subscribers" ON public.email_subscribers FOR ALL USING (auth.uid() = user_id);
CREATE UNIQUE INDEX idx_email_subscribers_unique ON public.email_subscribers(user_id, email);

-- Email list membership (many-to-many)
CREATE TABLE IF NOT EXISTS public.email_list_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID REFERENCES public.email_lists(id) ON DELETE CASCADE,
  subscriber_id UUID REFERENCES public.email_subscribers(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(list_id, subscriber_id)
);

ALTER TABLE public.email_list_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own list members" ON public.email_list_members FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.email_lists WHERE id = list_id AND user_id = auth.uid()));

-- Email campaigns
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  preview_text TEXT,
  from_name TEXT DEFAULT 'MASTER_OS',
  from_email TEXT,
  html_content TEXT NOT NULL,
  plain_text TEXT,
  campaign_type TEXT DEFAULT 'broadcast', -- broadcast, automated, sequence, transactional
  status TEXT DEFAULT 'draft', -- draft, scheduled, sending, sent, paused, cancelled
  list_id UUID REFERENCES public.email_lists(id),
  segment_rules JSONB, -- override list with custom segment
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_opens INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  total_unsubscribes INTEGER DEFAULT 0,
  total_bounces INTEGER DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  open_rate NUMERIC DEFAULT 0,
  click_rate NUMERIC DEFAULT 0,
  conversion_rate NUMERIC DEFAULT 0,
  ab_test_config JSONB, -- subject line A/B testing
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own campaigns" ON public.email_campaigns FOR ALL USING (auth.uid() = user_id);

-- Email sequences (drip campaigns / automation flows)
CREATE TABLE IF NOT EXISTS public.email_sequences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  trigger_event TEXT NOT NULL, -- signup, purchase, cart_abandon, trial_start, trial_ending, custom
  is_active BOOLEAN DEFAULT true,
  total_enrolled INTEGER DEFAULT 0,
  total_completed INTEGER DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  steps JSONB DEFAULT '[]', -- array of {delay_hours, subject, html_content, conditions}
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.email_sequences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sequences" ON public.email_sequences FOR ALL USING (auth.uid() = user_id);

-- Email sequence enrollments
CREATE TABLE IF NOT EXISTS public.email_sequence_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sequence_id UUID REFERENCES public.email_sequences(id) ON DELETE CASCADE,
  subscriber_id UUID REFERENCES public.email_subscribers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  current_step INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active', -- active, completed, paused, cancelled
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  next_email_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  revenue_attributed NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.email_sequence_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own enrollments" ON public.email_sequence_enrollments FOR ALL USING (auth.uid() = user_id);

-- Email send log (every email sent)
CREATE TABLE IF NOT EXISTS public.email_send_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subscriber_id UUID REFERENCES public.email_subscribers(id),
  campaign_id UUID REFERENCES public.email_campaigns(id),
  sequence_id UUID REFERENCES public.email_sequences(id),
  resend_id TEXT, -- Resend API message ID
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT DEFAULT 'sent', -- sent, delivered, opened, clicked, bounced, complained
  sent_at TIMESTAMPTZ DEFAULT now(),
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  revenue_attributed NUMERIC DEFAULT 0,
  metadata JSONB DEFAULT '{}'
);

ALTER TABLE public.email_send_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own send log" ON public.email_send_log FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- BOT EXECUTION ENFORCEMENT
-- =============================================

-- Bot execution queue (force=true enforcement)
CREATE TABLE IF NOT EXISTS public.bot_execution_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  bot_id TEXT NOT NULL,
  bot_name TEXT NOT NULL,
  command TEXT NOT NULL,
  command_payload JSONB DEFAULT '{}',
  force_execute BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 1, -- 1=highest
  status TEXT DEFAULT 'queued', -- queued, executing, completed, failed, retrying
  max_retries INTEGER DEFAULT 3,
  retry_count INTEGER DEFAULT 0,
  result JSONB,
  error_message TEXT,
  revenue_impact NUMERIC DEFAULT 0,
  queued_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.bot_execution_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own bot queue" ON public.bot_execution_queue FOR ALL USING (auth.uid() = user_id);

-- Revenue tracking (real Stripe money tracking)
CREATE TABLE IF NOT EXISTS public.revenue_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL, -- sale, subscription, refund, upsell, cross_sell
  source TEXT NOT NULL, -- shopify, stripe, manual, automation
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  stripe_payment_id TEXT,
  shopify_order_id TEXT,
  product_name TEXT,
  supplier_name TEXT,
  cost_of_goods NUMERIC DEFAULT 0,
  profit NUMERIC GENERATED ALWAYS AS (amount - cost_of_goods) STORED,
  profit_margin NUMERIC GENERATED ALWAYS AS (
    CASE WHEN amount > 0 THEN ((amount - cost_of_goods) / amount * 100) ELSE 0 END
  ) STORED,
  attribution_channel TEXT, -- email, tiktok, instagram, facebook, organic, referral
  attribution_campaign_id UUID,
  customer_email TEXT,
  is_recurring BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.revenue_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own revenue" ON public.revenue_events FOR ALL USING (auth.uid() = user_id);

-- Create index for fast revenue queries
CREATE INDEX idx_revenue_events_created ON public.revenue_events(user_id, created_at DESC);
CREATE INDEX idx_revenue_events_source ON public.revenue_events(user_id, source);
CREATE INDEX idx_bot_exec_queue_status ON public.bot_execution_queue(user_id, status);
CREATE INDEX idx_email_campaigns_status ON public.email_campaigns(user_id, status);
CREATE INDEX idx_product_sourcing_margin ON public.product_sourcing(user_id, meets_60pct_margin);
