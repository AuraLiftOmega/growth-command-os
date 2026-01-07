-- ============================================
-- PART 1: ADMIN ENTITLEMENTS SYSTEM
-- ============================================

-- Create admin_entitlements table for robust admin override
CREATE TABLE IF NOT EXISTS public.admin_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  user_email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  unlimited_generation BOOLEAN NOT NULL DEFAULT false,
  bypass_all_credit_checks BOOLEAN NOT NULL DEFAULT false,
  bypass_all_paywalls BOOLEAN NOT NULL DEFAULT false,
  bypass_all_feature_gates BOOLEAN NOT NULL DEFAULT false,
  features JSONB NOT NULL DEFAULT '{"all": false}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_entitlements ENABLE ROW LEVEL SECURITY;

-- Policies for admin_entitlements
CREATE POLICY "Users can view their own entitlements"
ON public.admin_entitlements FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all entitlements"
ON public.admin_entitlements FOR ALL
USING (current_setting('role', true) = 'service_role' OR current_user = 'postgres')
WITH CHECK (current_setting('role', true) = 'service_role' OR current_user = 'postgres');

-- Insert admin entitlements for the founder account
INSERT INTO public.admin_entitlements (
  user_id,
  user_email,
  role,
  unlimited_generation,
  bypass_all_credit_checks,
  bypass_all_paywalls,
  bypass_all_feature_gates,
  features
)
SELECT 
  id,
  email,
  'admin',
  true,
  true,
  true,
  true,
  '{"all": true, "video_generation": true, "ai_concepts": true, "shopify_sync": true, "publishing": true}'::jsonb
FROM auth.users
WHERE email = 'ryanauralift@gmail.com'
ON CONFLICT (user_email) DO UPDATE SET
  role = 'admin',
  unlimited_generation = true,
  bypass_all_credit_checks = true,
  bypass_all_paywalls = true,
  bypass_all_feature_gates = true,
  features = '{"all": true, "video_generation": true, "ai_concepts": true, "shopify_sync": true, "publishing": true}'::jsonb,
  updated_at = now();

-- ============================================
-- PART 2: VIDEO JOBS TABLE FOR REAL TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS public.video_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creative_id UUID REFERENCES public.creatives(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'rendering', 'uploading', 'completed', 'failed')),
  current_step TEXT,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  error_message TEXT,
  provider TEXT, -- 'replicate', 'runway', 'ffmpeg_fallback'
  provider_request JSONB,
  provider_response JSONB,
  prompt_spec JSONB, -- Parsed prompt specification
  shot_list JSONB, -- Generated shot list
  adherence_score INTEGER CHECK (adherence_score >= 0 AND adherence_score <= 100),
  video_url TEXT,
  video_size_bytes BIGINT,
  duration_seconds INTEGER,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.video_jobs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own video jobs"
ON public.video_jobs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own video jobs"
ON public.video_jobs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own video jobs"
ON public.video_jobs FOR UPDATE
USING (auth.uid() = user_id);

-- ============================================
-- PART 3: VIDEO GENERATION LOGS
-- ============================================

CREATE TABLE IF NOT EXISTS public.video_generation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.video_jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  level TEXT NOT NULL DEFAULT 'info' CHECK (level IN ('debug', 'info', 'warn', 'error')),
  step TEXT,
  message TEXT NOT NULL,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.video_generation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own generation logs"
ON public.video_generation_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own generation logs"
ON public.video_generation_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- PART 4: SYSTEM DIAGNOSTICS RESULTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.system_diagnostics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  diagnostic_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pass', 'fail', 'warning', 'running')),
  message TEXT,
  details JSONB,
  run_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.system_diagnostics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own diagnostics"
ON public.system_diagnostics FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own diagnostics"
ON public.system_diagnostics FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- PART 5: ADD MISSING COLUMNS TO CREATIVES
-- ============================================

-- Add prompt_spec column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'creatives' AND column_name = 'prompt_spec') THEN
    ALTER TABLE public.creatives ADD COLUMN prompt_spec JSONB;
  END IF;
END $$;

-- Add shot_list column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'creatives' AND column_name = 'shot_list') THEN
    ALTER TABLE public.creatives ADD COLUMN shot_list JSONB;
  END IF;
END $$;

-- Add adherence_score column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'creatives' AND column_name = 'adherence_score') THEN
    ALTER TABLE public.creatives ADD COLUMN adherence_score INTEGER CHECK (adherence_score >= 0 AND adherence_score <= 100);
  END IF;
END $$;

-- Add generation_provider column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'creatives' AND column_name = 'generation_provider') THEN
    ALTER TABLE public.creatives ADD COLUMN generation_provider TEXT;
  END IF;
END $$;

-- ============================================
-- PART 6: HELPER FUNCTION TO CHECK ADMIN STATUS
-- ============================================

CREATE OR REPLACE FUNCTION public.is_admin_user(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  SELECT bypass_all_credit_checks INTO is_admin
  FROM public.admin_entitlements
  WHERE user_id = check_user_id AND role = 'admin';
  
  RETURN COALESCE(is_admin, false);
END;
$$;

-- ============================================
-- PART 7: ENABLE REALTIME FOR VIDEO JOBS
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.video_jobs;

-- ============================================
-- PART 8: CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_video_jobs_user_id ON public.video_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_video_jobs_status ON public.video_jobs(status);
CREATE INDEX IF NOT EXISTS idx_video_jobs_creative_id ON public.video_jobs(creative_id);
CREATE INDEX IF NOT EXISTS idx_video_generation_logs_job_id ON public.video_generation_logs(job_id);
CREATE INDEX IF NOT EXISTS idx_admin_entitlements_user_email ON public.admin_entitlements(user_email);