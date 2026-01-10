-- Create user Shopify connections table for multi-user OAuth
CREATE TABLE IF NOT EXISTS public.user_shopify_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_domain TEXT NOT NULL,
  shop_name TEXT,
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT,
  scopes TEXT[],
  is_active BOOLEAN DEFAULT true,
  products_count INTEGER DEFAULT 0,
  orders_count INTEGER DEFAULT 0,
  total_revenue NUMERIC(12,2) DEFAULT 0,
  last_sync_at TIMESTAMPTZ,
  connected_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, shop_domain)
);

-- Enable RLS
ALTER TABLE public.user_shopify_connections ENABLE ROW LEVEL SECURITY;

-- RLS policies - users can only see/manage their own connections
CREATE POLICY "Users can view their own Shopify connections"
ON public.user_shopify_connections FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Shopify connections"
ON public.user_shopify_connections FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Shopify connections"
ON public.user_shopify_connections FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Shopify connections"
ON public.user_shopify_connections FOR DELETE
USING (auth.uid() = user_id);

-- Add tier column to subscriptions if not exists and update constraints
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'subscriptions' 
                 AND column_name = 'tier') THEN
    ALTER TABLE public.subscriptions ADD COLUMN tier TEXT DEFAULT 'free';
  END IF;
END $$;

-- Create user products table for per-user product syncing
CREATE TABLE IF NOT EXISTS public.user_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES public.user_shopify_connections(id) ON DELETE CASCADE,
  shopify_product_id TEXT NOT NULL,
  title TEXT NOT NULL,
  handle TEXT,
  description TEXT,
  vendor TEXT,
  product_type TEXT,
  price NUMERIC(10,2),
  compare_at_price NUMERIC(10,2),
  currency TEXT DEFAULT 'USD',
  images JSONB DEFAULT '[]',
  variants JSONB DEFAULT '[]',
  options JSONB DEFAULT '[]',
  tags TEXT[],
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, shopify_product_id)
);

-- Enable RLS on user_products
ALTER TABLE public.user_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own products"
ON public.user_products FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own products"
ON public.user_products FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products"
ON public.user_products FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products"
ON public.user_products FOR DELETE
USING (auth.uid() = user_id);

-- Update trigger for user_shopify_connections
CREATE TRIGGER update_user_shopify_connections_updated_at
BEFORE UPDATE ON public.user_shopify_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update trigger for user_products
CREATE TRIGGER update_user_products_updated_at
BEFORE UPDATE ON public.user_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();