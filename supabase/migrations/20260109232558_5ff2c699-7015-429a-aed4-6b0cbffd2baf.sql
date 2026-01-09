-- Phase 3: Social Connections Table for OAuth tokens
CREATE TABLE IF NOT EXISTS public.social_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform VARCHAR(50) NOT NULL,
  platform_user_id VARCHAR(255),
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  handle VARCHAR(255),
  profile_url TEXT,
  profile_image_url TEXT,
  followers_count INTEGER DEFAULT 0,
  is_connected BOOLEAN DEFAULT false,
  is_test_mode BOOLEAN DEFAULT false,
  health_status VARCHAR(50) DEFAULT 'disconnected',
  last_post_at TIMESTAMP WITH TIME ZONE,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- Enable RLS
ALTER TABLE public.social_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own social connections"
  ON public.social_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own social connections"
  ON public.social_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own social connections"
  ON public.social_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own social connections"
  ON public.social_connections FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_social_connections_updated_at
  BEFORE UPDATE ON public.social_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add shopify_product_id column to ads table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'ads' AND column_name = 'shopify_product_id'
  ) THEN
    ALTER TABLE public.ads ADD COLUMN shopify_product_id VARCHAR(255);
  END IF;
END $$;

-- Add product_image column to ads table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'ads' AND column_name = 'product_image'
  ) THEN
    ALTER TABLE public.ads ADD COLUMN product_image TEXT;
  END IF;
END $$;

-- Add platform_posts tracking table
CREATE TABLE IF NOT EXISTS public.platform_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  ad_id UUID REFERENCES public.ads(id),
  platform VARCHAR(50) NOT NULL,
  platform_post_id VARCHAR(255),
  post_url TEXT,
  caption TEXT,
  hashtags TEXT[],
  status VARCHAR(50) DEFAULT 'pending',
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  revenue_attributed NUMERIC DEFAULT 0,
  posted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own platform posts"
  ON public.platform_posts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own platform posts"
  ON public.platform_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own platform posts"
  ON public.platform_posts FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_platform_posts_updated_at
  BEFORE UPDATE ON public.platform_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for social_connections
ALTER PUBLICATION supabase_realtime ADD TABLE public.social_connections;
ALTER PUBLICATION supabase_realtime ADD TABLE public.platform_posts;