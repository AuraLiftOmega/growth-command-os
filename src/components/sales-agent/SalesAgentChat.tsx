import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Calendar, Loader2, Bot, User, Sparkles } from 'lucide-react';
import { useAISalesAgent } from '@/hooks/useAISalesAgent';
import { TimeSlotPicker } from './TimeSlotPicker';
import { format } from 'date-fns';

export function SalesAgentChat() {
  const [input, setInput] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    funnelStage,
    isTyping,
    initializeConversation,
    processMessage,
    conversationId,
    context,
  } = useAISalesAgent();

  useEffect(() => {
    if (!conversationId) {
      initializeConversation('chat');
    }
  }, [conversationId, initializeConversation]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Detect booking intent from AI messages
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant' && lastMessage.metadata?.suggestBooking) {
      setShowBookingModal(true);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const message = input.trim();
    setInput('');
    await processMessage(message);
  };

  const handleBookingComplete = (booking: any) => {
    processMessage(`[SYSTEM: Demo booked for ${format(new Date(booking.scheduled_at), 'PPpp')}]`);
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
      <Card className="h-[500px] flex flex-col">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-base">AI Sales Agent</CardTitle>
                <p className="text-xs text-muted-foreground">Autonomous demo booking</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowBookingModal(true)}
                className="gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                Book Demo
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
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                      msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      {msg.content}
                      {msg.metadata?.suggestBooking && (
                        <Button
                          size="sm"
                          className="mt-2 w-full gap-1.5"
                          onClick={() => setShowBookingModal(true)}
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          Schedule Now
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
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-muted rounded-xl px-3 py-2 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span className="text-xs text-muted-foreground">Typing...</span>
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
                placeholder="Type your message..."
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
        open={showBookingModal}
        onOpenChange={setShowBookingModal}
        onBookingComplete={handleBookingComplete}
        conversationId={conversationId || undefined}
        prospectContext={{
          name: context.prospect_name,
          email: context.prospect_email,
          company: context.prospect_company,
          qualificationScore: context.qualification_score,
          dealSizeEstimate: context.deal_size_estimate,
        }}
      />
    </>
  );
}
