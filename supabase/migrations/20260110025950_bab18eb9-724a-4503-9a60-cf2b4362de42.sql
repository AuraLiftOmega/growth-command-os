-- Create grok_ceo_logs table for Super Grok CEO decisions
CREATE TABLE public.grok_ceo_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  query TEXT NOT NULL,
  grok_response JSONB,
  strategy_json JSONB,
  profit_projection NUMERIC,
  actions_taken JSONB,
  execution_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.grok_ceo_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own grok logs"
ON public.grok_ceo_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own grok logs"
ON public.grok_ceo_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own grok logs"
ON public.grok_ceo_logs FOR UPDATE
USING (auth.uid() = user_id);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.grok_ceo_logs;