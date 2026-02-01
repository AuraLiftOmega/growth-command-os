-- Drop existing overly permissive policies on stripe_webhook_events
DROP POLICY IF EXISTS "Authenticated users can manage stripe_webhook_events" ON public.stripe_webhook_events;
DROP POLICY IF EXISTS "Authenticated users can view stripe_webhook_events" ON public.stripe_webhook_events;
DROP POLICY IF EXISTS "Service role full access stripe_webhook_events" ON public.stripe_webhook_events;

-- Create admin-only policies for stripe_webhook_events
CREATE POLICY "Admins can view stripe_webhook_events"
ON public.stripe_webhook_events
FOR SELECT
USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can manage stripe_webhook_events"
ON public.stripe_webhook_events
FOR ALL
USING (public.is_admin_user(auth.uid()))
WITH CHECK (public.is_admin_user(auth.uid()));