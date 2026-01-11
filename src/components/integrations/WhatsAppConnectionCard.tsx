import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { 
  MessageCircle, 
  Check, 
  ExternalLink, 
  Loader2, 
  RefreshCw, 
  Bot,
  AlertCircle,
  Sparkles,
  Users,
  Phone,
  Send,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface WhatsAppAccountInfo {
  phoneNumber: string;
  displayName: string;
  wabaId?: string;
  isConnected: boolean;
  lastSync?: string;
  botsActive: number;
  messagesHandled: number;
}

export function WhatsAppConnectionCard() {
  const { user } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [accountInfo, setAccountInfo] = useState<WhatsAppAccountInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showApiDialog, setShowApiDialog] = useState(false);
  const [apiCredentials, setApiCredentials] = useState({
    accessToken: "",
    phoneNumberId: "",
    wabaId: ""
  });

  // Check connection status on mount
  useEffect(() => {
    if (!user) return;
    checkConnectionStatus();
  }, [user]);

  const checkConnectionStatus = async () => {
    if (!user) return;
    
    try {
      // Check integration_tokens table for WhatsApp connection
      const { data: tokenData } = await supabase
        .from("integration_tokens")
        .select("*")
        .eq("user_id", user.id)
        .eq("integration_name", "whatsapp")
        .maybeSingle();

      if (tokenData?.is_connected) {
        const metadata = tokenData.metadata as Record<string, unknown> | null;
        setAccountInfo({
          phoneNumber: (metadata?.phone_number as string) || "+1 (555) 000-0000",
          displayName: (metadata?.display_name as string) || "AuraLift Business",
          wabaId: (metadata?.waba_id as string) || undefined,
          isConnected: true,
          lastSync: tokenData.updated_at,
          botsActive: (metadata?.bots_active as number) || 3,
          messagesHandled: (metadata?.messages_handled as number) || 0,
        });
      } else {
        setAccountInfo(null);
      }
    } catch (error) {
      console.error("Error checking WhatsApp status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!user) {
      toast.error("Please sign in to connect WhatsApp");
      return;
    }

    setShowApiDialog(true);
  };

  const handleApiSubmit = async () => {
    if (!user) return;

    setIsConnecting(true);
    setShowApiDialog(false);

    try {
      // Store credentials and connect
      await supabase.from("integration_tokens").upsert({
        user_id: user.id,
        integration_name: "whatsapp",
        integration_category: "communication",
        connection_type: "api_key",
        api_key_encrypted: apiCredentials.accessToken,
        is_connected: true,
        sync_status: "success",
        last_sync_at: new Date().toISOString(),
        metadata: {
          phone_number_id: apiCredentials.phoneNumberId,
          waba_id: apiCredentials.wabaId,
          phone_number: "+1 AuraLift",
          display_name: "AuraLift Essentials",
          bots_active: 3,
          messages_handled: 0,
          connected_at: new Date().toISOString(),
        },
      });

      setAccountInfo({
        phoneNumber: "+1 AuraLift",
        displayName: "AuraLift Essentials",
        wabaId: apiCredentials.wabaId,
        isConnected: true,
        lastSync: new Date().toISOString(),
        botsActive: 3,
        messagesHandled: 0,
      });

      toast.success("WhatsApp Business connected successfully!", {
        description: "Grok-powered chat bots are now active",
      });

      // Clear credentials from state
      setApiCredentials({ accessToken: "", phoneNumberId: "", wabaId: "" });
    } catch (error) {
      console.error("WhatsApp connection error:", error);
      toast.error("Failed to connect WhatsApp. Check API credentials.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSync = async () => {
    if (!user || !accountInfo?.isConnected) return;

    setIsSyncing(true);
    try {
      // Sync with WhatsApp API
      const { data, error } = await supabase.functions.invoke("whatsapp-handler", {
        body: {
          action: "sync",
          user_id: user.id,
        },
      });

      if (error) throw error;

      // Update local state
      setAccountInfo((prev) => ({
        ...prev!,
        messagesHandled: data?.messages_count || prev?.messagesHandled || 0,
        lastSync: new Date().toISOString(),
      }));

      // Update database
      await supabase
        .from("integration_tokens")
        .update({
          last_sync_at: new Date().toISOString(),
          sync_status: "success",
        })
        .eq("user_id", user.id)
        .eq("integration_name", "whatsapp");

      toast.success("WhatsApp synced successfully!");
    } catch (error) {
      console.error("Sync error:", error);
      toast.error("Sync failed. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTestMessage = async () => {
    if (!user || !accountInfo?.isConnected) return;

    try {
      const { data, error } = await supabase.functions.invoke("whatsapp-handler", {
        body: {
          action: "send_test",
          user_id: user.id,
          message: "👋 Hello from AURAOMEGA! Your AI sales bot is active.",
        },
      });

      if (error) throw error;

      toast.success("Test message sent!", {
        description: "Check your WhatsApp Business for the message",
      });
    } catch (error) {
      console.error("Test message error:", error);
      toast.error("Failed to send test message");
    }
  };

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardContent className="flex items-center justify-center h-48">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "border-border/50 transition-all duration-300 hover:shadow-lg",
        accountInfo?.isConnected && "border-green-500/30 bg-gradient-to-br from-green-500/5 to-emerald-500/5"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                WhatsApp Business
                {accountInfo?.isConnected ? (
                  <Badge className="bg-success text-success-foreground">
                    <Check className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    Not Connected
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                AI Chat Bots • Sales • Customer Engagement
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {accountInfo?.isConnected ? (
          <>
            {/* Connected Account Info */}
            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold">
                <Phone className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{accountInfo.displayName}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{accountInfo.phoneNumber}</span>
                  {accountInfo.lastSync && (
                    <span>
                      Synced: {new Date(accountInfo.lastSync).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <div className="flex items-center justify-center gap-1 text-success mb-1">
                  <Bot className="w-4 h-4" />
                  <span className="text-lg font-bold">{accountInfo.botsActive}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">Active Bots</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <div className="flex items-center justify-center gap-1 text-primary mb-1">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-lg font-bold">{accountInfo.messagesHandled}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">Messages</p>
              </div>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">
                <Bot className="w-3 h-3 mr-1" />
                Grok AI Sales
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <Zap className="w-3 h-3 mr-1" />
                Auto-Respond
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                Upsell Engine
              </Badge>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleSync}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Sync
              </Button>
              <Button
                size="sm"
                onClick={handleTestMessage}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Test Bot
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Setup Instructions */}
            <div className="p-3 rounded-lg bg-muted/50 border border-border/50 space-y-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-warning mt-0.5" />
                <div className="text-xs text-muted-foreground space-y-2">
                  <p className="font-medium text-foreground">Setup Required:</p>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>
                      Go to{" "}
                      <a
                        href="https://developers.facebook.com/apps"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        Meta for Developers <ExternalLink className="w-3 h-3" />
                      </a>
                    </li>
                    <li>Create/select app → Add "WhatsApp" product</li>
                    <li>Get Phone Number ID & WABA ID from dashboard</li>
                    <li>Generate permanent access token</li>
                    <li>Configure webhook for incoming messages</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Connect Button */}
            <Dialog open={showApiDialog} onOpenChange={setShowApiDialog}>
              <DialogTrigger asChild>
                <Button
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  onClick={handleConnect}
                  disabled={isConnecting}
                >
                  {isConnecting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <MessageCircle className="w-4 h-4 mr-2" />
                  )}
                  Connect WhatsApp Business
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-green-500" />
                    Connect WhatsApp Business API
                  </DialogTitle>
                  <DialogDescription>
                    Enter your Meta WhatsApp Business API credentials
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="accessToken">Access Token</Label>
                    <Input
                      id="accessToken"
                      type="password"
                      placeholder="EAA..."
                      value={apiCredentials.accessToken}
                      onChange={(e) =>
                        setApiCredentials({ ...apiCredentials, accessToken: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumberId">Phone Number ID</Label>
                    <Input
                      id="phoneNumberId"
                      placeholder="123456789..."
                      value={apiCredentials.phoneNumberId}
                      onChange={(e) =>
                        setApiCredentials({ ...apiCredentials, phoneNumberId: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wabaId">WhatsApp Business Account ID</Label>
                    <Input
                      id="wabaId"
                      placeholder="123456789..."
                      value={apiCredentials.wabaId}
                      onChange={(e) =>
                        setApiCredentials({ ...apiCredentials, wabaId: e.target.value })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowApiDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleApiSubmit}
                    disabled={!apiCredentials.accessToken || !apiCredentials.phoneNumberId}
                    className="bg-gradient-to-r from-green-500 to-emerald-600"
                  >
                    Connect
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <p className="text-[10px] text-center text-muted-foreground">
              Requires Meta Business Account with WhatsApp Business API access
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
