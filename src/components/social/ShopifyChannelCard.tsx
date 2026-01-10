/**
 * Shopify Channel Card - Premium 1-click OAuth integration for Shopify stores
 * Matches Instagram/Facebook styling with enhanced UX
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  RefreshCw,
  ShoppingBag,
  Package,
  DollarSign,
  Loader2,
  Unlink,
  Settings,
  Zap,
  Shield,
  Store,
  TrendingUp,
  Sparkles,
  Plus,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { useUserShopifyConnections, UserShopifyConnection, UserProduct } from "@/hooks/useUserShopifyConnections";
import { useAuth } from "@/hooks/useAuth";

interface ShopifyChannelCardProps {
  onStoreConnected?: () => void;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function formatCurrency(num: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function ShopifyChannelCard({ onStoreConnected }: ShopifyChannelCardProps) {
  const { user } = useAuth();
  const { 
    connections, 
    products, 
    isLoading, 
    initiateOAuth, 
    disconnectStore, 
    syncProducts,
    hasConnections,
    primaryConnection,
    totalProducts,
  } = useUserShopifyConnections();

  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [shopDomain, setShopDomain] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleConnect = async () => {
    if (!user) {
      toast.error("Please sign in to connect your Shopify store");
      return;
    }

    if (!shopDomain.trim()) {
      toast.error("Please enter your Shopify store domain");
      return;
    }

    setIsConnecting(true);
    try {
      await initiateOAuth(shopDomain);
      // Redirect happens in the hook
    } catch (err: any) {
      console.error("Shopify OAuth error:", err);
      toast.error(err.message || "Failed to connect Shopify store");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSync = async (connectionId: string) => {
    setIsSyncing(true);
    try {
      await syncProducts(connectionId);
      toast.success("Products synced successfully!");
    } catch (err) {
      toast.error("Failed to sync products");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = async (connectionId: string) => {
    try {
      await disconnectStore(connectionId);
      setShowManageModal(false);
      toast.success("Store disconnected");
    } catch (err) {
      toast.error("Failed to disconnect store");
    }
  };

  // Calculate stats from connections
  const totalRevenue = connections.reduce((sum, c) => sum + (c.total_revenue || 0), 0);
  const totalOrders = connections.reduce((sum, c) => sum + (c.orders_count || 0), 0);

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          className={`overflow-hidden transition-all duration-300 ${
            hasConnections
              ? "hover:border-success/30 hover:shadow-lg hover:shadow-success/5"
              : "hover:border-primary/30"
          }`}
        >
          <CardHeader
            className="pb-3"
            style={{
              background: `linear-gradient(135deg, #96bf4815, #5c6ac405)`,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-2xl shadow-lg">
                    🛍️
                  </div>
                  {hasConnections && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-success border-2 border-background flex items-center justify-center">
                      <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    Shopify
                    {hasConnections && (
                      <Badge variant="default" className="text-[9px] px-1.5 bg-success">
                        Connected
                      </Badge>
                    )}
                  </CardTitle>
                  {primaryConnection ? (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Store className="w-3 h-3" />
                      {primaryConnection.shop_name || primaryConnection.shop_domain}
                    </p>
                  ) : (
                    <p className="text-[10px] text-muted-foreground capitalize">
                      E-Commerce Platform
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {hasConnections && (
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-success" />
                      <span className="text-[9px] text-muted-foreground">OAuth 2.0</span>
                    </div>
                    {primaryConnection?.last_sync_at && (
                      <span className="text-[9px] text-muted-foreground">
                        Synced {new Date(primaryConnection.last_sync_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 space-y-4">
            {/* AI Suggestion Banner */}
            {!hasConnections && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-2.5 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20"
              >
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-primary mt-0.5" />
                  <div className="flex-1">
                    <span className="text-xs font-medium">AI Suggestion</span>
                    <p className="text-xs text-muted-foreground">
                      Connect Shopify for auto-product sync, AI video ads & autonomous posting
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {hasConnections ? (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                      <Package className="w-3 h-3" />
                    </div>
                    <p className="text-lg font-bold font-mono">{totalProducts}</p>
                    <p className="text-[9px] text-muted-foreground uppercase">Products</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                      <ShoppingBag className="w-3 h-3" />
                    </div>
                    <p className="text-lg font-bold font-mono text-success">{formatNumber(totalOrders)}</p>
                    <p className="text-[9px] text-muted-foreground uppercase">Orders</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                      <DollarSign className="w-3 h-3" />
                    </div>
                    <p className="text-lg font-bold font-mono">{formatCurrency(totalRevenue)}</p>
                    <p className="text-[9px] text-muted-foreground uppercase">Revenue</p>
                  </div>
                </div>

                {/* Connected Stores */}
                {connections.length > 1 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Connected Stores</span>
                      <span className="font-medium">{connections.length}</span>
                    </div>
                    <Progress value={(connections.length / 5) * 100} className="h-1.5" />
                  </div>
                )}

                {/* Features */}
                <div className="flex flex-wrap gap-1">
                  {["Products", "Orders", "Inventory", "Analytics", "Auto-Sync"].map((feature) => (
                    <Badge key={feature} variant="secondary" className="text-[9px] px-1.5">
                      {feature}
                    </Badge>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setShowManageModal(true)}
                  >
                    <Settings className="w-3 h-3 mr-1.5" />
                    Manage
                  </Button>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90"
                        onClick={() => primaryConnection && handleSync(primaryConnection.id)}
                        disabled={isSyncing}
                      >
                        {isSyncing ? (
                          <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3 h-3 mr-1.5" />
                        )}
                        Sync Products
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Pull latest products from your Shopify store</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* Add Another Store */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConnectModal(true)}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Another Store
                </Button>
              </>
            ) : (
              /* Disconnected State */
              <div className="space-y-4">
                {/* Secure OAuth Badge */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 cursor-help">
                      <Shield className="w-4 h-4 text-success" />
                      <span className="text-xs text-muted-foreground">
                        Secure OAuth login — your password stays with Shopify
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p className="text-xs">
                      We use industry-standard OAuth 2.0. Your Shopify credentials are never stored on our servers.
                    </p>
                  </TooltipContent>
                </Tooltip>

                {/* Features Preview */}
                <div className="flex flex-wrap gap-1">
                  {["Products", "Orders", "Inventory", "Analytics"].map((feature) => (
                    <Badge key={feature} variant="secondary" className="text-[9px] px-1.5 opacity-60">
                      {feature}
                    </Badge>
                  ))}
                </div>

                <Button
                  onClick={() => setShowConnectModal(true)}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 shadow-lg"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Connect Shopify Store
                </Button>
                <p className="text-[10px] text-center text-muted-foreground">
                  You'll be redirected to Shopify to authorize access
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Connect Store Modal */}
      <Dialog open={showConnectModal} onOpenChange={setShowConnectModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">🛍️</span>
              Connect Your Shopify Store
            </DialogTitle>
            <DialogDescription>
              Enter your store domain to connect via secure OAuth 2.0
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Security Info */}
            <div className="p-3 rounded-lg bg-success/10 border border-success/20">
              <div className="flex items-start gap-2">
                <Shield className="w-5 h-5 text-success mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-success">Bank-Level Security</p>
                  <p className="text-xs text-muted-foreground">
                    Your login credentials are never stored. OAuth 2.0 with PKCE ensures maximum security.
                  </p>
                </div>
              </div>
            </div>

            {/* Store Domain Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Store Domain</label>
              <div className="flex gap-2">
                <Input
                  placeholder="your-store"
                  value={shopDomain}
                  onChange={(e) => setShopDomain(e.target.value)}
                  className="flex-1"
                />
                <span className="flex items-center text-sm text-muted-foreground">.myshopify.com</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter your Shopify subdomain (e.g., "my-store" for my-store.myshopify.com)
              </p>
            </div>

            {/* What You'll Get */}
            <div className="space-y-2">
              <p className="text-sm font-medium">What you'll get:</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: Package, text: "Auto-sync products" },
                  { icon: TrendingUp, text: "Revenue analytics" },
                  { icon: Sparkles, text: "AI video ads" },
                  { icon: ShoppingBag, text: "Order tracking" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <item.icon className="w-3.5 h-3.5 text-success" />
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConnectModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConnect}
              disabled={isConnecting || !shopDomain.trim()}
              className="bg-gradient-to-r from-green-500 to-emerald-500"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  Connect Store
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Stores Modal */}
      <Dialog open={showManageModal} onOpenChange={setShowManageModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">🛍️</span>
              Manage Shopify Stores
            </DialogTitle>
            <DialogDescription>
              View and manage your connected Shopify stores
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {connections.map((connection) => (
              <div
                key={connection.id}
                className="p-4 rounded-lg border bg-muted/30"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                      <Store className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">{connection.shop_name || connection.shop_domain}</p>
                      <p className="text-xs text-muted-foreground">{connection.shop_domain}</p>
                    </div>
                  </div>
                  <Badge variant="default" className="bg-success text-[10px]">
                    Active
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-lg font-bold">{connection.products_count || 0}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Products</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{connection.orders_count || 0}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Orders</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{formatCurrency(connection.total_revenue || 0)}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Revenue</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleSync(connection.id)}
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
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDisconnect(connection.id)}
                  >
                    <Unlink className="w-3 h-3 mr-1" />
                    Disconnect
                  </Button>
                </div>
              </div>
            ))}

            {/* Add Another Store Button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setShowManageModal(false);
                setShowConnectModal(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Another Store
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
