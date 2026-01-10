/**
 * MULTI-CHANNEL HUB - PER-USER DYNAMIC
 * 
 * One-click OAuth connections for all major platforms:
 * - Shopify, TikTok Shop, Instagram, Facebook, Pinterest
 * - YouTube, LinkedIn, X, Threads
 * 
 * NO HARDCODED STORES - All data fetched per-user from database
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plug,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  RefreshCw,
  Zap,
  TrendingUp,
  DollarSign,
  Settings,
  Sparkles,
  Plus
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserShopifyConnections } from '@/hooks/useUserShopifyConnections';
import { useNavigate } from 'react-router-dom';

interface Channel {
  id: string;
  name: string;
  icon: string;
  color: string;
  status: 'connected' | 'pending' | 'disconnected';
  handle?: string | null;
  revenue?: number;
  orders?: number;
  syncEnabled?: boolean;
  lastSync?: string | null;
  apiType: 'oauth' | 'api_key' | 'webhook';
  aiSuggestion: string;
}

// PLATFORM TEMPLATES - Per-user, no hardcoded data
const CHANNEL_TEMPLATES: Omit<Channel, 'status' | 'handle' | 'revenue' | 'orders' | 'lastSync' | 'syncEnabled'>[] = [
  { id: 'shopify', name: 'Shopify', icon: '🛍️', color: 'from-green-500/20 to-green-600/20', apiType: 'oauth', aiSuggestion: 'Connect your store to start generating AI video ads!' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', color: 'from-pink-500/20 to-cyan-500/20', apiType: 'oauth', aiSuggestion: 'TikTok drives 2x engagement — perfect for viral product videos!' },
  { id: 'instagram', name: 'Instagram', icon: '📸', color: 'from-purple-500/20 to-pink-500/20', apiType: 'oauth', aiSuggestion: 'Visual storytelling for beauty & lifestyle brands!' },
  { id: 'pinterest', name: 'Pinterest', icon: '📌', color: 'from-red-500/20 to-rose-500/20', apiType: 'oauth', aiSuggestion: 'Pinterest users are 3x more likely to buy!' },
  { id: 'youtube', name: 'YouTube', icon: '📺', color: 'from-red-600/20 to-red-700/20', apiType: 'oauth', aiSuggestion: 'Repurpose TikToks as YouTube Shorts!' },
  { id: 'facebook', name: 'Facebook', icon: '📘', color: 'from-blue-500/20 to-blue-600/20', apiType: 'oauth', aiSuggestion: 'Largest audience 40+ — essential for broad reach!' },
  { id: 'x', name: 'X (Twitter)', icon: '𝕏', color: 'from-foreground/10 to-foreground/20', apiType: 'oauth', aiSuggestion: 'Perfect for announcements and community building!' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: 'from-blue-700/20 to-blue-600/20', apiType: 'oauth', aiSuggestion: 'Essential for B2B thought leadership!' },
  { id: 'threads', name: 'Threads', icon: '@', color: 'from-foreground/10 to-primary/20', apiType: 'oauth', aiSuggestion: 'New platform = early mover advantage!' },
];

export const MultiChannelHub = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { connections: shopifyConnections, hasConnections: hasShopify } = useUserShopifyConnections();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectingChannel, setConnectingChannel] = useState<string | null>(null);
  const [syncingChannel, setSyncingChannel] = useState<string | null>(null);

  // Fetch real platform connections per-user
  useEffect(() => {
    const fetchChannels = async () => {
      if (!user) {
        // Create empty templates for unauthenticated users
        const emptyChannels = CHANNEL_TEMPLATES.map(t => ({
          ...t,
          status: 'disconnected' as const,
          handle: null,
          revenue: 0,
          orders: 0,
          syncEnabled: false,
          lastSync: null
        }));
        setChannels(emptyChannels);
        setIsLoading(false);
        return;
      }

      try {
        // Fetch platform accounts for this user
        const { data: platformData, error } = await supabase
          .from('platform_accounts')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;

        // Build channels list from templates + user data
        const userChannels = CHANNEL_TEMPLATES.map(template => {
          const userConnection = platformData?.find(p => p.platform === template.id);
          
          // Special handling for Shopify - use useUserShopifyConnections
          if (template.id === 'shopify' && hasShopify && shopifyConnections.length > 0) {
            const shopifyConn = shopifyConnections[0];
            return {
              ...template,
              status: 'connected' as const,
              handle: shopifyConn.shop_domain,
              revenue: shopifyConn.total_revenue || 0,
              orders: shopifyConn.orders_count || 0,
              syncEnabled: true,
              lastSync: shopifyConn.last_sync_at
            };
          }

          if (userConnection) {
            return {
              ...template,
              status: userConnection.is_connected ? 'connected' as const : 'disconnected' as const,
              handle: userConnection.handle,
              revenue: 0,
              orders: 0,
              syncEnabled: true,
              lastSync: userConnection.last_health_check
            };
          }

          return {
            ...template,
            status: 'disconnected' as const,
            handle: null,
            revenue: 0,
            orders: 0,
            syncEnabled: false,
            lastSync: null
          };
        });

        setChannels(userChannels);
      } catch (err) {
        console.error('Failed to fetch channels:', err);
        // Fallback to empty templates
        const emptyChannels = CHANNEL_TEMPLATES.map(t => ({
          ...t,
          status: 'disconnected' as const,
          handle: null,
          revenue: 0,
          orders: 0,
          syncEnabled: false,
          lastSync: null
        }));
        setChannels(emptyChannels);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChannels();

    // Real-time subscription
    if (user) {
      const channel = supabase
        .channel('multi-channel-hub')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'platform_accounts' }, () => fetchChannels())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'user_shopify_connections' }, () => fetchChannels())
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [user, hasShopify, shopifyConnections]);

  const handleConnect = async (channelId: string) => {
    if (!user) {
      toast.error('Please sign in to connect platforms');
      return;
    }

    // Shopify uses different OAuth flow
    if (channelId === 'shopify') {
      navigate('/dashboard/settings?tab=shopify');
      return;
    }

    setConnectingChannel(channelId);
    try {
      const { data, error } = await supabase.functions.invoke('platform-oauth', {
        body: {
          platform: channelId,
          action: 'authorize',
          redirect_uri: `${window.location.origin}/oauth/callback`
        }
      });

      if (error) throw error;

      if (data?.authUrl) {
        localStorage.setItem('oauth_state', data.state);
        localStorage.setItem('oauth_platform', channelId);
        window.location.href = data.authUrl;
        return;
      }

      toast.error(`${channelId} OAuth not configured yet`);
    } catch (err) {
      console.error('Connection error:', err);
      toast.error(`Failed to connect ${channelId}`);
    } finally {
      setConnectingChannel(null);
    }
  };

  const handleSync = async (channelId: string) => {
    setSyncingChannel(channelId);
    try {
      await supabase.functions.invoke('platform-health-check', {
        body: { platform: channelId }
      });
      toast.success(`${channelId} synced successfully`);
    } catch (err) {
      toast.error('Sync failed');
    } finally {
      setSyncingChannel(null);
    }
  };

  const connectedCount = channels.filter(c => c.status === 'connected').length;
  const totalRevenue = channels.reduce((sum, c) => sum + (c.revenue || 0), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-chart-2/20">
              <Plug className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                Multi-Channel Hub
                <Badge variant="outline" className="text-xs">
                  {connectedCount}/{channels.length} Connected
                </Badge>
              </h2>
              <p className="text-sm text-muted-foreground">
                1-click OAuth • Secure • Per-user connections
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {totalRevenue > 0 && (
              <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
                <DollarSign className="w-3 h-3 mr-1" />
                ${totalRevenue.toLocaleString()} revenue
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/social-channels')}>
              <Settings className="w-4 h-4 mr-2" />
              Manage All
            </Button>
          </div>
        </div>

        {/* AI Suggestion Banner */}
        {connectedCount === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-chart-2/10 border border-primary/20"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <p className="text-sm">
                <strong>AI Tip:</strong> Connect your Shopify store first to unlock AI video ads, automated posting, and real-time analytics!
              </p>
              <Button size="sm" className="ml-auto" onClick={() => handleConnect('shopify')}>
                <Plus className="w-4 h-4 mr-1" />
                Connect Shopify
              </Button>
            </div>
          </motion.div>
        )}

        {/* Channels Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <AnimatePresence>
            {channels.map((channel, index) => (
              <motion.div
                key={channel.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card className={`relative overflow-hidden transition-all hover:shadow-lg ${
                  channel.status === 'connected'
                    ? 'border-green-500/30 shadow-green-500/5'
                    : 'border-border/50 hover:border-primary/30'
                }`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${channel.color} opacity-50`} />
                  
                  <div className="relative p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{channel.icon}</span>
                        <div>
                          <p className="font-semibold text-sm">{channel.name}</p>
                          {channel.handle && (
                            <p className="text-[10px] text-muted-foreground truncate max-w-[100px]">
                              {channel.handle}
                            </p>
                          )}
                        </div>
                      </div>
                      {channel.status === 'connected' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>

                    {channel.status === 'connected' ? (
                      <div className="space-y-2">
                        {(channel.revenue || 0) > 0 && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Revenue</span>
                            <span className="font-medium text-green-600">${channel.revenue?.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 h-7 text-xs"
                            onClick={() => handleSync(channel.id)}
                            disabled={syncingChannel === channel.id}
                          >
                            {syncingChannel === channel.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <RefreshCw className="w-3 h-3" />
                            )}
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 text-xs">
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="text-[10px] text-muted-foreground line-clamp-2">
                              {channel.aiSuggestion}
                            </p>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-[200px]">{channel.aiSuggestion}</p>
                          </TooltipContent>
                        </Tooltip>
                        <Button
                          size="sm"
                          className="w-full h-7 text-xs bg-gradient-to-r from-primary to-chart-2 hover:from-primary/90 hover:to-chart-2/90"
                          onClick={() => handleConnect(channel.id)}
                          disabled={connectingChannel === channel.id}
                        >
                          {connectingChannel === channel.id ? (
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          ) : (
                            <Zap className="w-3 h-3 mr-1" />
                          )}
                          Connect
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Status Bar */}
        {connectedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl bg-gradient-to-r from-green-500/10 to-primary/10 border border-green-500/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Autonomous Publishing Active</span>
              </div>
              <Badge variant="outline" className="text-xs text-green-600 border-green-500/30">
                {connectedCount} CHANNELS LIVE
              </Badge>
            </div>
          </motion.div>
        )}
      </motion.div>
    </TooltipProvider>
  );
};
