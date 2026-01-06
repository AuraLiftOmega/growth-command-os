-- Create table for A/B test notification settings
CREATE TABLE public.ab_test_notification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  -- Email settings
  email_address TEXT,
  in_app_enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT true,
  auto_winner_declaration BOOLEAN DEFAULT false,
  auto_send_email BOOLEAN DEFAULT false,
  significance_threshold INTEGER DEFAULT 95,
  sample_milestones BOOLEAN DEFAULT true,
  -- Digest settings
  digest_enabled BOOLEAN DEFAULT false,
  digest_frequency TEXT DEFAULT 'daily' CHECK (digest_frequency IN ('daily', 'weekly')),
  digest_time TEXT DEFAULT '09:00',
  -- Slack settings
  slack_enabled BOOLEAN DEFAULT false,
  slack_webhook_url TEXT,
  -- Discord settings
  discord_enabled BOOLEAN DEFAULT false,
  discord_webhook_url TEXT,
  -- Microsoft Teams settings
  teams_enabled BOOLEAN DEFAULT false,
  teams_webhook_url TEXT,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Unique per user
  CONSTRAINT unique_user_notification_settings UNIQUE (user_id)
);

-- Enable Row Level Security
ALTER TABLE public.ab_test_notification_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own notification settings" 
ON public.ab_test_notification_settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notification settings" 
ON public.ab_test_notification_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification settings" 
ON public.ab_test_notification_settings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notification settings" 
ON public.ab_test_notification_settings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ab_test_notification_settings_updated_at
BEFORE UPDATE ON public.ab_test_notification_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create table for scheduled digest jobs
CREATE TABLE public.ab_test_digest_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  settings_id UUID NOT NULL REFERENCES public.ab_test_notification_settings(id) ON DELETE CASCADE,
  digest_type TEXT NOT NULL CHECK (digest_type IN ('daily', 'weekly')),
  scheduled_time TEXT NOT NULL,
  last_sent_at TIMESTAMP WITH TIME ZONE,
  next_scheduled_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ab_test_digest_schedules ENABLE ROW LEVEL SECURITY;

-- Policies for digest schedules
CREATE POLICY "Users can view their own digest schedules" 
ON public.ab_test_digest_schedules 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own digest schedules" 
ON public.ab_test_digest_schedules 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own digest schedules" 
ON public.ab_test_digest_schedules 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own digest schedules" 
ON public.ab_test_digest_schedules 
FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_ab_test_digest_schedules_updated_at
BEFORE UPDATE ON public.ab_test_digest_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();