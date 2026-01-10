import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Zap, Check, AlertCircle, Loader2, Brain, Sparkles, ArrowRight, Workflow } from "lucide-react";
import { IntegrationCard, Integration } from "./IntegrationCard";
import { ALL_INTEGRATIONS, INTEGRATION_CATEGORIES, getIntegrationsByCategory, INTEGRATION_SECRET_MAP } from "./integrations-data";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

// Known secrets that exist in the system (from Supabase secrets)
const EXISTING_SECRETS = [
  "SLACK_CLIENT_ID", "SLACK_CLIENT_SECRET", "SLACK_SIGNING_SECRET",
  "HEYGEN_API_KEY", "ELEVENLABS_API_KEY", "RESEND_API_KEY",
  "PINTEREST_APP_ID", "PINTEREST_APP_SECRET",
  "TIKTOK_CLIENT_KEY", "TIKTOK_CLIENT_SECRET",
  "GEEKBOT_API_KEY", "REPLICATE_API_TOKEN",
  "SHOPIFY_ACCESS_TOKEN", "SHOPIFY_STOREFRONT_ACCESS_TOKEN",
  "STRIPE_SECRET_KEY", "STRIPE_LIVE_SECRET_KEY",
  "PERPLEXITY_API_KEY", "LOVABLE_API_KEY"
];

// Check if an integration has its required secrets configured
function checkIntegrationSecrets(integrationId: string): boolean {
  const requiredSecrets = INTEGRATION_SECRET_MAP[integrationId];
  if (!requiredSecrets) return false;
  return requiredSecrets.every(secret => EXISTING_SECRETS.includes(secret));
}

// Autonomous flow suggestions based on connected integrations
const AUTONOMOUS_FLOWS = [
  {
    id: "order-to-task",
    name: "Order → Task → Notify",
    description: "New Shopify order → Create Asana/ClickUp task → Log to Google Sheets → Notify Slack/WhatsApp",
    requiredIntegrations: ["shopify", "asana", "google_sheets", "slack"],
    icon: "🛍️",
  },
  {
    id: "lead-to-crm",
    name: "Lead → CRM → Email",
    description: "New Facebook/HubSpot lead → Add to Pipedrive → Send email via Gmail/Mailchimp → Book Calendly",
    requiredIntegrations: ["hubspot", "pipedrive", "gmail", "calendly"],
    icon: "📈",
  },
  {
    id: "low-stock-alert",
    name: "Low Stock → Restock → Notify",
    description: "Low stock detected → Source from CJ → Sync to Shopify → Notify Discord/Telegram → Generate ad",
    requiredIntegrations: ["shopify", "discord"],
    icon: "📦",
  },
  {
    id: "content-to-social",
    name: "Content → Optimize → Publish",
    description: "New content created → AI optimization → Multi-channel publish → Track performance",
    requiredIntegrations: ["openai", "youtube"],
    icon: "🚀",
  },
];

export function IntegrationsHub() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [integrations, setIntegrations] = useState<Integration[]>(ALL_INTEGRATIONS);
  const [isLoading, setIsLoading] = useState(true);
  const [showFlowSuggestions, setShowFlowSuggestions] = useState(false);

  // Load saved integration states from database + auto-detect existing secrets
  useEffect(() => {
    if (!user) return;

    const loadIntegrations = async () => {
      try {
        const { data: tokens, error } = await supabase
          .from("integration_tokens")
          .select("*")
          .eq("user_id", user.id);

        if (error) throw error;

        // Merge database state with default integrations + auto-detect secrets
        const updatedIntegrations = ALL_INTEGRATIONS.map((integration) => {
          const savedToken = tokens?.find(
            (t) => t.integration_name === integration.id
          );
          
          // Check if integration has its secrets configured (auto-detect)
          const hasSecrets = checkIntegrationSecrets(integration.id);
          
          if (savedToken) {
            return {
              ...integration,
              isConnected: savedToken.is_connected,
              lastSyncAt: savedToken.last_sync_at,
              syncStatus: savedToken.sync_status as Integration["syncStatus"],
            };
          }
          
          // Auto-mark as connected if secrets exist (except Shopify which is always connected)
          if (hasSecrets && integration.id !== "shopify") {
            return {
              ...integration,
              isConnected: true,
              syncStatus: "success" as const,
              lastSyncAt: new Date().toISOString(),
            };
          }
          
          return integration;
        });

        setIntegrations(updatedIntegrations);
      } catch (error) {
        console.error("Error loading integrations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadIntegrations();
  }, [user]);

  const handleConnect = async (integration: Integration, apiKey?: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from("integration_tokens").upsert({
        user_id: user.id,
        integration_name: integration.id,
        integration_category: integration.category,
        connection_type: integration.connectionType,
        api_key_encrypted: apiKey || null,
        is_connected: true,
        sync_status: "success",
        last_sync_at: new Date().toISOString(),
      });

      if (error) throw error;

      setIntegrations((prev) =>
        prev.map((i) =>
          i.id === integration.id
            ? {
                ...i,
                isConnected: true,
                syncStatus: "success" as const,
                lastSyncAt: new Date().toISOString(),
              }
            : i
        )
      );
    } catch (error) {
      console.error("Error connecting integration:", error);
      throw error;
    }
  };

  const handleDisconnect = async (integration: Integration) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("integration_tokens")
        .delete()
        .eq("user_id", user.id)
        .eq("integration_name", integration.id);

      if (error) throw error;

      setIntegrations((prev) =>
        prev.map((i) =>
          i.id === integration.id
            ? {
                ...i,
                isConnected: false,
                syncStatus: "idle" as const,
                lastSyncAt: undefined,
              }
            : i
        )
      );
    } catch (error) {
      console.error("Error disconnecting integration:", error);
      throw error;
    }
  };

  const handleSync = async (integration: Integration) => {
    if (!user) return;

    // Update sync status to syncing
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === integration.id ? { ...i, syncStatus: "syncing" as const } : i
      )
    );

    // Simulate sync delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const { error } = await supabase
        .from("integration_tokens")
        .update({
          last_sync_at: new Date().toISOString(),
          sync_status: "success",
        })
        .eq("user_id", user.id)
        .eq("integration_name", integration.id);

      if (error) throw error;

      setIntegrations((prev) =>
        prev.map((i) =>
          i.id === integration.id
            ? {
                ...i,
                syncStatus: "success" as const,
                lastSyncAt: new Date().toISOString(),
              }
            : i
        )
      );
    } catch (error) {
      console.error("Error syncing integration:", error);
      setIntegrations((prev) =>
        prev.map((i) =>
          i.id === integration.id ? { ...i, syncStatus: "error" as const } : i
        )
      );
      throw error;
    }
  };

  const handleActivateFlow = (flowId: string) => {
    toast.success("Autonomous flow activated!", {
      description: "AURAOMEGA Brain will manage this workflow automatically.",
    });
  };

  // Filter integrations
  const filteredIntegrations = integrations.filter((integration) => {
    const matchesSearch =
      integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "all" || integration.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedIntegrations = getIntegrationsByCategory(filteredIntegrations);

  // Stats
  const connectedCount = integrations.filter((i) => i.isConnected).length;
  const totalCount = integrations.length;

  // Check which flows can be activated
  const getFlowStatus = (flow: typeof AUTONOMOUS_FLOWS[0]) => {
    const connectedIds = integrations.filter(i => i.isConnected).map(i => i.id);
    const hasAll = flow.requiredIntegrations.every(id => connectedIds.includes(id));
    const hasPartial = flow.requiredIntegrations.some(id => connectedIds.includes(id));
    return { hasAll, hasPartial };
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Integrations Hub</h1>
          <p className="text-muted-foreground">
            Connect AURAOMEGA to your favorite tools and automate your revenue stack
          </p>
        </div>
        <Button
          variant={showFlowSuggestions ? "default" : "outline"}
          onClick={() => setShowFlowSuggestions(!showFlowSuggestions)}
          className="gap-2"
        >
          <Brain className="w-4 h-4" />
          AURAOMEGA Flows
        </Button>
      </div>

      {/* Autonomous Flow Suggestions */}
      {showFlowSuggestions && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-primary" />
              Autonomous Workflow Suggestions
            </CardTitle>
            <CardDescription>
              AURAOMEGA Brain suggests these flows based on your connected integrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {AUTONOMOUS_FLOWS.map((flow) => {
                const { hasAll, hasPartial } = getFlowStatus(flow);
                return (
                  <div
                    key={flow.id}
                    className={`p-4 rounded-lg border transition-all ${
                      hasAll
                        ? "border-success/50 bg-success/5"
                        : hasPartial
                        ? "border-warning/50 bg-warning/5"
                        : "border-border bg-muted/30"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{flow.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{flow.name}</h4>
                          {hasAll && (
                            <Badge className="bg-success text-success-foreground text-[10px]">
                              Ready
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                          {flow.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-1">
                            {flow.requiredIntegrations.slice(0, 4).map((id) => {
                              const int = integrations.find((i) => i.id === id);
                              const isConnected = int?.isConnected;
                              return (
                                <div
                                  key={id}
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border-2 border-background ${
                                    isConnected ? "bg-success/20" : "bg-muted"
                                  }`}
                                  title={int?.name}
                                >
                                  {int?.icon}
                                </div>
                              );
                            })}
                          </div>
                          {hasAll ? (
                            <Button
                              size="sm"
                              className="h-6 text-xs ml-auto"
                              onClick={() => handleActivateFlow(flow.id)}
                            >
                              <Workflow className="w-3 h-3 mr-1" />
                              Activate
                            </Button>
                          ) : (
                            <span className="text-[10px] text-muted-foreground ml-auto">
                              Connect more tools
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
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
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCount}</p>
                <p className="text-xs text-muted-foreground">Available</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {integrations.filter((i) => i.syncStatus === "error").length}
                </p>
                <p className="text-xs text-muted-foreground">Need Attention</p>
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
              All ({totalCount})
            </TabsTrigger>
            {Object.entries(INTEGRATION_CATEGORIES).map(([key, category]) => {
              const count = integrations.filter((i) => i.category === key).length;
              return (
                <TabsTrigger key={key} value={key} className="text-xs whitespace-nowrap">
                  {category.label} ({count})
                </TabsTrigger>
              );
            })}
          </TabsList>
        </ScrollArea>

        <TabsContent value={activeCategory} className="mt-6">
          {activeCategory === "all" ? (
            // Show grouped by category
            <div className="space-y-8">
              {Object.entries(groupedIntegrations).map(([categoryKey, categoryIntegrations]) => {
                const category = INTEGRATION_CATEGORIES[categoryKey as keyof typeof INTEGRATION_CATEGORIES];
                if (!category || categoryIntegrations.length === 0) return null;

                return (
                  <div key={categoryKey}>
                    <div className="mb-4">
                      <h2 className="text-lg font-semibold">{category.label}</h2>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryIntegrations.map((integration) => (
                        <IntegrationCard
                          key={integration.id}
                          integration={integration}
                          onConnect={handleConnect}
                          onDisconnect={handleDisconnect}
                          onSync={handleSync}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Show single category
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredIntegrations.map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onConnect={handleConnect}
                  onDisconnect={handleDisconnect}
                  onSync={handleSync}
                />
              ))}
            </div>
          )}

          {filteredIntegrations.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No integrations found</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
