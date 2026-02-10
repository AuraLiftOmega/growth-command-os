import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Brain, Send, Loader2, Zap, Store, Package, TrendingUp, Bot, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  toolsUsed?: string[];
  iterations?: number;
  timestamp: Date;
}

const QUICK_COMMANDS = [
  { label: "📊 Platform Status", prompt: "Give me a full platform status report — all stores, products, orders, revenue, and CJ connection status." },
  { label: "📦 Audit All Orders", prompt: "Check all recent unfulfilled orders across every store and tell me which ones need CJ fulfillment." },
  { label: "🔍 Sync Store Metrics", prompt: "Fetch fresh product and order counts from every connected store and update the database." },
  { label: "🚀 Scale Winners", prompt: "Analyze which products have the highest revenue and create automation jobs to scale their ads." },
  { label: "🛒 CJ Catalog Search", prompt: "Search CJ for trending beauty and skincare products with high margins." },
  { label: "⚡ Full Audit", prompt: "Run a complete platform audit: check every store's products, verify CJ sourcing, check unfulfilled orders, and give me an action plan." },
];

export default function GrokBrain() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: "user", content: text.trim(), timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("grok-brain", {
        body: { message: text.trim() },
      });

      if (error) throw error;

      const assistantMsg: Message = {
        role: "assistant",
        content: data.response || data.error || "No response received.",
        toolsUsed: data.tools_used,
        iterations: data.iterations,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error("Grok Brain error:", err);
      toast.error("Grok Brain error", { description: err.message });
      setMessages((prev) => [
        ...prev,
        { role: "system", content: `Error: ${err.message}`, timestamp: new Date() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
            <Brain className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Grok Brain</h1>
            <p className="text-sm text-muted-foreground">
              xAI-powered command center — controls all stores, CJ, marketing & analytics
            </p>
          </div>
          <Badge variant="outline" className="ml-auto border-violet-500 text-violet-400">
            <Zap className="h-3 w-3 mr-1" /> grok-3
          </Badge>
        </div>

        {/* Quick Commands */}
        <div className="flex flex-wrap gap-2">
          {QUICK_COMMANDS.map((cmd) => (
            <Button
              key={cmd.label}
              variant="outline"
              size="sm"
              className="text-xs"
              disabled={loading}
              onClick={() => sendMessage(cmd.prompt)}
            >
              {cmd.label}
            </Button>
          ))}
        </div>

        <Separator />

        {/* Chat Area */}
        <Card className="border-border/50">
          <CardContent className="p-0">
            <ScrollArea className="h-[55vh]">
              <div className="p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-16 space-y-4 text-muted-foreground">
                    <Brain className="h-16 w-16 mx-auto opacity-20" />
                    <p className="text-lg font-medium">Grok Brain is ready</p>
                    <p className="text-sm max-w-md mx-auto">
                      Ask anything about your stores, orders, CJ fulfillment, or marketing. Use the quick commands above to get started.
                    </p>
                    <div className="flex justify-center gap-6 pt-4">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Store className="h-4 w-4" /> Stores
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Package className="h-4 w-4" /> CJ Orders
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <TrendingUp className="h-4 w-4" /> Analytics
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Bot className="h-4 w-4" /> Automation
                      </div>
                    </div>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-xl px-4 py-3 text-sm ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : msg.role === "system"
                          ? "bg-destructive/10 text-destructive border border-destructive/20"
                          : "bg-muted"
                      }`}
                    >
                      {msg.role === "assistant" && msg.toolsUsed && msg.toolsUsed.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {[...new Set(msg.toolsUsed)].map((tool, ti) => (
                            <Badge key={ti} variant="secondary" className="text-[10px] px-1.5 py-0">
                              {tool}
                            </Badge>
                          ))}
                          {msg.iterations && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {msg.iterations} iteration{msg.iterations > 1 ? "s" : ""}
                            </Badge>
                          )}
                        </div>
                      )}
                      <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                      <div className="text-[10px] opacity-40 mt-1">
                        {msg.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Grok is thinking & executing tools...
                    </div>
                  </div>
                )}

                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="border-t p-3 flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder="Command Grok Brain... (e.g., 'Check all unfulfilled orders and source them on CJ')"
                className="min-h-[44px] max-h-[120px] resize-none"
                disabled={loading}
              />
              <Button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                size="icon"
                className="shrink-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
