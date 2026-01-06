-- Add strict trigger validation to SECURITY DEFINER functions

-- 1. Update update_updated_at_column with trigger validation
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate this is being called as a trigger
  IF TG_OP IS NULL THEN
    RAISE EXCEPTION 'This function can only be called as a trigger';
  END IF;
  
  IF TG_OP != 'UPDATE' THEN
    RAISE EXCEPTION 'This trigger only handles UPDATE operations';
  END IF;
  
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Update handle_new_user with strict validation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate this is being called as a trigger on INSERT only
  IF TG_OP IS NULL THEN
    RAISE EXCEPTION 'This function can only be called as a trigger';
  END IF;
  
  IF TG_OP != 'INSERT' THEN
    RAISE EXCEPTION 'This trigger only handles INSERT operations';
  END IF;
  
  -- Validate we're operating on the expected table structure
  IF NEW.id IS NULL OR NEW.email IS NULL THEN
    RAISE EXCEPTION 'Invalid user data for profile creation';
  END IF;
  
  -- Create profile
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  
  -- Create onboarding data
  INSERT INTO public.onboarding_data (user_id)
  VALUES (NEW.id);
  
  -- Create automation settings
  INSERT INTO public.automation_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Update handle_new_user_subscription with strict validation  
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate this is being called as a trigger on INSERT only
  IF TG_OP IS NULL THEN
    RAISE EXCEPTION 'This function can only be called as a trigger';
  END IF;
  
  IF TG_OP != 'INSERT' THEN
    RAISE EXCEPTION 'This trigger only handles INSERT operations';
  END IF;
  
  -- Validate we have a valid user ID
  IF NEW.id IS NULL THEN
    RAISE EXCEPTION 'Invalid user ID for subscription creation';
  END IF;
  
  -- Prevent duplicate subscriptions
  IF EXISTS (SELECT 1 FROM public.subscriptions WHERE user_id = NEW.id) THEN
    RETURN NEW; -- Silently skip if subscription already exists
  END IF;
  
  INSERT INTO public.subscriptions (user_id, plan, status, trial_ends_at)
  VALUES (NEW.id, 'free', 'trialing', now() + interval '14 days');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Update protect_subscription_stripe_fields with additional validation
CREATE OR REPLACE FUNCTION public.protect_subscription_stripe_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate this is being called as a trigger
  IF TG_OP IS NULL THEN
    RAISE EXCEPTION 'This function can only be called as a trigger';
  END IF;
  
  IF TG_OP != 'UPDATE' THEN
    RAISE EXCEPTION 'This trigger only handles UPDATE operations';
  END IF;

  -- Only allow changes to non-sensitive fields by regular users
  -- Sensitive fields can only be changed by service role (webhooks)
  IF current_setting('role', true) != 'service_role' THEN
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