/**
 * VIDEO IDEAS BRAIN - AURAOMEGA Viral Content Generator
 * 
 * AI-powered system for generating unlimited viral video content ideas
 * Integrates with CEO Brain for 24/7 autonomous content generation
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Sparkles, 
  Zap, 
  TrendingUp, 
  Video, 
  Play,
  Clock,
  Target,
  Hash,
  Copy,
  CheckCircle,
  RefreshCw,
  Flame,
  Star,
  Lightbulb
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface VideoIdea {
  id: string;
  idea_number: number;
  title: string;
  hook: string;
  visuals: string;
  visual_style: string;
  product_focus: string;
  product_id: string;
  body_script: string;
  cta: string;
  hashtags: string[];
  avatar_style: string;
  trending_elements: string[];
  emotional_trigger: string;
  virality_score: number;
  virality_reason: string;
  full_script: string;
  status: string;
  created_at: string;
}

export function VideoIdeasBrain() {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState<VideoIdea[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [autoMode, setAutoMode] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('all');
  const [generationProgress, setGenerationProgress] = useState(0);

  // Fetch existing ideas
  const fetchIdeas = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('video_ideas_brain')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setIdeas((data as VideoIdea[]) || []);
    } catch (error) {
      console.error('Error fetching ideas:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  // Generate new ideas
  const generateIdeas = async (count: number = 20) => {
    if (!user) {
      toast.error('Please sign in to generate ideas');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => Math.min(prev + 5, 90));
    }, 500);

    try {
      const { data, error } = await supabase.functions.invoke('generate-video-ideas', {
        body: { count, mode: 'generate', auto_loop: autoMode }
      });

      if (error) throw error;

      setGenerationProgress(100);
      
      if (data?.success) {
        toast.success(`🔥 Generated ${data.ideas_generated} viral video ideas!`);
        await fetchIdeas();
      } else {
        throw new Error(data?.error || 'Generation failed');
      }
    } catch (error) {
      console.error('Error generating ideas:', error);
      toast.error('Failed to generate ideas. Please try again.');
    } finally {
      clearInterval(progressInterval);
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  // Copy script to clipboard
  const copyScript = (idea: VideoIdea) => {
    const fullContent = `
🎬 ${idea.title}

📣 HOOK (0-3s):
${idea.hook}

🎥 VISUALS:
${idea.visuals}

📝 BODY (3-10s):
${idea.body_script}

🚀 CTA (10-15s):
${idea.cta}

📱 FULL 15s SCRIPT:
${idea.full_script}

#️⃣ HASHTAGS:
${idea.hashtags?.join(' ') || ''}

🎯 Product: ${idea.product_focus}
⭐ Virality Score: ${idea.virality_score}/10
💡 Why it works: ${idea.virality_reason}
    `.trim();

    navigator.clipboard.writeText(fullContent);
    setCopiedId(idea.id);
    toast.success('Script copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter ideas by status
  const filteredIdeas = ideas.filter(idea => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'top') return idea.virality_score >= 8;
    return idea.status === selectedTab;
  });

  // Stats
  const totalIdeas = ideas.length;
  const topIdeas = ideas.filter(i => i.virality_score >= 8).length;
  const avgVirality = ideas.length > 0 
    ? (ideas.reduce((acc, i) => acc + i.virality_score, 0) / ideas.length).toFixed(1)
    : 0;

  const getViralityColor = (score: number) => {
    if (score >= 9) return 'text-green-500 bg-green-500/10 border-green-500/30';
    if (score >= 7) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
    return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-900/40 via-pink-900/30 to-orange-900/40 border-purple-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: isGenerating ? 360 : 0 }}
                transition={{ duration: 2, repeat: isGenerating ? Infinity : 0, ease: 'linear' }}
              >
                <Brain className="h-8 w-8 text-purple-400" />
              </motion.div>
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  Video Ideas Brain
                  <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                    <Sparkles className="h-3 w-3 mr-1" />
                    OMEGA Layer
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  AI-powered viral content generator for Aura Luxe
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant={autoMode ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAutoMode(!autoMode)}
                className={autoMode ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                <Zap className={`h-4 w-4 mr-1 ${autoMode ? 'animate-pulse' : ''}`} />
                {autoMode ? 'Auto Mode ON' : 'Auto Mode'}
              </Button>
              <Button
                onClick={() => generateIdeas(20)}
                disabled={isGenerating}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Generate 20 Ideas
                  </>
                )}
              </Button>
            </div>
          </div>

          {isGenerating && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-purple-300">Generating viral ideas...</span>
                <span className="text-purple-300">{generationProgress}%</span>
              </div>
              <Progress value={generationProgress} className="h-2" />
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-background/50 border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Ideas</p>
                <p className="text-2xl font-bold">{totalIdeas}</p>
              </div>
              <Video className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-background/50 border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Top Viral (8+)</p>
                <p className="text-2xl font-bold text-green-500">{topIdeas}</p>
              </div>
              <Flame className="h-8 w-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-background/50 border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Virality</p>
                <p className="text-2xl font-bold text-yellow-500">{avgVirality}/10</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-background/50 border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ready to Generate</p>
                <p className="text-2xl font-bold text-purple-500">∞</p>
              </div>
              <Brain className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ideas List */}
      <Card>
        <CardHeader className="pb-2">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList>
              <TabsTrigger value="all">All Ideas ({ideas.length})</TabsTrigger>
              <TabsTrigger value="top">
                <Flame className="h-3 w-3 mr-1" />
                Top Viral ({topIdeas})
              </TabsTrigger>
              <TabsTrigger value="new">New</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="generated">Generated</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredIdeas.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <Lightbulb className="h-12 w-12 mb-4 opacity-30" />
                <p>No ideas yet. Click "Generate 20 Ideas" to start!</p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {filteredIdeas.map((idea, index) => (
                    <motion.div
                      key={idea.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="bg-background/30 border-border/50 hover:border-primary/30 transition-colors">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-3">
                              {/* Title & Virality */}
                              <div className="flex items-center gap-3">
                                <Badge 
                                  variant="outline" 
                                  className={getViralityColor(idea.virality_score)}
                                >
                                  <Flame className="h-3 w-3 mr-1" />
                                  {idea.virality_score}/10
                                </Badge>
                                <h3 className="font-semibold text-lg">{idea.title}</h3>
                              </div>

                              {/* Hook */}
                              <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/20">
                                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                                  <Zap className="h-3 w-3" /> Hook (0-3s)
                                </p>
                                <p className="font-medium text-purple-300">"{idea.hook}"</p>
                              </div>

                              {/* Body & CTA */}
                              <div className="grid grid-cols-2 gap-3">
                                <div className="bg-background/50 rounded-lg p-3">
                                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                                    <Video className="h-3 w-3" /> Body (3-10s)
                                  </p>
                                  <p className="text-sm">{idea.body_script}</p>
                                </div>
                                <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                                    <Target className="h-3 w-3" /> CTA (10-15s)
                                  </p>
                                  <p className="text-sm font-medium text-green-300">{idea.cta}</p>
                                </div>
                              </div>

                              {/* Meta */}
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Target className="h-3 w-3" />
                                  {idea.product_focus}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Play className="h-3 w-3" />
                                  {idea.visual_style?.replace('_', ' ')}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(idea.created_at).toLocaleDateString()}
                                </span>
                              </div>

                              {/* Hashtags */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <Hash className="h-3 w-3 text-muted-foreground" />
                                {idea.hashtags?.slice(0, 5).map((tag, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>

                              {/* Virality Reason */}
                              <p className="text-xs text-muted-foreground italic">
                                💡 {idea.virality_reason}
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyScript(idea)}
                              >
                                {copiedId === idea.id ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-purple-600 to-pink-600"
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
