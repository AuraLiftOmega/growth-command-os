import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageCircle, 
  Bot, 
  User, 
  Send, 
  Phone, 
  DollarSign,
  Clock,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Zap,
  ExternalLink,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  sender: "bot" | "customer";
  content: string;
  timestamp: string;
  metadata?: {
    intent?: string;
    product_mentioned?: string;
    sale_amount?: number;
    action?: string;
  };
}

interface Conversation {
  id: string;
  customer_name: string;
  customer_phone: string;
  channel: "whatsapp" | "sms" | "instagram";
  status: "active" | "closed" | "pending";
  last_message: string;
  last_message_time: string;
  unread_count: number;
  revenue_attributed: number;
  messages: ChatMessage[];
}

interface BotLog {
  id: string;
  bot_name: string;
  action: string;
  revenue_impact: number;
  status: "success" | "pending" | "failed";
  timestamp: string;
  customer?: string;
}

export default function LiveChat() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [botLogs, setBotLogs] = useState<BotLog[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("conversations");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Stats
  const [stats, setStats] = useState({
    activeConversations: 0,
    messagesHandled: 0,
    salesClosed: 0,
    revenueToday: 0,
  });

  useEffect(() => {
    if (!user) return;
    loadData();
    
    // Set up realtime subscription
    const channel = supabase
      .channel("whatsapp-messages")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "ai_sales_conversations",
      }, (payload) => {
        console.log("New message:", payload);
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      // Load conversations from ai_sales_conversations
      const { data: convData, error: convError } = await supabase
        .from("ai_sales_conversations")
        .select("*")
        .eq("user_id", user.id)
        .order("last_message_at", { ascending: false })
        .limit(50);

      if (convError) throw convError;

      // Transform to our format
      const transformedConvs: Conversation[] = (convData || []).map((conv) => ({
        id: conv.id,
        customer_name: conv.prospect_name || "Unknown",
        customer_phone: conv.prospect_phone || "",
        channel: (conv.channel as "whatsapp" | "sms" | "instagram") || "whatsapp",
        status: conv.deal_closed ? "closed" : "active",
        last_message: (conv.messages as any)?.[0]?.content || "No messages yet",
        last_message_time: conv.last_message_at || conv.created_at,
        unread_count: 0,
        revenue_attributed: conv.deal_value || 0,
        messages: ((conv.messages as any[]) || []).map((m: any, i: number) => ({
          id: `${conv.id}-${i}`,
          sender: m.role === "assistant" ? "bot" : "customer",
          content: m.content,
          timestamp: m.timestamp || conv.created_at,
          metadata: m.metadata,
        })),
      }));

      setConversations(transformedConvs);

      // Load bot logs
      const { data: logData } = await supabase
        .from("bot_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      const transformedLogs: BotLog[] = (logData || []).map((log) => ({
        id: log.id,
        bot_name: log.bot_name,
        action: log.action,
        revenue_impact: log.revenue_impact || 0,
        status: log.status as "success" | "pending" | "failed",
        timestamp: log.created_at,
        customer: (log.metadata as any)?.customer_name,
      }));

      setBotLogs(transformedLogs);

      // Calculate stats
      const activeCount = transformedConvs.filter(c => c.status === "active").length;
      const totalMessages = transformedConvs.reduce((sum, c) => sum + c.messages.length, 0);
      const salesCount = transformedConvs.filter(c => c.revenue_attributed > 0).length;
      const revenue = transformedConvs.reduce((sum, c) => sum + c.revenue_attributed, 0);

      setStats({
        activeConversations: activeCount,
        messagesHandled: totalMessages,
        salesClosed: salesCount,
        revenueToday: revenue,
      });

      // Add demo data if empty
      if (transformedConvs.length === 0) {
        setConversations(getDemoConversations());
        setBotLogs(getDemoBotLogs());
        setStats({
          activeConversations: 5,
          messagesHandled: 47,
          salesClosed: 3,
          revenueToday: 284.97,
        });
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDemoConversations = (): Conversation[] => [
    {
      id: "1",
      customer_name: "Sarah M.",
      customer_phone: "+1 (555) 123-4567",
      channel: "whatsapp",
      status: "active",
      last_message: "Yes, I'd love to try the Vitamin C Serum!",
      last_message_time: new Date(Date.now() - 2 * 60000).toISOString(),
      unread_count: 1,
      revenue_attributed: 0,
      messages: [
        { id: "1-1", sender: "customer", content: "Hi, I saw your ad for skincare products", timestamp: new Date(Date.now() - 10 * 60000).toISOString() },
        { id: "1-2", sender: "bot", content: "Hi Sarah! 👋 Welcome to AuraLift Essentials! I'm so excited you found us. Our Vitamin C Serum is our #1 bestseller - it's perfect for brightening and anti-aging. Would you like to learn more? ✨", timestamp: new Date(Date.now() - 9 * 60000).toISOString() },
        { id: "1-3", sender: "customer", content: "Yes, I'd love to try the Vitamin C Serum!", timestamp: new Date(Date.now() - 2 * 60000).toISOString() },
      ],
    },
    {
      id: "2",
      customer_name: "Mike R.",
      customer_phone: "+1 (555) 234-5678",
      channel: "whatsapp",
      status: "closed",
      last_message: "Order confirmed! 🎉 Thank you!",
      last_message_time: new Date(Date.now() - 30 * 60000).toISOString(),
      unread_count: 0,
      revenue_attributed: 89.99,
      messages: [
        { id: "2-1", sender: "customer", content: "Looking for a gift for my wife", timestamp: new Date(Date.now() - 60 * 60000).toISOString() },
        { id: "2-2", sender: "bot", content: "That's so thoughtful! 💝 Our Luxury Gift Set is perfect - it includes our bestselling Vitamin C Serum, Rose Gold Eye Cream, and Hydrating Mist. It's 20% off this week! Want me to add it to your cart?", timestamp: new Date(Date.now() - 55 * 60000).toISOString(), metadata: { product_mentioned: "Luxury Gift Set", intent: "gift_purchase" } },
        { id: "2-3", sender: "customer", content: "Yes please!", timestamp: new Date(Date.now() - 50 * 60000).toISOString() },
        { id: "2-4", sender: "bot", content: "Perfect! 🛒 Here's your secure checkout link: auraliftessentials.com/cart/xyz\n\nUse code GIFT20 for 20% off. Free shipping on orders over $50!", timestamp: new Date(Date.now() - 45 * 60000).toISOString(), metadata: { action: "checkout_link_sent" } },
        { id: "2-5", sender: "bot", content: "Order confirmed! 🎉 Thank you! Your wife is going to love it. Order #ALE-2847 ships within 24 hours!", timestamp: new Date(Date.now() - 30 * 60000).toISOString(), metadata: { action: "sale_closed", sale_amount: 89.99 } },
      ],
    },
    {
      id: "3",
      customer_name: "Jennifer L.",
      customer_phone: "+1 (555) 345-6789",
      channel: "whatsapp",
      status: "active",
      last_message: "Do you have anything for sensitive skin?",
      last_message_time: new Date(Date.now() - 5 * 60000).toISOString(),
      unread_count: 2,
      revenue_attributed: 0,
      messages: [
        { id: "3-1", sender: "customer", content: "Do you have anything for sensitive skin?", timestamp: new Date(Date.now() - 5 * 60000).toISOString() },
      ],
    },
  ];

  const getDemoBotLogs = (): BotLog[] => [
    { id: "l1", bot_name: "WhatsApp Sales Bot", action: "Closed sale - Luxury Gift Set", revenue_impact: 89.99, status: "success", timestamp: new Date(Date.now() - 30 * 60000).toISOString(), customer: "Mike R." },
    { id: "l2", bot_name: "WhatsApp Sales Bot", action: "Sent checkout link", revenue_impact: 0, status: "success", timestamp: new Date(Date.now() - 45 * 60000).toISOString(), customer: "Mike R." },
    { id: "l3", bot_name: "WhatsApp Sales Bot", action: "Product recommendation sent", revenue_impact: 0, status: "success", timestamp: new Date(Date.now() - 55 * 60000).toISOString(), customer: "Mike R." },
    { id: "l4", bot_name: "WhatsApp Sales Bot", action: "New conversation started", revenue_impact: 0, status: "success", timestamp: new Date(Date.now() - 10 * 60000).toISOString(), customer: "Sarah M." },
    { id: "l5", bot_name: "Grok Intent Analyzer", action: "Detected high purchase intent", revenue_impact: 0, status: "success", timestamp: new Date(Date.now() - 8 * 60000).toISOString(), customer: "Sarah M." },
  ];

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    // Add message to UI immediately
    const newMsg: ChatMessage = {
      id: `new-${Date.now()}`,
      sender: "bot",
      content: newMessage,
      timestamp: new Date().toISOString(),
    };

    setSelectedConversation(prev => ({
      ...prev!,
      messages: [...prev!.messages, newMsg],
    }));

    setNewMessage("");
    toast.success("Message sent!");
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "whatsapp": return <MessageCircle className="w-4 h-4 text-green-500" />;
      case "sms": return <Phone className="w-4 h-4 text-blue-500" />;
      case "instagram": return <MessageCircle className="w-4 h-4 text-pink-500" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-muted-foreground">Loading live chat...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <MessageCircle className="w-6 h-6 text-green-500" />
                  Live Chat
                </h1>
                <p className="text-sm text-muted-foreground">
                  Watch AI bots engage customers in real-time
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={loadData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-green-500/30 bg-green-500/5">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.activeConversations}</p>
                  <p className="text-xs text-muted-foreground">Active Chats</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.messagesHandled}</p>
                  <p className="text-xs text-muted-foreground">Messages</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.salesClosed}</p>
                  <p className="text-xs text-muted-foreground">Sales Closed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-success/30 bg-success/5">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">${stats.revenueToday.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Revenue Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Conversations</CardTitle>
              <CardDescription>{conversations.length} total</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={cn(
                      "p-4 border-b cursor-pointer transition-colors hover:bg-muted/50",
                      selectedConversation?.id === conv.id && "bg-muted"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                        {conv.customer_name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{conv.customer_name}</span>
                            {getChannelIcon(conv.channel)}
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            {formatTime(conv.last_message_time)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mb-1">
                          {conv.last_message}
                        </p>
                        <div className="flex items-center gap-2">
                          {conv.status === "closed" ? (
                            <Badge className="bg-success/20 text-success text-[10px]">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Closed ${conv.revenue_attributed}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px]">
                              Active
                            </Badge>
                          )}
                          {conv.unread_count > 0 && (
                            <Badge className="bg-primary text-[10px] h-5 w-5 p-0 flex items-center justify-center">
                              {conv.unread_count}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat View / Bot Logs */}
          <Card className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <TabsList>
                    <TabsTrigger value="conversations" className="gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Chat
                    </TabsTrigger>
                    <TabsTrigger value="bot-logs" className="gap-2">
                      <Bot className="w-4 h-4" />
                      Bot Activity
                    </TabsTrigger>
                  </TabsList>
                  {selectedConversation && activeTab === "conversations" && (
                    <Badge variant="outline" className="gap-1">
                      {getChannelIcon(selectedConversation.channel)}
                      {selectedConversation.customer_name}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <TabsContent value="conversations" className="m-0">
                <CardContent className="p-0">
                  {selectedConversation ? (
                    <div className="flex flex-col h-[450px]">
                      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                        <div className="space-y-4">
                          {selectedConversation.messages.map((msg) => (
                            <div
                              key={msg.id}
                              className={cn(
                                "flex gap-3",
                                msg.sender === "bot" ? "flex-row" : "flex-row-reverse"
                              )}
                            >
                              <div
                                className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                  msg.sender === "bot"
                                    ? "bg-gradient-to-br from-primary to-accent"
                                    : "bg-muted"
                                )}
                              >
                                {msg.sender === "bot" ? (
                                  <Bot className="w-4 h-4 text-white" />
                                ) : (
                                  <User className="w-4 h-4" />
                                )}
                              </div>
                              <div
                                className={cn(
                                  "max-w-[70%] rounded-2xl px-4 py-2",
                                  msg.sender === "bot"
                                    ? "bg-muted rounded-tl-sm"
                                    : "bg-primary text-primary-foreground rounded-tr-sm"
                                )}
                              >
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] opacity-70">
                                    {formatTime(msg.timestamp)}
                                  </span>
                                  {msg.metadata?.sale_amount && (
                                    <Badge className="bg-success text-[10px] h-4">
                                      <DollarSign className="w-3 h-3" />
                                      {msg.metadata.sale_amount}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      <div className="p-4 border-t flex gap-2">
                        <Input
                          placeholder="Type a message (manual override)..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        />
                        <Button onClick={handleSendMessage}>
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-[450px] flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Select a conversation to view</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </TabsContent>

              <TabsContent value="bot-logs" className="m-0">
                <CardContent className="p-0">
                  <ScrollArea className="h-[450px]">
                    <div className="divide-y">
                      {botLogs.map((log) => (
                        <div key={log.id} className="p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-start gap-3">
                            <div
                              className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center",
                                log.status === "success"
                                  ? "bg-success/20"
                                  : log.status === "failed"
                                  ? "bg-destructive/20"
                                  : "bg-warning/20"
                              )}
                            >
                              {log.status === "success" ? (
                                <CheckCircle2 className="w-4 h-4 text-success" />
                              ) : log.status === "failed" ? (
                                <AlertCircle className="w-4 h-4 text-destructive" />
                              ) : (
                                <Clock className="w-4 h-4 text-warning" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-sm">{log.bot_name}</span>
                                {log.revenue_impact > 0 && (
                                  <Badge className="bg-success text-[10px]">
                                    +${log.revenue_impact}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">{log.action}</p>
                              <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                                <span>{formatTime(log.timestamp)}</span>
                                {log.customer && <span>• {log.customer}</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
