import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Send, 
  Calendar, 
  Loader2, 
  Bot, 
  User, 
  Sparkles,
  Megaphone,
  Zap,
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSalesAgentStore, FunnelStage } from '@/stores/sales-agent-store';
import { TimeSlotPicker } from '@/components/sales-agent/TimeSlotPicker';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'ad';
  content: string;
  timestamp: Date;
  metadata?: {
    intent_level?: number;
    is_ad?: boolean;
    ad_type?: string;
    booking_cta?: boolean;
  };
}

export function CEOChatWidget() {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [funnelStage, setFunnelStage] = useState<FunnelStage>('unaware');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize conversation
  useEffect(() => {
    if (user && !conversationId) {
      initializeConversation();
    }
  }, [user]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Inject promotional ads periodically
  useEffect(() => {
    if (messages.length > 0 && messages.length % 4 === 0) {
      injectPromotionalAd();
    }
  }, [messages.length]);

  const initializeConversation = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_sales_conversations')
        .insert({
          user_id: user?.id,
          channel: 'ceo_brain',
          funnel_stage: 'unaware',
          messages: [],
          context: {},
        })
        .select()
        .single();

      if (error) throw error;
      
      setConversationId(data.id);
      
      // CEO Brain welcome message
      const welcomeMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "I'm the CEO Brain – your ruthless, income-maximizing AI. I'll help you scale revenue, close deals, and automate everything. What's your biggest growth blocker right now?",
        timestamp: new Date(),
        metadata: { intent_level: 100 }
      };
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('Error initializing conversation:', error);
    }
  };

  const injectPromotionalAd = () => {
    const ads = [
      {
        content: "🚀 **FLASH DEAL**: Upgrade to Enterprise for 40% off – only 2 hours left! Scale your revenue 10x with full automation.",
        ad_type: 'upgrade'
      },
      {
        content: "💼 Book a strategy call now and get a custom growth roadmap FREE. Our top clients saw 312% ROI in 90 days.",
        ad_type: 'booking'
      },
      {
        content: "⚡ New Feature: AI Video Ads now generate 5x faster. Create viral content in seconds!",
        ad_type: 'feature'
      }
    ];
    
    const randomAd = ads[Math.floor(Math.random() * ads.length)];
    
    const adMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'ad',
      content: randomAd.content,
      timestamp: new Date(),
      metadata: {
        is_ad: true,
        ad_type: randomAd.ad_type,
        booking_cta: randomAd.ad_type === 'booking'
      }
    };
    
    setMessages(prev => [...prev, adMessage]);
  };

  const processMessage = async (userMessage: string) => {
    if (!user || !conversationId) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-sales-agent', {
        body: {
          conversationId,
          userMessage,
          currentStage: funnelStage,
          context: { mode: 'ceo_brain' },
          messageHistory: messages.slice(-10).map(m => ({
            role: m.role === 'ad' ? 'assistant' : m.role,
            content: m.content
          })),
        },
      });

      if (error) throw error;

      const response = data as {
        message: string;
        suggestedAction?: string;
        nextStage?: FunnelStage;
        intentLevel?: number;
      };

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        metadata: {
          intent_level: response.intentLevel,
          booking_cta: response.suggestedAction === 'show_slots' || response.suggestedAction === 'offer_booking'
        }
      };
      setMessages(prev => [...prev, assistantMsg]);

      if (response.nextStage) {
        setFunnelStage(response.nextStage);
      }

      if (response.suggestedAction === 'show_slots') {
        setShowBooking(true);
      }

      // Persist conversation
      await supabase
        .from('ai_sales_conversations')
        .update({
          funnel_stage: response.nextStage || funnelStage,
          messages: messages.concat([userMsg, assistantMsg]).map(m => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp.toISOString()
          })),
          last_message_at: new Date().toISOString(),
        })
        .eq('id', conversationId);

    } catch (error) {
      console.error('Error processing message:', error);
      const fallbackMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "Interesting. Tell me more about your revenue goals – I'll find a way to maximize them.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
    processMessage(input.trim());
    setInput('');
  };

  const handleBookingComplete = (booking: any) => {
    const systemMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'system',
      content: `✅ Strategy call booked for ${format(new Date(booking.scheduled_at), 'PPpp')}. You'll receive a confirmation email shortly.`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, systemMsg]);
    setShowBooking(false);
    toast.success('Strategy call booked!');
  };

  const stageColors: Record<string, string> = {
    unaware: 'bg-muted',
    aware: 'bg-blue-500/20 text-blue-400',
    problem_aware: 'bg-amber-500/20 text-amber-400',
    solution_aware: 'bg-purple-500/20 text-purple-400',
    evaluating: 'bg-orange-500/20 text-orange-400',
    ready_to_act: 'bg-green-500/20 text-green-400',
    converted: 'bg-emerald-500/20 text-emerald-400',
  };

  return (
    <>
      <Card className="h-[520px] flex flex-col">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-orange-500/20">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  CEO Brain Chat
                  <Badge variant="outline" className="text-xs bg-success/10 text-success">
                    <Zap className="w-2.5 h-2.5 mr-1" />
                    AI
                  </Badge>
                </CardTitle>
                <p className="text-xs text-muted-foreground">Autonomous sales & support</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowBooking(true)}
                className="gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                Book Call
              </Button>
              <Badge className={stageColors[funnelStage] || 'bg-muted'}>
                {funnelStage.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role !== 'user' && (
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.role === 'ad' 
                          ? 'bg-gradient-to-br from-pink-500 to-rose-600' 
                          : msg.role === 'system'
                          ? 'bg-success/20'
                          : 'bg-gradient-to-br from-amber-500 to-orange-600'
                      }`}>
                        {msg.role === 'ad' ? (
                          <Megaphone className="w-3.5 h-3.5 text-white" />
                        ) : msg.role === 'system' ? (
                          <Zap className="w-3.5 h-3.5 text-success" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-white" />
                        )}
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                      msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : msg.role === 'ad'
                        ? 'bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/30'
                        : msg.role === 'system'
                        ? 'bg-success/10 border border-success/30'
                        : 'bg-muted'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      {msg.metadata?.booking_cta && msg.role !== 'user' && (
                        <Button
                          size="sm"
                          className="mt-2 w-full gap-1.5"
                          onClick={() => setShowBooking(true)}
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          Book Strategy Call
                        </Button>
                      )}
                      {msg.role === 'ad' && msg.metadata?.ad_type === 'upgrade' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 w-full gap-1.5 border-pink-500/50 text-pink-400 hover:bg-pink-500/10"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Claim Offer
                        </Button>
                      )}
                      <div className="text-[10px] opacity-50 mt-1">
                        {format(msg.timestamp, 'HH:mm')}
                      </div>
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-muted rounded-xl px-3 py-2 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span className="text-xs text-muted-foreground">CEO Brain analyzing...</span>
                  </div>
                </motion.div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          <div className="p-4 border-t bg-background">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask CEO Brain anything..."
                disabled={isTyping}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!input.trim() || isTyping}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      <TimeSlotPicker
        open={showBooking}
        onOpenChange={setShowBooking}
        onBookingComplete={handleBookingComplete}
        conversationId={conversationId || undefined}
        prospectContext={{
          name: undefined,
          email: undefined,
          company: undefined,
          qualificationScore: 75,
          dealSizeEstimate: 5000,
        }}
      />
    </>
  );
}
