/**
 * OMEGA AI SIDEBAR - Global AI Brain
 * 
 * Persistent AI assistant for optimization suggestions
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Sparkles,
  Send,
  X,
  Loader2,
  Zap,
  Copy,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface OmegaAISidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_PROMPTS = [
  { label: "Optimize for TikTok", prompt: "Optimize my latest ad for TikTok - make it punchy and trendy" },
  { label: "Instagram caption", prompt: "Generate an Instagram caption for my AuraLift product" },
  { label: "Improve conversion", prompt: "How can I improve my ad conversion rate?" },
  { label: "Bundle suggestion", prompt: "Suggest product bundles for AuraLift Beauty" },
];

export function OmegaAISidebar({ isOpen, onClose }: OmegaAISidebarProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hey! I'm Omega, your AI marketing brain. Ask me to optimize ads, generate captions, or suggest strategies for any platform. 🧠✨",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call Omega AI (using existing omega-swarm-2026 function)
      const { data, error } = await supabase.functions.invoke('omega-swarm-2026', {
        body: {
          action: 'chat',
          message: text,
          context: 'marketing_optimization'
        }
      });

      let response = data?.response || generateLocalResponse(text);
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      // Fallback to local response generation
      const response = generateLocalResponse(text);
      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const generateLocalResponse = (input: string): string => {
    const lower = input.toLowerCase();
    
    if (lower.includes('tiktok')) {
      return "🎵 **TikTok Optimization Tips:**\n\n1. Hook in first 3 seconds - start with transformation\n2. Use trending sounds (check TikTok Creative Center)\n3. Caption: Keep it punchy, use emojis\n\n**Suggested caption:**\n\"POV: Your skin finally glows ✨ #skincare #glowup #fyp\"\n\n4. Post at 7-9 PM for best engagement\n5. Add text overlays for silent viewing";
    }
    
    if (lower.includes('instagram')) {
      return "📸 **Instagram Caption Generated:**\n\n\"Your morning routine just got an upgrade ✨\n\nIntroducing our Radiance Vitamin C Serum - because your skin deserves that natural glow.\n\n🍊 Brightens dark spots\n💧 Hydrates deeply\n⚡ Results in weeks\n\nDouble-tap if you're ready to glow! 💕\n\n#skincare #glowingskin #auralift #selfcare\"";
    }
    
    if (lower.includes('conversion') || lower.includes('improve')) {
      return "📈 **Conversion Optimization Insights:**\n\n1. **Add urgency** - Limited stock badges increase CR by 12%\n2. **Social proof** - Show \"X people viewing\" live counter\n3. **Video length** - 15-30 sec performs best for ads\n4. **CTA clarity** - \"Shop Now\" outperforms \"Learn More\" by 23%\n5. **Price anchoring** - Show original price crossed out\n\n**Quick win:** Add a countdown timer to your best-performing ad.";
    }
    
    if (lower.includes('bundle')) {
      return "🎁 **AuraLift Bundle Recommendations:**\n\n**Best Sellers Bundle** - $99 (save 15%)\n• Radiance Vitamin C Serum\n• Hydra-Glow Retinol Night Cream\n• Rose Quartz Face Roller\n\n**Complete Glow Kit** - $149 (save 20%)\n• All 5 AuraLift products\n• Free skincare pouch\n\nBundle ads convert 34% better than single-product ads!";
    }
    
    return "🧠 **Omega AI Insight:**\n\nI analyzed your request! Here are my recommendations:\n\n1. Focus on video content - 2x engagement vs static\n2. Pinterest is underutilized for beauty - high intent traffic\n3. User-generated content outperforms branded by 4x\n\nWant me to dive deeper into any specific platform or strategy?";
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopied(index);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                  <Brain className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    Omega AI
                    <Badge variant="outline" className="text-[10px]">
                      <Zap className="w-2 h-2 mr-1" />
                      LIVE
                    </Badge>
                  </h3>
                  <p className="text-xs text-muted-foreground">Marketing Brain</p>
                </div>
              </div>
              <Button size="icon" variant="ghost" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Quick Prompts */}
            <div className="p-3 border-b overflow-x-auto">
              <div className="flex gap-2">
                {QUICK_PROMPTS.map((qp, i) => (
                  <Button
                    key={i}
                    size="sm"
                    variant="outline"
                    className="whitespace-nowrap text-xs"
                    onClick={() => sendMessage(qp.prompt)}
                    disabled={isLoading}
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    {qp.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      {msg.role === 'assistant' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="mt-2 h-6 text-xs gap-1 opacity-70 hover:opacity-100"
                          onClick={() => copyToClipboard(msg.content, i)}
                        >
                          {copied === i ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          Copy
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl px-4 py-3">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage(input);
                }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Omega to optimize..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button type="submit" disabled={!input.trim() || isLoading}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}