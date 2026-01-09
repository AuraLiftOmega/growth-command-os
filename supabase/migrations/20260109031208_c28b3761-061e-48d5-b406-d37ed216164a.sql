-- OAuth states table for CSRF protection (if not exists)
CREATE TABLE IF NOT EXISTS public.oauth_states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  state TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL,
  redirect_uri TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '10 minutes')
);

-- Enable RLS
ALTER TABLE public.oauth_states ENABLE ROW LEVEL SECURITY;

-- RLS policies for oauth_states
CREATE POLICY "Users can manage their own oauth states" ON public.oauth_states
  FOR ALL USING (auth.uid() = user_id);

-- Webhook tracking for analytics
CREATE TABLE IF NOT EXISTS public.content_performance_webhooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL,
  external_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  raw_data JSONB DEFAULT '{}',
  received_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed BOOLEAN DEFAULT false,
  creative_id UUID REFERENCES public.creatives(id)
);

-- Enable RLS
ALTER TABLE public.content_performance_webhooks ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own webhooks" ON public.content_performance_webhooks
  FOR SELECT USING (auth.uid() = user_id);

-- Abandoned cart tracking
CREATE TABLE IF NOT EXISTS public.abandoned_carts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  shopify_checkout_id TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  cart_total DECIMAL(10,2) DEFAULT 0,
  items JSONB DEFAULT '[]',
  abandoned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  recovery_sent_at TIMESTAMP WITH TIME ZONE,
  recovery_channel TEXT,
  recovered BOOLEAN DEFAULT false,
  recovered_at TIMESTAMP WITH TIME ZONE,
  recovery_revenue DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can manage their own abandoned carts" ON public.abandoned_carts
  FOR ALL USING (auth.uid() = user_id);

-- Product bundles for upsells
CREATE TABLE IF NOT EXISTS public.product_bundles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  products JSONB NOT NULL DEFAULT '[]',
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  original_price DECIMAL(10,2) DEFAULT 0,
  bundle_price DECIMAL(10,2) DEFAULT 0,
  shopify_variant_id TEXT,
  is_active BOOLEAN DEFAULT true,
  sales_count INTEGER DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_bundles ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can manage their own bundles" ON public.product_bundles
  FOR ALL USING (auth.uid() = user_id);

-- Add update trigger
CREATE TRIGGER update_product_bundles_updated_at
  BEFORE UPDATE ON public.product_bundles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_oauth_states_state ON public.oauth_states(state);
CREATE INDEX IF NOT EXISTS idx_webhooks_platform_external ON public.content_performance_webhooks(platform, external_id);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_email ON public.abandoned_carts(customer_email);
CREATE INDEX IF NOT EXISTS idx_bundles_active ON public.product_bundles(user_id, is_active);