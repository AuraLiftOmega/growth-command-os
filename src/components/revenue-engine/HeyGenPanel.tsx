import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Video, Sparkles, User, Loader2, Play, CheckCircle } from 'lucide-react';

interface HeyGenPanelProps {
  onVideoCreated?: (videoId: string) => void;
}

export function HeyGenPanel({ onVideoCreated }: HeyGenPanelProps) {
  const [script, setScript] = useState('');
  const [productName, setProductName] = useState('');
  const [avatarId, setAvatarId] = useState('Kristin_public_3_20240108');
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoStatus, setVideoStatus] = useState<{
    id: string;
    status: string;
    url?: string;
    progress: number;
  } | null>(null);

  // 🔥 RETINOL POWER SCRIPTS (2026 Scaling Strategy)
  const RETINOL_SCRIPTS = [
    {
      name: "🌙 Retinol Beginner",
      script: "Struggling with fine lines but scared of retinol irritation? Our gentle Retinol Cream is encapsulated for slow release — smooths wrinkles, boosts collagen without the redness! See real results: dull texture to plump glow in weeks. Don't wait — your younger-looking skin starts tonight! Tap shop now before stock runs low!"
    },
    {
      name: "📅 Timeline (High CVR)",
      script: "Month 1 with our Retinol Cream: Bye-bye rough texture. Month 3: Fine lines fading fast. Month 6: That 'glass skin' everyone wants! Powered by proven retinol plus hydrators to fight aging gently. Transform your routine today — limited intro offer! Grab yours now and glow up!"
    },
    {
      name: "💎 Bundle Upsell",
      script: "Want max anti-aging? Pair our Retinol Cream with Hyaluronic Serum for the ultimate 'sandwich' method — hydrate, renew, glow! Go from tired to radiant in months. Top seller at 28% of sales — but stock is flying! Secure your bundle now — tap to shop before it's gone!"
    },
    {
      name: "🍑 Viral Metaphor",
      script: "Those fine lines creeping in? Imagine your skin like this — then THIS! Our Retinol Cream delivers real collagen boost without the drama. Real users seeing results fast. Don't let aging win — claim yours today and wake up younger tomorrow!"
    }
  ];

  const SAMPLE_SCRIPTS = [
    ...RETINOL_SCRIPTS,
    {
      name: "Product Intro",
      script: "Hey beautiful! Let me tell you about this amazing product that's been transforming skincare routines everywhere. It's packed with powerful ingredients that your skin will love. Try it today and see the glow!"
    },
    {
      name: "Before/After",
      script: "You won't believe the transformation! This product helped me achieve the clearest skin of my life in just 30 days. The secret? Consistent use and quality ingredients. Your skin deserves this!"
    },
    {
      name: "Urgent CTA",
      script: "Stop scrolling! If you've been struggling with your skincare routine, this is the product you've been looking for. Limited time offer - grab yours now before it sells out!"
    }
  ];

  const generateVideo = async () => {
    if (!script.trim()) {
      toast.error('Please enter a script');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('heygen-avatar', {
        body: {
          action: 'create_video',
          script,
          avatar_id: avatarId,
          product_name: productName,
          aspect_ratio: aspectRatio
        }
      });

      if (error) throw error;

      if (data.requires_key) {
        toast.error('HeyGen API key required', {
          description: 'Add HEYGEN_API_KEY to your secrets to enable avatar videos.'
        });
        return;
      }

      setVideoStatus({
        id: data.video_id,
        status: 'processing',
        progress: 10
      });

      toast.success('🎬 Avatar video generation started!', {
        description: 'Check back in 2-5 minutes for your video.'
      });

      // Start polling for status
      pollVideoStatus(data.video_id);

    } catch (error) {
      console.error('HeyGen error:', error);
      toast.error('Failed to generate video');
    } finally {
      setIsGenerating(false);
    }
  };

  const pollVideoStatus = async (videoId: string) => {
    const checkStatus = async () => {
      try {
        const { data } = await supabase.functions.invoke('heygen-avatar', {
          body: { action: 'check_status', video_id: videoId }
        });

        if (data) {
          setVideoStatus({
            id: videoId,
            status: data.status,
            url: data.video_url,
            progress: data.progress || 50
          });

          if (data.status === 'completed') {
            toast.success('✅ Avatar video ready!');
            onVideoCreated?.(videoId);
            return true;
          } else if (data.status === 'failed') {
            toast.error('Video generation failed');
            return true;
          }
        }
        return false;
      } catch (e) {
        return false;
      }
    };

    // Poll every 15 seconds for up to 5 minutes
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 15000));
      const done = await checkStatus();
      if (done) break;
    }
  };

  return (
    <Card className="border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-pink-900/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-purple-400" />
          HeyGen Avatar Videos
          <Badge variant="outline" className="ml-auto text-purple-400 border-purple-400">
            10x Engagement
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Scripts */}
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Quick Scripts</label>
          <div className="flex gap-2 flex-wrap">
            {SAMPLE_SCRIPTS.map((s) => (
              <Button
                key={s.name}
                variant="outline"
                size="sm"
                onClick={() => setScript(s.script)}
                className="text-xs"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                {s.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Script Input */}
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Video Script</label>
          <Textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="Enter your avatar's script... (max 500 chars for optimal videos)"
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground mt-1">{script.length}/500 characters</p>
        </div>

        {/* Product Name */}
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Product Name (optional)</label>
          <Input
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="e.g., Rose Quartz Serum"
          />
        </div>

        {/* Settings Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Avatar</label>
            <Select value={avatarId} onValueChange={setAvatarId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Kristin_public_3_20240108">Kristin (Professional)</SelectItem>
                <SelectItem value="Angela_public_4_20240125">Angela (Friendly)</SelectItem>
                <SelectItem value="Susan_public_2_20240328">Susan (Elegant)</SelectItem>
                <SelectItem value="Monica_public_2_20240108">Monica (Energetic)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Aspect Ratio</label>
            <Select value={aspectRatio} onValueChange={(v) => setAspectRatio(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="9:16">9:16 (TikTok/Reels)</SelectItem>
                <SelectItem value="16:9">16:9 (YouTube)</SelectItem>
                <SelectItem value="1:1">1:1 (Feed)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Video Status */}
        {videoStatus && (
          <div className="p-4 rounded-lg bg-black/30 border border-purple-500/30">
            <div className="flex items-center gap-3">
              {videoStatus.status === 'completed' ? (
                <CheckCircle className="h-5 w-5 text-green-400" />
              ) : (
                <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {videoStatus.status === 'completed' ? 'Video Ready!' : 'Generating...'}
                </p>
                <div className="h-2 bg-muted rounded-full mt-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                    style={{ width: `${videoStatus.progress}%` }}
                  />
                </div>
              </div>
              {videoStatus.url && (
                <Button size="sm" variant="outline" asChild>
                  <a href={videoStatus.url} target="_blank" rel="noopener noreferrer">
                    <Play className="h-4 w-4 mr-1" />
                    Watch
                  </a>
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Generate Button */}
        <Button 
          onClick={generateVideo} 
          disabled={isGenerating || !script.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating Avatar Video...
            </>
          ) : (
            <>
              <Video className="h-4 w-4 mr-2" />
              Generate Avatar Video
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Powered by HeyGen AI • Realistic talking avatars for maximum engagement
        </p>
      </CardContent>
    </Card>
  );
}
