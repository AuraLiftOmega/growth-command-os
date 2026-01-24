-- Orders table for webhook logging
CREATE TABLE IF NOT EXISTS public.shopify_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopify_order_id TEXT UNIQUE NOT NULL,
  order_number TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  customer_name TEXT,
  total_price DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  line_items JSONB,
  shipping_address JSONB,
  billing_address JSONB,
  financial_status TEXT,
  fulfillment_status TEXT,
  sms_sent_at TIMESTAMPTZ,
  discord_pinged_at TIMESTAMPTZ,
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shopify_orders ENABLE ROW LEVEL SECURITY;

-- Admin-only access policy (webhook uses service role)
CREATE POLICY "Service role full access" ON public.shopify_orders
  FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime for dashboard updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.shopify_orders;

-- Trigger for updated_at
CREATE TRIGGER update_shopify_orders_updated_at
  BEFORE UPDATE ON public.shopify_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();