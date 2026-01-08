import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

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

// NO TEST MODE DATA - Production only

export const useRealCreatives = () => {
  const { user } = useAuth();
  const [creatives, setCreatives] = useState<RealCreative[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasRealData, setHasRealData] = useState(false);

  const fetchCreatives = useCallback(async () => {
    // NO TEST MODE - Only real data from database
    if (!user) {
      setCreatives([]);
      setHasRealData(false);
      setIsLoading(false);
      return;
    }

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
      setCreatives([]);
      setHasRealData(false);
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
