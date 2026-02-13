
-- Create table to store Zoho OAuth tokens per user
CREATE TABLE public.zoho_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_type TEXT DEFAULT 'Bearer',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  api_domain TEXT DEFAULT 'https://www.zohoapis.com',
  scopes TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.zoho_tokens ENABLE ROW LEVEL SECURITY;

-- Only service role can access tokens (edge functions use service role)
CREATE POLICY "Service role full access on zoho_tokens"
  ON public.zoho_tokens
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_zoho_tokens_updated_at
  BEFORE UPDATE ON public.zoho_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
