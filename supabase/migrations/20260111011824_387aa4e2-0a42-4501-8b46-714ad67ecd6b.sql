-- Create table for Grok query history
CREATE TABLE public.grok_query_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  prompt TEXT NOT NULL,
  mode TEXT DEFAULT 'default',
  response TEXT,
  tool_calls JSONB,
  model TEXT,
  tokens_used INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.grok_query_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own history
CREATE POLICY "Users can view own grok history"
ON public.grok_query_history
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own queries
CREATE POLICY "Users can insert own grok queries"
ON public.grok_query_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_grok_history_user_id ON public.grok_query_history(user_id);
CREATE INDEX idx_grok_history_created_at ON public.grok_query_history(created_at DESC);