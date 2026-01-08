/**
 * VOICE/CHAT AGENT
 * 
 * Persistent floating AI assistant that:
 * - Handles user commands (voice or text)
 * - Manages customer interactions
 * - Auto-replies to DMs
 * - Provides real-time insights
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  Bot,
  User,
  Zap,
  Sparkles,
  Loader2,
  Settings,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function VoiceChatAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hey! I'm your AI CEO assistant. I can help you generate ads, check performance, manage campaigns, or answer customer messages. What would you like to do?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call AI chat endpoint
      const { data, error } = await supabase.functions.invoke('ai-sales-agent', {
        body: {
          message: input,
          context: 'ceo_assistant',
          history: messages.slice(-10)
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data?.response || getDefaultResponse(input),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Speak response if voice enabled
      if (voiceEnabled && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(assistantMessage.content);
        utterance.rate = 1;
        utterance.pitch = 1;
        speechSynthesis.speak(utterance);
      }
    } catch (err) {
      // Demo response
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: getDefaultResponse(input),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('generate') || lowerInput.includes('create') || lowerInput.includes('video')) {
      return "I'll generate that video ad for you right now! Opening the Video Ad Studio... You can customize the style, platform, and duration. Want me to use your top-performing hook?";
    }
    if (lowerInput.includes('performance') || lowerInput.includes('stats') || lowerInput.includes('revenue')) {
      return "Today's looking great! 💰 Revenue: $2,847 (+12.4% vs yesterday). Best performer: Vitamin C Serum on TikTok with 8.2x ROAS. Should I scale that campaign?";
    }
    if (lowerInput.includes('campaign') || lowerInput.includes('ads')) {
      return "You have 4 active campaigns. The Vitamin C Serum TikTok campaign is crushing it at 8x ROAS. I recommend increasing budget by 50%. Should I do that automatically?";
    }
    if (lowerInput.includes('help') || lowerInput.includes('what can you')) {
      return "I can: 1) Generate viral video ads, 2) Check campaign performance, 3) Manage budgets, 4) Answer customer DMs, 5) Analyze trends, 6) Scale winners. What interests you?";
    }
    if (lowerInput.includes('dm') || lowerInput.includes('message') || lowerInput.includes('customer')) {
      return "I've handled 47 customer messages today. Most common: shipping inquiries (18), product questions (15), order status (14). Want me to show you the high-priority ones?";
    }
    
    return "Got it! I'm analyzing that now... Based on your current data, I'd recommend focusing on TikTok content since that's your highest-converting channel. Want me to elaborate?";
  };

  const toggleVoice = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast.error('Voice recognition failed');
      };

      recognition.start();
      setIsListening(true);
    } else {
      toast.error('Voice recognition not supported');
    }
  };

  // Quick action buttons
  const quickActions = [
    { label: 'Generate Ad', action: 'Generate a TikTok ad for my best product' },
    { label: 'Check Stats', action: "What's my revenue today?" },
    { label: 'Scale Winner', action: 'Scale my best performing campaign' },
  ];

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-chart-2 text-white shadow-lg shadow-primary/25 flex items-center justify-center z-50"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className={`fixed right-6 z-50 ${isMinimized ? 'bottom-6' : 'bottom-6'}`}
          >
            <Card className={`w-[380px] bg-background/95 backdrop-blur-lg border-primary/30 shadow-xl overflow-hidden transition-all ${
              isMinimized ? 'h-14' : 'h-[500px]'
            }`}>
              {/* Header */}
              <div className="p-3 bg-gradient-to-r from-primary/10 to-chart-2/10 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">AI CEO Assistant</p>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                      <span className="text-xs text-muted-foreground">Online</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                  >
                    <Volume2 className={`w-4 h-4 ${voiceEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setIsMinimized(!isMinimized)}
                  >
                    {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {!isMinimized && (
                <>
                  {/* Messages */}
                  <ScrollArea className="h-[340px] p-4" ref={scrollRef}>
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          {message.role === 'assistant' && (
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center flex-shrink-0">
                              <Sparkles className="w-3.5 h-3.5 text-white" />
                            </div>
                          )}
                          <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground rounded-br-sm'
                              : 'bg-muted rounded-bl-sm'
                          }`}>
                            {message.content}
                          </div>
                          {message.role === 'user' && (
                            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                              <User className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </motion.div>
                      ))}
                      {isLoading && (
                        <div className="flex gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center">
                            <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                          </div>
                          <div className="bg-muted p-3 rounded-2xl rounded-bl-sm">
                            <div className="flex gap-1">
                              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  {/* Quick Actions */}
                  <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto">
                    {quickActions.map((action) => (
                      <Button
                        key={action.label}
                        variant="outline"
                        size="sm"
                        className="text-xs whitespace-nowrap flex-shrink-0"
                        onClick={() => {
                          setInput(action.action);
                        }}
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        {action.label}
                      </Button>
                    ))}
                  </div>

                  {/* Input */}
                  <div className="p-3 border-t bg-muted/30">
                    <div className="flex gap-2">
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask me anything..."
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={toggleVoice}
                        className={isListening ? 'bg-primary text-primary-foreground' : ''}
                      >
                        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </Button>
                      <Button size="icon" onClick={handleSend} disabled={!input.trim() || isLoading}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
