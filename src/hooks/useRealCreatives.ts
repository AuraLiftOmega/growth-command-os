import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { isTestMode } from "@/lib/demo-mode";

export interface RealCreative {
  id: string;
  user_id: string;
  name: string;
  platform: string;
  hook: string | null;
  script: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  style: string | null;
  emotional_trigger: string | null;
  quality_score: number | null;
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  revenue: number;
  spend: number;
  roas: number;
  status: string;
  shopify_product_id: string | null;
  created_at: string;
  updated_at: string;
}

// Test mode demo creatives
const TEST_MODE_CREATIVES: RealCreative[] = [
  { id: 'c1', user_id: 'demo', name: 'Aura Lift - Transform Hook', platform: 'tiktok', hook: "Watch your skin transform in 7 days", script: "Full transformation script", video_url: null, thumbnail_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400', style: 'ugc', emotional_trigger: 'transformation', quality_score: 92, impressions: 487291, clicks: 19421, ctr: 3.98, conversions: 1847, revenue: 164383, spend: 34212, roas: 4.8, status: 'published', shopify_product_id: 'demo-1', created_at: new Date(Date.now() - 86400000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'c2', user_id: 'demo', name: 'Radiance - Before/After', platform: 'instagram_reels', hook: "The secret dermatologists don't want you to know", script: "Before/after reveal script", video_url: null, thumbnail_url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400', style: 'cinematic', emotional_trigger: 'curiosity', quality_score: 78, impressions: 324891, clicks: 12891, ctr: 3.97, conversions: 987, revenue: 64155, spend: 18234, roas: 3.5, status: 'published', shopify_product_id: 'demo-2', created_at: new Date(Date.now() - 172800000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'c3', user_id: 'demo', name: 'Youth Renewal - Testimonial', platform: 'youtube_shorts', hook: "I tried this for 30 days...", script: "Customer testimonial script", video_url: null, thumbnail_url: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400', style: 'testimonial', emotional_trigger: 'social_proof', quality_score: 85, impressions: 189234, clicks: 7421, ctr: 3.92, conversions: 534, revenue: 41652, spend: 11891, roas: 3.5, status: 'optimizing', shopify_product_id: 'demo-3', created_at: new Date(Date.now() - 259200000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'c4', user_id: 'demo', name: 'Aura Lift - Problem/Solution', platform: 'facebook', hook: "Tired of looking tired?", script: "Problem solution script", video_url: null, thumbnail_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400', style: 'educational', emotional_trigger: 'pain_point', quality_score: 71, impressions: 234891, clicks: 8921, ctr: 3.80, conversions: 623, revenue: 55447, spend: 15234, roas: 3.6, status: 'testing', shopify_product_id: 'demo-1', created_at: new Date(Date.now() - 345600000).toISOString(), updated_at: new Date().toISOString() },
];

export const useRealCreatives = () => {
  const { user } = useAuth();
  const [creatives, setCreatives] = useState<RealCreative[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasRealData, setHasRealData] = useState(false);

  const fetchCreatives = useCallback(async () => {
    // Use test mode data if enabled
    if (isTestMode()) {
      setCreatives(TEST_MODE_CREATIVES);
      setHasRealData(true);
      setIsLoading(false);
      return;
    }

    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('creatives')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setCreatives(data.map(c => ({
          id: c.id,
          user_id: c.user_id,
          name: c.name,
          platform: c.platform,
          hook: c.hook,
          script: c.script,
          video_url: c.video_url,
          thumbnail_url: c.thumbnail_url,
          style: c.style,
          emotional_trigger: c.emotional_trigger,
          quality_score: c.quality_score,
          impressions: c.impressions || 0,
          clicks: c.clicks || 0,
          ctr: c.ctr || 0,
          conversions: c.conversions || 0,
          revenue: c.revenue || 0,
          spend: c.spend || 0,
          roas: c.roas || 0,
          status: c.status || 'draft',
          shopify_product_id: c.shopify_product_id,
          created_at: c.created_at,
          updated_at: c.updated_at,
        })));
        setHasRealData(true);
      } else {
        setCreatives([]);
        setHasRealData(false);
      }
    } catch (err) {
      console.error('Error fetching creatives:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const generateCreative = useCallback(async (
    productId: string,
    platform: string,
    stylePreset: string,
    userPrompt?: string
  ) => {
    if (!user) throw new Error('Not authenticated');

    const { data: session } = await supabase.auth.getSession();
    if (!session.session) throw new Error('No session');

    // Create automation job
    const { data: job, error: jobError } = await supabase
      .from('automation_jobs')
      .insert({
        user_id: user.id,
        job_type: 'GENERATE_CREATIVE',
        status: 'pending',
        input_data: {
          shopify_product_id: productId,
          platform,
          style_preset: stylePreset,
          user_prompt: userPrompt,
        },
      })
      .select()
      .single();

    if (jobError) throw jobError;

    toast.success('Video generation queued');
    
    // Trigger the job processor
    try {
      await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/run-automation-jobs`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${session.session.access_token}`,
          },
          body: JSON.stringify({ job_id: job.id }),
        }
      );
    } catch (err) {
      console.error('Failed to trigger job processor:', err);
    }

    return job.id;
  }, [user]);

  const updateCreativeStatus = useCallback(async (
    creativeId: string,
    status: string,
    killReason?: string
  ) => {
    if (!user) return;

    const updates: Record<string, unknown> = { status };
    if (status === 'killed') {
      updates.killed_at = new Date().toISOString();
      updates.kill_reason = killReason || 'Manually killed';
    }

    const { error } = await supabase
      .from('creatives')
      .update(updates)
      .eq('id', creativeId)
      .eq('user_id', user.id);

    if (error) throw error;

    setCreatives(prev => prev.map(c => 
      c.id === creativeId ? { ...c, status } : c
    ));

    toast.success(`Creative ${status}`);
  }, [user]);

  useEffect(() => {
    fetchCreatives();

    // Realtime subscription
    if (user) {
      const channel = supabase
        .channel('creatives-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'creatives',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchCreatives();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [fetchCreatives, user]);

  return {
    creatives,
    isLoading,
    hasRealData,
    generateCreative,
    updateCreativeStatus,
    refreshCreatives: fetchCreatives,
  };
};
