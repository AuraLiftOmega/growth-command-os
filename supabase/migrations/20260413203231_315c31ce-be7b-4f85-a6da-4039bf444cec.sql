-- Fix critical: shopify_orders publicly accessible
DROP POLICY IF EXISTS "Service role full access" ON public.shopify_orders;
CREATE POLICY "Admin only access shopify_orders" ON public.shopify_orders
  FOR ALL TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

-- Fix critical: zoho_tokens publicly accessible
DROP POLICY IF EXISTS "Allow access for authenticated users" ON public.zoho_tokens;
DROP POLICY IF EXISTS "zoho_tokens_public_policy" ON public.zoho_tokens;
CREATE POLICY "Service role only zoho_tokens" ON public.zoho_tokens
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Fix critical: shopify_config publicly accessible
DROP POLICY IF EXISTS "shopify_config_public_policy" ON public.shopify_config;
DROP POLICY IF EXISTS "Service role full access on shopify_config" ON public.shopify_config;
CREATE POLICY "Service role only shopify_config" ON public.shopify_config
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Fix critical: shopify_connections publicly accessible
DROP POLICY IF EXISTS "Service role full access on shopify_connections" ON public.shopify_connections;
CREATE POLICY "Service role only shopify_connections" ON public.shopify_connections
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Fix critical: shopify_audit_log publicly accessible
DROP POLICY IF EXISTS "shopify_audit_log_public_policy" ON public.shopify_audit_log;
DROP POLICY IF EXISTS "Service role full access on shopify_audit_log" ON public.shopify_audit_log;
CREATE POLICY "Service role only shopify_audit_log" ON public.shopify_audit_log
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Fix critical: admin_entitlements policy bypass via GUC spoofing
DROP POLICY IF EXISTS "Service role can manage all entitlements" ON public.admin_entitlements;
CREATE POLICY "Service role manages entitlements" ON public.admin_entitlements
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Fix: demo_share_links expose all recipient data
DROP POLICY IF EXISTS "Anyone can view by share_code" ON public.demo_share_links;

-- Fix: workspace_invites expose all emails
DROP POLICY IF EXISTS "Anyone can view invites by token" ON public.workspace_invites;

-- Enable leaked password protection is handled separately via configure_auth