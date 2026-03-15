-- CRITICAL SECURITY FIX (corrected for shopify_orders having no user_id)

-- 2. shopify_orders: admin + service_role only (no user_id column)
DROP POLICY IF EXISTS "Users view own shopify orders" ON public.shopify_orders;
CREATE POLICY "Admins view shopify orders" ON public.shopify_orders
  FOR SELECT TO authenticated
  USING (public.is_admin_user(auth.uid()));
CREATE POLICY "Service role manages shopify orders" ON public.shopify_orders
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 10. notifications: Fix INSERT policy from public to service_role
DROP POLICY IF EXISTS "Service role inserts notifications" ON public.notifications;
CREATE POLICY "Service role inserts notifications" ON public.notifications
  FOR INSERT TO service_role
  WITH CHECK (true);

-- 11. master_events: Fix INSERT policy from public to service_role
DROP POLICY IF EXISTS "System can insert events" ON public.master_events;
CREATE POLICY "Service role inserts events" ON public.master_events
  FOR INSERT TO service_role
  WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated users can view master_events" ON public.master_events;
CREATE POLICY "Users view own events" ON public.master_events
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin_user(auth.uid()));

-- 12. brain_suggestions: Fix INSERT policy from public to service_role
DROP POLICY IF EXISTS "System can create suggestions" ON public.brain_suggestions;
CREATE POLICY "Service role creates suggestions" ON public.brain_suggestions
  FOR INSERT TO service_role
  WITH CHECK (true);

-- 13. spine_audit_log: Restrict to admin only
DROP POLICY IF EXISTS "Authenticated users can view spine_audit_log" ON public.spine_audit_log;
CREATE POLICY "Admins view spine audit log" ON public.spine_audit_log
  FOR SELECT TO authenticated
  USING (public.is_admin_user(auth.uid()));

-- 14. store_setups: Fix the NULL user_id bypass
DROP POLICY IF EXISTS "Users can update own store setup" ON public.store_setups;
CREATE POLICY "Users update own store setup" ON public.store_setups
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 15. Stripe infrastructure tables: Restrict to admin only
DROP POLICY IF EXISTS "Authenticated users can manage stripe_metrics_daily" ON public.stripe_metrics_daily;
DROP POLICY IF EXISTS "Authenticated users manage stripe_metrics_daily" ON public.stripe_metrics_daily;
CREATE POLICY "Admins manage stripe metrics" ON public.stripe_metrics_daily
  FOR ALL TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can manage stripe_canonical" ON public.stripe_canonical;
DROP POLICY IF EXISTS "Authenticated users manage stripe_canonical" ON public.stripe_canonical;
CREATE POLICY "Admins manage stripe canonical" ON public.stripe_canonical
  FOR ALL TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can manage stripe_boot_validations" ON public.stripe_boot_validations;
DROP POLICY IF EXISTS "Authenticated users manage stripe_boot_validations" ON public.stripe_boot_validations;
CREATE POLICY "Admins manage stripe boot validations" ON public.stripe_boot_validations
  FOR ALL TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can manage project_stripe_bindings" ON public.project_stripe_bindings;
DROP POLICY IF EXISTS "Authenticated users manage project_stripe_bindings" ON public.project_stripe_bindings;
CREATE POLICY "Admins manage project stripe bindings" ON public.project_stripe_bindings
  FOR ALL TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can manage webhook_health_metrics" ON public.webhook_health_metrics;
DROP POLICY IF EXISTS "Authenticated users manage webhook_health_metrics" ON public.webhook_health_metrics;
CREATE POLICY "Admins manage webhook health metrics" ON public.webhook_health_metrics
  FOR ALL TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can manage spine_projects" ON public.spine_projects;
DROP POLICY IF EXISTS "Authenticated users manage spine_projects" ON public.spine_projects;
CREATE POLICY "Admins manage spine projects" ON public.spine_projects
  FOR ALL TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));