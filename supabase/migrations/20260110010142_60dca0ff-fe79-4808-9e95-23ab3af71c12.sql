-- Create self_heal_logs table for tracking auto-fixes
CREATE TABLE public.self_heal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  fix_action TEXT NOT NULL,
  fix_result TEXT,
  success BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.self_heal_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own heal logs"
ON public.self_heal_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own heal logs"
ON public.self_heal_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_self_heal_logs_user_id ON public.self_heal_logs(user_id);
CREATE INDEX idx_self_heal_logs_created_at ON public.self_heal_logs(created_at DESC);