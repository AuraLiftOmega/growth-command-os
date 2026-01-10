/**
 * Enhanced Social & Sales Channels Dashboard
 * 
 * Ruthless SaaS design - 100% per-user dynamic
 * One-click OAuth for all platforms, AI suggestions, real-time sync
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Share2,
  ShoppingBag,
  Shield,
  Zap,
  RefreshCw,
  Loader2,
  Sparkles,
  TrendingUp,
  Users,
  Eye,
  DollarSign,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Settings,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserShopifyConnections } from "@/hooks/useUserShopifyConnections";
import { useSocialTokens } from "@/hooks/useSocialTokens";
import { AI_SUGGESTIONS } from "@/lib/dynamic-store-config";

interface ChannelConfig {
  id: string;
  name: string;
  icon: string;
  type: "social" | "sales";
  color: string;
  gradientFrom: string;
  gradientTo: string;
  features: string[];
  oauthSupported: boolean;
}

const ALL_CHANNELS: ChannelConfig[] = [
  // Sales Channels
  { id: "shopify", name: "Shopify", icon: "🛍️", type: "sales", color: "#5c6ac4", gradientFrom: "from-green-500", gradientTo: "to-emerald-500", features: ["Products", "Orders", "Inventory", "Analytics"], oauthSupported: true },
  { id: "amazon", name: "Amazon", icon: "📦", type: "sales", color: "#ff9900", gradientFrom: "from-orange-500", gradientTo: "to-yellow-500", features: ["Seller Central", "FBA", "Ads"], oauthSupported: true },
  { id: "etsy", name: "Etsy", icon: "🎨", type: "sales", color: "#f56400", gradientFrom: "from-orange-600", gradientTo: "to-orange-500", features: ["Listings", "Orders", "Reviews"], oauthSupported: true },
  // Social Channels
  { id: "tiktok", name: "TikTok", icon: "🎵", type: "social", color: "#ff0050", gradientFrom: "from-pink-500", gradientTo: "to-cyan-500", features: ["Video Upload", "Reels", "Ads"], oauthSupported: true },
  { id: "tiktok_shop", name: "TikTok Shop", icon: "🛒", type: "social", color: "#ff0050", gradientFrom: "from-pink-600", gradientTo: "to-orange-500", features: ["Shoppable Videos", "Product Tags", "GMV"], oauthSupported: true },
  { id: "instagram", name: "Instagram", icon: "📸", type: "social", color: "#e1306c", gradientFrom: "from-purple-500", gradientTo: "to-pink-500", features: ["Reels", "Stories", "Feed Posts"], oauthSupported: true },
  { id: "facebook", name: "Facebook", icon: "📘", type: "social", color: "#1877f2", gradientFrom: "from-blue-600", gradientTo: "to-blue-500", features: ["Video Ads", "Page Posts", "Stories"], oauthSupported: true },
  { id: "youtube", name: "YouTube", icon: "🎬", type: "social", color: "#ff0000", gradientFrom: "from-red-600", gradientTo: "to-red-500", features: ["Shorts", "Long-form", "Ads"], oauthSupported: true },
  { id: "pinterest", name: "Pinterest", icon: "📌", type: "social", color: "#e60023", gradientFrom: "from-red-500", gradientTo: "to-rose-500", features: ["Video Pins", "Idea Pins", "Boards"], oauthSupported: true },
  { id: "twitter", name: "X (Twitter)", icon: "🐦", type: "social", color: "#1da1f2", gradientFrom: "from-sky-500", gradientTo: "to-blue-500", features: ["Tweets", "Video", "Ads"], oauthSupported: true },
  { id: "linkedin", name: "LinkedIn", icon: "💼", type: "social", color: "#0a66c2", gradientFrom: "from-blue-700", gradientTo: "to-blue-600", features: ["Posts", "Articles", "Video"], oauthSupported: true },
  { id: "threads", name: "Threads", icon: "🧵", type: "social", color: "#000000", gradientFrom: "from-gray-800", gradientTo: "to-black", features: ["Posts", "Images", "Videos"], oauthSupported: true },
];

export function EnhancedChannelsDashboard() {
  const { user } = useAuth();
  const { connections: shopifyConnections, totalProducts, initiateOAuth: initiateShopifyOAuth, disconnectStore } = useUserShopifyConnections();
  const { tokens, initiateOAuth: initiateSocialOAuth, isConnected: isSocialConnected, disconnect: disconnectSocial } = useSocialTokens();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);

  // Calculate stats from real connections
  const connectedSales = shopifyConnections.length;
  const connectedSocial = tokens.filter(t => t.is_connected).length;
  const totalConnected = connectedSales + connectedSocial;

  // Determine AI suggestions based on user state
  const getActiveSuggestion = () => {
    if (shopifyConnections.length === 0) return AI_SUGGESTIONS.noStore;
    if (connectedSocial === 0) return AI_SUGGESTIONS.noSocial;
    if (totalProducts === 0) return AI_SUGGESTIONS.noVideos;
    return null;
  };

  const activeSuggestion = getActiveSuggestion();

  const handleConnect = async (channelId: string) => {
    if (!user) {
      toast.error("Please sign in to connect your accounts securely");
      return;
    }

    setConnectingPlatform(channelId);

    try {
      if (channelId === "shopify") {
        // Shopify uses special OAuth flow
        const shopDomain = prompt("Enter your Shopify store domain (e.g., my-store.myshopify.com):");
        if (!shopDomain) {
          setConnectingPlatform(null);
          return;
        }
        await initiateShopifyOAuth(shopDomain);
      } else {
        // Standard social OAuth
        await initiateSocialOAuth(channelId);
      }
      toast.success(`Redirecting to ${channelId} login...`);
    } catch (error: any) {
      console.error(`OAuth error for ${channelId}:`, error);
      toast.error(`Failed to connect ${channelId}. Please try again.`);
    } finally {
      setConnectingPlatform(null);
    }
  };

  const handleDisconnect = async (channelId: string, connectionId?: string) => {
    try {
      if (channelId === "shopify" && connectionId) {
        await disconnectStore(connectionId);
      } else {
        await disconnectSocial(channelId);
      }
      toast.success(`${channelId} disconnected successfully`);
    } catch (error) {
      toast.error("Failed to disconnect. Please try again.");
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Trigger sync for all connected platforms
      if (user) {
        await supabase.functions.invoke('sync-all-platforms', {
          body: { user_id: user.id }
        });
      }
      toast.success("All platforms synced successfully");
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const isChannelConnected = (channelId: string) => {
    if (channelId === "shopify") {
      return shopifyConnections.length > 0;
    }
    return isSocialConnected(channelId);
  };

  const getChannelStats = (channelId: string) => {
    if (channelId === "shopify" && shopifyConnections.length > 0) {
      const conn = shopifyConnections[0];
      return {
        primary: totalProducts,
        primaryLabel: "Products",
        secondary: conn.orders_count || 0,
        secondaryLabel: "Orders",
        revenue: conn.total_revenue || 0,
      };
    }
    
    const token = tokens.find(t => t.channel === channelId);
    if (token?.is_connected) {
      return {
        primary: 0,
        primaryLabel: "Followers",
        secondary: 0,
        secondaryLabel: "Posts",
        revenue: 0,
      };
    }
    
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
            <Share2 className="w-7 h-7 text-primary" />
            Sales & Social Channels
          </h1>
          <p className="text-muted-foreground">
            One-click secure OAuth — connect all your stores and social accounts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Sync All
          </Button>
          <Button className="btn-power gap-2">
            <Sparkles className="w-4 h-4" />
            Test All Integrations
          </Button>
        </div>
      </div>

      {/* Security Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-3 rounded-lg bg-gradient-to-r from-success/5 to-primary/5 border border-success/20"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-success/20">
            <Shield className="w-5 h-5 text-success" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Secure OAuth 2.0 Connections</p>
            <p className="text-xs text-muted-foreground">
              Your passwords are never stored — login securely on each platform's official page
            </p>
          </div>
          <Badge variant="outline" className="text-success border-success/30">
            Bank-Level Security
          </Badge>
        </div>
      </motion.div>

      {/* AI Suggestion Banner */}
      {activeSuggestion && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-xl bg-gradient-to-r from-primary/10 via-chart-1/10 to-chart-2/10 border border-primary/20"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/20">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">{activeSuggestion.title}</p>
              <p className="text-sm text-muted-foreground">{activeSuggestion.message}</p>
            </div>
            <Button className="shrink-0">
              {activeSuggestion.action}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-success/10 to-success/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/20">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalConnected}</p>
                <p className="text-xs text-muted-foreground">Connected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <ShoppingBag className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalProducts}</p>
                <p className="text-xs text-muted-foreground">Products</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-chart-1/10 to-chart-1/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-1/20">
                <Users className="w-5 h-5 text-chart-1" />
              </div>
              <div>
                <p className="text-2xl font-bold">{connectedSocial}</p>
                <p className="text-xs text-muted-foreground">Social Channels</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-chart-2/10 to-chart-2/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-2/20">
                <TrendingUp className="w-5 h-5 text-chart-2" />
              </div>
              <div>
                <p className="text-2xl font-bold">{ALL_CHANNELS.length - totalConnected}</p>
                <p className="text-xs text-muted-foreground">Available</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Channels Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <ShoppingBag className="w-5 h-5" />
          Sales Channels
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_CHANNELS.filter(c => c.type === "sales").map((channel) => {
            const connected = isChannelConnected(channel.id);
            const stats = getChannelStats(channel.id);
            const isConnecting = connectingPlatform === channel.id;

            return (
              <motion.div
                key={channel.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className={`overflow-hidden transition-all ${connected ? "border-success/30 shadow-lg shadow-success/5" : "opacity-80 hover:opacity-100"}`}>
                  <CardHeader 
                    className="pb-2" 
                    style={{ background: `linear-gradient(135deg, ${channel.color}15, ${channel.color}05)` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${channel.gradientFrom} ${channel.gradientTo} flex items-center justify-center text-2xl shadow-lg`}>
                          {channel.icon}
                        </div>
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            {channel.name}
                            {connected && (
                              <Badge variant="default" className="text-[9px] bg-success">
                                Connected
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {channel.type === "sales" ? "Sales Channel" : "Social Channel"}
                          </CardDescription>
                        </div>
                      </div>
                      {connected && (
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Settings className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    {connected && stats ? (
                      <>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <p className="text-lg font-bold">{stats.primary}</p>
                            <p className="text-[10px] text-muted-foreground">{stats.primaryLabel}</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold">{stats.secondary}</p>
                            <p className="text-[10px] text-muted-foreground">{stats.secondaryLabel}</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-success">${stats.revenue.toLocaleString()}</p>
                            <p className="text-[10px] text-muted-foreground">Revenue</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Sync
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDisconnect(channel.id, shopifyConnections[0]?.id)}
                          >
                            Disconnect
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                          <Shield className="w-4 h-4 text-success" />
                          <span className="text-xs text-muted-foreground">
                            Login securely on {channel.name}'s page
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {channel.features.map((feature) => (
                            <Badge key={feature} variant="secondary" className="text-[9px]">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          onClick={() => handleConnect(channel.id)}
                          disabled={isConnecting}
                          className={`w-full bg-gradient-to-r ${channel.gradientFrom} ${channel.gradientTo} hover:opacity-90`}
                        >
                          {isConnecting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Redirecting...
                            </>
                          ) : (
                            <>
                              <Zap className="w-4 h-4 mr-2" />
                              Connect {channel.name}
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Social Channels Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          Social Channels
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {ALL_CHANNELS.filter(c => c.type === "social").map((channel) => {
            const connected = isChannelConnected(channel.id);
            const isConnecting = connectingPlatform === channel.id;
            const token = tokens.find(t => t.channel === channel.id);

            return (
              <motion.div
                key={channel.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className={`overflow-hidden transition-all ${connected ? "border-success/30 shadow-lg shadow-success/5" : "opacity-80 hover:opacity-100"}`}>
                  <CardHeader 
                    className="pb-2" 
                    style={{ background: `linear-gradient(135deg, ${channel.color}15, ${channel.color}05)` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${channel.gradientFrom} ${channel.gradientTo} flex items-center justify-center text-xl shadow-lg`}>
                        {channel.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm flex items-center gap-2">
                          {channel.name}
                          {connected && (
                            <Badge variant="default" className="text-[8px] bg-success">
                              ✓
                            </Badge>
                          )}
                        </CardTitle>
                        {connected && token?.account_name && (
                          <p className="text-xs text-muted-foreground truncate">
                            {token.account_name}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3">
                    {connected ? (
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 h-8 text-xs">
                          Post Ad
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 text-xs text-destructive"
                          onClick={() => handleDisconnect(channel.id)}
                        >
                          ×
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleConnect(channel.id)}
                        disabled={isConnecting}
                        className={`w-full h-8 text-xs bg-gradient-to-r ${channel.gradientFrom} ${channel.gradientTo} hover:opacity-90`}
                      >
                        {isConnecting ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <>
                            <Zap className="w-3 h-3 mr-1" />
                            Connect
                          </>
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {totalConnected === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="inline-flex p-4 rounded-full bg-muted/50 mb-4">
            <Plus className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Channels Connected</h3>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            Connect your Shopify store and social accounts to start generating AI video ads and posting automatically.
          </p>
          <Button className="btn-power" onClick={() => handleConnect("shopify")}>
            <ShoppingBag className="w-4 h-4 mr-2" />
            Connect Your First Store
          </Button>
        </motion.div>
      )}
    </div>
  );
}
