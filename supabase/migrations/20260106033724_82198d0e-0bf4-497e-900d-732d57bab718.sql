-- Create subscriptions table for SaaS billing
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Subscription details
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'growth', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'trialing')),
  
  -- Billing info
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  
  -- Plan limits
  stores_limit INTEGER NOT NULL DEFAULT 1,
  monthly_video_credits INTEGER NOT NULL DEFAULT 10,
  monthly_ai_credits INTEGER NOT NULL DEFAULT 100,
  
  -- Usage tracking
  stores_used INTEGER NOT NULL DEFAULT 0,
  videos_used_this_month INTEGER NOT NULL DEFAULT 0,
  ai_credits_used_this_month INTEGER NOT NULL DEFAULT 0,
  
  -- Dates
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  current_period_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  current_period_end TIMESTAMP WITH TIME ZONE DEFAULT now() + interval '30 days',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_user_subscription UNIQUE (user_id)
);

-- Enable RLS on subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription
CREATE POLICY "Users can view their own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own subscription usage
CREATE POLICY "Users can update their own subscription"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Create user_store_connections for multi-tenant Shopify stores
CREATE TABLE public.user_store_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Store identification
  store_name TEXT NOT NULL,
  store_domain TEXT NOT NULL, -- e.g., 'mystore.myshopify.com'
  
  -- API Credentials (stored securely)
  storefront_access_token TEXT NOT NULL,
  admin_access_token TEXT, -- Optional for advanced features
  
  -- Store status
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_primary BOOLEAN NOT NULL DEFAULT false, -- Primary store for this user
  
  -- Sync status
  last_synced_at TIMESTAMP WITH TIME ZONE,
  products_count INTEGER DEFAULT 0,
  orders_count INTEGER DEFAULT 0,
  total_revenue DECIMAL(12, 2) DEFAULT 0,
  
  -- Connection metadata
  connected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_user_store UNIQUE (user_id, store_domain)
);

-- Enable RLS on user_store_connections
ALTER TABLE public.user_store_connections ENABLE ROW LEVEL SECURITY;

-- Users can view their own stores
CREATE POLICY "Users can view their own stores"
  ON public.user_store_connections FOR SELECT
  USING (auth.uid() = user_id);

-- Users can add their own stores
CREATE POLICY "Users can add their own stores"
  ON public.user_store_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own stores
CREATE POLICY "Users can update their own stores"
  ON public.user_store_connections FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own stores
CREATE POLICY "Users can delete their own stores"
  ON public.user_store_connections FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically create subscription on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan, status, trial_ends_at)
  VALUES (NEW.id, 'free', 'trialing', now() + interval '14 days');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create subscription for new users
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subscription();

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION public.update_store_connection_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for updated_at
CREATE TRIGGER update_user_store_connections_updated_at
  BEFORE UPDATE ON public.user_store_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_store_connection_updated_at();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_store_connection_updated_at();