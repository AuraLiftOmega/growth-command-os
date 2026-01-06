-- Revenue Engine Configuration Table
-- Stores the complete revenue engine configuration per user
CREATE TABLE public.revenue_engine_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  
  -- Industry Adaptation
  industry TEXT,
  industry_config JSONB DEFAULT '{}',
  offer_type TEXT,
  sales_motion TEXT,
  deal_size TEXT DEFAULT 'mid',
  buying_cycle TEXT DEFAULT 'short',
  
  -- Core Engine Capabilities
  core_capabilities JSONB DEFAULT '{
    "traffic_generation": true,
    "attention_capture": true,
    "lead_conversion": true,
    "sales_execution": true,
    "pricing_optimization": true,
    "proof_compounding": true,
    "automation_replacement": true,
    "intelligence_loops": true
  }',
  
  -- Self-Marketing Mode
  is_self_marketing_active BOOLEAN DEFAULT false,
  self_as_client BOOLEAN DEFAULT false,
  
  -- Integration Sovereignty
  connected_integrations TEXT[] DEFAULT ARRAY['shopify'],
  orchestrated_tools TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Tenant Mode
  tenant_mode TEXT DEFAULT 'founder',
  is_founder_instance BOOLEAN DEFAULT true,
  customer_id TEXT,
  
  -- KPIs and Metrics
  primary_kpis TEXT[] DEFAULT ARRAY[]::TEXT[],
  secondary_kpis TEXT[] DEFAULT ARRAY[]::TEXT[],
  kpi_benchmarks JSONB DEFAULT '{}',
  
  -- Tone and Language
  language_tone TEXT DEFAULT 'aggressive',
  approved_phrases TEXT[] DEFAULT ARRAY[]::TEXT[],
  forbidden_words TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Buyer Psychology
  decision_makers TEXT[] DEFAULT ARRAY[]::TEXT[],
  objections TEXT[] DEFAULT ARRAY[]::TEXT[],
  triggers TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Configuration Status
  is_configured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.revenue_engine_config ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own revenue engine config" 
ON public.revenue_engine_config 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own revenue engine config" 
ON public.revenue_engine_config 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own revenue engine config" 
ON public.revenue_engine_config 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own revenue engine config" 
ON public.revenue_engine_config 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_revenue_engine_config_updated_at
BEFORE UPDATE ON public.revenue_engine_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create a function to auto-create revenue engine config for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_revenue_engine()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public'
AS $$
BEGIN
  IF TG_OP IS NULL THEN
    RAISE EXCEPTION 'This function can only be called as a trigger';
  END IF;
  
  IF TG_OP != 'INSERT' THEN
    RAISE EXCEPTION 'This trigger only handles INSERT operations';
  END IF;
  
  IF NEW.id IS NULL THEN
    RAISE EXCEPTION 'Invalid user ID for revenue engine config creation';
  END IF;
  
  IF EXISTS (SELECT 1 FROM public.revenue_engine_config WHERE user_id = NEW.id) THEN
    RETURN NEW;
  END IF;
  
  INSERT INTO public.revenue_engine_config (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-create revenue engine config for new users
CREATE TRIGGER on_auth_user_created_revenue_engine
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_revenue_engine();