-- Drop existing overly permissive policies on spine_alerts
DROP POLICY IF EXISTS "Authenticated users can manage spine_alerts" ON public.spine_alerts;
DROP POLICY IF EXISTS "Authenticated users can view spine_alerts" ON public.spine_alerts;
DROP POLICY IF EXISTS "Service role full access spine_alerts" ON public.spine_alerts;

-- Create admin-only policies for spine_alerts
CREATE POLICY "Admins can view spine_alerts"
ON public.spine_alerts
FOR SELECT
USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can manage spine_alerts"
ON public.spine_alerts
FOR ALL
USING (public.is_admin_user(auth.uid()))
WITH CHECK (public.is_admin_user(auth.uid()));