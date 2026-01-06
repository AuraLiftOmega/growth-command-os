-- Fix security vulnerabilities: Remove public access from sensitive tables

-- 1. Ensure RLS is enabled on both tables (should already be, but confirm)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_data ENABLE ROW LEVEL SECURITY;

-- 2. Force RLS for table owners (critical - prevents bypassing RLS)
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_data FORCE ROW LEVEL SECURITY;

-- 3. Drop and recreate profiles policies with PERMISSIVE (not RESTRICTIVE)
-- First drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Recreate as proper PERMISSIVE policies (default behavior)
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 4. Drop and recreate onboarding_data policies
DROP POLICY IF EXISTS "Users can view their own onboarding data" ON public.onboarding_data;
DROP POLICY IF EXISTS "Users can insert their own onboarding data" ON public.onboarding_data;
DROP POLICY IF EXISTS "Users can update their own onboarding data" ON public.onboarding_data;

-- Recreate as proper PERMISSIVE policies for authenticated users only
CREATE POLICY "Users can view their own onboarding data" 
ON public.onboarding_data 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own onboarding data" 
ON public.onboarding_data 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding data" 
ON public.onboarding_data 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

-- 5. Revoke any public/anon access that might exist
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.onboarding_data FROM anon;

-- Grant only to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.onboarding_data TO authenticated;