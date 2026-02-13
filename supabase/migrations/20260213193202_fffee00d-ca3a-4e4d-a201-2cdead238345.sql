
-- Unified product registry for real-time accuracy across Shopify + CJ
CREATE TABLE public.unified_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  shopify_product_id TEXT NOT NULL,
  cj_product_id TEXT,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  handle TEXT,
  vendor TEXT,
  product_type TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  live BOOLEAN NOT NULL DEFAULT true,
  currency TEXT DEFAULT 'USD',
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, shopify_product_id)
);

-- Enable RLS
ALTER TABLE public.unified_products ENABLE ROW LEVEL SECURITY;

-- Users can view their own products
CREATE POLICY "Users can view their own unified products"
  ON public.unified_products FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own products
CREATE POLICY "Users can insert their own unified products"
  ON public.unified_products FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own products
CREATE POLICY "Users can update their own unified products"
  ON public.unified_products FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own products
CREATE POLICY "Users can delete their own unified products"
  ON public.unified_products FOR DELETE
  USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX idx_unified_products_user_live ON public.unified_products(user_id, live) WHERE live = true;
CREATE INDEX idx_unified_products_shopify_id ON public.unified_products(shopify_product_id);

-- Auto-update timestamp trigger
CREATE TRIGGER update_unified_products_updated_at
  BEFORE UPDATE ON public.unified_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
