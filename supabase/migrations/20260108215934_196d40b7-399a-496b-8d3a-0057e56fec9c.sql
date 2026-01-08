-- Fix crm_contacts: change from 'public' to 'authenticated' role
DROP POLICY IF EXISTS "Users can manage own contacts" ON public.crm_contacts;

CREATE POLICY "Users can view their own contacts"
ON public.crm_contacts
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contacts"
ON public.crm_contacts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts"
ON public.crm_contacts
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts"
ON public.crm_contacts
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Fix user_store_connections: change from 'public' to 'authenticated' role
DROP POLICY IF EXISTS "Users can add their own stores" ON public.user_store_connections;
DROP POLICY IF EXISTS "Users can delete their own stores" ON public.user_store_connections;
DROP POLICY IF EXISTS "Users can update their own stores" ON public.user_store_connections;
DROP POLICY IF EXISTS "Users can view their own stores" ON public.user_store_connections;

CREATE POLICY "Users can view their own stores"
ON public.user_store_connections
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own stores"
ON public.user_store_connections
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stores"
ON public.user_store_connections
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stores"
ON public.user_store_connections
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);