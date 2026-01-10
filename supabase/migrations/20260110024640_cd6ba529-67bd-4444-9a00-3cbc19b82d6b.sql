-- Create emerging layer tables for Phase 4

-- Metaverse deployments table
CREATE TABLE public.metaverse_deployments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('decentraland', 'roblox', 'sandbox', 'spatial')),
  deployment_type TEXT NOT NULL CHECK (deployment_type IN ('sales_rep', 'billboard', 'experience', 'npc')),
  config JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'deploying', 'active', 'paused', 'terminated')),
  location JSONB DEFAULT '{}',
  interactions_count INTEGER DEFAULT 0,
  revenue_generated NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Physical robot deployments
CREATE TABLE public.robot_deployments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  robot_type TEXT NOT NULL CHECK (robot_type IN ('figure_01', 'agility_digit', 'boston_spot', 'custom')),
  location TEXT,
  task_type TEXT CHECK (task_type IN ('retail_demo', 'warehouse', 'delivery', 'customer_service')),
  status TEXT DEFAULT 'standby' CHECK (status IN ('standby', 'active', 'maintenance', 'offline')),
  telemetry JSONB DEFAULT '{}',
  tasks_completed INTEGER DEFAULT 0,
  revenue_attributed NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Blockchain transaction logs
CREATE TABLE public.blockchain_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  chain TEXT DEFAULT 'polygon' CHECK (chain IN ('polygon', 'ethereum', 'arbitrum', 'base')),
  tx_hash TEXT,
  tx_type TEXT CHECK (tx_type IN ('profit_log', 'sale_record', 'commission', 'refund', 'royalty')),
  amount NUMERIC(18,8),
  currency TEXT DEFAULT 'MATIC',
  metadata JSONB DEFAULT '{}',
  block_number BIGINT,
  confirmed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.metaverse_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.robot_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blockchain_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for metaverse_deployments
CREATE POLICY "Users can view their own metaverse deployments"
  ON public.metaverse_deployments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create metaverse deployments"
  ON public.metaverse_deployments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own metaverse deployments"
  ON public.metaverse_deployments FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS policies for robot_deployments
CREATE POLICY "Users can view their own robot deployments"
  ON public.robot_deployments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create robot deployments"
  ON public.robot_deployments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own robot deployments"
  ON public.robot_deployments FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS policies for blockchain_logs
CREATE POLICY "Users can view their own blockchain logs"
  ON public.blockchain_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create blockchain logs"
  ON public.blockchain_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);