-- Create shareable demo links table with tracking
CREATE TABLE public.demo_share_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  demo_id UUID NOT NULL REFERENCES public.demo_videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  share_code TEXT NOT NULL UNIQUE,
  recipient_name TEXT,
  recipient_email TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  views INTEGER DEFAULT 0,
  unique_viewers INTEGER DEFAULT 0,
  total_watch_time_seconds INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue_attributed NUMERIC(12,2) DEFAULT 0,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create share link view events table
CREATE TABLE public.demo_share_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  share_link_id UUID NOT NULL REFERENCES public.demo_share_links(id) ON DELETE CASCADE,
  viewer_ip TEXT,
  viewer_fingerprint TEXT,
  watch_time_seconds INTEGER DEFAULT 0,
  completion_percentage INTEGER DEFAULT 0,
  converted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.demo_share_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_share_views ENABLE ROW LEVEL SECURITY;

-- RLS policies for demo_share_links
CREATE POLICY "Users can view their own share links" ON public.demo_share_links
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own share links" ON public.demo_share_links
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own share links" ON public.demo_share_links
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own share links" ON public.demo_share_links
FOR DELETE USING (auth.uid() = user_id);

-- Allow public read access by share_code for viewing shared demos
CREATE POLICY "Anyone can view by share_code" ON public.demo_share_links
FOR SELECT USING (true);

-- RLS policies for demo_share_views (public insert for tracking)
CREATE POLICY "Anyone can insert view events" ON public.demo_share_views
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their share link views" ON public.demo_share_views
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.demo_share_links sl
    WHERE sl.id = share_link_id AND sl.user_id = auth.uid()
  )
);

-- Create indexes for performance
CREATE INDEX idx_demo_share_links_share_code ON public.demo_share_links(share_code);
CREATE INDEX idx_demo_share_links_demo_id ON public.demo_share_links(demo_id);
CREATE INDEX idx_demo_share_views_share_link_id ON public.demo_share_views(share_link_id);

-- Add narration_url column to demo_videos for AI voice narration
ALTER TABLE public.demo_videos ADD COLUMN IF NOT EXISTS narration_url TEXT;

-- Revoke anon access, grant authenticated
REVOKE ALL ON public.demo_share_links FROM anon;
REVOKE ALL ON public.demo_share_views FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.demo_share_links TO authenticated;
GRANT SELECT, INSERT ON public.demo_share_views TO authenticated;
-- Allow anon to insert view events for tracking
GRANT INSERT ON public.demo_share_views TO anon;
GRANT SELECT ON public.demo_share_links TO anon;