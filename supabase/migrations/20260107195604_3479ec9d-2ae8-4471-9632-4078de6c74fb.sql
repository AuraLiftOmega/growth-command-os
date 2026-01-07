-- CRM Contacts table - 360° customer view
CREATE TABLE public.crm_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  company VARCHAR(200),
  title VARCHAR(100),
  avatar_url TEXT,
  source VARCHAR(50) DEFAULT 'manual', -- manual, social, shopify, referral, ad
  source_details JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',
  lead_score INTEGER DEFAULT 0,
  lifecycle_stage VARCHAR(50) DEFAULT 'lead', -- lead, mql, sql, opportunity, customer, evangelist
  churn_risk DECIMAL(3,2) DEFAULT 0,
  ltv DECIMAL(12,2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  last_interaction_at TIMESTAMPTZ,
  last_order_at TIMESTAMPTZ,
  shopify_customer_id VARCHAR(100),
  social_profiles JSONB DEFAULT '{}', -- {instagram: "@handle", tiktok: "@handle"}
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CRM Deals/Pipeline table
CREATE TABLE public.crm_deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  stage VARCHAR(50) DEFAULT 'discovery', -- discovery, qualification, proposal, negotiation, closed_won, closed_lost
  amount DECIMAL(12,2) DEFAULT 0,
  probability INTEGER DEFAULT 10,
  expected_close_date DATE,
  actual_close_date DATE,
  source VARCHAR(50),
  assigned_to VARCHAR(255),
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
  tags TEXT[] DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',
  activities JSONB DEFAULT '[]', -- Array of activity logs
  next_action TEXT,
  next_action_date TIMESTAMPTZ,
  won_reason TEXT,
  lost_reason TEXT,
  competitor VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CRM Interactions/Activities table
CREATE TABLE public.crm_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES public.crm_deals(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL, -- email, call, meeting, social_dm, social_comment, chat, sms, order, note
  direction VARCHAR(20) DEFAULT 'outbound', -- inbound, outbound
  channel VARCHAR(50), -- instagram, tiktok, email, phone, chat
  subject VARCHAR(255),
  content TEXT,
  sentiment VARCHAR(20), -- positive, neutral, negative
  ai_summary TEXT,
  ai_next_action TEXT,
  metadata JSONB DEFAULT '{}',
  is_automated BOOLEAN DEFAULT false,
  response_time_seconds INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CRM Tasks/Follow-ups
CREATE TABLE public.crm_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES public.crm_deals(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) DEFAULT 'follow_up', -- follow_up, call, email, meeting, task
  priority VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, cancelled
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  is_automated BOOLEAN DEFAULT false,
  automation_trigger TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI Decision Log for War Room
CREATE TABLE public.ai_decision_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  decision_type VARCHAR(100) NOT NULL, -- creative_generated, budget_scaled, creative_killed, price_adjusted, seo_optimized, social_published
  entity_type VARCHAR(50), -- creative, product, campaign, contact, deal
  entity_id VARCHAR(255),
  action_taken TEXT NOT NULL,
  reasoning TEXT,
  confidence DECIMAL(3,2) DEFAULT 0.8,
  impact_metrics JSONB DEFAULT '{}', -- {revenue_change: 150, roas_change: 0.5}
  was_overridden BOOLEAN DEFAULT false,
  override_reason TEXT,
  execution_status VARCHAR(20) DEFAULT 'completed', -- pending, executing, completed, failed
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- War Room Alerts
CREATE TABLE public.war_room_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  alert_type VARCHAR(50) NOT NULL, -- revenue_spike, revenue_drop, roas_alert, churn_risk, opportunity, system_error
  severity VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
  title VARCHAR(255) NOT NULL,
  message TEXT,
  entity_type VARCHAR(50),
  entity_id VARCHAR(255),
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_decision_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.war_room_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own contacts" ON public.crm_contacts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own deals" ON public.crm_deals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own interactions" ON public.crm_interactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own tasks" ON public.crm_tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own decisions" ON public.ai_decision_log FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own alerts" ON public.war_room_alerts FOR ALL USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_contacts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_deals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_decision_log;
ALTER PUBLICATION supabase_realtime ADD TABLE public.war_room_alerts;

-- Indexes for performance
CREATE INDEX idx_crm_contacts_user ON public.crm_contacts(user_id);
CREATE INDEX idx_crm_contacts_email ON public.crm_contacts(email);
CREATE INDEX idx_crm_contacts_lifecycle ON public.crm_contacts(lifecycle_stage);
CREATE INDEX idx_crm_deals_user ON public.crm_deals(user_id);
CREATE INDEX idx_crm_deals_stage ON public.crm_deals(stage);
CREATE INDEX idx_crm_interactions_contact ON public.crm_interactions(contact_id);
CREATE INDEX idx_ai_decision_log_user ON public.ai_decision_log(user_id, created_at DESC);
CREATE INDEX idx_war_room_alerts_user ON public.war_room_alerts(user_id, is_read, created_at DESC);