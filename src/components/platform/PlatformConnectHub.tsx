/**
 * PLATFORM CONNECT HUB - One-Click Platform Connections
 * 
 * Easy OAuth connections for all channels with test mode fallback
 * Supports: TikTok, Instagram, Facebook, YouTube, Pinterest, Amazon
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wifi, 
  WifiOff, 
  CheckCircle2, 
  AlertTriangle,
  Loader2,
  ExternalLink,
  Zap,
  Play,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { usePlatformConnections } from "@/hooks/usePlatformConnections";
import { isTestMode } from "@/lib/demo-mode";

interface PlatformConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  gradient: string;
  oauthEndpoint?: string;
  features: string[];
  contentTypes: string[];
}

const PLATFORMS: PlatformConfig[] = [
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎵',
    color: 'from-pink-500 to-cyan-500',
    gradient: 'from-pink-500/20 to-cyan-500/20',
    oauthEndpoint: 'tiktok-oauth',
    features: ['Short Videos', 'Lives', 'DMs'],
    contentTypes: ['15s clips', '60s videos', 'Stories']
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '📸',
    color: 'from-purple-500 to-pink-500',
    gradient: 'from-purple-500/20 to-pink-500/20',
    oauthEndpoint: 'meta-oauth',
    features: ['Reels', 'Stories', 'Posts', 'DMs'],
    contentTypes: ['Reels', 'Carousels', 'Stories']
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: '📘',
    color: 'from-blue-500 to-blue-600',
    gradient: 'from-blue-500/20 to-blue-600/20',
    oauthEndpoint: 'meta-oauth',
    features: ['Posts', 'Reels', 'Marketplace', 'Ads'],
    contentTypes: ['Videos', 'Posts', 'Ads']
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: '📺',
    color: 'from-red-600 to-red-700',
    gradient: 'from-red-600/20 to-red-700/20',
    oauthEndpoint: 'youtube-oauth',
    features: ['Shorts', 'Videos', 'Community', 'Ads'],
    contentTypes: ['Shorts', 'Long-form', 'Ads']
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    icon: '📌',
    color: 'from-red-500 to-red-600',
    gradient: 'from-red-500/20 to-red-600/20',
    oauthEndpoint: 'pinterest-oauth',
    features: ['Pins', 'Boards', 'Idea Pins'],
    contentTypes: ['Pins', 'Video Pins', 'Idea Pins']
  },
  {
    id: 'amazon',
    name: 'Amazon',
    icon: '📦',
    color: 'from-orange-500 to-yellow-500',
    gradient: 'from-orange-500/20 to-yellow-500/20',
    features: ['Products', 'Ads', 'Reviews'],
    contentTypes: ['Product Listings', 'A+ Content', 'Ads']
  },
];

export const PlatformConnectHub = () => {
  const { user } = useAuth();
  const { 
    platforms, 
    isLoading, 
    connectPlatform, 
    disconnectPlatform,
    enableTestMode,
    runHealthCheck,
    isChecking 
  } = usePlatformConnections();
  
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [autonomousMode, setAutonomousMode] = useState(true);

  const handleConnect = async (platform: PlatformConfig) => {
    if (!user) {
      toast.error('Please sign in to connect platforms');
      return;
    }

    setConnectingPlatform(platform.id);

    try {
      // For platforms with OAuth, initiate the flow
      if (platform.oauthEndpoint) {
        // Store return URL for OAuth callback
        localStorage.setItem('oauth_return_url', window.location.href);
        localStorage.setItem('oauth_platform', platform.id);

        // Call edge function to get OAuth URL
        const { data, error } = await supabase.functions.invoke('platform-oauth', {
          body: { 
            platform: platform.id, 
            action: 'authorize',
            redirect_uri: `${window.location.origin}/oauth/callback`
          }
        });

        if (error) throw error;

        if (data?.authUrl) {
          // Redirect to OAuth provider
          window.location.href = data.authUrl;
          return;
        }
      }

      // Fallback: Enable test mode for the platform
      await enableTestMode(platform.id);
      toast.success(`${platform.name} connected in Test Mode! Real data simulation active.`);
      
    } catch (error: any) {
      console.error('Connection error:', error);
      
      // Auto-enable test mode on failure
      await enableTestMode(platform.id);
      toast.info(`${platform.name} connected in Test Mode (OAuth pending)`);
    } finally {
      setConnectingPlatform(null);
    }
  };

  const handleDisconnect = async (platformId: string) => {
    try {
      await disconnectPlatform(platformId);
      toast.success('Platform disconnected');
    } catch (error) {
      toast.error('Failed to disconnect');
    }
  };

  const getPlatformStatus = (platformId: string) => {
    const platform = platforms.find(p => p.platform === platformId);
    return {
      isConnected: platform?.is_connected ?? false,
      healthStatus: platform?.health_status ?? 'disconnected',
      handle: platform?.handle,
      isTestMode: platform?.is_test_mode ?? false
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const connectedCount = platforms.filter(p => p.is_connected).length;
  const testModeActive = isTestMode();

  return (
    <div className="space-y-6">
      {/* Header with Autonomous Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-chart-2/20">
            <Wifi className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold">Platform Hub</h2>
            <p className="text-sm text-muted-foreground">
              {connectedCount}/{PLATFORMS.length} connected • 
              {testModeActive && <Badge variant="outline" className="ml-2 text-xs">Test Mode</Badge>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-warning" />
            <span className="text-sm font-medium">Autonomous</span>
            <Switch 
              checked={autonomousMode} 
              onCheckedChange={setAutonomousMode}
            />
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={runHealthCheck}
            disabled={isChecking}
          >
            {isChecking ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            Health Check
          </Button>
        </div>
      </div>

      {/* Platform Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {PLATFORMS.map((platform, index) => {
            const status = getPlatformStatus(platform.id);
            const isConnecting = connectingPlatform === platform.id;

            return (
              <motion.div
                key={platform.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`
                  relative p-5 rounded-2xl border transition-all duration-300
                  bg-gradient-to-br ${platform.gradient}
                  ${status.isConnected 
                    ? 'border-success/50 shadow-lg shadow-success/10' 
                    : 'border-border/50 hover:border-primary/50'
                  }
                `}
              >
                {/* Status Indicator */}
                <div className="absolute top-3 right-3">
                  {status.isConnected ? (
                    <div className="flex items-center gap-1">
                      {status.isTestMode && (
                        <Badge variant="secondary" className="text-[10px] px-1.5">TEST</Badge>
                      )}
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    </div>
                  ) : (
                    <WifiOff className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>

                {/* Platform Info */}
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-3xl">{platform.icon}</span>
                  <div>
                    <h3 className="font-semibold">{platform.name}</h3>
                    {status.handle && (
                      <p className="text-xs text-muted-foreground">{status.handle}</p>
                    )}
                    {status.isConnected && (
                      <div className="flex items-center gap-1 mt-1">
                        <div className={`w-2 h-2 rounded-full ${
                          status.healthStatus === 'healthy' ? 'bg-success animate-pulse' :
                          status.healthStatus === 'degraded' ? 'bg-warning' : 'bg-muted'
                        }`} />
                        <span className="text-[10px] text-muted-foreground capitalize">
                          {status.healthStatus}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {platform.features.slice(0, 3).map(feature => (
                    <Badge 
                      key={feature} 
                      variant="secondary" 
                      className="text-[10px] px-1.5 py-0"
                    >
                      {feature}
                    </Badge>
                  ))}
                </div>

                {/* Action Button */}
                <div className="flex gap-2">
                  {status.isConnected ? (
                    <>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex-1 h-8 text-xs"
                        onClick={() => handleDisconnect(platform.id)}
                      >
                        <Settings className="w-3 h-3 mr-1" />
                        Manage
                      </Button>
                      {autonomousMode && (
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="h-8 text-xs px-3"
                        >
                          <Zap className="w-3 h-3" />
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button
                      onClick={() => handleConnect(platform)}
                      disabled={isConnecting}
                      className={`
                        w-full h-9 text-sm font-medium
                        bg-gradient-to-r ${platform.color}
                        hover:opacity-90 transition-opacity
                      `}
                    >
                      {isConnecting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <ExternalLink className="w-4 h-4 mr-2" />
                      )}
                      Connect {platform.name}
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Autonomous Selling Status */}
      {autonomousMode && connectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-gradient-to-r from-success/10 to-primary/10 border border-success/30"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/20">
              <Zap className="w-5 h-5 text-success" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm">Autonomous Selling Active</h4>
              <p className="text-xs text-muted-foreground">
                AI agents generating content, A/B testing, and publishing to {connectedCount} channels every hour
              </p>
            </div>
            <Badge variant="outline" className="text-success border-success/50">
              LIVE
            </Badge>
          </div>
        </motion.div>
      )}
    </div>
  );
};
