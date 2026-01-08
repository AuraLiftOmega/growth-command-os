-- Drop existing policies that use 'public' role
DROP POLICY IF EXISTS "Users can create their own calendar integrations" ON public.calendar_integrations;
DROP POLICY IF EXISTS "Users can delete their own calendar integrations" ON public.calendar_integrations;
DROP POLICY IF EXISTS "Users can update their own calendar integrations" ON public.calendar_integrations;
DROP POLICY IF EXISTS "Users can view their own calendar integrations" ON public.calendar_integrations;

-- Recreate policies with 'authenticated' role for proper security
CREATE POLICY "Users can view their own calendar integrations"
ON public.calendar_integrations
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own calendar integrations"
ON public.calendar_integrations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar integrations"
ON public.calendar_integrations
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar integrations"
ON public.calendar_integrations
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);