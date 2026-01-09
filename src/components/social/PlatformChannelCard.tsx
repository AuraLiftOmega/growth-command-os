/**
 * Platform Channel Card - Individual social/sales channel with OAuth, stats, and posting
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
  healthStatus: "healthy" | "degraded" | "disconnected";
  handle?: string;
  stats?: PlatformStats;
  onConnect: (platformId: string) => Promise<void>;
  onDisconnect: (platformId: string) => Promise<void>;
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
  stats,
  onConnect,
  onDisconnect,
  onPost,
  isLoading,
}: PlatformChannelCardProps) {
  const { user } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleConnect = async () => {
    if (!user) {
      toast.error("Please sign in first");
      return;
    }
    setIsConnecting(true);
    try {
      await onConnect(platform.id);
      toast.success(`${platform.name} connected!`);
    } catch (err: any) {
      toast.error(err.message || `Failed to connect ${platform.name}`);
    } finally {
      setIsConnecting(false);
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

  const statusColor =
    healthStatus === "healthy"
      ? "bg-success"
      : healthStatus === "degraded"
      ? "bg-warning"
      : "bg-muted-foreground";

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
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${platform.gradientFrom} ${platform.gradientTo} flex items-center justify-center text-2xl shadow-lg`}
                >
                  {platform.icon}
                </div>
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    {platform.name}
                    {isConnected && isTestMode && (
                      <Badge variant="secondary" className="text-[9px] px-1.5">
                        TEST
                      </Badge>
                    )}
                  </CardTitle>
                  {handle ? (
                    <p className="text-xs text-muted-foreground">{handle}</p>
                  ) : (
                    <p className="text-[10px] text-muted-foreground capitalize">
                      {platform.type} Channel
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isConnected && (
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${statusColor} ${
                      healthStatus === "healthy" ? "animate-pulse" : ""
                    }`} />
                    {healthStatus === "healthy" ? (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    ) : healthStatus === "degraded" ? (
                      <RefreshCw className="w-4 h-4 text-warning" />
                    ) : (
                      <XCircle className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 space-y-4">
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
                  >
                    <Play className="w-3 h-3 mr-1.5" />
                    Post Ad
                  </Button>
                </div>
              </>
            ) : (
              /* Disconnected State */
              <div className="space-y-3">
                {/* Features Preview */}
                <div className="flex flex-wrap gap-1 mb-2">
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
                  className={`w-full bg-gradient-to-r ${platform.gradientFrom} ${platform.gradientTo} hover:opacity-90`}
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Connect {platform.name}
                    </>
                  )}
                </Button>
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
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Connection Status</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${statusColor}`} />
                  <span className="text-sm capitalize">{healthStatus}</span>
                </div>
              </div>
              {handle && (
                <p className="text-xs text-muted-foreground mt-1">{handle}</p>
              )}
            </div>

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
