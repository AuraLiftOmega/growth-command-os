-- Create platform_accounts table (for social platform connections)
CREATE TABLE IF NOT EXISTS public.platform_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('tiktok', 'instagram', 'youtube', 'facebook', 'pinterest', 'amazon')),
  handle TEXT,
  is_connected BOOLEAN DEFAULT false,
  credentials_encrypted JSONB DEFAULT '{}'::jsonb,
  last_health_check TIMESTAMP WITH TIME ZONE,
  health_status TEXT DEFAULT 'disconnected' CHECK (health_status IN ('healthy', 'degraded', 'disconnected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create publish_jobs table
CREATE TABLE IF NOT EXISTS public.publish_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  creative_id UUID NOT NULL,
  platform TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'publishing', 'published', 'failed', 'ready_to_upload')),
  external_post_id TEXT,
  upload_pack_url TEXT,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create creative_metrics table
CREATE TABLE IF NOT EXISTS public.creative_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  creative_id UUID NOT NULL,
  platform TEXT NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ctr NUMERIC DEFAULT 0,
  spend NUMERIC DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue NUMERIC DEFAULT 0,
  roas NUMERIC DEFAULT 0,
  observed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create system_checks table for acceptance tests
CREATE TABLE IF NOT EXISTS public.system_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  check_type TEXT NOT NULL,
  check_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'passed', 'failed', 'degraded')),
  result JSONB DEFAULT '{}'::jsonb,
  error TEXT,
  ran_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add missing columns to creatives table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'creatives' AND column_name = 'shopify_product_id') THEN
    ALTER TABLE public.creatives ADD COLUMN shopify_product_id TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'creatives' AND column_name = 'captions') THEN
    ALTER TABLE public.creatives ADD COLUMN captions JSONB DEFAULT '[]'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'creatives' AND column_name = 'duration_seconds') THEN
    ALTER TABLE public.creatives ADD COLUMN duration_seconds INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'creatives' AND column_name = 'error') THEN
    ALTER TABLE public.creatives ADD COLUMN error TEXT;
  END IF;
END $$;

-- Enable RLS on all new tables
ALTER TABLE public.platform_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publish_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creative_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_checks ENABLE ROW LEVEL SECURITY;

-- RLS policies for platform_accounts
CREATE POLICY "Users can view their own platform accounts" ON public.platform_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own platform accounts" ON public.platform_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own platform accounts" ON public.platform_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own platform accounts" ON public.platform_accounts FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for publish_jobs
CREATE POLICY "Users can view their own publish jobs" ON public.publish_jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own publish jobs" ON public.publish_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own publish jobs" ON public.publish_jobs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own publish jobs" ON public.publish_jobs FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for creative_metrics
CREATE POLICY "Users can view their own creative metrics" ON public.creative_metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own creative metrics" ON public.creative_metrics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own creative metrics" ON public.creative_metrics FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for system_checks
CREATE POLICY "Users can view their own system checks" ON public.system_checks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own system checks" ON public.system_checks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own system checks" ON public.system_checks FOR UPDATE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_platform_accounts_user_id ON public.platform_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_publish_jobs_creative_id ON public.publish_jobs(creative_id);
CREATE INDEX IF NOT EXISTS idx_publish_jobs_status ON public.publish_jobs(status);
CREATE INDEX IF NOT EXISTS idx_creative_metrics_creative_id ON public.creative_metrics(creative_id);
CREATE INDEX IF NOT EXISTS idx_system_checks_user_id ON public.system_checks(user_id);

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.publish_jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.creative_metrics;

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_platform_accounts_updated_at ON public.platform_accounts;
CREATE TRIGGER update_platform_accounts_updated_at BEFORE UPDATE ON public.platform_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_publish_jobs_updated_at ON public.publish_jobs;
CREATE TRIGGER update_publish_jobs_updated_at BEFORE UPDATE ON public.publish_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();