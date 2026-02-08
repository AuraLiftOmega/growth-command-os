
-- ========================================
-- MASTER_OS MULTI-TENANT FOUNDATION
-- ========================================

-- 1) Organizations table (evolution of workspaces)
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'My Organization',
  slug TEXT UNIQUE,
  logo_url TEXT,
  brand_colors JSONB DEFAULT '{}',
  custom_domain TEXT,
  owner_id UUID NOT NULL,
  plan TEXT NOT NULL DEFAULT 'starter',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- 2) Organization members with proper role enum
CREATE TYPE public.org_role AS ENUM ('owner', 'admin', 'operator', 'client');

CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role public.org_role NOT NULL DEFAULT 'client',
  invited_by UUID,
  invited_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- 3) Helper function: check org membership (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.is_org_member(check_user_id UUID, check_org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = check_user_id AND organization_id = check_org_id
  );
$$;

CREATE OR REPLACE FUNCTION public.get_org_role(check_user_id UUID, check_org_id UUID)
RETURNS public.org_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role FROM public.organization_members
  WHERE user_id = check_user_id AND organization_id = check_org_id
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_user_org_ids(check_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT organization_id FROM public.organization_members
  WHERE user_id = check_user_id;
$$;

-- 4) RLS policies for organizations
CREATE POLICY "Members can view their organizations"
  ON public.organizations FOR SELECT
  USING (public.is_org_member(auth.uid(), id));

CREATE POLICY "Owners can update their organizations"
  ON public.organizations FOR UPDATE
  USING (public.get_org_role(auth.uid(), id) IN ('owner', 'admin'));

CREATE POLICY "Authenticated users can create organizations"
  ON public.organizations FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their organizations"
  ON public.organizations FOR DELETE
  USING (public.get_org_role(auth.uid(), id) = 'owner');

-- 5) RLS policies for organization_members
CREATE POLICY "Members can view org members"
  ON public.organization_members FOR SELECT
  USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Admins can insert org members"
  ON public.organization_members FOR INSERT
  WITH CHECK (
    public.get_org_role(auth.uid(), organization_id) IN ('owner', 'admin')
    OR auth.uid() = user_id -- allow self-join on invite accept
  );

CREATE POLICY "Admins can update org members"
  ON public.organization_members FOR UPDATE
  USING (public.get_org_role(auth.uid(), organization_id) IN ('owner', 'admin'));

CREATE POLICY "Admins can remove org members"
  ON public.organization_members FOR DELETE
  USING (
    public.get_org_role(auth.uid(), organization_id) IN ('owner', 'admin')
    OR auth.uid() = user_id -- allow self-removal
  );

-- 6) Projects table (org-scoped)
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  settings JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view projects"
  ON public.projects FOR SELECT
  USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Operators+ can manage projects"
  ON public.projects FOR INSERT
  WITH CHECK (public.get_org_role(auth.uid(), organization_id) IN ('owner', 'admin', 'operator'));

CREATE POLICY "Operators+ can update projects"
  ON public.projects FOR UPDATE
  USING (public.get_org_role(auth.uid(), organization_id) IN ('owner', 'admin', 'operator'));

CREATE POLICY "Admins can delete projects"
  ON public.projects FOR DELETE
  USING (public.get_org_role(auth.uid(), organization_id) IN ('owner', 'admin'));

-- 7) Experiences table (funnels/pages, org-scoped)
CREATE TABLE IF NOT EXISTS public.experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'page',
  status TEXT NOT NULL DEFAULT 'draft',
  config JSONB DEFAULT '{}',
  analytics JSONB DEFAULT '{}',
  published_url TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view experiences"
  ON public.experiences FOR SELECT
  USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Operators+ can manage experiences"
  ON public.experiences FOR INSERT
  WITH CHECK (public.get_org_role(auth.uid(), organization_id) IN ('owner', 'admin', 'operator'));

CREATE POLICY "Operators+ can update experiences"
  ON public.experiences FOR UPDATE
  USING (public.get_org_role(auth.uid(), organization_id) IN ('owner', 'admin', 'operator'));

CREATE POLICY "Admins can delete experiences"
  ON public.experiences FOR DELETE
  USING (public.get_org_role(auth.uid(), organization_id) IN ('owner', 'admin'));

-- 8) Master automations table (n8n + Python, org-scoped)
CREATE TABLE IF NOT EXISTS public.master_automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'n8n', -- 'n8n' or 'python'
  external_id TEXT, -- n8n workflow ID or python job name
  endpoint_url TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  config JSONB DEFAULT '{}',
  last_run_at TIMESTAMPTZ,
  last_run_status TEXT,
  run_count INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.master_automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view automations"
  ON public.master_automations FOR SELECT
  USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Operators+ can manage automations"
  ON public.master_automations FOR INSERT
  WITH CHECK (public.get_org_role(auth.uid(), organization_id) IN ('owner', 'admin', 'operator'));

CREATE POLICY "Operators+ can update automations"
  ON public.master_automations FOR UPDATE
  USING (public.get_org_role(auth.uid(), organization_id) IN ('owner', 'admin', 'operator'));

CREATE POLICY "Admins can delete automations"
  ON public.master_automations FOR DELETE
  USING (public.get_org_role(auth.uid(), organization_id) IN ('owner', 'admin'));

-- 9) Automation runs/logs
CREATE TABLE IF NOT EXISTS public.automation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id UUID NOT NULL REFERENCES public.master_automations(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  triggered_by UUID,
  payload JSONB DEFAULT '{}',
  result JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.automation_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view runs"
  ON public.automation_runs FOR SELECT
  USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Operators+ can create runs"
  ON public.automation_runs FOR INSERT
  WITH CHECK (public.get_org_role(auth.uid(), organization_id) IN ('owner', 'admin', 'operator'));

-- 10) Referrals table (growth engine)
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id UUID NOT NULL,
  referred_email TEXT NOT NULL,
  referral_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  referred_user_id UUID,
  reward_type TEXT DEFAULT 'credit',
  reward_amount NUMERIC DEFAULT 0,
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their referrals"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_user_id OR auth.uid() = referred_user_id);

CREATE POLICY "Authenticated users can create referrals"
  ON public.referrals FOR INSERT
  WITH CHECK (auth.uid() = referrer_user_id);

-- 11) Leads table (self-selling engine)
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT,
  company TEXT,
  source TEXT DEFAULT 'website',
  status TEXT NOT NULL DEFAULT 'new',
  score INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  converted_at TIMESTAMPTZ,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Leads can be created by anyone (public forms)
CREATE POLICY "Anyone can create leads"
  ON public.leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Org members can view their leads"
  ON public.leads FOR SELECT
  USING (
    organization_id IS NULL 
    OR public.is_org_member(auth.uid(), organization_id)
  );

CREATE POLICY "Org admins can update leads"
  ON public.leads FOR UPDATE
  USING (public.get_org_role(auth.uid(), organization_id) IN ('owner', 'admin', 'operator'));

-- 12) System events (activity log, org-scoped)
CREATE TABLE IF NOT EXISTS public.master_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID,
  event_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.master_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view events"
  ON public.master_events FOR SELECT
  USING (
    organization_id IS NULL 
    OR public.is_org_member(auth.uid(), organization_id)
  );

CREATE POLICY "System can insert events"
  ON public.master_events FOR INSERT
  WITH CHECK (true);

-- 13) Performance brain suggestions
CREATE TABLE IF NOT EXISTS public.brain_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  impact TEXT DEFAULT 'medium',
  category TEXT DEFAULT 'optimization',
  status TEXT NOT NULL DEFAULT 'pending',
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.brain_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view suggestions"
  ON public.brain_suggestions FOR SELECT
  USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "System can create suggestions"
  ON public.brain_suggestions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Operators+ can update suggestions"
  ON public.brain_suggestions FOR UPDATE
  USING (public.get_org_role(auth.uid(), organization_id) IN ('owner', 'admin', 'operator'));

-- 14) Auto-create org on user signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user_org()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF TG_OP != 'INSERT' THEN
    RETURN NEW;
  END IF;

  -- Create default organization
  WITH new_org AS (
    INSERT INTO public.organizations (name, owner_id, slug)
    VALUES (
      COALESCE(split_part(NEW.email, '@', 1), 'My Org') || '''s Organization',
      NEW.id,
      NEW.id::text
    )
    RETURNING id
  )
  INSERT INTO public.organization_members (organization_id, user_id, role, accepted_at)
  SELECT id, NEW.id, 'owner', now()
  FROM new_org;

  -- Generate referral code
  INSERT INTO public.referrals (referrer_user_id, referred_email, referral_code, status)
  VALUES (NEW.id, '', 'REF-' || substr(NEW.id::text, 1, 8), 'available');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_org
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_org();

-- 15) Updated_at triggers
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_org_members_updated_at BEFORE UPDATE ON public.organization_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_experiences_updated_at BEFORE UPDATE ON public.experiences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_master_automations_updated_at BEFORE UPDATE ON public.master_automations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 16) Indexes
CREATE INDEX idx_org_members_user ON public.organization_members(user_id);
CREATE INDEX idx_org_members_org ON public.organization_members(organization_id);
CREATE INDEX idx_projects_org ON public.projects(organization_id);
CREATE INDEX idx_experiences_org ON public.experiences(organization_id);
CREATE INDEX idx_master_automations_org ON public.master_automations(organization_id);
CREATE INDEX idx_automation_runs_automation ON public.automation_runs(automation_id);
CREATE INDEX idx_automation_runs_org ON public.automation_runs(organization_id);
CREATE INDEX idx_referrals_code ON public.referrals(referral_code);
CREATE INDEX idx_leads_org ON public.leads(organization_id);
CREATE INDEX idx_master_events_org ON public.master_events(organization_id);
CREATE INDEX idx_brain_suggestions_org ON public.brain_suggestions(organization_id);
