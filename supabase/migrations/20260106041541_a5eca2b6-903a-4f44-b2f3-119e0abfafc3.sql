-- Power Users Application Tracking
CREATE TABLE public.power_user_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  monthly_revenue TEXT NOT NULL,
  current_ad_spend TEXT NOT NULL,
  growth_bottleneck TEXT NOT NULL,
  is_decision_maker BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'removed')),
  approval_notes TEXT,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Proof Assets Tracking
CREATE TABLE public.proof_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('revenue_increase', 'time_saved', 'agency_replaced', 'quote', 'case_study')),
  title TEXT NOT NULL,
  description TEXT,
  metric_value TEXT,
  metric_unit TEXT,
  brand_name TEXT,
  is_anonymized BOOLEAN DEFAULT true,
  is_approved BOOLEAN DEFAULT false,
  approved_for TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Language Violations Tracking
CREATE TABLE public.language_violations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  violation_type TEXT NOT NULL CHECK (violation_type IN ('forbidden_word', 'weak_framing', 'unauthorized_message')),
  content TEXT NOT NULL,
  flagged_word TEXT,
  context TEXT,
  resolved BOOLEAN DEFAULT false,
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Rollout Phase Tracking
CREATE TABLE public.rollout_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phase INTEGER NOT NULL DEFAULT 1 CHECK (phase BETWEEN 1 AND 5),
  phase_name TEXT NOT NULL,
  conditions_met JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Strategic Doctrine (CEO-only editable)
CREATE TABLE public.strategic_doctrine (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  north_star TEXT NOT NULL,
  market_category TEXT NOT NULL,
  approved_language TEXT[] NOT NULL DEFAULT '{}',
  forbidden_language TEXT[] NOT NULL DEFAULT '{}',
  target_audience TEXT NOT NULL,
  excluded_audience TEXT NOT NULL,
  last_edited_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.power_user_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proof_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.language_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rollout_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategic_doctrine ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Power User Applications (admin only for write, authenticated for read)
CREATE POLICY "Admins can manage power user applications"
ON public.power_user_applications
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view approved applications"
ON public.power_user_applications
FOR SELECT
TO authenticated
USING (status = 'approved' OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies - Proof Assets
CREATE POLICY "Admins can manage proof assets"
ON public.proof_assets
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view approved proof assets"
ON public.proof_assets
FOR SELECT
TO authenticated
USING (is_approved = true OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies - Language Violations (admin only)
CREATE POLICY "Admins can manage language violations"
ON public.language_violations
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies - Rollout Status (admin only for write)
CREATE POLICY "Admins can manage rollout status"
ON public.rollout_status
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view rollout status"
ON public.rollout_status
FOR SELECT
TO authenticated
USING (true);

-- RLS Policies - Strategic Doctrine (admin only for write)
CREATE POLICY "Admins can manage strategic doctrine"
ON public.strategic_doctrine
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view strategic doctrine"
ON public.strategic_doctrine
FOR SELECT
TO authenticated
USING (true);

-- Insert initial rollout phases
INSERT INTO public.rollout_status (phase, phase_name, conditions_met) VALUES
(1, 'Silent Proof Accumulation', '{"active_users": false, "documented_wins": false, "agency_replaced": false}'),
(2, 'Controlled Exposure', '{"anonymized_wins": false, "founder_content": false, "waitlist_active": false}'),
(3, 'Narrative Warfare', '{"public_challenges": false, "labor_obsolete_content": false, "infrastructure_positioning": false}'),
(4, 'Paid Scale', '{"proof_amplification": false, "intake_caps": false, "price_increases": false}'),
(5, 'Market Lock-In', '{"default_comparison": false, "agency_reactions": false, "pricing_resistance_gone": false}');

-- Insert initial strategic doctrine
INSERT INTO public.strategic_doctrine (
  north_star,
  market_category,
  approved_language,
  forbidden_language,
  target_audience,
  excluded_audience,
  last_edited_by
) VALUES (
  'DOMINION is an AI commerce operating system that replaces agencies, media buyers, and content teams with one system that learns and scales revenue autonomously.',
  'Autonomous Revenue Infrastructure',
  ARRAY['Replace', 'Operate', 'Run', 'Scale', 'Eliminate', 'Compound'],
  ARRAY['Help', 'Assist', 'Tool', 'Platform', 'Support', 'AI-powered'],
  'Owners, operators, $20k+/month brands',
  'Beginners, free users, tire-kickers, emotionally attached agencies',
  '00000000-0000-0000-0000-000000000000'
);

-- Create trigger for updated_at
CREATE TRIGGER update_power_user_applications_updated_at
BEFORE UPDATE ON public.power_user_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_proof_assets_updated_at
BEFORE UPDATE ON public.proof_assets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rollout_status_updated_at
BEFORE UPDATE ON public.rollout_status
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_strategic_doctrine_updated_at
BEFORE UPDATE ON public.strategic_doctrine
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();