
-- ============================================================
-- OMEGA NOTIFICATION ENGINE — Full Schema
-- ============================================================

-- 1. Core notifications table (the single source of truth)
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  -- Content
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  icon TEXT DEFAULT 'bell',
  image_url TEXT,
  action_url TEXT,
  action_label TEXT,
  
  -- Classification
  category TEXT NOT NULL DEFAULT 'system',
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  channel TEXT NOT NULL DEFAULT 'in_app' CHECK (channel IN ('in_app', 'push', 'email', 'discord', 'all')),
  
  -- Grouping & dedup
  group_key TEXT,
  dedup_key TEXT,
  
  -- State
  read_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  
  -- Delivery tracking
  delivery_status JSONB DEFAULT '{}',
  
  -- Source
  source_type TEXT,
  source_id TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for fast queries
CREATE INDEX idx_notifications_user_unread ON public.notifications (user_id, read_at) WHERE read_at IS NULL;
CREATE INDEX idx_notifications_user_created ON public.notifications (user_id, created_at DESC);
CREATE INDEX idx_notifications_category ON public.notifications (user_id, category);
CREATE INDEX idx_notifications_dedup ON public.notifications (dedup_key) WHERE dedup_key IS NOT NULL;
CREATE INDEX idx_notifications_org ON public.notifications (organization_id) WHERE organization_id IS NOT NULL;

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users mark own notifications read"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role inserts notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- 2. Notification preferences per user
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  
  -- Global toggles
  in_app_enabled BOOLEAN NOT NULL DEFAULT true,
  push_enabled BOOLEAN NOT NULL DEFAULT true,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  discord_enabled BOOLEAN NOT NULL DEFAULT false,
  
  -- Category overrides (JSON map of category -> {enabled, channels[]})
  category_overrides JSONB DEFAULT '{}',
  
  -- Quiet hours
  quiet_hours_enabled BOOLEAN NOT NULL DEFAULT false,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',
  timezone TEXT DEFAULT 'UTC',
  
  -- Digest
  digest_enabled BOOLEAN NOT NULL DEFAULT false,
  digest_frequency TEXT DEFAULT 'daily' CHECK (digest_frequency IN ('hourly', 'daily', 'weekly')),
  digest_time TIME DEFAULT '09:00',
  
  -- Smart routing
  critical_always_push BOOLEAN NOT NULL DEFAULT true,
  batch_low_priority BOOLEAN NOT NULL DEFAULT true,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own preferences"
  ON public.notification_preferences FOR ALL
  USING (auth.uid() = user_id);

-- 3. Push subscriptions (Web Push API)
CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  
  user_agent TEXT,
  device_name TEXT,
  
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMPTZ DEFAULT now(),
  failed_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, endpoint)
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own push subs"
  ON public.push_subscriptions FOR ALL
  USING (auth.uid() = user_id);

-- 4. Notification delivery log (audit trail)
CREATE TABLE public.notification_delivery_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id UUID REFERENCES public.notifications(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
  provider TEXT,
  provider_response JSONB,
  latency_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_delivery_log_notification ON public.notification_delivery_log (notification_id);
CREATE INDEX idx_delivery_log_status ON public.notification_delivery_log (status, created_at DESC);

ALTER TABLE public.notification_delivery_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own delivery logs"
  ON public.notification_delivery_log FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.notifications n WHERE n.id = notification_id AND n.user_id = auth.uid()
  ));

CREATE POLICY "Service role inserts delivery logs"
  ON public.notification_delivery_log FOR INSERT
  WITH CHECK (true);

-- Enable realtime for instant notification delivery
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Auto-create preferences on first notification
CREATE OR REPLACE FUNCTION public.ensure_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

CREATE TRIGGER trg_ensure_notification_prefs
  AFTER INSERT ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_notification_preferences();
