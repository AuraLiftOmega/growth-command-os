-- Create omega_ceo_agents table for CEO Brain agent operations
CREATE TABLE public.omega_ceo_agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  agent_type TEXT NOT NULL DEFAULT 'ceo_brain',
  status TEXT NOT NULL DEFAULT 'idle',
  query TEXT,
  strategy JSONB DEFAULT '{}',
  last_run TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  logs TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.omega_ceo_agents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own CEO agents"
ON public.omega_ceo_agents
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own CEO agents"
ON public.omega_ceo_agents
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own CEO agents"
ON public.omega_ceo_agents
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own CEO agents"
ON public.omega_ceo_agents
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_omega_ceo_agents_updated_at
BEFORE UPDATE ON public.omega_ceo_agents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();