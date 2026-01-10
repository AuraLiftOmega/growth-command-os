/**
 * Platform Channel Card - Enhanced social/sales channel with one-click OAuth
 * Clean UI with status indicators, reconnect support, and real-time sync
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  RefreshCw,
  Play,
  BarChart3,
  Users,
  Heart,
  Eye,
  Loader2,
  Unlink,
  Settings,
  Zap,
  AlertTriangle,
  Shield,
  Clock,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface PlatformConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  type: "social" | "sales";
  oauthEndpoint?: string;
  apiFeatures: string[];
}

interface PlatformStats {
  followers: number;
  engagement: number;
  posts7d: number;
  reach: number;
  revenue?: number;
  orders?: number;
}

interface PlatformChannelCardProps {
  platform: PlatformConfig;
  isConnected: boolean;
  isTestMode?: boolean;
  healthStatus: "healthy" | "degraded" | "disconnected" | "expired";
  handle?: string;
  avatar?: string;
  lastSyncAt?: string;
  expiresAt?: string;
  stats?: PlatformStats;
  onConnect: (platformId: string) => Promise<void>;
  onDisconnect: (platformId: string) => Promise<void>;
  onReconnect?: (platformId: string) => Promise<void>;
  onPost: (platformId: string) => void;
  isLoading?: boolean;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function PlatformChannelCard({
  platform,
  isConnected,
  isTestMode,
  healthStatus,
  handle,
  avatar,
  lastSyncAt,
  expiresAt,
  stats,
  onConnect,
  onDisconnect,
  onReconnect,
  onPost,
  isLoading,
}: PlatformChannelCardProps) {
  const { user } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Check if token is expiring soon (within 24 hours)
  const isExpiringSoon = expiresAt ? 
    new Date(expiresAt).getTime() - Date.now() < 24 * 60 * 60 * 1000 : false;
  
  const isExpired = expiresAt ? new Date(expiresAt) < new Date() : false;

  const handleConnect = async () => {
    if (!user) {
      toast.error("Please sign in to connect your accounts securely");
      return;
    }
    setIsConnecting(true);
    try {
      await onConnect(platform.id);
    } catch (err: any) {
      toast.error(err.message || `Failed to connect ${platform.name}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleReconnect = async () => {
    if (!onReconnect) {
      await handleConnect();
      return;
    }
    setIsReconnecting(true);
    try {
      await onReconnect(platform.id);
      toast.success(`${platform.name} reconnected!`);
    } catch (err) {
      toast.error("Failed to reconnect");
    } finally {
      setIsReconnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await onDisconnect(platform.id);
      toast.success(`${platform.name} disconnected`);
      setShowSettings(false);
    } catch (err) {
      toast.error("Failed to disconnect");
    }
  };

  const getStatusInfo = () => {
    if (isExpired || healthStatus === "expired") {
      return { color: "bg-destructive", text: "Expired", icon: AlertTriangle };
    }
    if (isExpiringSoon) {
      return { color: "bg-warning", text: "Expiring Soon", icon: Clock };
    }
    if (healthStatus === "healthy") {
      return { color: "bg-success", text: "Connected", icon: CheckCircle2 };
    }
    if (healthStatus === "degraded") {
      return { color: "bg-warning", text: "Degraded", icon: RefreshCw };
    }
    return { color: "bg-muted-foreground", text: "Disconnected", icon: XCircle };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          className={`overflow-hidden transition-all duration-300 ${
            isConnected
              ? "hover:border-primary/30 hover:shadow-lg"
              : "opacity-70 hover:opacity-100"
          }`}
        >
          <CardHeader
            className={`pb-3 bg-gradient-to-r ${platform.gradientFrom} ${platform.gradientTo} bg-opacity-10`}
            style={{
              background: `linear-gradient(135deg, ${platform.color}15, ${platform.color}05)`,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Platform icon or user avatar if connected */}
                <div className="relative">
                  {isConnected && avatar ? (
                    <img 
                      src={avatar} 
                      alt={handle || platform.name}
                      className="w-11 h-11 rounded-xl object-cover shadow-lg ring-2 ring-background"
                    />
                  ) : (
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${platform.gradientFrom} ${platform.gradientTo} flex items-center justify-center text-2xl shadow-lg`}
                    >
                      {platform.icon}
                    </div>
                  )}
                  {/* Connection status indicator */}
                  {isConnected && (
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${statusInfo.color} border-2 border-background flex items-center justify-center`}>
                      <StatusIcon className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    {platform.name}
                    {isConnected && isTestMode && (
                      <Badge variant="secondary" className="text-[9px] px-1.5">
                        TEST
                      </Badge>
                    )}
                    {isConnected && (
                      <Badge 
                        variant={isExpired || healthStatus === "expired" ? "destructive" : isExpiringSoon ? "outline" : "default"} 
                        className="text-[9px] px-1.5"
                      >
                        {statusInfo.text}
                      </Badge>
                    )}
                  </CardTitle>
                  {handle ? (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {handle}
                    </p>
                  ) : (
                    <p className="text-[10px] text-muted-foreground capitalize">
                      {platform.type} Channel
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isConnected && (
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-success" />
                      <span className="text-[9px] text-muted-foreground">OAuth</span>
                    </div>
                    {lastSyncAt && (
                      <span className="text-[9px] text-muted-foreground">
                        Synced {new Date(lastSyncAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 space-y-4">
            {/* Expired/Expiring Banner */}
            {isConnected && (isExpired || isExpiringSoon) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className={`p-2.5 rounded-lg ${isExpired ? "bg-destructive/10 border border-destructive/20" : "bg-warning/10 border border-warning/20"}`}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`w-4 h-4 ${isExpired ? "text-destructive" : "text-warning"}`} />
                  <span className="text-xs font-medium">
                    {isExpired ? "Connection expired" : "Token expiring soon"}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-auto h-7 text-xs"
                    onClick={handleReconnect}
                    disabled={isReconnecting}
                  >
                    {isReconnecting ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <>
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Reconnect
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Connected State */}
            {isConnected ? (
              <>
                {/* Stats Grid */}
                {stats && (
                  <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                        <Users className="w-3 h-3" />
                      </div>
                      <p className="text-lg font-bold font-mono">
                        {formatNumber(stats.followers)}
                      </p>
                      <p className="text-[9px] text-muted-foreground uppercase">
                        {platform.type === "sales" ? "Customers" : "Followers"}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                        <Heart className="w-3 h-3" />
                      </div>
                      <p className="text-lg font-bold font-mono text-success">
                        {stats.engagement}%
                      </p>
                      <p className="text-[9px] text-muted-foreground uppercase">
                        {platform.type === "sales" ? "Conv Rate" : "Engagement"}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                        <Eye className="w-3 h-3" />
                      </div>
                      <p className="text-lg font-bold font-mono">
                        {platform.type === "sales"
                          ? `$${formatNumber(stats.revenue || 0)}`
                          : formatNumber(stats.reach)}
                      </p>
                      <p className="text-[9px] text-muted-foreground uppercase">
                        {platform.type === "sales" ? "Revenue" : "Reach"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Reach Progress */}
                {stats && platform.type === "social" && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        Posts (7 days)
                      </span>
                      <span className="font-medium">{stats.posts7d}</span>
                    </div>
                    <Progress value={(stats.posts7d / 30) * 100} className="h-1.5" />
                  </div>
                )}

                {/* Features */}
                <div className="flex flex-wrap gap-1">
                  {platform.apiFeatures.slice(0, 4).map((feature) => (
                    <Badge
                      key={feature}
                      variant="secondary"
                      className="text-[9px] px-1.5"
                    >
                      {feature}
                    </Badge>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setShowSettings(true)}
                  >
                    <Settings className="w-3 h-3 mr-1.5" />
                    Manage
                  </Button>
                  <Button
                    size="sm"
                    className={`flex-1 bg-gradient-to-r ${platform.gradientFrom} ${platform.gradientTo}`}
                    onClick={() => onPost(platform.id)}
                    disabled={isExpired}
                  >
                    <Play className="w-3 h-3 mr-1.5" />
                    Post Ad
                  </Button>
                </div>
              </>
            ) : (
              /* Disconnected State */
              <div className="space-y-4">
                {/* Secure OAuth Badge */}
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                  <Shield className="w-4 h-4 text-success" />
                  <span className="text-xs text-muted-foreground">
                    Secure OAuth login — your password stays with {platform.name}
                  </span>
                </div>

                {/* Features Preview */}
                <div className="flex flex-wrap gap-1">
                  {platform.apiFeatures.slice(0, 4).map((feature) => (
                    <Badge
                      key={feature}
                      variant="secondary"
                      className="text-[9px] px-1.5 opacity-60"
                    >
                      {feature}
                    </Badge>
                  ))}
                </div>

                <Button
                  onClick={handleConnect}
                  disabled={isConnecting || isLoading}
                  className={`w-full bg-gradient-to-r ${platform.gradientFrom} ${platform.gradientTo} hover:opacity-90 shadow-lg`}
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Redirecting to {platform.name}...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Connect with {platform.name}
                    </>
                  )}
                </Button>
                <p className="text-[10px] text-center text-muted-foreground">
                  You'll be redirected to {platform.name} to authorize access
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{platform.icon}</span>
              {platform.name} Settings
            </DialogTitle>
            <DialogDescription>
              Manage your {platform.name} connection and preferences.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Connection Status */}
            <div className={`p-3 rounded-lg ${isExpired ? "bg-destructive/10" : "bg-muted/50"}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Connection Status</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${statusInfo.color}`} />
                  <span className="text-sm">{statusInfo.text}</span>
                </div>
              </div>
              {handle && (
                <div className="flex items-center gap-2 mt-2">
                  {avatar && (
                    <img src={avatar} alt={handle} className="w-6 h-6 rounded-full" />
                  )}
                  <p className="text-xs text-muted-foreground">{handle}</p>
                </div>
              )}
              {lastSyncAt && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last synced: {new Date(lastSyncAt).toLocaleString()}
                </p>
              )}
              {expiresAt && (
                <p className={`text-xs mt-1 ${isExpired ? "text-destructive" : "text-muted-foreground"}`}>
                  {isExpired ? "Expired" : "Expires"}: {new Date(expiresAt).toLocaleString()}
                </p>
              )}
            </div>

            {/* Reconnect if expired */}
            {(isExpired || isExpiringSoon) && (
              <Button
                onClick={handleReconnect}
                disabled={isReconnecting}
                className="w-full"
                variant={isExpired ? "destructive" : "outline"}
              >
                {isReconnecting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Reconnect Account
              </Button>
            )}

            {/* Features */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">
                Available Features
              </p>
              <div className="flex flex-wrap gap-1">
                {platform.apiFeatures.map((feature) => (
                  <Badge key={feature} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Security Info */}
            <div className="p-2 rounded-lg bg-success/5 border border-success/20">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-success" />
                <span className="text-xs text-success">Securely connected via OAuth 2.0</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleDisconnect}
              >
                <Unlink className="w-4 h-4 mr-2" />
                Disconnect
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => window.open(`https://${platform.id}.com`, "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open App
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
