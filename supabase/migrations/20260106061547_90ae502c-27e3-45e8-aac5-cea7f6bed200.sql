-- Create demo deployments table to track where demos are deployed
CREATE TABLE public.demo_deployments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  demo_id UUID NOT NULL REFERENCES public.demo_videos(id) ON DELETE CASCADE,
  deployment_type TEXT NOT NULL CHECK (deployment_type IN ('email_sequence', 'sales_page', 'landing_page', 'crm_trigger', 'ad_creative', 'webinar', 'proposal')),
  deployment_name TEXT NOT NULL,
  deployment_config JSONB NOT NULL DEFAULT '{}',
  embed_code TEXT,
  public_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue_attributed NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email sequences table
CREATE TABLE public.email_sequences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('signup', 'demo_view', 'cart_abandon', 'purchase', 'sales_stage', 'manual')),
  trigger_config JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused')),
  emails JSONB NOT NULL DEFAULT '[]',
  total_sent INTEGER DEFAULT 0,
  total_opens INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  revenue_attributed NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sales page embeds table
CREATE TABLE public.sales_page_embeds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  demo_id UUID NOT NULL REFERENCES public.demo_videos(id) ON DELETE CASCADE,
  page_name TEXT NOT NULL,
  page_url TEXT,
  embed_type TEXT NOT NULL CHECK (embed_type IN ('inline', 'modal', 'sidebar', 'fullscreen')),
  embed_config JSONB DEFAULT '{}',
  embed_code TEXT NOT NULL,
  views INTEGER DEFAULT 0,
  engagement_time_seconds INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create CRM triggers table
CREATE TABLE public.crm_demo_triggers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  demo_id UUID NOT NULL REFERENCES public.demo_videos(id) ON DELETE CASCADE,
  trigger_name TEXT NOT NULL,
  sales_stage TEXT NOT NULL,
  deal_size_min NUMERIC(12,2),
  deal_size_max NUMERIC(12,2),
  industry_match TEXT[],
  auto_send BOOLEAN DEFAULT false,
  send_delay_minutes INTEGER DEFAULT 0,
  webhook_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'disabled')),
  triggers_fired INTEGER DEFAULT 0,
  demos_sent INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.demo_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_page_embeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_demo_triggers ENABLE ROW LEVEL SECURITY;

-- RLS policies for demo_deployments
CREATE POLICY "Users can view their own demo deployments"
ON public.demo_deployments FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own demo deployments"
ON public.demo_deployments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own demo deployments"
ON public.demo_deployments FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own demo deployments"
ON public.demo_deployments FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for email_sequences
CREATE POLICY "Users can view their own email sequences"
ON public.email_sequences FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own email sequences"
ON public.email_sequences FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email sequences"
ON public.email_sequences FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email sequences"
ON public.email_sequences FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for sales_page_embeds
CREATE POLICY "Users can view their own sales page embeds"
ON public.sales_page_embeds FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sales page embeds"
ON public.sales_page_embeds FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sales page embeds"
ON public.sales_page_embeds FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sales page embeds"
ON public.sales_page_embeds FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for crm_demo_triggers
CREATE POLICY "Users can view their own CRM triggers"
ON public.crm_demo_triggers FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own CRM triggers"
ON public.crm_demo_triggers FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own CRM triggers"
ON public.crm_demo_triggers FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own CRM triggers"
ON public.crm_demo_triggers FOR DELETE USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_demo_deployments_updated_at
BEFORE UPDATE ON public.demo_deployments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_sequences_updated_at
BEFORE UPDATE ON public.email_sequences
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sales_page_embeds_updated_at
BEFORE UPDATE ON public.sales_page_embeds
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crm_demo_triggers_updated_at
BEFORE UPDATE ON public.crm_demo_triggers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();