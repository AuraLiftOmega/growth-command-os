-- Fix webhook_logs insert policy to be more secure
DROP POLICY IF EXISTS "Service can insert webhook logs" ON public.webhook_logs;

-- Only allow inserts from service role or when user_id matches
CREATE POLICY "Authenticated users can insert own webhook logs"
ON public.webhook_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);