
-- 1. PROFILES: Replace overly broad public view policy with owner-only
DROP POLICY IF EXISTS "Public can view limited profile data" ON public.profiles;

-- 2. STORE_SETUPS: Tighten so only owners see their own, restrict inserts to authenticated
DROP POLICY IF EXISTS "Users can view their own store setups" ON public.store_setups;
DROP POLICY IF EXISTS "Anyone can create store setups" ON public.store_setups;

CREATE POLICY "Users can view their own store setups"
  ON public.store_setups FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create store setups"
  ON public.store_setups FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 3. STRATEGIC_DOCTRINE: Remove public SELECT, keep admin-only
DROP POLICY IF EXISTS "Authenticated users can view doctrine" ON public.strategic_doctrine;
DROP POLICY IF EXISTS "Authenticated users can view strategic doctrine" ON public.strategic_doctrine;

-- 4. ROLLOUT_STATUS: Remove public SELECT, keep admin-only
DROP POLICY IF EXISTS "Authenticated users can view rollout status" ON public.rollout_status;

-- 5. LEADS: Replace open INSERT with authenticated + org-scoped
DROP POLICY IF EXISTS "Anyone can create leads" ON public.leads;

CREATE POLICY "Authenticated users can create leads"
  ON public.leads FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (organization_id IS NOT NULL)
  );

-- Also tighten SELECT to require org membership (no NULL org fallback)
DROP POLICY IF EXISTS "Org members can view their leads" ON public.leads;

CREATE POLICY "Org members can view their leads"
  ON public.leads FOR SELECT
  TO authenticated
  USING (is_org_member(auth.uid(), organization_id));
