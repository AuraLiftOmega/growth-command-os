-- Create storage bucket for demo videos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('demo-videos', 'demo-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for demo thumbnails
INSERT INTO storage.buckets (id, name, public)
VALUES ('demo-thumbnails', 'demo-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for creatives
INSERT INTO storage.buckets (id, name, public)
VALUES ('creatives', 'creatives', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for demo-videos bucket
CREATE POLICY "Public can view demo videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'demo-videos');

CREATE POLICY "Authenticated users can upload demo videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'demo-videos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own demo videos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'demo-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own demo videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'demo-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for demo-thumbnails bucket
CREATE POLICY "Public can view demo thumbnails"
ON storage.objects FOR SELECT
USING (bucket_id = 'demo-thumbnails');

CREATE POLICY "Authenticated users can upload demo thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'demo-thumbnails' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own demo thumbnails"
ON storage.objects FOR UPDATE
USING (bucket_id = 'demo-thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own demo thumbnails"
ON storage.objects FOR DELETE
USING (bucket_id = 'demo-thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for creatives bucket
CREATE POLICY "Public can view creatives"
ON storage.objects FOR SELECT
USING (bucket_id = 'creatives');

CREATE POLICY "Authenticated users can upload creatives"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'creatives' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own creatives"
ON storage.objects FOR UPDATE
USING (bucket_id = 'creatives' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own creatives"
ON storage.objects FOR DELETE
USING (bucket_id = 'creatives' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add render_status and render_progress columns to demo_videos for tracking
ALTER TABLE public.demo_videos 
ADD COLUMN IF NOT EXISTS render_progress INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS render_error TEXT,
ADD COLUMN IF NOT EXISTS frames_generated INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_frames INTEGER DEFAULT 0;

-- Add video generation tracking to creatives
ALTER TABLE public.creatives
ADD COLUMN IF NOT EXISTS render_status TEXT DEFAULT 'pending' CHECK (render_status IN ('pending', 'rendering', 'complete', 'failed')),
ADD COLUMN IF NOT EXISTS render_progress INTEGER DEFAULT 0;