-- Recreate RLS policies on demo_bookings to ensure proper user isolation
-- First drop existing policies
DROP POLICY IF EXISTS "Users can create their own bookings" ON public.demo_bookings;
DROP POLICY IF EXISTS "Users can delete their own bookings" ON public.demo_bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.demo_bookings;
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.demo_bookings;

-- Ensure RLS is enabled
ALTER TABLE public.demo_bookings ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owners too
ALTER TABLE public.demo_bookings FORCE ROW LEVEL SECURITY;

-- Recreate policies explicitly as PERMISSIVE with strict user isolation
CREATE POLICY "Users can view their own bookings"
ON public.demo_bookings
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings"
ON public.demo_bookings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings"
ON public.demo_bookings
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookings"
ON public.demo_bookings
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);