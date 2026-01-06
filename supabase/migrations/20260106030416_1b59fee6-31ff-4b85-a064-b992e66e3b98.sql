-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  brand_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Create onboarding_data table for storing all form data
CREATE TABLE public.onboarding_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Business DNA
  brand_name TEXT,
  shopify_url TEXT,
  primary_products TEXT,
  aov TEXT,
  monthly_revenue TEXT,
  growth_goal TEXT DEFAULT 'scale-aggressively',
  
  -- Customer Intelligence
  demographics TEXT,
  frustrations TEXT,
  desired_outcomes TEXT,
  past_failures TEXT,
  buying_objections TEXT,
  
  -- Product Truth
  competitive_advantages TEXT,
  claims_allowed TEXT,
  claims_forbidden TEXT,
  proof_assets TEXT[] DEFAULT '{}',
  
  -- Brand Control
  personality TEXT[] DEFAULT '{}',
  tone_casual_professional INTEGER DEFAULT 50,
  tone_soft_aggressive INTEGER DEFAULT 70,
  primary_color TEXT DEFAULT '#3b82f6',
  secondary_color TEXT,
  fonts TEXT,
  forbidden_words TEXT,
  
  -- Creative Direction
  ad_styles TEXT[] DEFAULT '{}',
  priority_platforms TEXT[] DEFAULT '{}',
  competitors TEXT,
  winning_ad_definition TEXT,
  
  -- Automation
  enable_comment_dm BOOLEAN DEFAULT true,
  cta_preference TEXT DEFAULT 'shop-now',
  offer_type TEXT DEFAULT 'discount',
  
  -- Risk & Speed
  aggressiveness_level TEXT DEFAULT 'aggressive',
  priority TEXT DEFAULT 'fast-iteration',
  
  -- Authorization
  authorize_automation BOOLEAN DEFAULT false,
  
  -- Meta
  is_completed BOOLEAN DEFAULT false,
  input_quality_score INTEGER DEFAULT 0,
  current_step INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on onboarding_data
ALTER TABLE public.onboarding_data ENABLE ROW LEVEL SECURITY;

-- Onboarding data policies
CREATE POLICY "Users can view their own onboarding data"
ON public.onboarding_data FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own onboarding data"
ON public.onboarding_data FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding data"
ON public.onboarding_data FOR UPDATE
USING (auth.uid() = user_id);

-- Create automation_settings table for scale mode settings
CREATE TABLE public.automation_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Scale Mode Settings
  aggressive_testing BOOLEAN DEFAULT true,
  auto_regeneration BOOLEAN DEFAULT true,
  multi_variation BOOLEAN DEFAULT true,
  auto_posting BOOLEAN DEFAULT true,
  performance_scaling BOOLEAN DEFAULT true,
  human_approval_required BOOLEAN DEFAULT false,
  
  -- Stats
  creatives_generated_today INTEGER DEFAULT 0,
  auto_killed_today INTEGER DEFAULT 0,
  scaling_now INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on automation_settings
ALTER TABLE public.automation_settings ENABLE ROW LEVEL SECURITY;

-- Automation settings policies
CREATE POLICY "Users can view their own automation settings"
ON public.automation_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own automation settings"
ON public.automation_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own automation settings"
ON public.automation_settings FOR UPDATE
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_onboarding_data_updated_at
BEFORE UPDATE ON public.onboarding_data
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_automation_settings_updated_at
BEFORE UPDATE ON public.automation_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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

-- Trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();