-- First drop the trigger so we can make changes
DROP TRIGGER IF EXISTS protect_subscription_billing ON public.subscriptions;

-- Now replace the function to allow migrations and service role
CREATE OR REPLACE FUNCTION public.protect_subscription_stripe_fields()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Validate this is being called as a trigger
  IF TG_OP IS NULL THEN
    RAISE EXCEPTION 'This function can only be called as a trigger';
  END IF;
  
  IF TG_OP != 'UPDATE' THEN
    RAISE EXCEPTION 'This trigger only handles UPDATE operations';
  END IF;

  -- Allow service_role and postgres (migrations) to make any changes
  IF current_setting('role', true) = 'service_role' OR current_user = 'postgres' THEN
    RETURN NEW;
  END IF;
  
  -- Only allow changes to non-sensitive fields by regular users
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
  
  RETURN NEW;
END;
$function$;