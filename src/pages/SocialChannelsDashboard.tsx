import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Store, Sparkles, TrendingUp, Users, Zap, Shield, ExternalLink,
  CheckCircle2, AlertCircle, Loader2, RefreshCw, Plus, Settings,
  ArrowRight, MessageCircle, Video, ShoppingCart, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUserShopifyConnections } from "@/hooks/useUserShopifyConnections";
import { ShopifyConnectionsPanel } from "@/components/settings/ShopifyConnectionsPanel";
import { AISuggestionBanner } from "@/components/dashboard/AISuggestionBanner";

interface PlatformConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  gradient: string;
  description: string;
  features: string[];
  oauthSupported: boolean;
  aiSuggestion: string;
}

const PLATFORMS: PlatformConfig[] = [
  {
    id: 'shopify',
    name: 'Shopify',
    icon: '🛍️',
    color: 'text-green-500',
    gradient: 'from-green-500/20 to-emerald-500/20',
    description: 'E-commerce store integration',
    features: ['Product sync', 'Order tracking', 'Inventory management'],
    oauthSupported: true,
    aiSuggestion: 'Connect your Shopify store to start generating AI video ads for your products!'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎵',
    color: 'text-pink-500',
    gradient: 'from-pink-500/20 to-cyan-500/20',
    description: 'Short-form video marketing',
    features: ['Auto-posting', 'Trending hashtags', 'Viral reach'],
    oauthSupported: true,
    aiSuggestion: 'TikTok drives 2x more engagement for product videos — connect now for viral reach!'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '📸',
    color: 'text-purple-500',
    gradient: 'from-purple-500/20 to-pink-500/20',
    description: 'Visual storytelling & reels',
    features: ['Reels posting', 'Story automation', 'Shopping tags'],
    oauthSupported: true,
    aiSuggestion: 'Perfect for visual brands — connect Instagram for Reels and Story automation!'
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    icon: '📌',
    color: 'text-red-500',
    gradient: 'from-red-500/20 to-orange-500/20',
    description: 'Discovery & inspiration',
    features: ['Pin scheduling', 'Rich pins', 'Shopping catalog'],
    oauthSupported: true,
    aiSuggestion: 'Pinterest users are 3x more likely to buy — great for product discovery!'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: '📺',
    color: 'text-red-600',
    gradient: 'from-red-600/20 to-red-500/20',
    description: 'Long-form video content',
    features: ['Shorts posting', 'SEO optimization', 'Monetization'],
    oauthSupported: true,
    aiSuggestion: 'YouTube Shorts are blowing up — repurpose your TikToks here!'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: '📘',
    color: 'text-blue-500',
    gradient: 'from-blue-500/20 to-blue-600/20',
    description: 'Social networking & ads',
    features: ['Page posting', 'Ad integration', 'Shops'],
    oauthSupported: true,
    aiSuggestion: 'Facebook has the largest audience 40+ — essential for broad reach!'
  },
  {
    id: 'x',
    name: 'X (Twitter)',
    icon: '𝕏',
    color: 'text-foreground',
    gradient: 'from-foreground/10 to-foreground/20',
    description: 'Real-time engagement',
    features: ['Thread automation', 'Trending topics', 'Video tweets'],
    oauthSupported: true,
    aiSuggestion: 'X is perfect for announcements and community building!'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '💼',
    color: 'text-blue-700',
    gradient: 'from-blue-700/20 to-blue-600/20',
    description: 'B2B professional network',
    features: ['Company posts', 'Thought leadership', 'B2B leads'],
    oauthSupported: true,
    aiSuggestion: 'Essential for B2B — share business updates and thought leadership!'
  },
  {
    id: 'threads',
    name: 'Threads',
    icon: '@',
    color: 'text-foreground',
    gradient: 'from-foreground/10 to-primary/20',
    description: 'Text-based conversations',
    features: ['Cross-posting', 'Community building', 'Real-time updates'],
    oauthSupported: false,
    aiSuggestion: 'New platform = early mover advantage — grow your audience here!'
  },
];

interface PlatformConnection {
  id: string;
  platform: string;
  is_connected: boolean;
  handle: string | null;
  followers_count?: number | null;
  posts_count?: number | null;
  last_sync_at?: string | null;
}

export default function SocialChannelsDashboard() {
  const { user } = useAuth();
  const { connections: shopifyConnections, hasConnections: hasShopify } = useUserShopifyConnections();
  const [platformConnections, setPlatformConnections] = useState<PlatformConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [testingPlatform, setTestingPlatform] = useState<string | null>(null);

  // Fetch platform connections
  useEffect(() => {
    const fetchConnections = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('platform_accounts')
          .select('id, platform, is_connected, handle')
          .eq('user_id', user.id);

        if (error) throw error;
        setPlatformConnections((data || []) as PlatformConnection[]);
      } catch (err) {
        console.error('Failed to fetch platform connections:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConnections();

    // Real-time subscription
    const channel = supabase
      .channel('platform-connections-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'platform_accounts' },
        () => fetchConnections()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const getConnectionStatus = (platformId: string): PlatformConnection | null => {
    return platformConnections.find(c => c.platform === platformId) || null;
  };

  const handleConnect = async (platform: PlatformConfig) => {
    if (!user) {
      toast.error('Please sign in to connect platforms');
      return;
    }

    setConnectingPlatform(platform.id);

    try {
      const { data, error } = await supabase.functions.invoke('platform-oauth', {
        body: { 
          platform: platform.id, 
          action: 'authorize',
          redirect_uri: `${window.location.origin}/oauth/callback`
        }
      });

      if (error) throw error;

      if (data?.authUrl) {
        // Store state for verification
        localStorage.setItem('oauth_state', data.state);
        localStorage.setItem('oauth_platform', platform.id);
        
        // Redirect to OAuth page (secure login on platform's page)
        window.location.href = data.authUrl;
        return;
      }

      // OAuth not configured
      toast.error(`${platform.name} OAuth not configured yet. Contact support.`);
    } catch (err) {
      console.error('Connection error:', err);
      toast.error(`Failed to connect ${platform.name}`);
    } finally {
      setConnectingPlatform(null);
    }
  };

  const handleDisconnect = async (platformId: string) => {
    try {
      const { error } = await supabase
        .from('platform_accounts')
        .update({ is_connected: false })
        .eq('platform', platformId)
        .eq('user_id', user?.id);

      if (error) throw error;
      toast.success('Platform disconnected');
    } catch (err) {
      toast.error('Failed to disconnect');
    }
  };

  const handleTestConnection = async (platformId: string) => {
    setTestingPlatform(platformId);
    try {
      const { data, error } = await supabase.functions.invoke('platform-health-check', {
        body: { platform: platformId }
      });

      if (error) throw error;
      
      if (data?.healthy) {
        toast.success(`${platformId} connection is healthy!`);
      } else {
        toast.warning(`${platformId} connection needs attention`);
      }
    } catch (err) {
      toast.error('Test failed - connection may need refresh');
    } finally {
      setTestingPlatform(null);
    }
  };

  const connectedCount = platformConnections.filter(c => c.is_connected).length + (hasShopify ? 1 : 0);
  const totalPlatforms = PLATFORMS.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-chart-2/20">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              Sales & Social Channels
            </h1>
            <p className="text-muted-foreground mt-1">
              1-click connect • Secure OAuth • Full automation
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-sm px-3 py-1">
              {connectedCount}/{totalPlatforms} Connected
            </Badge>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* AI Suggestion Banner */}
        {!hasShopify && (
          <AISuggestionBanner 
            message="Connect your Shopify store to unlock AI video ads, automated posting, and real-time sales tracking!"
            type="shopify"
            ctaLabel="Connect Shopify"
          />
        )}

        {hasShopify && connectedCount < 3 && (
          <AISuggestionBanner 
            message={`You're only using ${connectedCount} channel${connectedCount !== 1 ? 's' : ''}. Connect more platforms to maximize your reach and revenue!`}
            type="growth"
          />
        )}

        {/* Shopify Section - Prominently at top */}
        <Card className="border-green-500/30 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/20">
                <Store className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  Shopify Stores
                  {hasShopify && (
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      {shopifyConnections.length} Connected
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Your product catalog • Secure OAuth • 1-click connect
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ShopifyConnectionsPanel />
          </CardContent>
        </Card>

        {/* Social Platforms Grid */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Social Channels
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PLATFORMS.filter(p => p.id !== 'shopify').map((platform, index) => {
              const connection = getConnectionStatus(platform.id);
              const isConnected = connection?.is_connected;
              const isConnecting = connectingPlatform === platform.id;
              const isTesting = testingPlatform === platform.id;

              return (
                <motion.div
                  key={platform.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`relative overflow-hidden transition-all hover:shadow-lg ${
                    isConnected 
                      ? 'border-green-500/30 shadow-green-500/5' 
                      : 'border-border/50 hover:border-primary/30'
                  }`}>
                    {/* Gradient background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${platform.gradient} opacity-50`} />
                    
                    <CardContent className="relative p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{platform.icon}</span>
                          <div>
                            <h3 className="font-semibold">{platform.name}</h3>
                            <p className="text-xs text-muted-foreground">{platform.description}</p>
                          </div>
                        </div>
                        {isConnected ? (
                          <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Live
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-muted-foreground">
                            Not connected
                          </Badge>
                        )}
                      </div>

                      {/* Connection details or features */}
                      {isConnected && connection ? (
                        <div className="space-y-2 mb-4">
                          {connection.handle && (
                            <p className="text-sm font-medium">{connection.handle}</p>
                          )}
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            {connection.followers_count !== null && (
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {connection.followers_count.toLocaleString()} followers
                              </span>
                            )}
                            {connection.posts_count !== null && (
                              <span className="flex items-center gap-1">
                                <BarChart3 className="w-3 h-3" />
                                {connection.posts_count} posts
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="mb-4">
                          {/* AI suggestion */}
                          <div className="p-2 rounded-lg bg-primary/5 border border-primary/20">
                            <p className="text-xs text-primary flex items-start gap-1.5">
                              <Sparkles className="w-3 h-3 mt-0.5 flex-shrink-0" />
                              {platform.aiSuggestion}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex gap-2">
                        {isConnected ? (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => handleTestConnection(platform.id)}
                              disabled={isTesting}
                            >
                              {isTesting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <RefreshCw className="w-4 h-4 mr-1" />
                                  Test
                                </>
                              )}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDisconnect(platform.id)}
                            >
                              Disconnect
                            </Button>
                          </>
                        ) : (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                className={`flex-1 gap-2 ${
                                  platform.oauthSupported 
                                    ? 'bg-gradient-to-r from-primary to-chart-2 hover:opacity-90' 
                                    : ''
                                }`}
                                size="sm"
                                onClick={() => handleConnect(platform)}
                                disabled={isConnecting || !platform.oauthSupported}
                              >
                                {isConnecting ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Connecting...
                                  </>
                                ) : (
                                  <>
                                    <ExternalLink className="w-4 h-4" />
                                    Connect / Login
                                  </>
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="flex items-center gap-1">
                                <Shield className="w-3 h-3" />
                                Login securely on {platform.name}'s page
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>

                      {/* Features list */}
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <div className="flex flex-wrap gap-1">
                          {platform.features.map((feature, i) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        {connectedCount > 0 && (
          <Card className="bg-gradient-to-r from-primary/5 to-chart-2/5 border-primary/20">
            <CardContent className="py-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{connectedCount}</div>
                  <div className="text-sm text-muted-foreground">Channels Connected</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-500">
                    {shopifyConnections.reduce((sum, s) => sum + (s.products_count || 0), 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Products Synced</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-chart-2">
                    {platformConnections.reduce((sum, p) => sum + (p.posts_count || 0), 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Posts Published</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent-foreground">
                    <Zap className="w-8 h-8 mx-auto text-primary" />
                  </div>
                  <div className="text-sm text-muted-foreground">Automation Active</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
}
