import { motion } from "framer-motion";
import {
  ExternalLink,
  TrendingUp,
  Users,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ChannelData {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  followers: number;
  engagement: number;
  recentPosts: number;
  reach: number;
  color: string;
}

const channels: ChannelData[] = [
  {
    id: "tiktok",
    name: "TikTok",
    icon: "🎵",
    connected: true,
    followers: 24500,
    engagement: 8.4,
    recentPosts: 12,
    reach: 145000,
    color: "from-pink-500 to-cyan-500",
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: "📸",
    connected: true,
    followers: 18200,
    engagement: 4.2,
    recentPosts: 8,
    reach: 89000,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "pinterest",
    name: "Pinterest",
    icon: "📌",
    connected: true,
    followers: 12800,
    engagement: 6.1,
    recentPosts: 24,
    reach: 210000,
    color: "from-red-500 to-rose-500",
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: "🎬",
    connected: false,
    followers: 0,
    engagement: 0,
    recentPosts: 0,
    reach: 0,
    color: "from-red-600 to-red-500",
  },
];

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function SocialChannelsPanel() {
  const connectedCount = channels.filter((c) => c.connected).length;
  const totalReach = channels.reduce((sum, c) => sum + c.reach, 0);
  const totalFollowers = channels.reduce((sum, c) => sum + c.followers, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Social Channels</h1>
          <p className="text-muted-foreground">
            Manage and monitor your social media presence
          </p>
        </div>
        <Button className="btn-power gap-2">
          <Share2 className="w-4 h-4" />
          Connect New Channel
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-mono">{connectedCount}/4</p>
                  <p className="text-xs text-muted-foreground">Channels Connected</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Users className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-mono">
                    {formatNumber(totalFollowers)}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Followers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <Eye className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-mono">
                    {formatNumber(totalReach)}
                  </p>
                  <p className="text-xs text-muted-foreground">Monthly Reach</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <TrendingUp className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-mono">6.2%</p>
                  <p className="text-xs text-muted-foreground">Avg Engagement</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Channel Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {channels.map((channel, index) => (
          <motion.div
            key={channel.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.05 }}
          >
            <Card
              className={`glass-card overflow-hidden transition-all ${
                channel.connected ? "hover:border-primary/30" : "opacity-60"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${channel.color} flex items-center justify-center text-xl`}
                    >
                      {channel.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{channel.name}</CardTitle>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {channel.connected ? (
                          <>
                            <div className="w-1.5 h-1.5 rounded-full bg-success" />
                            <span className="text-xs text-success">Connected</span>
                          </>
                        ) : (
                          <>
                            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              Not connected
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant={channel.connected ? "outline" : "default"}
                    size="sm"
                    className={channel.connected ? "" : "btn-power"}
                  >
                    {channel.connected ? (
                      <>
                        <ExternalLink className="w-3 h-3 mr-1.5" />
                        Manage
                      </>
                    ) : (
                      "Connect"
                    )}
                  </Button>
                </div>
              </CardHeader>

              {channel.connected && (
                <CardContent className="pt-0">
                  <div className="grid grid-cols-3 gap-4 pt-3 border-t border-border">
                    <div className="text-center">
                      <p className="text-lg font-bold font-mono">
                        {formatNumber(channel.followers)}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase">
                        Followers
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold font-mono text-success">
                        {channel.engagement}%
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase">
                        Engagement
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold font-mono">
                        {channel.recentPosts}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase">
                        Posts (7d)
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Monthly Reach</span>
                      <span className="font-medium">
                        {formatNumber(channel.reach)}
                      </span>
                    </div>
                    <Progress value={(channel.reach / 250000) * 100} className="h-1.5" />
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  channel: "TikTok",
                  action: "Video posted",
                  time: "2 hours ago",
                  stats: { views: "12.4K", likes: "892" },
                },
                {
                  channel: "Pinterest",
                  action: "Pin created",
                  time: "4 hours ago",
                  stats: { views: "3.2K", saves: "156" },
                },
                {
                  channel: "Instagram",
                  action: "Reel published",
                  time: "6 hours ago",
                  stats: { views: "8.7K", likes: "421" },
                },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-normal">
                      {activity.channel}
                    </Badge>
                    <span className="text-sm">{activity.action}</span>
                    <span className="text-xs text-muted-foreground">
                      {activity.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {activity.stats.views}
                    </span>
                    <span className="flex items-center gap-1 text-primary">
                      <Heart className="w-3 h-3" />
                      {activity.stats.likes || activity.stats.saves}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
