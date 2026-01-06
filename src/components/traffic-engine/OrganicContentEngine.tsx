import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { 
  Video, 
  Zap,
  TrendingUp,
  Eye,
  Play,
  Clock,
  Calendar,
  RefreshCw,
  CheckCircle2,
  Target
} from "lucide-react";

export const OrganicContentEngine = () => {
  const [autoGeneration, setAutoGeneration] = useState(true);
  const [dailyPosting, setDailyPosting] = useState(true);

  const platforms = [
    { name: 'TikTok', status: 'active', postsToday: 3, views: 45200, engagement: 8.4 },
    { name: 'IG Reels', status: 'active', postsToday: 2, views: 23400, engagement: 6.2 },
    { name: 'YouTube Shorts', status: 'active', postsToday: 2, views: 18700, engagement: 5.8 },
    { name: 'X (Twitter)', status: 'active', postsToday: 5, views: 12300, engagement: 4.1 },
    { name: 'LinkedIn', status: 'active', postsToday: 2, views: 8900, engagement: 3.2 }
  ];

  const contentPillars = [
    { type: 'Proof Content', description: 'Results, metrics, case studies', percentage: 35 },
    { type: 'Replacement Narratives', description: 'Why old methods fail', percentage: 25 },
    { type: 'System Execution', description: 'Behind-the-scenes process', percentage: 20 },
    { type: 'Outcome Visibility', description: 'What success looks like', percentage: 20 }
  ];

  const contentQueue = [
    { title: 'Case study breakdown: 340% ROAS in 14 days', platform: 'TikTok', scheduled: '2:00 PM', status: 'ready' },
    { title: 'Why agencies cant scale you past 7 figures', platform: 'IG Reels', scheduled: '4:30 PM', status: 'ready' },
    { title: 'Inside our creative automation workflow', platform: 'YouTube', scheduled: '6:00 PM', status: 'generating' },
    { title: 'Real-time dashboard walkthrough', platform: 'LinkedIn', scheduled: '8:00 AM', status: 'ready' }
  ];

  const totalViews = platforms.reduce((sum, p) => sum + p.views, 0);
  const totalPosts = platforms.reduce((sum, p) => sum + p.postsToday, 0);
  const avgEngagement = platforms.reduce((sum, p) => sum + p.engagement, 0) / platforms.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Video className="w-7 h-7 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold">ORGANIC SHORT-FORM ENGINE</h3>
                <p className="text-muted-foreground text-sm">
                  Platform-agnostic content generation • Daily inbound • Ad-independent growth
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Auto-Generate</span>
                <Switch 
                  checked={autoGeneration} 
                  onCheckedChange={setAutoGeneration}
                  className="data-[state=checked]:bg-purple-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Daily Posting</span>
                <Switch 
                  checked={dailyPosting} 
                  onCheckedChange={setDailyPosting}
                  className="data-[state=checked]:bg-purple-500"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-card/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Play className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-2xl font-bold">{totalPosts}</p>
                <p className="text-xs text-muted-foreground">Posts Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-2xl font-bold">{(totalViews / 1000).toFixed(1)}K</p>
                <p className="text-xs text-muted-foreground">Views Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-2xl font-bold">{avgEngagement.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Avg Engagement</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-pink-400" />
              <div>
                <p className="text-2xl font-bold">28</p>
                <p className="text-xs text-muted-foreground">Inbound Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Status */}
      <Card className="bg-card/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5 text-primary" />
            Platform Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            {platforms.map((platform) => (
              <div key={platform.name} className="p-4 bg-muted/30 rounded-lg text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="font-medium">{platform.name}</span>
                  <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                    {platform.status}
                  </Badge>
                </div>
                <p className="text-2xl font-bold">{platform.postsToday}</p>
                <p className="text-xs text-muted-foreground mb-2">posts today</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="font-bold">{(platform.views / 1000).toFixed(1)}K</p>
                    <p className="text-muted-foreground">views</p>
                  </div>
                  <div>
                    <p className="font-bold text-emerald-400">{platform.engagement}%</p>
                    <p className="text-muted-foreground">engage</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* Content Pillars */}
        <Card className="bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Content Pillars (Focus Areas)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {contentPillars.map((pillar, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <div>
                    <span className="font-medium">{pillar.type}</span>
                    <span className="text-xs text-muted-foreground ml-2">{pillar.description}</span>
                  </div>
                  <span className="font-bold">{pillar.percentage}%</span>
                </div>
                <Progress value={pillar.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Content Queue */}
        <Card className="bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Content Queue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {contentQueue.map((content, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  {content.status === 'ready' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{content.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">{content.platform}</Badge>
                      <Clock className="w-3 h-3" />
                      {content.scheduled}
                    </div>
                  </div>
                </div>
                <Badge 
                  variant="outline" 
                  className={
                    content.status === 'ready' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }
                >
                  {content.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Organic Engine Rule */}
      <Card className="bg-card/60 border-purple-500/30">
        <CardContent className="p-4">
          <div className="text-center">
            <p className="font-bold text-purple-400 mb-1">ORGANIC CONTENT LAW</p>
            <p className="text-xs text-muted-foreground">
              Organic content must: Drive inbound demand continuously • Build brand gravity independent of ads • Function even if all ads are off
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
