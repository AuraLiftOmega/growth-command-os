
-- Add per-store Shopify App credentials to user_store_connections
ALTER TABLE public.user_store_connections
  ADD COLUMN IF NOT EXISTS shopify_client_id text,
  ADD COLUMN IF NOT EXISTS shopify_client_secret text,
  ADD COLUMN IF NOT EXISTS shopify_client_secret_encrypted bytea,
  ADD COLUMN IF NOT EXISTS profit_margin_target numeric DEFAULT 0.60,
  ADD COLUMN IF NOT EXISTS min_margin numeric DEFAULT 0.45,
  ADD COLUMN IF NOT EXISTS platform_fee numeric DEFAULT 0.05;

-- Link product_sourcing to a specific store connection
ALTER TABLE public.product_sourcing
  ADD COLUMN IF NOT EXISTS store_connection_id uuid REFERENCES public.user_store_connections(id);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_product_sourcing_store ON public.product_sourcing(store_connection_id);
CREATE INDEX IF NOT EXISTS idx_user_store_connections_domain ON public.user_store_connections(store_domain);
