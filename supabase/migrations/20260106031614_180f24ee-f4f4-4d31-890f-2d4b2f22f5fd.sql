-- ============================================
-- AI COMMERCE COMMAND CENTER - LEARNING LOOP
-- ============================================

-- Creative Assets with Quality Scoring
CREATE TABLE public.creatives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'tiktok',
  hook TEXT,
  script TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  style TEXT,
  emotional_trigger TEXT,
  
  -- Quality Scoring
  quality_score INTEGER DEFAULT 0 CHECK (quality_score >= 0 AND quality_score <= 100),
  hook_score INTEGER DEFAULT 0,
  engagement_score INTEGER DEFAULT 0,
  conversion_score INTEGER DEFAULT 0,
  passed_quality_gate BOOLEAN DEFAULT false,
  auto_regenerated BOOLEAN DEFAULT false,
  regeneration_count INTEGER DEFAULT 0,
  
  -- Performance Metrics
  impressions BIGINT DEFAULT 0,
  views BIGINT DEFAULT 0,
  watch_time_seconds BIGINT DEFAULT 0,
  avg_watch_percentage DECIMAL(5,2) DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  ctr DECIMAL(5,4) DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue DECIMAL(12,2) DEFAULT 0,
  spend DECIMAL(12,2) DEFAULT 0,
  roas DECIMAL(8,4) DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'pending_review', 'active', 'paused', 'scaling', 'killed')),
  kill_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE,
  killed_at TIMESTAMP WITH TIME ZONE
);

-- Performance Snapshots (hourly data for charts)
CREATE TABLE public.performance_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  creative_id UUID REFERENCES public.creatives(id) ON DELETE CASCADE,
  snapshot_hour TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Metrics at this hour
  impressions BIGINT DEFAULT 0,
  views BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue DECIMAL(12,2) DEFAULT 0,
  spend DECIMAL(12,2) DEFAULT 0,
  roas DECIMAL(8,4) DEFAULT 0,
  ctr DECIMAL(5,4) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Learning Signals (what the AI learns from)
CREATE TABLE public.learning_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  creative_id UUID REFERENCES public.creatives(id) ON DELETE CASCADE,
  
  signal_type TEXT NOT NULL CHECK (signal_type IN ('hook_performance', 'pacing', 'angle', 'cta', 'platform', 'audience', 'timing')),
  signal_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Learning outcome
  positive_outcome BOOLEAN DEFAULT false,
  impact_score DECIMAL(5,2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI Learnings (insights derived from signals)
CREATE TABLE public.ai_learnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  
  category TEXT NOT NULL CHECK (category IN ('hooks', 'pacing', 'angles', 'cta', 'platform', 'audience', 'timing')),
  insight TEXT NOT NULL,
  confidence DECIMAL(5,2) DEFAULT 0,
  signals_count INTEGER DEFAULT 0,
  
  -- Application
  applied_to_generation BOOLEAN DEFAULT false,
  improvement_percentage DECIMAL(5,2),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Platform Connections
CREATE TABLE public.platform_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  
  platform TEXT NOT NULL CHECK (platform IN ('shopify', 'tiktok', 'instagram', 'facebook', 'amazon', 'etsy', 'pinterest', 'youtube')),
  status TEXT DEFAULT 'disconnected' CHECK (status IN ('connected', 'pending', 'disconnected', 'error')),
  
  -- OAuth/API credentials (encrypted)
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Platform-specific data
  platform_user_id TEXT,
  platform_username TEXT,
  store_url TEXT,
  
  -- Metrics
  total_revenue DECIMAL(14,2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'idle',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, platform)
);

-- Comment Automation Logs
CREATE TABLE public.comment_automations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  
  platform TEXT NOT NULL,
  post_id TEXT,
  comment_text TEXT NOT NULL,
  comment_author TEXT,
  
  -- DM sent
  dm_text TEXT,
  dm_sent_at TIMESTAMP WITH TIME ZONE,
  dm_status TEXT DEFAULT 'pending' CHECK (dm_status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  
  -- Conversion tracking
  outcome TEXT DEFAULT 'pending' CHECK (outcome IN ('pending', 'qualified', 'converted', 'ignored')),
  revenue_attributed DECIMAL(10,2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- System Events (for activity feed and debugging)
CREATE TABLE public.system_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  
  event_type TEXT NOT NULL,
  event_category TEXT NOT NULL CHECK (event_category IN ('creative', 'automation', 'platform', 'learning', 'error', 'scale')),
  
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- For error handling
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  resolved BOOLEAN DEFAULT true,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_learnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "Users can manage their own creatives" ON public.creatives FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own performance" ON public.performance_snapshots FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own signals" ON public.learning_signals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own learnings" ON public.ai_learnings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their platform connections" ON public.platform_connections FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view their comment automations" ON public.comment_automations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view their system events" ON public.system_events FOR ALL USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_creatives_user_status ON public.creatives(user_id, status);
CREATE INDEX idx_creatives_quality ON public.creatives(user_id, quality_score DESC);
CREATE INDEX idx_performance_snapshots_creative ON public.performance_snapshots(creative_id, snapshot_hour DESC);
CREATE INDEX idx_learning_signals_type ON public.learning_signals(user_id, signal_type);
CREATE INDEX idx_system_events_category ON public.system_events(user_id, event_category, created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_creatives_updated_at BEFORE UPDATE ON public.creatives FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ai_learnings_updated_at BEFORE UPDATE ON public.ai_learnings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_platform_connections_updated_at BEFORE UPDATE ON public.platform_connections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();