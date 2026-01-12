-- Create video_ideas_brain table for storing viral video content ideas
CREATE TABLE public.video_ideas_brain (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  idea_number INT,
  title TEXT NOT NULL,
  hook TEXT NOT NULL,
  hook_duration_seconds INT DEFAULT 3,
  visuals TEXT NOT NULL,
  visual_style TEXT,
  product_focus TEXT NOT NULL,
  product_id TEXT,
  body_script TEXT,
  body_duration_seconds INT DEFAULT 7,
  cta TEXT NOT NULL,
  cta_duration_seconds INT DEFAULT 5,
  hashtags TEXT[],
  target_platforms TEXT[] DEFAULT ARRAY['tiktok', 'instagram', 'youtube_shorts', 'facebook'],
  target_audience JSONB DEFAULT '{"age_min": 18, "age_max": 45, "gender": "female", "locations": ["US", "CA"], "interests": ["skincare", "anti-aging", "clean beauty", "k-beauty"]}',
  avatar_style TEXT DEFAULT 'kristin_happy',
  trending_elements TEXT[],
  emotional_trigger TEXT,
  virality_score INT CHECK (virality_score >= 1 AND virality_score <= 10),
  virality_reason TEXT,
  full_script TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'approved', 'generated', 'published', 'archived')),
  generated_video_id UUID,
  performance_metrics JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.video_ideas_brain ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own video ideas"
ON public.video_ideas_brain FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own video ideas"
ON public.video_ideas_brain FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own video ideas"
ON public.video_ideas_brain FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own video ideas"
ON public.video_ideas_brain FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_video_ideas_brain_updated_at
BEFORE UPDATE ON public.video_ideas_brain
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index for faster queries
CREATE INDEX idx_video_ideas_brain_user_status ON public.video_ideas_brain(user_id, status);
CREATE INDEX idx_video_ideas_brain_virality ON public.video_ideas_brain(user_id, virality_score DESC);
CREATE INDEX idx_video_ideas_brain_created ON public.video_ideas_brain(user_id, created_at DESC);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.video_ideas_brain;