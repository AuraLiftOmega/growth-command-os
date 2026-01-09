-- Fix update_updated_at_column function with proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create rate limit tracking for webhooks
CREATE TABLE IF NOT EXISTS public.webhook_rate_limits (
  identifier TEXT PRIMARY KEY,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on rate limits table (internal use only)
ALTER TABLE public.webhook_rate_limits ENABLE ROW LEVEL SECURITY;

-- Service role only access
CREATE POLICY "Service role access only" ON public.webhook_rate_limits
  FOR ALL USING (auth.role() = 'service_role');

-- Create rate limit tracking for demo views
CREATE TABLE IF NOT EXISTS public.view_rate_limits (
  viewer_fingerprint TEXT PRIMARY KEY,
  insert_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.view_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role access only" ON public.view_rate_limits
  FOR ALL USING (auth.role() = 'service_role');

-- Add constraints to demo_share_views to prevent obviously fake data
ALTER TABLE public.demo_share_views
  DROP CONSTRAINT IF EXISTS valid_watch_time,
  DROP CONSTRAINT IF EXISTS valid_completion;

ALTER TABLE public.demo_share_views
  ADD CONSTRAINT valid_watch_time CHECK (watch_time_seconds IS NULL OR (watch_time_seconds >= 0 AND watch_time_seconds <= 86400)),
  ADD CONSTRAINT valid_completion CHECK (completion_percentage IS NULL OR (completion_percentage >= 0 AND completion_percentage <= 100));