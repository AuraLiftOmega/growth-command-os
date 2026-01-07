/**
 * PLATFORM CONNECTIONS HOOK
 * 
 * Manages platform OAuth connections, test mode, and health checks
 * Provides unified interface for all platform integrations
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { isTestMode, enableTestMode as setGlobalTestMode } from "@/lib/demo-mode";

export interface PlatformConnection {
  id: string;
  platform: string;
  handle: string | null;
  is_connected: boolean;
  health_status: 'healthy' | 'degraded' | 'disconnected' | null;
  is_test_mode: boolean;
  last_health_check: string | null;
  created_at: string;
  metrics?: {
    followers: number;
    engagement_rate: number;
    posts_today: number;
    revenue_attributed: number;
  };
}

// Test mode simulation data
const TEST_MODE_PLATFORMS: PlatformConnection[] = [
  { 
    id: 'test-tiktok', 
    platform: 'tiktok', 
    handle: '@aurabeauty', 
    is_connected: true, 
    health_status: 'healthy', 
    is_test_mode: true,
    last_health_check: new Date().toISOString(), 
    created_at: new Date().toISOString(),
    metrics: { followers: 125400, engagement_rate: 8.7, posts_today: 3, revenue_attributed: 4520 }
  },
  { 
    id: 'test-instagram', 
    platform: 'instagram', 
    handle: '@aura.essentials', 
    is_connected: true, 
    health_status: 'healthy', 
    is_test_mode: true,
    last_health_check: new Date().toISOString(), 
    created_at: new Date().toISOString(),
    metrics: { followers: 89200, engagement_rate: 5.2, posts_today: 2, revenue_attributed: 3180 }
  },
  { 
    id: 'test-facebook', 
    platform: 'facebook', 
    handle: 'Aura Lift Essentials', 
    is_connected: true, 
    health_status: 'healthy', 
    is_test_mode: true,
    last_health_check: new Date().toISOString(), 
    created_at: new Date().toISOString(),
    metrics: { followers: 45600, engagement_rate: 3.1, posts_today: 1, revenue_attributed: 1890 }
  },
  { 
    id: 'test-youtube', 
    platform: 'youtube', 
    handle: '@AuraBeautyOfficial', 
    is_connected: true, 
    health_status: 'healthy', 
    is_test_mode: true,
    last_health_check: new Date().toISOString(), 
    created_at: new Date().toISOString(),
    metrics: { followers: 32100, engagement_rate: 4.8, posts_today: 1, revenue_attributed: 2340 }
  },
  { 
    id: 'test-pinterest', 
    platform: 'pinterest', 
    handle: '@auraessentials', 
    is_connected: true, 
    health_status: 'healthy', 
    is_test_mode: true,
    last_health_check: new Date().toISOString(), 
    created_at: new Date().toISOString(),
    metrics: { followers: 18900, engagement_rate: 6.3, posts_today: 4, revenue_attributed: 980 }
  },
  { 
    id: 'test-amazon', 
    platform: 'amazon', 
    handle: 'Aura Seller', 
    is_connected: true, 
    health_status: 'healthy', 
    is_test_mode: true,
    last_health_check: new Date().toISOString(), 
    created_at: new Date().toISOString(),
    metrics: { followers: 0, engagement_rate: 0, posts_today: 0, revenue_attributed: 8450 }
  },
];

const DEFAULT_PLATFORMS: PlatformConnection[] = [
  { id: 'default-tiktok', platform: 'tiktok', handle: null, is_connected: false, health_status: 'disconnected', is_test_mode: false, last_health_check: null, created_at: new Date().toISOString() },
  { id: 'default-instagram', platform: 'instagram', handle: null, is_connected: false, health_status: 'disconnected', is_test_mode: false, last_health_check: null, created_at: new Date().toISOString() },
  { id: 'default-facebook', platform: 'facebook', handle: null, is_connected: false, health_status: 'disconnected', is_test_mode: false, last_health_check: null, created_at: new Date().toISOString() },
  { id: 'default-youtube', platform: 'youtube', handle: null, is_connected: false, health_status: 'disconnected', is_test_mode: false, last_health_check: null, created_at: new Date().toISOString() },
  { id: 'default-pinterest', platform: 'pinterest', handle: null, is_connected: false, health_status: 'disconnected', is_test_mode: false, last_health_check: null, created_at: new Date().toISOString() },
  { id: 'default-amazon', platform: 'amazon', handle: null, is_connected: false, health_status: 'disconnected', is_test_mode: false, last_health_check: null, created_at: new Date().toISOString() },
];

export const usePlatformConnections = () => {
  const { user } = useAuth();
  const [platforms, setPlatforms] = useState<PlatformConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  // Fetch platforms from database or use test mode
  const fetchPlatforms = useCallback(async () => {
    // Use test mode data if enabled
    if (isTestMode()) {
      setPlatforms(TEST_MODE_PLATFORMS);
      setIsLoading(false);
      return;
    }

    if (!user) {
      setPlatforms(DEFAULT_PLATFORMS);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('platform_accounts')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      if (data && data.length > 0) {
        // Merge with defaults for missing platforms
        const existingPlatforms = new Set(data.map(p => p.platform));
        const merged = [
          ...data.map(p => ({
            ...p,
            is_test_mode: false,
            metrics: undefined
          })),
          ...DEFAULT_PLATFORMS.filter(p => !existingPlatforms.has(p.platform))
        ] as PlatformConnection[];
        
        setPlatforms(merged);
      } else {
        setPlatforms(DEFAULT_PLATFORMS);
      }
    } catch (error) {
      console.error('Error fetching platforms:', error);
      setPlatforms(DEFAULT_PLATFORMS);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Connect a platform (real OAuth or test mode)
  const connectPlatform = useCallback(async (platformId: string, credentials?: any) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('platform_accounts')
        .upsert({
          user_id: user.id,
          platform: platformId,
          is_connected: true,
          health_status: 'healthy',
          credentials_encrypted: credentials ? JSON.stringify(credentials) : null,
          last_health_check: new Date().toISOString(),
        }, {
          onConflict: 'user_id,platform'
        });

      if (error) throw error;

      await fetchPlatforms();
    } catch (error) {
      console.error('Connect error:', error);
      throw error;
    }
  }, [user, fetchPlatforms]);

  // Enable test mode for a platform
  const enableTestMode = useCallback(async (platformId: string) => {
    // Update local state with test mode data
    setPlatforms(prev => prev.map(p => {
      if (p.platform === platformId) {
        const testData = TEST_MODE_PLATFORMS.find(t => t.platform === platformId);
        return testData || { ...p, is_connected: true, health_status: 'healthy', is_test_mode: true };
      }
      return p;
    }));

    // Also store in database with test mode flag
    if (user) {
      await supabase
        .from('platform_accounts')
        .upsert({
          user_id: user.id,
          platform: platformId,
          is_connected: true,
          health_status: 'healthy',
          handle: TEST_MODE_PLATFORMS.find(t => t.platform === platformId)?.handle || '@testuser',
          last_health_check: new Date().toISOString(),
        }, {
          onConflict: 'user_id,platform'
        });
    }
  }, [user]);

  // Disconnect a platform
  const disconnectPlatform = useCallback(async (platformId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('platform_accounts')
        .update({ is_connected: false, health_status: 'disconnected' })
        .eq('user_id', user.id)
        .eq('platform', platformId);

      await fetchPlatforms();
    } catch (error) {
      console.error('Disconnect error:', error);
      throw error;
    }
  }, [user, fetchPlatforms]);

  // Run health check on all platforms
  const runHealthCheck = useCallback(async () => {
    if (!user) return;
    setIsChecking(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Not authenticated');

      await supabase.functions.invoke('platform-health-check', {
        body: { user_id: user.id }
      });

      await fetchPlatforms();
    } catch (error) {
      console.error('Health check error:', error);
    } finally {
      setIsChecking(false);
    }
  }, [user, fetchPlatforms]);

  useEffect(() => {
    fetchPlatforms();
  }, [fetchPlatforms]);

  // Computed values
  const connectedCount = platforms.filter(p => p.is_connected).length;
  const healthyCount = platforms.filter(p => p.health_status === 'healthy').length;
  const testModeCount = platforms.filter(p => p.is_test_mode).length;
  const totalRevenue = platforms.reduce((sum, p) => sum + (p.metrics?.revenue_attributed || 0), 0);

  return {
    platforms,
    isLoading,
    isChecking,
    connectedCount,
    healthyCount,
    testModeCount,
    totalRevenue,
    connectPlatform,
    disconnectPlatform,
    enableTestMode,
    runHealthCheck,
    refreshPlatforms: fetchPlatforms,
  };
};
