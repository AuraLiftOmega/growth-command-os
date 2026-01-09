/**
 * SOCIAL CONNECTIONS HOOK
 * 
 * Manages OAuth connections to social platforms
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface SocialConnection {
  id: string;
  platform: string;
  platform_user_id: string | null;
  handle: string | null;
  profile_url: string | null;
  profile_image_url: string | null;
  followers_count: number;
  is_connected: boolean;
  is_test_mode: boolean;
  health_status: string;
  last_sync_at: string | null;
  metadata: Record<string, unknown>;
}

export function useSocialConnections() {
  const { user } = useAuth();
  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConnections = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('social_connections')
        .select('*')
        .eq('user_id', user.id);

      if (fetchError) throw fetchError;
      setConnections((data as SocialConnection[]) || []);
    } catch (err) {
      console.error('Error fetching connections:', err);
      setError('Failed to load connections');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('social_connections_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'social_connections',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchConnections();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchConnections]);

  const connectPlatform = useCallback(async (platform: string, testMode: boolean = false) => {
    if (!user) return;

    try {
      // Check if connection already exists
      const existing = connections.find(c => c.platform === platform);
      
      if (existing) {
        // Update existing connection
        const { error: updateError } = await supabase
          .from('social_connections')
          .update({
            is_connected: true,
            is_test_mode: testMode,
            health_status: 'healthy',
            last_sync_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (updateError) throw updateError;
      } else {
        // Create new connection
        const { error: insertError } = await supabase
          .from('social_connections')
          .insert({
            user_id: user.id,
            platform,
            is_connected: true,
            is_test_mode: testMode,
            health_status: 'healthy',
            handle: testMode ? `@test_${platform}` : null,
            followers_count: testMode ? Math.floor(Math.random() * 50000) : 0,
            last_sync_at: new Date().toISOString()
          });

        if (insertError) throw insertError;
      }

      toast.success(`✅ ${platform} ${testMode ? '(test mode)' : ''} connected!`);
      fetchConnections();
    } catch (err) {
      console.error('Connect error:', err);
      toast.error(`Failed to connect ${platform}`);
    }
  }, [user, connections, fetchConnections]);

  const disconnectPlatform = useCallback(async (platform: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('social_connections')
        .update({
          is_connected: false,
          health_status: 'disconnected'
        })
        .eq('user_id', user.id)
        .eq('platform', platform);

      if (error) throw error;

      toast.success(`${platform} disconnected`);
      fetchConnections();
    } catch (err) {
      console.error('Disconnect error:', err);
      toast.error('Failed to disconnect');
    }
  }, [user, fetchConnections]);

  const getConnection = useCallback((platform: string) => {
    return connections.find(c => c.platform === platform);
  }, [connections]);

  const isConnected = useCallback((platform: string) => {
    const conn = getConnection(platform);
    return conn?.is_connected || false;
  }, [getConnection]);

  return {
    connections,
    isLoading,
    error,
    fetchConnections,
    connectPlatform,
    disconnectPlatform,
    getConnection,
    isConnected,
    connectedCount: connections.filter(c => c.is_connected).length
  };
}