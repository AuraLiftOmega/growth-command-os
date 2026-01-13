-- Create winning_product_hunts table for product discovery tracking
CREATE TABLE public.winning_product_hunts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  source TEXT NOT NULL, -- cj_dropshipping, aliexpress, spocket, competitor_scan
  source_url TEXT,
  source_product_id TEXT,
  
  -- Product details
  category TEXT NOT NULL, -- serum, moisturizer, tool, bundle
  price_range TEXT, -- budget, mid, premium
  suggested_price DECIMAL(10,2),
  cost_price DECIMAL(10,2),
  margin_percentage DECIMAL(5,2),
  
  -- Scoring
  viral_score INT CHECK (viral_score >= 1 AND viral_score <= 10),
  lTV_potential TEXT, -- low, medium, high
  cac_estimate TEXT, -- low, medium, high
  tiktok_potential INT CHECK (tiktok_potential >= 1 AND tiktok_potential <= 10),
  bundle_affinity_score INT CHECK (bundle_affinity_score >= 1 AND bundle_affinity_score <= 10),
  overall_score INT CHECK (overall_score >= 1 AND overall_score <= 100),
  
  -- Matching criteria
  complements_products TEXT[], -- product IDs it pairs well with
  bundle_suggestions JSONB, -- auto-generated bundle ideas
  competitor_refs JSONB, -- competitor products it's based on
  trend_tags TEXT[], -- #GlassSkin, #ViralSkincare, etc.
  
  -- Content
  ai_description TEXT,
  ai_benefits TEXT[],
  ai_hooks TEXT[], -- generated hooks for ads
  image_urls TEXT[],
  
  -- Status tracking
  status TEXT DEFAULT 'discovered' CHECK (status IN ('discovered', 'evaluating', 'approved', 'adding', 'added', 'rejected', 'killed')),
  shopify_product_id TEXT,
  shopify_handle TEXT,
  
  -- Performance (after added)
  roas DECIMAL(6,2),
  aov_lift_percentage DECIMAL(5,2),
  sales_count INT DEFAULT 0,
  revenue DECIMAL(12,2) DEFAULT 0,
  performance_status TEXT DEFAULT 'pending' CHECK (performance_status IN ('pending', 'testing', 'winner', 'underperformer', 'scaled')),
  
  -- Ads generated
  ads_generated INT DEFAULT 0,
  ads_published INT DEFAULT 0,
  
  -- Timestamps
  discovered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  added_at TIMESTAMP WITH TIME ZONE,
  killed_at TIMESTAMP WITH TIME ZONE,
  kill_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.winning_product_hunts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own product hunts"
ON public.winning_product_hunts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own product hunts"
ON public.winning_product_hunts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own product hunts"
ON public.winning_product_hunts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own product hunts"
ON public.winning_product_hunts FOR DELETE
USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_winning_product_hunts_updated_at
  BEFORE UPDATE ON public.winning_product_hunts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX idx_winning_product_hunts_user_id ON public.winning_product_hunts(user_id);
CREATE INDEX idx_winning_product_hunts_status ON public.winning_product_hunts(status);
CREATE INDEX idx_winning_product_hunts_overall_score ON public.winning_product_hunts(overall_score DESC);
CREATE INDEX idx_winning_product_hunts_performance_status ON public.winning_product_hunts(performance_status);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.winning_product_hunts;