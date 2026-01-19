import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Store, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ExternalLink,
  Key,
  Globe,
  Zap,
  ChevronDown,
  ShieldCheck
} from "lucide-react";
import { validateShopifyCredentials } from "@/lib/multi-tenant-shopify";
import { useUserStore } from "@/hooks/useUserStore";
import { useUserShopifyConnections } from "@/hooks/useUserShopifyConnections";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ConnectShopifyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConnectShopifyModal({ open, onOpenChange }: ConnectShopifyModalProps) {
  const { addStore, stores } = useUserStore();
  const { initiateOAuth } = useUserShopifyConnections();
  const [connectionMethod, setConnectionMethod] = useState<"oauth" | "manual">("oauth");
  const [step, setStep] = useState<"choose" | "oauth-input" | "manual-form" | "validating" | "success">("choose");
  const [storeDomain, setStoreDomain] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [detectedStoreName, setDetectedStoreName] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Auto-format store domain as user types
  const formatStoreDomain = (input: string): string => {
    let cleaned = input.trim().toLowerCase();
    cleaned = cleaned.replace(/^https?:\/\//, "");
    cleaned = cleaned.replace(/\/$/, "");
    cleaned = cleaned.split("/")[0];
    return cleaned;
  };

  const handleDomainChange = (value: string) => {
    const formatted = formatStoreDomain(value);
    setStoreDomain(formatted);
  };

  useEffect(() => {
    if (storeDomain.includes("http") || storeDomain.includes("/")) {
      setStoreDomain(formatStoreDomain(storeDomain));
    }
  }, [storeDomain]);

  const resetForm = () => {
    setStep("choose");
    setConnectionMethod("oauth");
    setStoreDomain("");
    setAccessToken("");
    setValidationError(null);
    setDetectedStoreName(null);
    setIsConnecting(false);
    setShowAdvanced(false);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  // One-click OAuth connection
  const handleOAuthConnect = async () => {
    if (!storeDomain) {
      setValidationError("Please enter your store domain");
      return;
    }

    if (!storeDomain.includes(".myshopify.com")) {
      setValidationError("Please use your .myshopify.com domain");
      return;
    }

    setIsConnecting(true);
    setValidationError(null);

    try {
      await initiateOAuth(storeDomain);
      // The page will redirect to Shopify for OAuth
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : "Failed to start connection");
      setIsConnecting(false);
    }
  };

  // Manual storefront token connection
  const handleManualConnect = async () => {
    if (!storeDomain || !accessToken) {
      setValidationError("Please fill in all fields");
      return;
    }

    if (!storeDomain.includes(".myshopify.com")) {
      setValidationError("Please use your .myshopify.com domain");
      return;
    }

    setStep("validating");
    setValidationError(null);

    const result = await validateShopifyCredentials(storeDomain, accessToken);

    if (!result.valid) {
      setValidationError(result.error || "Invalid credentials");
      setStep("manual-form");
      return;
    }

    try {
      await addStore({
        store_name: result.storeName || storeDomain.replace(".myshopify.com", ""),
        store_domain: storeDomain,
        storefront_access_token: accessToken,
      });

      setDetectedStoreName(result.storeName || storeDomain);
      setStep("success");
      toast.success("Store connected successfully!");
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : "Failed to save store");
      setStep("manual-form");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-600/20">
              <Store className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <DialogTitle className="text-xl">Connect Shopify Store</DialogTitle>
              <DialogDescription>
                {stores.length === 0 
                  ? "Connect your first store to get started"
                  : `Add another store (${stores.length} connected)`
                }
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {/* Step 1: Choose Connection Method */}
          {step === "choose" && (
            <motion.div
              key="choose"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4 py-4"
            >
              {/* Store Domain Input - Always shown first */}
              <div className="space-y-2">
                <Label className="font-medium">Your Shopify Store URL</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="yourstore.myshopify.com"
                    value={storeDomain}
                    onChange={(e) => handleDomainChange(e.target.value)}
                    className="pl-10 bg-secondary/50"
                    autoFocus
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Use your <strong>.myshopify.com</strong> URL, not a custom domain
                </p>
              </div>

              {/* One-Click OAuth Button - Primary */}
              <Button
                onClick={handleOAuthConnect}
                disabled={!storeDomain.includes(".myshopify.com") || isConnecting}
                className="w-full h-14 text-base gap-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                {isConnecting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Connect with One-Click
                  </>
                )}
              </Button>

              <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Secure OAuth 2.0 connection • Full API access</span>
              </div>

              {validationError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-destructive">{validationError}</span>
                </motion.div>
              )}

              {/* Advanced: Manual Token */}
              <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
                    <ChevronDown className={`w-4 h-4 mr-2 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                    Advanced: Use Storefront Token
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-4">
                  <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-3">
                      If you can't use OAuth, you can manually enter a Storefront Access Token.
                      This provides limited API access (read-only products, checkout creation).
                    </p>
                    <div className="space-y-2">
                      <Label className="text-xs">Storefront Access Token</Label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="Paste token here"
                          value={accessToken}
                          onChange={(e) => setAccessToken(e.target.value.trim())}
                          className="pl-10 bg-background font-mono text-xs"
                        />
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                      onClick={handleManualConnect}
                      disabled={!storeDomain || !accessToken}
                    >
                      <Key className="w-4 h-4 mr-2" />
                      Connect with Token
                    </Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}

          {step === "validating" && (
            <motion.div
              key="validating"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="py-12 text-center"
            >
              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
              <p className="text-lg font-medium">Connecting to your store...</p>
              <p className="text-sm text-muted-foreground">Validating credentials</p>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              className="py-8 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Store Connected!</h3>
              <p className="text-muted-foreground mb-6">
                <strong>{detectedStoreName}</strong> is now connected
              </p>
              <Button onClick={handleClose}>
                Continue to Dashboard
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}