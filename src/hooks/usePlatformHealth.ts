import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { isTestMode } from "@/lib/demo-mode";

export interface PlatformAccount {
  id: string;
  platform: string;
  handle: string | null;
  is_connected: boolean;
  health_status: 'healthy' | 'degraded' | 'disconnected' | null;
  last_health_check: string | null;
  created_at: string;
}

// Test mode platforms - dynamic per-user stores
// Removed all hardcoded store references
const TEST_MODE_PLATFORMS: PlatformAccount[] = [
  { id: 'shopify', platform: 'shopify', handle: null, is_connected: true, health_status: 'healthy', last_health_check: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 'tiktok', platform: 'tiktok', handle: null, is_connected: true, health_status: 'healthy', last_health_check: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 'instagram', platform: 'instagram', handle: null, is_connected: true, health_status: 'healthy', last_health_check: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 'facebook', platform: 'facebook', handle: null, is_connected: true, health_status: 'healthy', last_health_check: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 'youtube', platform: 'youtube', handle: null, is_connected: true, health_status: 'healthy', last_health_check: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 'pinterest', platform: 'pinterest', handle: null, is_connected: true, health_status: 'healthy', last_health_check: new Date().toISOString(), created_at: new Date().toISOString() },
];

export const usePlatformHealth = () => {
  const { user } = useAuth();
  const [platforms, setPlatforms] = useState<PlatformAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  const fetchPlatforms = useCallback(async () => {
    // Use test mode data if enabled
    if (isTestMode()) {
      setPlatforms(TEST_MODE_PLATFORMS);
      setIsLoading(false);
      return;
    }

    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('platform_accounts')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      if (data && data.length > 0) {
        setPlatforms(data as PlatformAccount[]);
      } else {
        // Initialize default platforms as disconnected
        const defaultPlatforms: PlatformAccount[] = [
          { id: 'shopify', platform: 'shopify', handle: null, is_connected: true, health_status: 'healthy', last_health_check: new Date().toISOString(), created_at: new Date().toISOString() },
          { id: 'tiktok', platform: 'tiktok', handle: null, is_connected: false, health_status: 'disconnected', last_health_check: null, created_at: new Date().toISOString() },
          { id: 'instagram', platform: 'instagram', handle: null, is_connected: false, health_status: 'disconnected', last_health_check: null, created_at: new Date().toISOString() },
          { id: 'facebook', platform: 'facebook', handle: null, is_connected: false, health_status: 'disconnected', last_health_check: null, created_at: new Date().toISOString() },
          { id: 'youtube', platform: 'youtube', handle: null, is_connected: false, health_status: 'disconnected', last_health_check: null, created_at: new Date().toISOString() },
          { id: 'pinterest', platform: 'pinterest', handle: null, is_connected: false, health_status: 'disconnected', last_health_check: null, created_at: new Date().toISOString() },
        ];
        setPlatforms(defaultPlatforms);
      }
    } catch (err) {
      console.error('Error fetching platforms:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const runHealthCheck = useCallback(async () => {
    if (!user) return;

    setIsChecking(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/platform-health-check`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${session.session.access_token}`,
          },
          body: JSON.stringify({ user_id: user.id }),
        }
      );

      if (response.ok) {
        await fetchPlatforms();
      }
    } catch (err) {
      console.error('Health check error:', err);
    } finally {
      setIsChecking(false);
    }
  }, [user, fetchPlatforms]);

  useEffect(() => {
    fetchPlatforms();
  }, [fetchPlatforms]);

  const healthyCount = platforms.filter(p => p.health_status === 'healthy').length;
  const connectedCount = platforms.filter(p => p.is_connected).length;
  const allHealthy = platforms.length > 0 && healthyCount === connectedCount;

  return {
    platforms,
    isLoading,
    isChecking,
    healthyCount,
    connectedCount,
    allHealthy,
    runHealthCheck,
    refreshPlatforms: fetchPlatforms,
  };
};
