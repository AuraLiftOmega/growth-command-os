-- Create bot_logs table for real-time bot activity tracking
CREATE TABLE public.bot_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  bot_id TEXT NOT NULL,
  bot_name TEXT NOT NULL,
  team TEXT NOT NULL,
  action TEXT NOT NULL,
  action_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  revenue_impact DECIMAL(10,2) DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bot_configs table for bot settings
CREATE TABLE public.bot_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  bot_id TEXT NOT NULL UNIQUE,
  bot_name TEXT NOT NULL,
  team TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  performance_score DECIMAL(5,2) DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  revenue_generated DECIMAL(12,2) DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  last_active_at TIMESTAMP WITH TIME ZONE,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bot_team_metrics table for team-level stats
CREATE TABLE public.bot_team_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  team TEXT NOT NULL,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0,
  active_bots INTEGER DEFAULT 0,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  hourly_metrics JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, team, metric_date)
);

-- Enable RLS
ALTER TABLE public.bot_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_team_metrics ENABLE ROW LEVEL SECURITY;

-- RLS policies for bot_logs
CREATE POLICY "Users can view their own bot logs"
ON public.bot_logs FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bot logs"
ON public.bot_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for bot_configs
CREATE POLICY "Users can manage their own bot configs"
ON public.bot_configs FOR ALL USING (auth.uid() = user_id);

-- RLS policies for bot_team_metrics
CREATE POLICY "Users can manage their own team metrics"
ON public.bot_team_metrics FOR ALL USING (auth.uid() = user_id);

-- Enable realtime for bot_logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.bot_logs;

-- Create indexes for performance
CREATE INDEX idx_bot_logs_user_created ON public.bot_logs(user_id, created_at DESC);
CREATE INDEX idx_bot_logs_team ON public.bot_logs(team, created_at DESC);
CREATE INDEX idx_bot_configs_user ON public.bot_configs(user_id);
CREATE INDEX idx_bot_team_metrics_user_date ON public.bot_team_metrics(user_id, metric_date DESC);