
-- ============================================================
-- OMEGA INTERNAL COMMERCE ENGINE
-- Replaces: Shopify product DB, CJ sourcing, single-payment
-- ============================================================

-- 1. INTERNAL PRODUCTS (replaces Shopify as product source of truth)
CREATE TABLE public.internal_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  description_html TEXT,
  product_type TEXT DEFAULT 'physical', -- physical, digital, service, subscription
  status TEXT DEFAULT 'draft', -- draft, active, archived
  tags TEXT[] DEFAULT '{}',
  vendor TEXT,
  sku TEXT,
  barcode TEXT,
  
  -- Pricing
  base_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  compare_at_price NUMERIC(10,2),
  cost_price NUMERIC(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  margin_percentage NUMERIC(5,2) GENERATED ALWAYS AS (
    CASE WHEN base_price > 0 THEN ((base_price - COALESCE(cost_price, 0)) / base_price * 100) ELSE 0 END
  ) STORED,
  
  -- Inventory
  track_inventory BOOLEAN DEFAULT true,
  inventory_quantity INTEGER DEFAULT 0,
  allow_backorder BOOLEAN DEFAULT false,
  
  -- Media
  images JSONB DEFAULT '[]',
  thumbnail_url TEXT,
  
  -- SEO
  seo_title TEXT,
  seo_description TEXT,
  
  -- External sync (parallel run - maps to Shopify/CJ if needed)
  shopify_product_id TEXT,
  cj_product_id TEXT,
  external_source TEXT, -- 'internal', 'shopify', 'cj', 'manual'
  
  -- Fulfillment
  fulfillment_type TEXT DEFAULT 'manual', -- manual, cj, dropship, digital_delivery
  weight_grams NUMERIC(10,2),
  shipping_required BOOLEAN DEFAULT true,
  
  -- Analytics
  total_sold INTEGER DEFAULT 0,
  total_revenue NUMERIC(12,2) DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  conversion_rate NUMERIC(5,4) DEFAULT 0,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(organization_id, slug)
);

-- 2. PRODUCT VARIANTS
CREATE TABLE public.internal_product_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.internal_products(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Default',
  sku TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  compare_at_price NUMERIC(10,2),
  cost_price NUMERIC(10,2),
  inventory_quantity INTEGER DEFAULT 0,
  weight_grams NUMERIC(10,2),
  option1_name TEXT,
  option1_value TEXT,
  option2_name TEXT,
  option2_value TEXT,
  option3_name TEXT,
  option3_value TEXT,
  image_url TEXT,
  available_for_sale BOOLEAN DEFAULT true,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. PAYMENT PROCESSORS (multi-payment abstraction)
CREATE TABLE public.payment_processors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  processor_type TEXT NOT NULL, -- 'stripe', 'paypal', 'crypto', 'manual'
  display_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_primary BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}', -- non-sensitive config (modes, currencies supported)
  supported_currencies TEXT[] DEFAULT '{USD}',
  supported_methods TEXT[] DEFAULT '{card}', -- card, bank, crypto, paypal
  fee_percentage NUMERIC(5,2) DEFAULT 0,
  fee_fixed_cents INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, processor_type)
);

-- 4. INTERNAL ORDERS (replaces Shopify order tracking)
CREATE TABLE public.internal_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  order_number SERIAL,
  customer_email TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  customer_id UUID, -- reference to crm_contacts if available
  
  -- Status
  status TEXT DEFAULT 'pending', -- pending, confirmed, processing, shipped, delivered, cancelled, refunded
  payment_status TEXT DEFAULT 'unpaid', -- unpaid, paid, partially_refunded, refunded, failed
  fulfillment_status TEXT DEFAULT 'unfulfilled', -- unfulfilled, partial, fulfilled, cancelled
  
  -- Amounts
  subtotal NUMERIC(12,2) DEFAULT 0,
  shipping_cost NUMERIC(10,2) DEFAULT 0,
  tax_amount NUMERIC(10,2) DEFAULT 0,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  
  -- Payment
  processor_id UUID REFERENCES public.payment_processors(id),
  processor_type TEXT, -- stripe, paypal, crypto
  payment_intent_id TEXT,
  payment_method TEXT,
  
  -- Shipping
  shipping_address JSONB,
  billing_address JSONB,
  tracking_number TEXT,
  tracking_url TEXT,
  carrier TEXT,
  
  -- Fulfillment
  fulfillment_type TEXT, -- manual, cj, dropship, digital
  fulfilled_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  
  -- External sync
  shopify_order_id TEXT,
  cj_order_id TEXT,
  
  -- Notes
  notes TEXT,
  internal_notes TEXT,
  tags TEXT[] DEFAULT '{}',
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. ORDER LINE ITEMS
CREATE TABLE public.internal_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.internal_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.internal_products(id),
  variant_id UUID REFERENCES public.internal_product_variants(id),
  title TEXT NOT NULL,
  variant_title TEXT,
  sku TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  cost_price NUMERIC(10,2),
  fulfillment_status TEXT DEFAULT 'unfulfilled',
  image_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. INTERNAL AI CREATIVE JOBS (replaces HeyGen/D-ID dependency)
CREATE TABLE public.internal_creative_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  job_type TEXT NOT NULL, -- 'script', 'voiceover', 'video', 'image', 'full_pipeline'
  status TEXT DEFAULT 'queued', -- queued, processing, completed, failed
  
  -- Input
  product_id UUID REFERENCES public.internal_products(id),
  prompt TEXT,
  style TEXT,
  target_platform TEXT, -- tiktok, instagram, facebook, youtube
  duration_seconds INTEGER,
  
  -- Pipeline stages
  script_text TEXT,
  script_model TEXT, -- which AI model generated it
  voiceover_url TEXT,
  voiceover_model TEXT,
  video_url TEXT,
  video_model TEXT,
  thumbnail_url TEXT,
  
  -- Quality
  quality_score NUMERIC(3,2),
  hook_score NUMERIC(3,2),
  emotional_trigger TEXT,
  
  -- Cost tracking
  total_cost_cents INTEGER DEFAULT 0,
  
  -- Output
  result JSONB DEFAULT '{}',
  error_message TEXT,
  
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.internal_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_processors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_creative_jobs ENABLE ROW LEVEL SECURITY;

-- RLS: Org-scoped access for all tables
CREATE POLICY "Org members can manage products" ON public.internal_products
  FOR ALL USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Org members can manage variants" ON public.internal_product_variants
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.internal_products p WHERE p.id = product_id AND public.is_org_member(auth.uid(), p.organization_id))
  );

CREATE POLICY "Org members can manage processors" ON public.payment_processors
  FOR ALL USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Org members can manage orders" ON public.internal_orders
  FOR ALL USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Org members can manage order items" ON public.internal_order_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.internal_orders o WHERE o.id = order_id AND public.is_org_member(auth.uid(), o.organization_id))
  );

CREATE POLICY "Org members can manage creative jobs" ON public.internal_creative_jobs
  FOR ALL USING (public.is_org_member(auth.uid(), organization_id));

-- Public read for active products (storefront)
CREATE POLICY "Public can view active products" ON public.internal_products
  FOR SELECT USING (status = 'active');

CREATE POLICY "Public can view active variants" ON public.internal_product_variants
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.internal_products p WHERE p.id = product_id AND p.status = 'active')
  );

-- Indexes
CREATE INDEX idx_internal_products_org ON public.internal_products(organization_id);
CREATE INDEX idx_internal_products_status ON public.internal_products(status);
CREATE INDEX idx_internal_products_slug ON public.internal_products(slug);
CREATE INDEX idx_internal_orders_org ON public.internal_orders(organization_id);
CREATE INDEX idx_internal_orders_status ON public.internal_orders(status);
CREATE INDEX idx_internal_orders_customer ON public.internal_orders(customer_email);
CREATE INDEX idx_internal_creative_jobs_org ON public.internal_creative_jobs(organization_id);
CREATE INDEX idx_internal_creative_jobs_status ON public.internal_creative_jobs(status);

-- Triggers for updated_at
CREATE TRIGGER update_internal_products_updated_at BEFORE UPDATE ON public.internal_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_internal_product_variants_updated_at BEFORE UPDATE ON public.internal_product_variants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payment_processors_updated_at BEFORE UPDATE ON public.payment_processors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_internal_orders_updated_at BEFORE UPDATE ON public.internal_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_internal_creative_jobs_updated_at BEFORE UPDATE ON public.internal_creative_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
