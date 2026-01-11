import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Brain, 
  Send, 
  Loader2, 
  Sparkles, 
  TrendingUp, 
  DollarSign, 
  Target,
  Zap,
  Copy,
  RotateCcw
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  toolCalls?: any[];
  timestamp: Date;
}

interface GrokChatInterfaceProps {
  onDomainIdea?: (domain: string) => void;
  className?: string;
}

const MODES = [
  { value: "domainMining", label: "Domain Mining", icon: Sparkles, description: "Find premium domains" },
  { value: "domainValuation", label: "Valuation", icon: DollarSign, description: "Analyze domain value" },
  { value: "salesAgent", label: "Sales Agent", icon: Target, description: "Generate sales copy" },
  { value: "marketIntel", label: "Market Intel", icon: TrendingUp, description: "Real-time trends" },
  { value: "default", label: "General", icon: Brain, description: "General assistant" },
];

const QUICK_PROMPTS = [
  "Find 10 premium Vegas-themed .crypto domains under $100",
  "Valuate my domain 'caeserspalace.nft' for quick flip",
  "Generate a killer X DM for whale domain buyers",
  "What crypto projects need domains right now?",
  "Create FOMO sales thread for luxury domains",
];

export function GrokChatInterface({ onDomainIdea, className }: GrokChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("domainMining");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (prompt?: string) => {
    const messageText = prompt || input.trim();
    if (!messageText) return;

    const userMessage: Message = {
      role: "user",
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke("grok-query", {
        body: {
          prompt: messageText,
          mode,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          enableTools: true,
          userId: user?.id
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.content,
        toolCalls: data.toolCalls,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Check for domain suggestions and trigger callback
      if (onDomainIdea && data.content.includes(".crypto") || data.content.includes(".nft")) {
        // Extract potential domain names
        const domainMatches = data.content.match(/[\w-]+\.(crypto|nft|dao|x|wallet|blockchain|bitcoin)/gi);
        if (domainMatches && domainMatches.length > 0) {
          domainMatches.forEach((domain: string) => onDomainIdea(domain));
        }
      }

    } catch (error) {
      console.error("Grok query error:", error);
      
      let errorMessage = "Failed to query Grok. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes("Rate limit")) {
          errorMessage = "Rate limit reached. Please wait a moment.";
        } else if (error.message.includes("Invalid API key")) {
          errorMessage = "API key issue. Please check configuration.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    toast.success("Chat cleared");
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
  };

  const currentMode = MODES.find(m => m.value === mode);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Grok AI Agent
            </CardTitle>
            <CardDescription>Powered by xAI • Real-time domain intelligence</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODES.map(m => (
                  <SelectItem key={m.value} value={m.value}>
                    <div className="flex items-center gap-2">
                      <m.icon className="w-4 h-4" />
                      {m.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {messages.length > 0 && (
              <Button variant="outline" size="icon" onClick={clearChat}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        {currentMode && (
          <Badge variant="secondary" className="w-fit mt-2">
            <currentMode.icon className="w-3 h-3 mr-1" />
            {currentMode.description}
          </Badge>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quick Prompts */}
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Quick Actions:</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((prompt, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="text-xs h-auto py-1.5 px-2"
                  onClick={() => sendMessage(prompt)}
                  disabled={isLoading}
                >
                  <Zap className="w-3 h-3 mr-1" />
                  {prompt.slice(0, 40)}...
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <ScrollArea className="h-[300px] pr-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-3 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                  {msg.toolCalls && msg.toolCalls.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border/50">
                      <p className="text-xs opacity-70">
                        Used tools: {msg.toolCalls.map(t => t.function?.name).join(", ")}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-2 pt-1">
                    <span className="text-[10px] opacity-50">
                      {msg.timestamp.toLocaleTimeString()}
                    </span>
                    {msg.role === "assistant" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => copyMessage(msg.content)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Grok for domain ideas, valuations, sales copy..."
            className="min-h-[60px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <Button 
            onClick={() => sendMessage()} 
            disabled={isLoading || !input.trim()}
            className="h-[60px] px-4"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
