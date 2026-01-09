/**
 * Autonomous Mode Panel - Schedule AI-generated posts via Omega
 */

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Clock,
  Calendar,
  Bot,
  Settings,
  Play,
  Pause,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface ScheduledPost {
  id: string;
  platform: string;
  platformIcon: string;
  content: string;
  scheduledFor: string;
  status: "pending" | "generating" | "ready" | "posted" | "failed";
  videoId?: string;
}

const mockScheduledPosts: ScheduledPost[] = [
  {
    id: "1",
    platform: "TikTok",
    platformIcon: "🎵",
    content: "Problem/Solution ad for Vitamin C Serum",
    scheduledFor: "2026-01-10T09:00:00",
    status: "ready",
  },
  {
    id: "2",
    platform: "Instagram",
    platformIcon: "📸",
    content: "Before/After testimonial for Retinol Cream",
    scheduledFor: "2026-01-10T12:00:00",
    status: "generating",
  },
  {
    id: "3",
    platform: "Pinterest",
    platformIcon: "📌",
    content: "Product showcase for Rose Quartz Roller",
    scheduledFor: "2026-01-10T15:00:00",
    status: "pending",
  },
  {
    id: "4",
    platform: "YouTube",
    platformIcon: "🎬",
    content: "Short-form demo for Hyaluronic Serum",
    scheduledFor: "2026-01-10T18:00:00",
    status: "pending",
  },
];

export function AutonomousModePanel() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [postsPerDay, setPostsPerDay] = useState([4]);
  const [contentStyle, setContentStyle] = useState("mixed");
  const [scheduledPosts, setScheduledPosts] = useState(mockScheduledPosts);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleToggle = (enabled: boolean) => {
    setIsEnabled(enabled);
    if (enabled) {
      toast.success("Autonomous mode activated! OMEGA will generate and post content automatically.");
    } else {
      toast("Autonomous mode paused");
    }
  };

  const handleRefreshSchedule = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.success("Schedule refreshed with trending content");
    setIsRefreshing(false);
  };

  const getStatusBadge = (status: ScheduledPost["status"]) => {
    switch (status) {
      case "ready":
        return (
          <Badge variant="default" className="bg-success text-success-foreground">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Ready
          </Badge>
        );
      case "generating":
        return (
          <Badge variant="secondary">
            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
            Generating
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "posted":
        return (
          <Badge variant="default">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Posted
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Control Card */}
      <Card className={`glass-card overflow-hidden ${isEnabled ? "border-primary/30" : ""}`}>
        <div
          className={`absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 transition-opacity ${
            isEnabled ? "opacity-100" : "opacity-0"
          }`}
        />
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${isEnabled ? "bg-primary/20" : "bg-muted"}`}>
                <Bot className={`w-5 h-5 ${isEnabled ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              Autonomous Mode
              {isEnabled && (
                <Badge variant="outline" className="ml-2 text-success border-success">
                  <Zap className="w-3 h-3 mr-1" />
                  ACTIVE
                </Badge>
              )}
            </CardTitle>
            <Switch checked={isEnabled} onCheckedChange={handleToggle} />
          </div>
        </CardHeader>

        <CardContent className="relative space-y-6">
          <p className="text-sm text-muted-foreground">
            OMEGA will automatically generate and post optimized content based on trending topics
            and your best-performing ads.
          </p>

          {/* Settings */}
          <div className="space-y-4">
            {/* Posts per day */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Posts per Day</label>
                <span className="text-sm font-mono text-primary">{postsPerDay[0]}</span>
              </div>
              <Slider
                value={postsPerDay}
                onValueChange={setPostsPerDay}
                min={1}
                max={12}
                step={1}
                disabled={!isEnabled}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Conservative</span>
                <span>Aggressive</span>
              </div>
            </div>

            {/* Content Style */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Content Style</label>
              <Select value={contentStyle} onValueChange={setContentStyle} disabled={!isEnabled}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mixed">Mixed (Best Performers)</SelectItem>
                  <SelectItem value="ugc">UGC Style</SelectItem>
                  <SelectItem value="professional">Professional/Polished</SelectItem>
                  <SelectItem value="trending">Trend-Based</SelectItem>
                  <SelectItem value="testimonial">Testimonial Focus</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quick Stats */}
            {isEnabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="grid grid-cols-3 gap-4 pt-4 border-t border-border"
              >
                <div className="text-center">
                  <p className="text-2xl font-bold font-mono text-primary">24</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Posts Today</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold font-mono text-success">$4,280</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Revenue</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold font-mono">3.8x</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Avg ROAS</p>
                </div>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Posts */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              Upcoming Posts
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshSchedule}
              disabled={isRefreshing || !isEnabled}
            >
              {isRefreshing ? (
                <RefreshCw className="w-3 h-3 mr-1.5 animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3 mr-1.5" />
              )}
              Regenerate
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {scheduledPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <span className="text-2xl">{post.platformIcon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{post.content}</p>
                  <p className="text-xs text-muted-foreground">
                    {post.platform} • {formatTime(post.scheduledFor)}
                  </p>
                </div>
                {getStatusBadge(post.status)}
              </motion.div>
            ))}
          </div>

          {/* Today's Progress */}
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-muted-foreground">Today's Progress</span>
              <span className="font-medium">{scheduledPosts.length} / {postsPerDay[0] * 4} posts</span>
            </div>
            <Progress value={(scheduledPosts.length / (postsPerDay[0] * 4)) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
