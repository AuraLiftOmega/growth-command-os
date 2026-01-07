-- Update the subscription to enterprise for testing
UPDATE public.subscriptions 
SET plan = 'enterprise', 
    status = 'active', 
    stores_limit = -1, 
    monthly_video_credits = -1, 
    monthly_ai_credits = -1
WHERE user_id = 'ea0f9415-b730-41a4-b9b2-380f4a96a17d';

-- Recreate the protection trigger
CREATE TRIGGER protect_subscription_billing
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION protect_subscription_stripe_fields();