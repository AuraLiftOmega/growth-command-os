-- Create integration tokens table for OAuth and API key storage
CREATE TABLE public.integration_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  integration_name TEXT NOT NULL,
  integration_category TEXT NOT NULL,
  connection_type TEXT NOT NULL CHECK (connection_type IN ('oauth', 'api_key', 'webhook')),
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  api_key_encrypted TEXT,
  webhook_url TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  scopes TEXT[],
  metadata JSONB DEFAULT '{}',
  is_connected BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'idle',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, integration_name)
);

-- Enable RLS
ALTER TABLE public.integration_tokens ENABLE ROW LEVEL SECURITY;

-- Users can only access their own integration tokens
CREATE POLICY "Users can view own integration tokens"
ON public.integration_tokens
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own integration tokens"
ON public.integration_tokens
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own integration tokens"
ON public.integration_tokens
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own integration tokens"
ON public.integration_tokens
FOR DELETE
USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_integration_tokens_updated_at
BEFORE UPDATE ON public.integration_tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create webhook logs table for Zapier/automation tracking
CREATE TABLE public.webhook_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  source TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  payload JSONB,
  response_status INTEGER,
  response_body JSONB,
  error_message TEXT,
  processed BOOLEAN DEFAULT false,
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own webhook logs
CREATE POLICY "Users can view own webhook logs"
ON public.webhook_logs
FOR SELECT
USING (auth.uid() = user_id);

-- Service role can insert webhook logs
CREATE POLICY "Service can insert webhook logs"
ON public.webhook_logs
FOR INSERT
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_integration_tokens_user_id ON public.integration_tokens(user_id);
CREATE INDEX idx_integration_tokens_name ON public.integration_tokens(integration_name);
CREATE INDEX idx_webhook_logs_user_id ON public.webhook_logs(user_id);
CREATE INDEX idx_webhook_logs_source ON public.webhook_logs(source);