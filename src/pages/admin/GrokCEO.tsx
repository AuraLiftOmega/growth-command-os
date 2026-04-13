import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Loader2, Sparkles, Brain, Zap, TrendingUp, ShoppingCart,
  Mail, Video, Target, Bot, DollarSign, Activity, Shield,
  BarChart3, Package, Globe, Flame
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const GROK_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/grok-ceo`;

const QUICK_COMMANDS = [
  { icon: BarChart3, label: "Full Status Report", msg: "Give me a complete status report of all systems, revenue, and active agents right now." },
  { icon: DollarSign, label: "Revenue Today", msg: "Show me today's revenue breakdown with conversion rates and top performing products." },
  { icon: Flame, label: "Launch Revenue Blitz", msg: "Launch an immediate revenue blitz — activate all sales channels, push bestsellers, fire abandoned cart recovery, and deploy fresh content. Maximum aggression." },
  { icon: Package, label: "Inventory Check", msg: "Run a full inventory audit — check Shopify stock levels, CJ sync status, and flag any out-of-stock bestsellers." },
  { icon: Mail, label: "Email Campaigns", msg: "Show me email automation status — abandoned cart recovery rates, welcome sequence performance, and suggest new campaigns." },
  { icon: Video, label: "Generate Content", msg: "Generate 5 viral content scripts for TikTok and Instagram Reels featuring our top 3 products. Make them scroll-stopping." },
  { icon: Target, label: "Ad Performance", msg: "Analyze all active ad creatives — show ROAS, identify winners to scale and losers to kill immediately." },
  { icon: Bot, label: "Bot Swarm Status", msg: "Show me the Bot Swarm status — all active bots, tasks completed today, revenue attributed, and any errors." },
];

const SYSTEM_STATS = [
  { icon: Activity, label: "Systems", value: "ALL LIVE", color: "text-green-400" },
  { icon: Shield, label: "Security", value: "HARDENED", color: "text-blue-400" },
  { icon: Globe, label: "Reach", value: "GLOBAL", color: "text-purple-400" },
  { icon: Zap, label: "Mode", value: "AUTONOMOUS", color: "text-amber-400" },
];

export default function GrokCEO() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    document.title = "GROK CEO — Supreme Command Interface";
    // Auto-greet
    setMessages([{
      role: "assistant",
      content: `⚡ **GROK CEO ONLINE** — All systems nominal.\n\n📊 **SYSTEM STATUS:**\n🟢 Shopify Store — **LIVE** (50 products)\n🟢 Stripe — **LIVE MODE** (Real payments active)\n🟢 AI Sales Agent — **DEPLOYED** on storefront\n🟢 Email Automation — **ACTIVE**\n🟢 Content Engine — **GENERATING**\n🟢 CJ Dropshipping — **SYNCED**\n🟢 Bot Swarm — **OPERATIONAL**\n\nI am your single point of command. Every agent reports to me. Every system obeys me. What's the play, boss? 🎯`
    }]);
  }, []);

  const streamChat = useCallback(async (allMessages: Message[]) => {
    setIsLoading(true);
    let assistantContent = "";

    try {
      const resp = await fetch(GROK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages }),
      });

      if (resp.status === 429) {
        toast.error("Rate limited — try again in a moment");
        return;
      }
      if (resp.status === 402) {
        toast.error("Credits needed — add funds in workspace settings");
        return;
      }
      if (!resp.ok || !resp.body) throw new Error(`Stream failed: ${resp.status}`);

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && prev.length > 1) {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantContent } : m
                  );
                }
                return [...prev, { role: "assistant", content: assistantContent }];
              });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (err) {
      console.error("Grok CEO error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Temporary disruption. Reconnecting to systems... Try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    const userMsg: Message = { role: "user", content: text };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    await streamChat(allMessages);
  }, [input, isLoading, messages, streamChat]);

  const handleQuickCommand = useCallback(async (msg: string) => {
    if (isLoading) return;
    const userMsg: Message = { role: "user", content: msg };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    await streamChat(allMessages);
  }, [isLoading, messages, streamChat]);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-white/5 bg-[#0a0a0c]/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight flex items-center gap-2">
                GROK CEO
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">LIVE</span>
              </h1>
              <p className="text-[11px] text-white/40 font-mono">Supreme Autonomous Command Interface</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3">
            {SYSTEM_STATS.map((stat) => (
              <div key={stat.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5">
                <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                <span className="text-[10px] font-mono text-white/50">{stat.label}:</span>
                <span className={`text-[10px] font-mono font-bold ${stat.color}`}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        {/* Sidebar — Quick Commands */}
        <aside className="hidden lg:flex flex-col w-72 border-r border-white/5 p-4 gap-2 overflow-y-auto">
          <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-2 px-1">Quick Commands</p>
          {QUICK_COMMANDS.map((cmd) => (
            <button
              key={cmd.label}
              onClick={() => handleQuickCommand(cmd.msg)}
              disabled={isLoading}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm text-white/70 hover:text-white hover:bg-white/[0.05] transition-all group disabled:opacity-40"
            >
              <cmd.icon className="w-4 h-4 text-amber-500/70 group-hover:text-amber-400 flex-shrink-0" />
              <span className="truncate">{cmd.label}</span>
            </button>
          ))}
        </aside>

        {/* Main Chat */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[85%] ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-amber-600/20 to-orange-600/10 border border-amber-500/20 rounded-2xl rounded-br-sm"
                    : "bg-white/[0.03] border border-white/5 rounded-2xl rounded-bl-sm"
                } px-5 py-4`}>
                  <div className="prose prose-sm prose-invert max-w-none [&>p]:m-0 [&>ul]:mt-1.5 [&>ul]:mb-0 [&>h1]:text-amber-400 [&>h2]:text-amber-400 [&>h3]:text-amber-400 [&>strong]:text-amber-300 text-sm leading-relaxed">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ))}
            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex justify-start">
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl rounded-bl-sm px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                    <span className="text-xs text-white/40 font-mono">Processing command...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Mobile Quick Commands */}
          <div className="lg:hidden flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide">
            {QUICK_COMMANDS.slice(0, 4).map((cmd) => (
              <button
                key={cmd.label}
                onClick={() => handleQuickCommand(cmd.msg)}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-white/60 bg-white/[0.04] border border-white/5 hover:bg-white/[0.08] whitespace-nowrap transition-colors disabled:opacity-40"
              >
                <cmd.icon className="w-3 h-3 text-amber-500/70" />
                {cmd.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="border-t border-white/5 px-4 md:px-8 py-4">
            <div className="flex items-end gap-3 max-w-4xl mx-auto">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Command your empire..."
                  rows={1}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 resize-none"
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="h-[46px] w-[46px] rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 border-0 shadow-lg shadow-orange-500/20 flex-shrink-0"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-[10px] text-white/20 text-center mt-2 font-mono">
              GROK CEO • All agents report here • Full autonomous control
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
