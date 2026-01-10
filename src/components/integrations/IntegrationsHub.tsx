import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Zap, Check, AlertCircle, Loader2 } from "lucide-react";
import { IntegrationCard, Integration } from "./IntegrationCard";
import { ALL_INTEGRATIONS, INTEGRATION_CATEGORIES, getIntegrationsByCategory } from "./integrations-data";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export function IntegrationsHub() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [integrations, setIntegrations] = useState<Integration[]>(ALL_INTEGRATIONS);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved integration states from database
  useEffect(() => {
    if (!user) return;

    const loadIntegrations = async () => {
      try {
        const { data: tokens, error } = await supabase
          .from("integration_tokens")
          .select("*")
          .eq("user_id", user.id);

        if (error) throw error;

        // Merge database state with default integrations
        const updatedIntegrations = ALL_INTEGRATIONS.map((integration) => {
          const savedToken = tokens?.find(
            (t) => t.integration_name === integration.id
          );
          if (savedToken) {
            return {
              ...integration,
              isConnected: savedToken.is_connected,
              lastSyncAt: savedToken.last_sync_at,
              syncStatus: savedToken.sync_status as Integration["syncStatus"],
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
      <div>
        <h1 className="text-2xl font-bold">Integrations Hub</h1>
        <p className="text-muted-foreground">
          Connect AURAOMEGA to your favorite tools and automate your revenue stack
        </p>
      </div>

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
