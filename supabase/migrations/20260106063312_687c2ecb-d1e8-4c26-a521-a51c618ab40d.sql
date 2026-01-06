-- Drop the existing ALL policy and create explicit policies for each operation
DROP POLICY IF EXISTS "Users can manage their platform connections" ON public.platform_connections;

-- Create explicit PERMISSIVE policies for each operation
CREATE POLICY "Users can view their own platform connections"
ON public.platform_connections
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own platform connections"
ON public.platform_connections
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own platform connections"
ON public.platform_connections
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own platform connections"
ON public.platform_connections
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);