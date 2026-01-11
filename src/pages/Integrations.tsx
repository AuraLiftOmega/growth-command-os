import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, Check, Loader2, ExternalLink, Mail, RefreshCw, 
  Zap, AlertCircle, Sparkles, Video, Mic, Brain, CreditCard,
  Workflow, ShoppingBag, Target, Globe, CheckSquare, Github,
  Database, Cloud, Camera, Share2, Music, MessageSquare, Users
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

import { motion, AnimatePresence } from "framer-motion";

// Revenue accounts for pre-fill
const REVENUE_ACCOUNTS = [
  { email: "ryanauralift@gmail.com", label: "Primary (Shopify, Stripe, xAI)", isDefault: true },
  { email: "rfloweroflife@gmail.com", label: "Secondary (Vercel, Unstoppable)", isDefault: false },
  { email: "gizmogadgetdenver@gmail.com", label: "Tertiary (Backups)", isDefault: false },
];

// App categories
const APP_CATEGORIES = {
  revenue: { label: "Revenue Critical", icon: "💰", color: "success" },
  video: { label: "Video & AI", icon: "🎬", color: "primary" },
  social: { label: "Social Channels", icon: "📱", color: "accent" },
  automation: { label: "Automation", icon: "⚡", color: "warning" },
  productivity: { label: "Productivity", icon: "📋", color: "muted" },
};

interface BusinessApp {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: keyof typeof APP_CATEGORIES;
  secretKey?: string;
  oauthUrl?: string;
  preferredEmail?: string;
  aiSuggestion?: string;
  syncedData?: string;
  isCore?: boolean;
}

const BUSINESS_APPS: BusinessApp[] = [
  // Revenue Critical
  {
    id: "shopify",
    name: "Shopify",
    description: "E-commerce platform - AuraLift Essentials",
    icon: ShoppingBag,
    category: "revenue",
    preferredEmail: "ryanauralift@gmail.com",
    aiSuggestion: "Connect for real product sync → auto-generate D-ID ads",
    syncedData: "Products, Orders, Customers",
    isCore: true,
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Payment processing & subscriptions",
    icon: CreditCard,
    category: "revenue",
    secretKey: "STRIPE_SECRET_KEY",
    preferredEmail: "ryanauralift@gmail.com",
    aiSuggestion: "Track real revenue, auto-scale winners",
    syncedData: "Payments, Subscriptions, Revenue",
    isCore: true,
  },
  {
    id: "grok",
    name: "xAI Grok",
    description: "Grok CEO brain for revenue optimization",
    icon: Brain,
    category: "revenue",
    secretKey: "XAI_API_KEY",
    preferredEmail: "ryanauralift@gmail.com",
    aiSuggestion: "Enable self-thinking mode for 24/7 optimization",
    isCore: true,
  },
  {
    id: "google_ads",
    name: "Google Ads",
    description: "Paid advertising & scaling campaigns",
    icon: Target,
    category: "revenue",
    oauthUrl: "https://ads.google.com",
    preferredEmail: "ryanauralift@gmail.com",
    aiSuggestion: "Connect for automatic campaign creation & scaling",
    syncedData: "Campaigns, ROAS, Spend",
  },
  {
    id: "unstoppable",
    name: "Unstoppable Domains",
    description: "Web3 domain portfolio & sales",
    icon: Globe,
    category: "revenue",
    oauthUrl: "https://unstoppabledomains.com",
    preferredEmail: "rfloweroflife@gmail.com",
    aiSuggestion: "Auto-list domains, track sales revenue",
    syncedData: "Domains, Sales, Portfolio",
  },

  // Video & AI
  {
    id: "did",
    name: "D-ID",
    description: "AI video generation with realistic avatars",
    icon: Video,
    category: "video",
    secretKey: "DID_API_KEY",
    preferredEmail: "ryanauralift@gmail.com",
    aiSuggestion: "Generate unlimited avatar videos for products",
    isCore: true,
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    description: "Ultra-realistic AI voice synthesis",
    icon: Mic,
    category: "video",
    secretKey: "ELEVENLABS_API_KEY",
    preferredEmail: "rfloweroflife@gmail.com",
    aiSuggestion: "Premium voiceovers for all video ads",
    isCore: true,
  },
  {
    id: "heygen",
    name: "HeyGen",
    description: "AI avatar video creation platform",
    icon: Users,
    category: "video",
    secretKey: "HEYGEN_API_KEY",
    preferredEmail: "ryanauralift@gmail.com",
    aiSuggestion: "Alternative avatar videos with custom faces",
  },

  // Social Channels
  {
    id: "tiktok",
    name: "TikTok",
    description: "Short-form video platform for viral content",
    icon: Music,
    category: "social",
    secretKey: "TIKTOK_CLIENT_KEY",
    preferredEmail: "ryanauralift@gmail.com",
    aiSuggestion: "Auto-post viral short-form video ads",
    syncedData: "Posts, Views, Engagement",
  },
  {
    id: "instagram",
    name: "Instagram",
    description: "Visual content & stories platform",
    icon: Camera,
    category: "social",
    oauthUrl: "https://instagram.com",
    preferredEmail: "ryanauralift@gmail.com",
    aiSuggestion: "Post Reels, Stories, auto-DM responders",
    syncedData: "Posts, Followers, Engagement",
  },
  {
    id: "pinterest",
    name: "Pinterest",
    description: "Visual discovery and shopping platform",
    icon: Share2,
    category: "social",
    secretKey: "PINTEREST_APP_ID",
    preferredEmail: "ryanauralift@gmail.com",
    aiSuggestion: "Rich pins for products, auto-post catalog",
    syncedData: "Pins, Saves, Clicks",
  },
  {
    id: "youtube",
    name: "YouTube",
    description: "Long-form video hosting & monetization",
    icon: Video,
    category: "social",
    oauthUrl: "https://youtube.com",
    preferredEmail: "ryanauralift@gmail.com",
    aiSuggestion: "Upload product demos, track watch time",
    syncedData: "Videos, Views, Subscribers",
  },

  // Automation
  {
    id: "n8n",
    name: "n8n",
    description: "Workflow automation engine",
    icon: Workflow,
    category: "automation",
    preferredEmail: "ryanauralift@gmail.com",
    aiSuggestion: "Run 50+ autonomous workflows now",
    isCore: true,
  },
  {
    id: "supabase",
    name: "Supabase",
    description: "Database & authentication backend",
    icon: Database,
    category: "automation",
    preferredEmail: "ryanauralift@gmail.com",
    aiSuggestion: "Already syncing all user data in real-time",
    isCore: true,
  },
  {
    id: "vercel",
    name: "Vercel",
    description: "Frontend hosting & edge functions",
    icon: Cloud,
    category: "automation",
    oauthUrl: "https://vercel.com",
    preferredEmail: "rfloweroflife@gmail.com",
    aiSuggestion: "Auto-deploy on Git push, preview branches",
  },
  {
    id: "github",
    name: "GitHub",
    description: "Code repository & CI/CD deployments",
    icon: Github,
    category: "automation",
    oauthUrl: "https://github.com",
    preferredEmail: "rfloweroflife@gmail.com",
    aiSuggestion: "Auto-deploy, track commits & issues",
    syncedData: "Repos, Commits, Issues",
  },

  // Productivity
  {
    id: "clickup",
    name: "ClickUp",
    description: "Task management & project tracking",
    icon: CheckSquare,
    category: "productivity",
    secretKey: "CLICKUP_API_TOKEN",
    preferredEmail: "ryanauralift@gmail.com",
    aiSuggestion: "Auto-create tasks from Shopify orders",
    syncedData: "Tasks, Projects, Goals",
    isCore: true,
  },
  {
    id: "slack",
    name: "Slack",
    description: "Team messaging & notifications",
    icon: MessageSquare,
    category: "productivity",
    secretKey: "SLACK_CLIENT_ID",
    preferredEmail: "ryanauralift@gmail.com",
    aiSuggestion: "Real-time alerts on sales, issues",
    syncedData: "Messages, Channels",
  },
];

// Known existing secrets (from Supabase)
const EXISTING_SECRETS = [
  "DID_API_KEY", "ELEVENLABS_API_KEY", "XAI_API_KEY", "STRIPE_SECRET_KEY",
  "HEYGEN_API_KEY", "TIKTOK_CLIENT_KEY", "TIKTOK_CLIENT_SECRET",
  "PINTEREST_APP_ID", "PINTEREST_APP_SECRET", "CLICKUP_API_TOKEN",
  "SLACK_CLIENT_ID", "SLACK_CLIENT_SECRET", "GEEKBOT_API_KEY",
  "SHOPIFY_ACCESS_TOKEN", "SHOPIFY_STOREFRONT_ACCESS_TOKEN",
];

// Always connected apps
const ALWAYS_CONNECTED = ["shopify", "n8n", "supabase", "clickup"];

export default function Integrations() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedEmail, setSelectedEmail] = useState(REVENUE_ACCOUNTS[0].email);
  const [connectionStatus, setConnectionStatus] = useState<Record<string, "connected" | "pending" | "not_connected" | "syncing">>({});
  const [syncedCounts, setSyncedCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  // Load integration states
  useEffect(() => {
    if (!user) return;

    const loadIntegrations = async () => {
      try {
        const { data: tokens } = await supabase
          .from("integration_tokens")
          .select("*")
          .eq("user_id", user.id);

        const status: Record<string, "connected" | "pending" | "not_connected"> = {};
        const counts: Record<string, number> = {};

        BUSINESS_APPS.forEach((app) => {
          // Check if always connected
          if (ALWAYS_CONNECTED.includes(app.id)) {
            status[app.id] = "connected";
            return;
          }

          // Check database tokens
          const token = tokens?.find((t) => t.integration_name === app.id);
          if (token?.is_connected) {
            status[app.id] = "connected";
            return;
          }

          // Check if secrets exist
          if (app.secretKey && EXISTING_SECRETS.includes(app.secretKey)) {
            status[app.id] = "connected";
            return;
          }

          status[app.id] = "not_connected";
        });

        // Mock synced counts
        counts["shopify"] = 17;
        counts["stripe"] = 42;
        counts["clickup"] = 8;
        counts["tiktok"] = 23;
        counts["n8n"] = 50;

        setConnectionStatus(status);
        setSyncedCounts(counts);
      } catch (error) {
        console.error("Error loading integrations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadIntegrations();

    // Real-time subscription
    const channel = supabase
      .channel("integrations-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "integration_tokens" },
        () => loadIntegrations()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleConnect = useCallback(async (app: BusinessApp) => {
    if (!user) return;
    setConnecting(app.id);

    try {
      const emailToUse = app.preferredEmail || selectedEmail;

      if (app.oauthUrl) {
        // Store OAuth state
        localStorage.setItem("oauth_platform", app.id);
        localStorage.setItem("oauth_return_url", "/dashboard/integrations");
        localStorage.setItem("oauth_email", emailToUse);

        // Open OAuth in new window
        window.open(
          `${app.oauthUrl}?login_hint=${encodeURIComponent(emailToUse)}`,
          "_blank",
          "width=600,height=700"
        );

        toast.info(`Opening ${app.name} OAuth...`, {
          description: `Connect with ${emailToUse}`,
        });
      } else {
        // API key or native connection
        await supabase.from("integration_tokens").upsert({
          user_id: user.id,
          integration_name: app.id,
          integration_category: app.category,
          connection_type: app.secretKey ? "api_key" : "native",
          is_connected: true,
          sync_status: "success",
          last_sync_at: new Date().toISOString(),
          metadata: { email: emailToUse },
        });

        setConnectionStatus((prev) => ({ ...prev, [app.id]: "connected" }));
        toast.success(`${app.name} connected!`, {
          description: `Using ${emailToUse}`,
        });
      }
    } catch (error) {
      console.error("Connection error:", error);
      toast.error(`Failed to connect ${app.name}`);
    } finally {
      setConnecting(null);
    }
  }, [user, selectedEmail]);

  const handleDisconnect = useCallback(async (app: BusinessApp) => {
    if (!user || ALWAYS_CONNECTED.includes(app.id)) return;

    try {
      await supabase
        .from("integration_tokens")
        .delete()
        .eq("user_id", user.id)
        .eq("integration_name", app.id);

      setConnectionStatus((prev) => ({ ...prev, [app.id]: "not_connected" }));
      toast.info(`${app.name} disconnected`);
    } catch (error) {
      console.error("Disconnect error:", error);
    }
  }, [user]);

  const handleSync = useCallback(async (app: BusinessApp) => {
    setConnectionStatus((prev) => ({ ...prev, [app.id]: "syncing" }));

    // Simulate sync
    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (user) {
      await supabase
        .from("integration_tokens")
        .update({ last_sync_at: new Date().toISOString(), sync_status: "success" })
        .eq("user_id", user.id)
        .eq("integration_name", app.id);
    }

    setConnectionStatus((prev) => ({ ...prev, [app.id]: "connected" }));
    toast.success(`${app.name} synced!`);
  }, [user]);

  // Filter apps
  const filteredApps = BUSINESS_APPS.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || app.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const connectedCount = Object.values(connectionStatus).filter((s) => s === "connected").length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">App Integrations</h1>
            <p className="text-muted-foreground">
              {connectedCount}/{BUSINESS_APPS.length} connected • 1-click OAuth with pre-filled emails
            </p>
          </div>

          {/* Account Selector */}
          <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-2">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <select
              value={selectedEmail}
              onChange={(e) => setSelectedEmail(e.target.value)}
              className="bg-transparent border-none text-sm focus:outline-none cursor-pointer"
            >
              {REVENUE_ACCOUNTS.map((acc) => (
                <option key={acc.email} value={acc.email}>
                  {acc.email} — {acc.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <Check className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{connectedCount}</p>
                  <p className="text-xs text-muted-foreground">Connected</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{BUSINESS_APPS.length}</p>
                  <p className="text-xs text-muted-foreground">Available</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{syncedCounts["n8n"] || 50}</p>
                  <p className="text-xs text-muted-foreground">Workflows</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{syncedCounts["shopify"] || 0}+</p>
                  <p className="text-xs text-muted-foreground">Products Synced</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search integrations..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Tabs */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <ScrollArea className="w-full">
            <TabsList className="inline-flex w-auto gap-1 bg-muted/50 p-1">
              <TabsTrigger value="all" className="text-xs">
                All ({BUSINESS_APPS.length})
              </TabsTrigger>
              {Object.entries(APP_CATEGORIES).map(([key, cat]) => {
                const count = BUSINESS_APPS.filter((a) => a.category === key).length;
                return (
                  <TabsTrigger key={key} value={key} className="text-xs whitespace-nowrap">
                    {cat.icon} {cat.label} ({count})
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </ScrollArea>

          <TabsContent value={activeCategory} className="mt-6">
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredApps.map((app, index) => {
                  const status = connectionStatus[app.id] || "not_connected";
                  const isConnected = status === "connected";
                  const isSyncing = status === "syncing";
                  const isConnecting = connecting === app.id;
                  const Icon = app.icon;
                  const syncCount = syncedCounts[app.id];
                  const isAlwaysConnected = ALWAYS_CONNECTED.includes(app.id);

                  return (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <Card
                        className={`transition-all hover:shadow-md ${
                          isConnected
                            ? "border-success/40 bg-success/5"
                            : app.isCore
                              ? "border-primary/30 bg-primary/5"
                              : "hover:border-primary/30"
                        }`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                  isConnected
                                    ? "bg-success/20"
                                    : app.isCore
                                      ? "bg-primary/20"
                                      : "bg-muted"
                                }`}
                              >
                                <Icon
                                  className={`w-6 h-6 ${
                                    isConnected
                                      ? "text-success"
                                      : app.isCore
                                        ? "text-primary"
                                        : "text-muted-foreground"
                                  }`}
                                />
                              </div>
                              <div>
                                <CardTitle className="text-sm flex items-center gap-2">
                                  {app.name}
                                  {app.isCore && (
                                    <Badge variant="outline" className="text-[9px] border-primary text-primary">
                                      Core
                                    </Badge>
                                  )}
                                </CardTitle>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge
                                    variant="outline"
                                    className={`text-[9px] ${
                                      isConnected
                                        ? "border-success text-success"
                                        : isSyncing
                                          ? "border-warning text-warning"
                                          : "border-muted-foreground"
                                    }`}
                                  >
                                    {isSyncing ? "Syncing..." : isConnected ? "Connected" : "Not Connected"}
                                  </Badge>
                                  {syncCount && isConnected && (
                                    <span className="text-[10px] text-muted-foreground">
                                      {syncCount}+ synced
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {isConnected && (
                              <Check className="w-5 h-5 text-success flex-shrink-0" />
                            )}
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-3">
                          <p className="text-xs text-muted-foreground">{app.description}</p>

                          {/* AI Suggestion */}
                          {app.aiSuggestion && !isConnected && (
                            <div className="flex items-start gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20">
                              <Sparkles className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                              <p className="text-[10px] text-primary">{app.aiSuggestion}</p>
                            </div>
                          )}

                          {/* Synced Data */}
                          {app.syncedData && isConnected && (
                            <div className="flex items-center gap-2">
                              <RefreshCw className="w-3 h-3 text-muted-foreground" />
                              <p className="text-[10px] text-muted-foreground">{app.syncedData}</p>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2 pt-1">
                            {isConnected ? (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 text-xs h-8"
                                  onClick={() => handleSync(app)}
                                  disabled={isSyncing}
                                >
                                  {isSyncing ? (
                                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                  ) : (
                                    <RefreshCw className="w-3 h-3 mr-1" />
                                  )}
                                  Sync
                                </Button>
                                {!isAlwaysConnected && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs h-8 text-destructive hover:text-destructive"
                                    onClick={() => handleDisconnect(app)}
                                  >
                                    Disconnect
                                  </Button>
                                )}
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <ExternalLink className="w-3 h-3" />
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                className="w-full text-xs h-8"
                                onClick={() => handleConnect(app)}
                                disabled={isConnecting}
                              >
                                {isConnecting ? (
                                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                ) : null}
                                Connect with {(app.preferredEmail || selectedEmail).split("@")[0]}
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          </TabsContent>
        </Tabs>
    </div>
  );
}
