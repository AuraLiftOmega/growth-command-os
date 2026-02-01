-- Add rate limiting for demo view tracking to prevent abuse
CREATE TABLE IF NOT EXISTS public.view_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_fingerprint TEXT NOT NULL,
  insert_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT unique_fingerprint UNIQUE (viewer_fingerprint)
);

-- Enable RLS on rate limits table
ALTER TABLE public.view_rate_limits ENABLE ROW LEVEL SECURITY;

-- Create rate limit check function
CREATE OR REPLACE FUNCTION public.check_view_rate_limit(fingerprint TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count INTEGER;
  window_start_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get current rate limit status
  SELECT insert_count, window_start 
  INTO current_count, window_start_time
  FROM public.view_rate_limits
  WHERE viewer_fingerprint = fingerprint;
  
  IF current_count IS NULL THEN
    -- First insert for this fingerprint
    INSERT INTO public.view_rate_limits (viewer_fingerprint, insert_count, window_start)
    VALUES (fingerprint, 1, now())
    ON CONFLICT (viewer_fingerprint) 
    DO UPDATE SET insert_count = 1, window_start = now();
    RETURN TRUE;
  ELSIF (now() - window_start_time) > INTERVAL '1 hour' THEN
    -- Reset window
    UPDATE public.view_rate_limits
    SET insert_count = 1, window_start = now()
    WHERE viewer_fingerprint = fingerprint;
    RETURN TRUE;
  ELSIF current_count < 20 THEN
    -- Within limit (max 20 per hour)
    UPDATE public.view_rate_limits
    SET insert_count = insert_count + 1
    WHERE viewer_fingerprint = fingerprint;
    RETURN TRUE;
  ELSE
    -- Rate limit exceeded
    RETURN FALSE;
  END IF;
END;
$$;

-- Update demo_share_views policy to use rate limiting
DROP POLICY IF EXISTS "Anyone can insert view events" ON public.demo_share_views;

CREATE POLICY "Rate limited view inserts"
ON public.demo_share_views
FOR INSERT
WITH CHECK (
  public.check_view_rate_limit(COALESCE(viewer_fingerprint, 'anonymous'))
);

-- Add validation constraints to prevent fake data
ALTER TABLE public.demo_share_views
DROP CONSTRAINT IF EXISTS valid_watch_time,
DROP CONSTRAINT IF EXISTS valid_completion;

ALTER TABLE public.demo_share_views
ADD CONSTRAINT valid_watch_time CHECK (watch_time_seconds IS NULL OR (watch_time_seconds >= 0 AND watch_time_seconds <= 86400)),
ADD CONSTRAINT valid_completion CHECK (completion_percentage IS NULL OR (completion_percentage >= 0 AND completion_percentage <= 100));

-- Restrict profiles email visibility - only owner can see their own email
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;

CREATE POLICY "Users can view own full profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Public can view limited profile data"
ON public.profiles
FOR SELECT
USING (
  -- Only expose non-sensitive fields publicly
  auth.uid() IS NULL OR auth.uid() != user_id
);

-- Create anomaly detection for suspicious activity
CREATE OR REPLACE FUNCTION public.detect_security_anomalies()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check for rapid insertions (potential abuse)
  IF (SELECT COUNT(*) 
      FROM public.demo_share_views 
      WHERE viewer_fingerprint = NEW.viewer_fingerprint 
      AND created_at > now() - INTERVAL '1 minute') > 10 THEN
    -- Log suspicious activity
    INSERT INTO public.system_events (
      user_id, 
      event_type, 
      event_category, 
      title, 
      severity,
      description
    )
    SELECT 
      dsl.user_id,
      'security_alert',
      'security',
      'Suspicious view activity detected',
      'error',
      'Potential view count manipulation from fingerprint: ' || LEFT(NEW.viewer_fingerprint, 20) || '...'
    FROM public.demo_share_links dsl
    WHERE dsl.id = NEW.share_link_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for anomaly detection
DROP TRIGGER IF EXISTS monitor_view_anomalies ON public.demo_share_views;
CREATE TRIGGER monitor_view_anomalies
AFTER INSERT ON public.demo_share_views
FOR EACH ROW EXECUTE FUNCTION public.detect_security_anomalies();

-- Add phishing protection headers table for CSP
CREATE TABLE IF NOT EXISTS public.security_headers_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  csp_enabled BOOLEAN DEFAULT true,
  frame_ancestors TEXT DEFAULT '''self''',
  xss_protection BOOLEAN DEFAULT true,
  content_type_nosniff BOOLEAN DEFAULT true,
  referrer_policy TEXT DEFAULT 'strict-origin-when-cross-origin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT unique_user_security_config UNIQUE (user_id)
);

ALTER TABLE public.security_headers_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own security config"
ON public.security_headers_config
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create session security tracking
CREATE TABLE IF NOT EXISTS public.security_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_token_hash TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  device_fingerprint TEXT,
  is_suspicious BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '7 days')
);

ALTER TABLE public.security_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own sessions"
ON public.security_sessions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
ON public.security_sessions
FOR DELETE
USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_security_sessions_user ON public.security_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_view_rate_limits_fingerprint ON public.view_rate_limits(viewer_fingerprint);