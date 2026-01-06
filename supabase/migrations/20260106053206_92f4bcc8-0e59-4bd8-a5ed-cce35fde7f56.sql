-- Remove the existing user update policy that allows direct updates
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscriptions;

-- Create a function to protect sensitive Stripe fields from direct updates
CREATE OR REPLACE FUNCTION public.protect_subscription_stripe_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow changes to non-sensitive fields by regular users
  -- Sensitive fields can only be changed by service role (webhooks)
  IF current_setting('role', true) != 'service_role' THEN
    -- Prevent changes to Stripe-sensitive fields
    IF NEW.stripe_customer_id IS DISTINCT FROM OLD.stripe_customer_id OR
       NEW.stripe_subscription_id IS DISTINCT FROM OLD.stripe_subscription_id OR
       NEW.plan IS DISTINCT FROM OLD.plan OR
       NEW.status IS DISTINCT FROM OLD.status OR
       NEW.current_period_start IS DISTINCT FROM OLD.current_period_start OR
       NEW.current_period_end IS DISTINCT FROM OLD.current_period_end OR
       NEW.trial_ends_at IS DISTINCT FROM OLD.trial_ends_at OR
       NEW.monthly_video_credits IS DISTINCT FROM OLD.monthly_video_credits OR
       NEW.monthly_ai_credits IS DISTINCT FROM OLD.monthly_ai_credits OR
       NEW.stores_limit IS DISTINCT FROM OLD.stores_limit THEN
      RAISE EXCEPTION 'Subscription billing fields can only be modified through authenticated webhooks';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to protect sensitive fields
DROP TRIGGER IF EXISTS protect_subscription_updates ON public.subscriptions;
CREATE TRIGGER protect_subscription_updates
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_subscription_stripe_fields();

-- Create a restricted update policy that only allows usage counter updates
CREATE POLICY "Users can update usage counters only"
  ON public.subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);