/**
 * SOCIAL TOKENS HOOK
 * 
 * Manages real OAuth tokens stored in social_tokens table
 * Handles token refresh, connection status, and real API integration
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface SocialToken {
  id: string;
  user_id: string;
  channel: string;
  is_connected: boolean;
  account_id: string | null;
  account_name: string | null;
  account_avatar: string | null;
  expires_at: string | null;
  scope: string | null;
  metadata: Record<string, unknown>;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
}

// Channel-specific language/tone configurations for Omega AI
export const CHANNEL_TONES = {
  tiktok: {
    tone: 'punchy',
    style: 'Gen-Z casual, trendy, hook-driven',
    maxLength: 150,
    hashtagCount: 5,
    examples: ['POV:', 'Wait for it...', 'The way this...', 'NOT the...']
  },
  instagram: {
    tone: 'polished',
    style: 'Aesthetic, aspirational, story-driven',
    maxLength: 2200,
    hashtagCount: 15,
    examples: ['✨', 'Your glow-up starts here', 'Living for this']
  },
  twitter: {
    tone: 'concise',
    style: 'Sharp, witty, engagement-focused',
    maxLength: 280,
    hashtagCount: 2,
    examples: ['this hits different', 'if u know u know', 'no cap']
  },
  youtube: {
    tone: 'engaging',
    style: 'Informative, clickable, detailed',
    maxLength: 5000,
    hashtagCount: 8,
    examples: ['FINALLY!', 'The Truth About...', 'I Tried...']
  },
  linkedin: {
    tone: 'professional',
    style: 'Business-casual, thought-leadership, value-driven',
    maxLength: 3000,
    hashtagCount: 5,
    examples: ["Here's what I learned...", 'Unpopular opinion:', 'After 10 years...']
  },
  pinterest: {
    tone: 'inspirational',
    style: 'Searchable, aspirational, solution-focused',
    maxLength: 500,
    hashtagCount: 10,
    examples: ['Ultimate Guide to', 'Best...for 2026', 'Transform your...']
  },
  facebook: {
    tone: 'friendly',
    style: 'Conversational, community-focused, shareable',
    maxLength: 2000,
    hashtagCount: 3,
    examples: ['Have you ever...', 'Tag a friend who...', 'Comment below!']
  }
} as const;

export function useSocialTokens() {
  const { user } = useAuth();
  const [tokens, setTokens] = useState<SocialToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTokens = useCallback(async () => {
    if (!user) {
      setTokens([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('social_tokens')
        .select('*')
        .eq('user_id', user.id);

      if (fetchError) throw fetchError;
      setTokens((data as SocialToken[]) || []);
    } catch (err) {
      console.error('Error fetching social tokens:', err);
      setError('Failed to load social tokens');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('social_tokens_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'social_tokens',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchTokens();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchTokens]);

  // Initiate OAuth flow for a channel
  const initiateOAuth = useCallback(async (channel: string) => {
    if (!user) {
      toast.error('Please sign in first');
      return;
    }

    // Store return URL for callback
    localStorage.setItem('oauth_return_url', window.location.href);
    localStorage.setItem('oauth_channel', channel);

    try {
      const { data, error } = await supabase.functions.invoke('social-oauth', {
        body: {
          channel,
          action: 'authorize',
          redirect_uri: `${window.location.origin}/oauth/callback`,
        },
      });

      if (error) throw error;

      if (data?.authUrl) {
        window.location.href = data.authUrl;
        return true;
      }

      if (data?.requires_credentials) {
        toast.error(data.error || `Please configure ${channel} API credentials`);
        return false;
      }

      throw new Error('No auth URL returned');
    } catch (err: any) {
      console.error('OAuth initiation failed:', err);
      toast.error(`Failed to connect ${channel}: ${err.message}`);
      return false;
    }
  }, [user]);

  // Check if tokens need refresh
  const checkTokenExpiry = useCallback(async (channel: string) => {
    const token = tokens.find(t => t.channel === channel);
    if (!token?.expires_at) return true;

    const expiresAt = new Date(token.expires_at);
    const now = new Date();
    const fiveMinutes = 5 * 60 * 1000;

    // If expiring within 5 minutes, refresh
    if (expiresAt.getTime() - now.getTime() < fiveMinutes) {
      try {
        const { error } = await supabase.functions.invoke('social-oauth', {
          body: { channel, action: 'refresh' },
        });
        if (error) throw error;
        await fetchTokens();
        return true;
      } catch (err) {
        console.error('Token refresh failed:', err);
        return false;
      }
    }

    return true;
  }, [tokens, fetchTokens]);

  // Disconnect a channel
  const disconnect = useCallback(async (channel: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('social_tokens')
        .update({ is_connected: false })
        .eq('user_id', user.id)
        .eq('channel', channel);

      if (error) throw error;
      toast.success(`${channel} disconnected`);
      fetchTokens();
    } catch (err) {
      console.error('Disconnect error:', err);
      toast.error('Failed to disconnect');
    }
  }, [user, fetchTokens]);

  // Get channel stats via API
  const getChannelStats = useCallback(async (channel: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.functions.invoke('social-stats', {
        body: { channel },
      });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Failed to fetch channel stats:', err);
      return null;
    }
  }, [user]);

  // Get token for a specific channel
  const getToken = useCallback((channel: string) => {
    return tokens.find(t => t.channel === channel);
  }, [tokens]);

  // Check if channel is connected
  const isConnected = useCallback((channel: string) => {
    const token = getToken(channel);
    return token?.is_connected || false;
  }, [getToken]);

  return {
    tokens,
    isLoading,
    error,
    fetchTokens,
    initiateOAuth,
    checkTokenExpiry,
    disconnect,
    getChannelStats,
    getToken,
    isConnected,
    connectedChannels: tokens.filter(t => t.is_connected),
    connectedCount: tokens.filter(t => t.is_connected).length,
    CHANNEL_TONES
  };
}
