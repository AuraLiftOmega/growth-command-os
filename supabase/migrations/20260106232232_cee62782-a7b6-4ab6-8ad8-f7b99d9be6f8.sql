-- Create geekbot_reports table to store synced standup data
CREATE TABLE public.geekbot_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  geekbot_report_id TEXT,
  standup_id TEXT,
  standup_name TEXT NOT NULL,
  member_id TEXT,
  member_name TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]',
  has_blockers BOOLEAN DEFAULT false,
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.geekbot_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own geekbot reports" 
ON public.geekbot_reports 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own geekbot reports" 
ON public.geekbot_reports 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own geekbot reports" 
ON public.geekbot_reports 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own geekbot reports" 
ON public.geekbot_reports 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create unique constraint to prevent duplicate reports
CREATE UNIQUE INDEX idx_geekbot_reports_unique ON public.geekbot_reports (user_id, geekbot_report_id) WHERE geekbot_report_id IS NOT NULL;

-- Create index for faster queries
CREATE INDEX idx_geekbot_reports_user_created ON public.geekbot_reports (user_id, created_at DESC);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_geekbot_reports_updated_at
BEFORE UPDATE ON public.geekbot_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();