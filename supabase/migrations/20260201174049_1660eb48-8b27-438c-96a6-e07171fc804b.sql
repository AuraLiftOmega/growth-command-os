-- Create admin-only RLS policies for shopify_connections
CREATE POLICY "Admins can view shopify_connections"
ON public.shopify_connections
FOR SELECT
USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can manage shopify_connections"
ON public.shopify_connections
FOR ALL
USING (public.is_admin_user(auth.uid()))
WITH CHECK (public.is_admin_user(auth.uid()));