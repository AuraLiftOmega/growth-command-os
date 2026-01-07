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
  Copy,
  Check
} from "lucide-react";
import { validateShopifyCredentials } from "@/lib/multi-tenant-shopify";
import { useUserStore } from "@/hooks/useUserStore";
import { toast } from "sonner";

interface ConnectShopifyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConnectShopifyModal({ open, onOpenChange }: ConnectShopifyModalProps) {
  const { addStore, stores } = useUserStore();
  const [step, setStep] = useState<"form" | "validating" | "success">("form");
  const [storeDomain, setStoreDomain] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [detectedStoreName, setDetectedStoreName] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Auto-format store domain as user types
  const formatStoreDomain = (input: string): string => {
    let cleaned = input.trim().toLowerCase();
    // Remove protocol
    cleaned = cleaned.replace(/^https?:\/\//, "");
    // Remove trailing slash
    cleaned = cleaned.replace(/\/$/, "");
    // Remove /admin or other paths
    cleaned = cleaned.split("/")[0];
    return cleaned;
  };

  const handleDomainChange = (value: string) => {
    const formatted = formatStoreDomain(value);
    setStoreDomain(formatted);
  };

  // Detect if user pasted a full URL and auto-format
  useEffect(() => {
    if (storeDomain.includes("http") || storeDomain.includes("/")) {
      setStoreDomain(formatStoreDomain(storeDomain));
    }
  }, [storeDomain]);

  const resetForm = () => {
    setStep("form");
    setStoreDomain("");
    setAccessToken("");
    setValidationError(null);
    setDetectedStoreName(null);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConnect = async () => {
    if (!storeDomain || !accessToken) {
      setValidationError("Please fill in all fields");
      return;
    }

    // Validate domain format
    if (!storeDomain.includes(".myshopify.com")) {
      setValidationError("Please use your .myshopify.com domain (e.g., mystore.myshopify.com)");
      return;
    }

    setStep("validating");
    setValidationError(null);

    const result = await validateShopifyCredentials(storeDomain, accessToken);

    if (!result.valid) {
      setValidationError(result.error || "Invalid credentials");
      setStep("form");
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
      setStep("form");
    }
  };

  const getAdminUrl = () => {
    if (storeDomain) {
      const storeName = storeDomain.replace(".myshopify.com", "");
      return `https://admin.shopify.com/store/${storeName}/settings/apps/development`;
    }
    return "https://admin.shopify.com";
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
                  ? "Connect your store in 2 simple steps"
                  : "Add another Shopify store"
                }
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5 py-4"
            >
              {/* Step 1: Store Domain */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
                  <Label className="font-medium">Enter your Shopify store URL</Label>
                </div>
                <div className="ml-8 space-y-2">
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="yourstore.myshopify.com"
                      value={storeDomain}
                      onChange={(e) => handleDomainChange(e.target.value)}
                      className="pl-10 bg-secondary/50"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use your <strong>.myshopify.com</strong> URL, not your custom domain
                  </p>
                </div>
              </div>

              {/* Step 2: Access Token with better instructions */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
                  <Label className="font-medium">Get your Storefront Access Token</Label>
                </div>
                <div className="ml-8 space-y-3">
                  {/* Quick guide */}
                  <div className="p-3 rounded-lg bg-secondary/50 border border-border/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Quick Setup:</span>
                      {storeDomain.includes(".myshopify.com") && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => window.open(getAdminUrl(), "_blank")}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Open Shopify Admin
                        </Button>
                      )}
                    </div>
                    <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
                      <li>Go to <strong>Settings → Apps and sales channels → Develop apps</strong></li>
                      <li>Click <strong>"Create an app"</strong> (name it anything)</li>
                      <li>Click <strong>"Configure Storefront API scopes"</strong></li>
                      <li>Check all boxes, then click <strong>Save</strong></li>
                      <li>Click <strong>"Install app"</strong>, then copy the <strong>Storefront access token</strong></li>
                    </ol>
                  </div>

                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="Paste your Storefront access token"
                      value={accessToken}
                      onChange={(e) => setAccessToken(e.target.value.trim())}
                      className="pl-10 bg-secondary/50 font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              {validationError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-sm text-destructive block">{validationError}</span>
                    {validationError.includes("Invalid") && (
                      <span className="text-xs text-muted-foreground mt-1 block">
                        Make sure you're using a Storefront token, not an Admin token
                      </span>
                    )}
                  </div>
                </motion.div>
              )}

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={handleConnect} 
                  className="flex-1"
                  disabled={!storeDomain || !accessToken}
                >
                  Connect Store
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Need help?{" "}
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={() => window.open("https://help.shopify.com/en/manual/apps/app-types/custom-apps", "_blank")}
                >
                  View Shopify's guide
                </Button>
              </p>
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
