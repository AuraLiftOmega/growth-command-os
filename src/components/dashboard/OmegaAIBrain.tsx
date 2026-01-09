/**
 * OMEGA AI BRAIN - Global AI Agent in Sidebar
 * Autonomous content tailoring per platform with real-time optimization
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Sparkles,
  Zap,
  X,
  Send,
  TrendingUp,
  BarChart3,
  MessageSquare,
  Loader2,
  Maximize2,
  Minimize2,
  Bot,
  Wand2,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface OptimizationSuggestion {
  id: string;
  channel: string;
  suggestion: string;
  impact: 'high' | 'medium' | 'low';
  type: 'caption' | 'timing' | 'hashtags' | 'format' | 'cta';
  applied: boolean;
}

interface OmegaAIBrainProps {
  isExpanded: boolean;
  onToggle: () => void;
}

const CHANNEL_STYLES = {
  tiktok: { tone: 'punchy, viral, trend-driven', maxLength: 150, hashtags: 5 },
  instagram: { tone: 'engaging, aesthetic, lifestyle', maxLength: 200, hashtags: 10 },
  youtube: { tone: 'informative, valuable, searchable', maxLength: 300, hashtags: 3 },
  twitter: { tone: 'concise, witty, conversational', maxLength: 280, hashtags: 2 },
  facebook: { tone: 'storytelling, community-focused', maxLength: 400, hashtags: 3 },
  pinterest: { tone: 'inspirational, DIY, aspirational', maxLength: 250, hashtags: 5 },
  linkedin: { tone: 'professional, insightful, thought-leader', maxLength: 300, hashtags: 3 },
};

export function OmegaAIBrain({ isExpanded, onToggle }: OmegaAIBrainProps) {
  const [isThinking, setIsThinking] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'omega'; content: string }>>([
    { role: 'omega', content: '🧠 OMEGA online. Ask me to optimize content for any channel, analyze trends, or generate ad strategies.' }
  ]);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [activeOptimization, setActiveOptimization] = useState<string | null>(null);
  const [optimizationProgress, setOptimizationProgress] = useState(0);

  // Auto-generate suggestions based on context
  useEffect(() => {
    if (isExpanded && suggestions.length === 0) {
      generateSuggestions();
    }
  }, [isExpanded]);

  const generateSuggestions = async () => {
    const mockSuggestions: OptimizationSuggestion[] = [
      {
        id: '1',
        channel: 'TikTok',
        suggestion: 'Add trending audio "Aesthetic" to boost reach 340%',
        impact: 'high',
        type: 'format',
        applied: false,
      },
      {
        id: '2',
        channel: 'Instagram',
        suggestion: 'Optimal posting time: 7PM EST for your audience',
        impact: 'medium',
        type: 'timing',
        applied: false,
      },
      {
        id: '3',
        channel: 'YouTube',
        suggestion: 'Hook with "You won\'t believe..." increases CTR 28%',
        impact: 'high',
        type: 'caption',
        applied: false,
      },
    ];
    setSuggestions(mockSuggestions);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsThinking(true);

    try {
      // Check for optimization commands
      const optimizeMatch = userMessage.toLowerCase().match(/optimize.*for\s+(tiktok|instagram|youtube|twitter|facebook|pinterest|linkedin)/i);
      
      if (optimizeMatch) {
        const channel = optimizeMatch[1].toLowerCase();
        await optimizeForChannel(channel, userMessage);
      } else {
        // General AI response
        const { data, error } = await supabase.functions.invoke('ai-sales-agent', {
          body: {
            action: 'omega_chat',
            message: userMessage,
            context: 'content_optimization'
          }
        });

        const response = data?.response || generateFallbackResponse(userMessage);
        setMessages(prev => [...prev, { role: 'omega', content: response }]);
      }
    } catch (err) {
      console.error('Omega AI error:', err);
      setMessages(prev => [...prev, { 
        role: 'omega', 
        content: generateFallbackResponse(userMessage) 
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  const optimizeForChannel = async (channel: string, originalContent: string) => {
    setActiveOptimization(channel);
    setOptimizationProgress(0);

    const style = CHANNEL_STYLES[channel as keyof typeof CHANNEL_STYLES];
    
    // Simulate optimization process
    for (let i = 0; i <= 100; i += 20) {
      await new Promise(r => setTimeout(r, 200));
      setOptimizationProgress(i);
    }

    const optimizedResponse = `✅ **Optimized for ${channel.charAt(0).toUpperCase() + channel.slice(1)}:**

📝 **Tone:** ${style?.tone || 'engaging'}
📏 **Max Length:** ${style?.maxLength || 200} chars
#️⃣ **Hashtags:** ${style?.hashtags || 5} recommended

**Optimized Caption:**
"${generateOptimizedCaption(channel)}"

**Best Hashtags:**
${generateHashtags(channel)}

**Optimal Posting Time:** ${getOptimalTime(channel)}`;

    setMessages(prev => [...prev, { role: 'omega', content: optimizedResponse }]);
    setActiveOptimization(null);
    toast.success(`Content optimized for ${channel}!`);
  };

  const generateOptimizedCaption = (channel: string) => {
    const captions: Record<string, string> = {
      tiktok: "POV: You finally found THE skincare routine 💅✨ Wait till the end for the glow up! #fyp",
      instagram: "Your skin deserves this 🌸 Double tap if you're ready for your glow era ✨",
      youtube: "I Tried This $30 Skincare Routine For 30 Days - Here's What Happened...",
      twitter: "This one product changed my entire skincare game. Here's why 👇",
      facebook: "After years of struggling with my skin, I finally found what works. Let me share my journey...",
      pinterest: "The Only Morning Skincare Routine You Need | Clean Girl Aesthetic 2024",
      linkedin: "How I reduced customer acquisition costs by 40% with AI-powered video ads",
    };
    return captions[channel] || captions.tiktok;
  };

  const generateHashtags = (channel: string) => {
    const hashtags: Record<string, string> = {
      tiktok: "#skincare #glowup #fyp #viral #skincareroutine",
      instagram: "#skincare #beauty #selfcare #glowingskin #skincaretips",
      youtube: "#skincare #routine #beforeandafter #beauty",
      twitter: "#skincare #beautytips",
      facebook: "#skincare #wellness #selfcare",
      pinterest: "#skincare #aesthetic #cleangirl #routine",
      linkedin: "#marketing #AI #ecommerce",
    };
    return hashtags[channel] || hashtags.tiktok;
  };

  const getOptimalTime = (channel: string) => {
    const times: Record<string, string> = {
      tiktok: "7-9 PM (your audience peak)",
      instagram: "12 PM or 7 PM",
      youtube: "Saturday 9 AM",
      twitter: "9 AM or 12 PM",
      facebook: "1-4 PM",
      pinterest: "8-11 PM",
      linkedin: "Tuesday 10 AM",
    };
    return times[channel] || times.tiktok;
  };

  const generateFallbackResponse = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('trend')) {
      return "📈 **Current Trends:**\n\n1. Short-form video dominating (15-30s optimal)\n2. UGC-style content outperforming polished ads\n3. 'Get Ready With Me' format +180% engagement\n4. Problem-solution hooks convert 3x better\n\nWant me to generate a trend-aligned ad for a specific product?";
    }
    
    if (lowerMessage.includes('strategy') || lowerMessage.includes('plan')) {
      return "🎯 **Recommended Strategy:**\n\n**Week 1:** Test 3 hook variants across TikTok\n**Week 2:** Scale winner, expand to Reels\n**Week 3:** Retarget with testimonial content\n**Week 4:** A/B test CTAs for conversion\n\nShall I auto-schedule this campaign?";
    }
    
    return "I can help you optimize content for any platform! Try asking:\n\n• 'Optimize this for TikTok'\n• 'What's trending right now?'\n• 'Create a 30-day content strategy'\n• 'Best hashtags for skincare'";
  };

  const applySuggestion = async (suggestion: OptimizationSuggestion) => {
    setSuggestions(prev => 
      prev.map(s => s.id === suggestion.id ? { ...s, applied: true } : s)
    );
    toast.success(`Applied: ${suggestion.suggestion}`);
  };

  const impactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-success/20 text-success border-success/30';
      case 'medium': return 'bg-warning/20 text-warning border-warning/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 380, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="h-full border-l border-border bg-card/95 backdrop-blur-xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between bg-gradient-to-r from-accent/10 to-primary/10">
            <div className="flex items-center gap-3">
              <motion.div 
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center"
              >
                <Brain className="w-5 h-5 text-white" />
              </motion.div>
              <div>
                <h3 className="font-bold text-sm flex items-center gap-2">
                  OMEGA AI
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                  </span>
                </h3>
                <p className="text-[10px] text-muted-foreground">Autonomous Content Optimizer</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8">
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Quick Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-3 border-b border-border space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI Suggestions
              </p>
              <div className="space-y-1.5">
                {suggestions.slice(0, 3).map((suggestion) => (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-2 rounded-lg border ${suggestion.applied ? 'bg-success/10 border-success/30' : 'bg-muted/30 border-border'} cursor-pointer hover:bg-muted/50 transition-colors`}
                    onClick={() => !suggestion.applied && applySuggestion(suggestion)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium flex items-center gap-1.5">
                          {suggestion.applied ? (
                            <CheckCircle className="w-3 h-3 text-success" />
                          ) : (
                            <Wand2 className="w-3 h-3 text-accent" />
                          )}
                          {suggestion.channel}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">{suggestion.suggestion}</p>
                      </div>
                      <Badge variant="outline" className={`text-[8px] px-1.5 ${impactColor(suggestion.impact)}`}>
                        {suggestion.impact}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Optimization Progress */}
          {activeOptimization && (
            <div className="p-3 border-b border-border bg-accent/5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin text-accent" />
                  Optimizing for {activeOptimization}...
                </p>
                <span className="text-xs text-muted-foreground">{optimizationProgress}%</span>
              </div>
              <Progress value={optimizationProgress} className="h-1.5" />
            </div>
          )}

          {/* Chat Messages */}
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-3">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[90%] p-3 rounded-xl text-xs ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/50 border border-border'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </motion.div>
              ))}

              {isThinking && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-muted-foreground text-xs"
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>OMEGA is thinking...</span>
                </motion.div>
              )}
            </div>
          </ScrollArea>

          {/* Quick Commands */}
          <div className="p-2 border-t border-border">
            <div className="flex flex-wrap gap-1 mb-2">
              {['Optimize for TikTok', 'Trending now', 'Best hashtags'].map((cmd) => (
                <Button
                  key={cmd}
                  variant="outline"
                  size="sm"
                  className="h-6 text-[10px] px-2"
                  onClick={() => {
                    setInput(cmd);
                    handleSend();
                  }}
                >
                  {cmd}
                </Button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border">
            <div className="flex gap-2">
              <Input
                placeholder="Ask OMEGA to optimize..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 h-9 text-sm bg-muted/50"
              />
              <Button 
                onClick={handleSend} 
                disabled={isThinking || !input.trim()}
                size="icon"
                className="h-9 w-9"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
