-- Create profit simulations table
CREATE TABLE public.profit_simulations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  simulation_type TEXT NOT NULL DEFAULT 'monte_carlo',
  target_profit NUMERIC,
  simulated_profit NUMERIC,
  confidence_level NUMERIC,
  iterations INTEGER DEFAULT 10000,
  input_params JSONB DEFAULT '{}',
  results JSONB DEFAULT '{}',
  market_research JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create workflow executions table
CREATE TABLE public.workflow_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  workflow_type TEXT NOT NULL,
  workflow_name TEXT NOT NULL,
  trigger_source TEXT,
  input_data JSONB DEFAULT '{}',
  output_data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.profit_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;

-- RLS policies for profit_simulations
CREATE POLICY "Users can view own simulations" ON public.profit_simulations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own simulations" ON public.profit_simulations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own simulations" ON public.profit_simulations
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for workflow_executions
CREATE POLICY "Users can view own workflows" ON public.workflow_executions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own workflows" ON public.workflow_executions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workflows" ON public.workflow_executions
  FOR UPDATE USING (auth.uid() = user_id);