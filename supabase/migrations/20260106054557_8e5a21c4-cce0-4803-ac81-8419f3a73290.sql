-- Create demo_videos table for storing generated demos
CREATE TABLE public.demo_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  variant TEXT NOT NULL CHECK (variant IN ('standard', 'intimidation', 'enterprise', 'silent')),
  industry TEXT NOT NULL,
  deal_size TEXT NOT NULL CHECK (deal_size IN ('smb', 'mid_market', 'enterprise')),
  sales_stage TEXT NOT NULL CHECK (sales_stage IN ('cold', 'warm', 'close')),
  length TEXT NOT NULL CHECK (length IN ('short', 'long')),
  capabilities TEXT[] NOT NULL DEFAULT '{}',
  narrative JSONB NOT NULL DEFAULT '{}',
  video_url TEXT,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  status TEXT NOT NULL DEFAULT 'generating' CHECK (status IN ('generating', 'ready', 'optimizing', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create demo_analytics table for tracking engagement
CREATE TABLE public.demo_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  demo_id UUID NOT NULL REFERENCES public.demo_videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  avg_watch_time_seconds NUMERIC(10,2) NOT NULL DEFAULT 0,
  completion_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  close_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  drop_off_points JSONB NOT NULL DEFAULT '[]',
  view_sessions JSONB NOT NULL DEFAULT '[]',
  closed_deals INTEGER NOT NULL DEFAULT 0,
  revenue_attributed NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create demo_optimizations table for AI learning loop
CREATE TABLE public.demo_optimizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  optimization_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  applied BOOLEAN NOT NULL DEFAULT false,
  applied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create demo_capability_performance table for tracking which capabilities convert
CREATE TABLE public.demo_capability_performance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  capability_id TEXT NOT NULL,
  times_shown INTEGER NOT NULL DEFAULT 0,
  close_correlation NUMERIC(5,2) NOT NULL DEFAULT 0,
  engagement_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  avg_watch_time_when_shown NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, capability_id)
);

-- Enable RLS
ALTER TABLE public.demo_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_optimizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_capability_performance ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for demo_videos
CREATE POLICY "Users can view their own demos" ON public.demo_videos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own demos" ON public.demo_videos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own demos" ON public.demo_videos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own demos" ON public.demo_videos
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for demo_analytics
CREATE POLICY "Users can view their own analytics" ON public.demo_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analytics" ON public.demo_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analytics" ON public.demo_analytics
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for demo_optimizations
CREATE POLICY "Users can view their own optimizations" ON public.demo_optimizations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own optimizations" ON public.demo_optimizations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own optimizations" ON public.demo_optimizations
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for demo_capability_performance
CREATE POLICY "Users can view their own capability performance" ON public.demo_capability_performance
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own capability performance" ON public.demo_capability_performance
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_demo_videos_user_id ON public.demo_videos(user_id);
CREATE INDEX idx_demo_videos_status ON public.demo_videos(status);
CREATE INDEX idx_demo_analytics_demo_id ON public.demo_analytics(demo_id);
CREATE INDEX idx_demo_analytics_user_id ON public.demo_analytics(user_id);
CREATE INDEX idx_demo_capability_performance_user ON public.demo_capability_performance(user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_demo_videos_updated_at
  BEFORE UPDATE ON public.demo_videos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_demo_analytics_updated_at
  BEFORE UPDATE ON public.demo_analytics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_demo_capability_performance_updated_at
  BEFORE UPDATE ON public.demo_capability_performance
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();