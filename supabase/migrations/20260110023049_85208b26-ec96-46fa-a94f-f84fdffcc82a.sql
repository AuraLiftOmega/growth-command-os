-- Create sales_team_agents table for hierarchical agent tracking
CREATE TABLE public.sales_team_agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  parent_agent_id UUID REFERENCES public.sales_team_agents(id),
  agent_name TEXT NOT NULL,
  agent_role TEXT NOT NULL DEFAULT 'sub_agent',
  agent_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'idle',
  current_task TEXT,
  last_activity_at TIMESTAMP WITH TIME ZONE,
  performance_metrics JSONB DEFAULT '{}',
  configuration JSONB DEFAULT '{}',
  debate_logs JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agent_debates table for autonomous debate tracking
CREATE TABLE public.agent_debates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  debate_topic TEXT NOT NULL,
  participants JSONB NOT NULL DEFAULT '[]',
  debate_transcript JSONB NOT NULL DEFAULT '[]',
  consensus_reached BOOLEAN DEFAULT false,
  consensus_output JSONB,
  final_strategy JSONB,
  execution_status TEXT DEFAULT 'pending',
  impact_metrics JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.sales_team_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_debates ENABLE ROW LEVEL SECURITY;

-- RLS policies for sales_team_agents
CREATE POLICY "Users can view their own agents" 
  ON public.sales_team_agents FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own agents" 
  ON public.sales_team_agents FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agents" 
  ON public.sales_team_agents FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agents" 
  ON public.sales_team_agents FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS policies for agent_debates
CREATE POLICY "Users can view their own debates" 
  ON public.agent_debates FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own debates" 
  ON public.agent_debates FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debates" 
  ON public.agent_debates FOR UPDATE 
  USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_sales_team_agents_updated_at
  BEFORE UPDATE ON public.sales_team_agents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_debates_updated_at
  BEFORE UPDATE ON public.agent_debates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();