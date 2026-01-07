-- Create shopify_products table to persist real Shopify product data
CREATE TABLE public.shopify_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  shopify_id TEXT NOT NULL,
  handle TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  product_type TEXT,
  vendor TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  compare_at_price DECIMAL(10,2),
  currency_code TEXT DEFAULT 'USD',
  image_url TEXT,
  variant_id TEXT,
  inventory_quantity INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, shopify_id)
);

-- Create product_automations table for real automation state per product
CREATE TABLE public.product_automations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID REFERENCES public.shopify_products(id) ON DELETE CASCADE,
  shopify_product_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'learning' CHECK (status IN ('learning', 'optimizing', 'scaling', 'paused', 'disabled')),
  automation_mode TEXT NOT NULL DEFAULT 'assisted' CHECK (automation_mode IN ('manual', 'assisted', 'autonomous')),
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  conversions INTEGER NOT NULL DEFAULT 0,
  revenue DECIMAL(12,2) NOT NULL DEFAULT 0,
  spend DECIMAL(12,2) NOT NULL DEFAULT 0,
  roas DECIMAL(8,4) GENERATED ALWAYS AS (CASE WHEN spend > 0 THEN revenue / spend ELSE 0 END) STORED,
  ctr DECIMAL(8,6) GENERATED ALWAYS AS (CASE WHEN impressions > 0 THEN clicks::DECIMAL / impressions ELSE 0 END) STORED,
  conversion_rate DECIMAL(8,6) GENERATED ALWAYS AS (CASE WHEN clicks > 0 THEN conversions::DECIMAL / clicks ELSE 0 END) STORED,
  quality_score INTEGER DEFAULT 0 CHECK (quality_score >= 0 AND quality_score <= 100),
  last_action TEXT,
  next_action TEXT,
  last_action_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, shopify_product_id)
);

-- Create revenue_events table for real-time revenue tracking
CREATE TABLE public.revenue_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID REFERENCES public.shopify_products(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('impression', 'click', 'add_to_cart', 'checkout', 'purchase', 'refund')),
  platform TEXT DEFAULT 'shopify',
  source TEXT, -- ad, organic, email, etc
  campaign_id TEXT,
  creative_id UUID REFERENCES public.creatives(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create automation_jobs table for real background job tracking
CREATE TABLE public.automation_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  job_type TEXT NOT NULL CHECK (job_type IN ('creative_generation', 'ab_test', 'scale_budget', 'kill_creative', 'product_sync', 'dm_send', 'video_render')),
  target_id UUID, -- Could be product_id, creative_id, etc.
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  priority INTEGER DEFAULT 5,
  input_data JSONB DEFAULT '{}',
  output_data JSONB DEFAULT '{}',
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quality_gate_decisions table for auditable quality scoring
CREATE TABLE public.quality_gate_decisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  creative_id UUID REFERENCES public.creatives(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  decision TEXT NOT NULL CHECK (decision IN ('pass', 'regenerate', 'kill', 'scale')),
  decision_reason TEXT,
  metrics_snapshot JSONB DEFAULT '{}',
  auto_applied BOOLEAN DEFAULT false,
  applied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.shopify_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quality_gate_decisions ENABLE ROW LEVEL SECURITY;

-- RLS policies for shopify_products
CREATE POLICY "Users can view their own products" ON public.shopify_products FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own products" ON public.shopify_products FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own products" ON public.shopify_products FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own products" ON public.shopify_products FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for product_automations
CREATE POLICY "Users can view their own automations" ON public.product_automations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own automations" ON public.product_automations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own automations" ON public.product_automations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own automations" ON public.product_automations FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for revenue_events
CREATE POLICY "Users can view their own events" ON public.revenue_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own events" ON public.revenue_events FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for automation_jobs
CREATE POLICY "Users can view their own jobs" ON public.automation_jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own jobs" ON public.automation_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own jobs" ON public.automation_jobs FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for quality_gate_decisions
CREATE POLICY "Users can view their own decisions" ON public.quality_gate_decisions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own decisions" ON public.quality_gate_decisions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_shopify_products_user ON public.shopify_products(user_id);
CREATE INDEX idx_product_automations_user ON public.product_automations(user_id);
CREATE INDEX idx_product_automations_status ON public.product_automations(status);
CREATE INDEX idx_revenue_events_user_created ON public.revenue_events(user_id, created_at DESC);
CREATE INDEX idx_revenue_events_product ON public.revenue_events(product_id);
CREATE INDEX idx_automation_jobs_user_status ON public.automation_jobs(user_id, status);
CREATE INDEX idx_automation_jobs_scheduled ON public.automation_jobs(scheduled_for) WHERE status = 'pending';

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.revenue_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.automation_jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_automations;

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers
CREATE TRIGGER update_shopify_products_updated_at BEFORE UPDATE ON public.shopify_products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_product_automations_updated_at BEFORE UPDATE ON public.product_automations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();