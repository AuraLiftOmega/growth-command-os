import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface VideoJob {
  id: string;
  creative_id: string;
  user_id: string;
  status: 'queued' | 'processing' | 'rendering' | 'uploading' | 'completed' | 'failed';
  current_step: string | null;
  progress: number;
  error_message: string | null;
  provider: string | null;
  prompt_spec: Record<string, any> | null;
  shot_list: Record<string, any> | null;
  adherence_score: number | null;
  video_url: string | null;
  video_size_bytes: number | null;
  duration_seconds: number | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export function useVideoJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<VideoJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeJob, setActiveJob] = useState<VideoJob | null>(null);

  const fetchJobs = useCallback(async () => {
    if (!user) {
      setJobs([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('video_jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setJobs((data || []) as VideoJob[]);
    } catch (err) {
      console.error('Error fetching video jobs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Set up realtime subscription
  useEffect(() => {
    if (!user) return;

    fetchJobs();

    const channel = supabase
      .channel('video_jobs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'video_jobs',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setJobs(prev => [payload.new as VideoJob, ...prev]);
            setActiveJob(payload.new as VideoJob);
          } else if (payload.eventType === 'UPDATE') {
            setJobs(prev => prev.map(j => 
              j.id === payload.new.id ? payload.new as VideoJob : j
            ));
            if (activeJob?.id === payload.new.id) {
              setActiveJob(payload.new as VideoJob);
            }
          } else if (payload.eventType === 'DELETE') {
            setJobs(prev => prev.filter(j => j.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchJobs, activeJob?.id]);

  const createJob = useCallback(async (creativeId: string, promptSpec: Record<string, any>) => {
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('video_jobs')
      .insert({
        creative_id: creativeId,
        user_id: user.id,
        status: 'queued',
        current_step: 'Initializing',
        progress: 0,
        prompt_spec: promptSpec
      })
      .select()
      .single();

    if (error) throw error;
    setActiveJob(data as VideoJob);
    return data as VideoJob;
  }, [user]);

  const updateJob = useCallback(async (
    jobId: string, 
    updates: Partial<VideoJob>
  ) => {
    const { error } = await supabase
      .from('video_jobs')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', jobId);

    if (error) throw error;
  }, []);

  const logJobStep = useCallback(async (
    jobId: string,
    level: 'debug' | 'info' | 'warn' | 'error',
    step: string,
    message: string,
    data?: Record<string, any>
  ) => {
    if (!user) return;

    await supabase
      .from('video_generation_logs')
      .insert({
        job_id: jobId,
        user_id: user.id,
        level,
        step,
        message,
        data
      });
  }, [user]);

  return {
    jobs,
    isLoading,
    activeJob,
    setActiveJob,
    createJob,
    updateJob,
    logJobStep,
    refetch: fetchJobs
  };
}
