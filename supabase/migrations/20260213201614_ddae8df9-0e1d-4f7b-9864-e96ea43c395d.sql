
-- Table to store integration endpoint configs (editable from UI)
CREATE TABLE public.integration_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  service_key TEXT NOT NULL,
  service_name TEXT NOT NULL,
  base_url TEXT,
  status TEXT DEFAULT 'disconnected',
  last_tested_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, service_key)
);

ALTER TABLE public.integration_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own integration configs"
  ON public.integration_configs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own integration configs"
  ON public.integration_configs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own integration configs"
  ON public.integration_configs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own integration configs"
  ON public.integration_configs FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_integration_configs_updated_at
  BEFORE UPDATE ON public.integration_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
