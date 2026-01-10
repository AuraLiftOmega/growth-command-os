import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, ExternalLink, Key, Loader2, RefreshCw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  connectionType: "oauth" | "api_key" | "webhook" | "native";
  isConnected: boolean;
  lastSyncAt?: string;
  syncStatus?: "idle" | "syncing" | "error" | "success";
  oauthUrl?: string;
  docsUrl?: string;
}

interface IntegrationCardProps {
  integration: Integration;
  onConnect: (integration: Integration, apiKey?: string) => Promise<void>;
  onDisconnect: (integration: Integration) => Promise<void>;
  onSync: (integration: Integration) => Promise<void>;
}

export function IntegrationCard({
  integration,
  onConnect,
  onDisconnect,
  onSync,
}: IntegrationCardProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [apiKey, setApiKey] = useState("");

  const handleConnect = async () => {
    if (integration.connectionType === "api_key") {
      setShowApiKeyDialog(true);
      return;
    }

    if (integration.connectionType === "oauth" && integration.oauthUrl) {
      window.open(integration.oauthUrl, "_blank", "width=600,height=700");
      return;
    }

    setIsConnecting(true);
    try {
      await onConnect(integration);
      toast.success(`${integration.name} connected successfully!`);
    } catch (error) {
      toast.error(`Failed to connect ${integration.name}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleApiKeySubmit = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter an API key");
      return;
    }

    setIsConnecting(true);
    try {
      await onConnect(integration, apiKey);
      toast.success(`${integration.name} connected successfully!`);
      setShowApiKeyDialog(false);
      setApiKey("");
    } catch (error) {
      toast.error(`Failed to connect ${integration.name}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsConnecting(true);
    try {
      await onDisconnect(integration);
      toast.success(`${integration.name} disconnected`);
    } catch (error) {
      toast.error(`Failed to disconnect ${integration.name}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await onSync(integration);
      toast.success(`${integration.name} synced successfully!`);
    } catch (error) {
      toast.error(`Failed to sync ${integration.name}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusBadge = () => {
    if (!integration.isConnected) {
      return (
        <Badge variant="outline" className="text-muted-foreground">
          <X className="w-3 h-3 mr-1" />
          Disconnected
        </Badge>
      );
    }

    switch (integration.syncStatus) {
      case "syncing":
        return (
          <Badge variant="secondary" className="text-warning">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Syncing
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive">
            <X className="w-3 h-3 mr-1" />
            Error
          </Badge>
        );
      case "success":
      default:
        return (
          <Badge variant="default" className="bg-success text-success-foreground">
            <Check className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        );
    }
  };

  return (
    <>
      <Card className={cn(
        "group hover:shadow-lg transition-all duration-300 border-border/50",
        integration.isConnected && "border-success/30 bg-success/5"
      )}>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl shrink-0">
              {integration.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm truncate">{integration.name}</h3>
                {getStatusBadge()}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                {integration.description}
              </p>

              {/* Last Sync */}
              {integration.isConnected && integration.lastSyncAt && (
                <p className="text-[10px] text-muted-foreground mb-2">
                  Last synced: {new Date(integration.lastSyncAt).toLocaleString()}
                </p>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                {integration.isConnected ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={handleSync}
                      disabled={isSyncing}
                    >
                      {isSyncing ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3 h-3 mr-1" />
                      )}
                      Sync
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs text-destructive hover:text-destructive"
                      onClick={handleDisconnect}
                      disabled={isConnecting}
                    >
                      Disconnect
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    className="h-7 text-xs"
                    onClick={handleConnect}
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : integration.connectionType === "api_key" ? (
                      <Key className="w-3 h-3 mr-1" />
                    ) : (
                      <ExternalLink className="w-3 h-3 mr-1" />
                    )}
                    Connect
                  </Button>
                )}

                {integration.docsUrl && (
                  <a
                    href={integration.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Docs →
                  </a>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Key Dialog */}
      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{integration.icon}</span>
              Connect {integration.name}
            </DialogTitle>
            <DialogDescription>
              Enter your {integration.name} API key to connect this integration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your API key..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            {integration.docsUrl && (
              <p className="text-xs text-muted-foreground">
                <a
                  href={integration.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Find your API key →
                </a>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApiKeyDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApiKeySubmit} disabled={isConnecting}>
              {isConnecting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Connect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
