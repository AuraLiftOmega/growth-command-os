-- Social tokens table for storing OAuth credentials securely
CREATE TABLE public.social_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  channel TEXT NOT NULL,
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  scope TEXT,
  metadata JSONB DEFAULT '{}',
  account_id TEXT,
  account_name TEXT,
  account_avatar TEXT,
  is_connected BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, channel)
);

-- Social posts tracking table
CREATE TABLE public.social_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  ad_id UUID REFERENCES public.ads(id) ON DELETE SET NULL,
  creative_id UUID REFERENCES public.creatives(id) ON DELETE SET NULL,
  channel TEXT NOT NULL,
  post_id TEXT,
  post_url TEXT,
  status TEXT DEFAULT 'pending',
  caption TEXT,
  hashtags TEXT[],
  scheduled_at TIMESTAMP WITH TIME ZONE,
  posted_at TIMESTAMP WITH TIME ZONE,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  revenue_attributed NUMERIC DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Autonomous posting rules
CREATE TABLE public.autonomous_posting_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  trigger_type TEXT NOT NULL,
  trigger_config JSONB DEFAULT '{}',
  channels TEXT[] DEFAULT '{}',
  content_template JSONB DEFAULT '{}',
  posting_schedule JSONB DEFAULT '{}',
  performance_threshold JSONB DEFAULT '{}',
  posts_created INTEGER DEFAULT 0,
  revenue_generated NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.social_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.autonomous_posting_rules ENABLE ROW LEVEL SECURITY;

-- RLS policies for social_tokens
CREATE POLICY "Users can view their own social tokens"
ON public.social_tokens FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own social tokens"
ON public.social_tokens FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own social tokens"
ON public.social_tokens FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own social tokens"
ON public.social_tokens FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for social_posts
CREATE POLICY "Users can view their own social posts"
ON public.social_posts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own social posts"
ON public.social_posts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own social posts"
ON public.social_posts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own social posts"
ON public.social_posts FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for autonomous_posting_rules
CREATE POLICY "Users can view their own autonomous rules"
ON public.autonomous_posting_rules FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own autonomous rules"
ON public.autonomous_posting_rules FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own autonomous rules"
ON public.autonomous_posting_rules FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own autonomous rules"
ON public.autonomous_posting_rules FOR DELETE
USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_social_tokens_updated_at
BEFORE UPDATE ON public.social_tokens
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_social_posts_updated_at
BEFORE UPDATE ON public.social_posts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_autonomous_rules_updated_at
BEFORE UPDATE ON public.autonomous_posting_rules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_social_tokens_user_channel ON public.social_tokens(user_id, channel);
CREATE INDEX idx_social_posts_user_channel ON public.social_posts(user_id, channel);
CREATE INDEX idx_social_posts_status ON public.social_posts(status);
CREATE INDEX idx_autonomous_rules_user ON public.autonomous_posting_rules(user_id);