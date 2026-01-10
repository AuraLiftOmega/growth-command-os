-- Create CJ Dropshipping logs table
CREATE TABLE public.cj_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cj_product_id TEXT NOT NULL,
  cj_product_name TEXT,
  cj_product_image TEXT,
  cj_price NUMERIC(12,2),
  shopify_product_id TEXT,
  shopify_handle TEXT,
  sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'syncing', 'synced', 'error', 'ad_generated', 'posted')),
  ad_video_url TEXT,
  posted_platforms TEXT[],
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create CJ connection settings table
CREATE TABLE public.cj_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  is_connected BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  products_loaded INTEGER DEFAULT 0,
  auto_sync_enabled BOOLEAN DEFAULT false,
  auto_ad_generation BOOLEAN DEFAULT false,
  auto_post_enabled BOOLEAN DEFAULT false,
  preferred_channels TEXT[] DEFAULT ARRAY['tiktok', 'pinterest'],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cj_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cj_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for cj_logs
CREATE POLICY "Users can view their own CJ logs"
  ON public.cj_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create CJ logs"
  ON public.cj_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own CJ logs"
  ON public.cj_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own CJ logs"
  ON public.cj_logs FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for cj_settings
CREATE POLICY "Users can view their own CJ settings"
  ON public.cj_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own CJ settings"
  ON public.cj_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own CJ settings"
  ON public.cj_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_cj_logs_updated_at
  BEFORE UPDATE ON public.cj_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cj_settings_updated_at
  BEFORE UPDATE ON public.cj_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();