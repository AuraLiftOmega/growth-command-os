import { useState } from "react";
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
  Globe
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

  const handleConnect = async () => {
    if (!storeDomain || !accessToken) {
      setValidationError("Please fill in all fields");
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
        store_name: result.storeName || storeDomain,
        store_domain: storeDomain.replace(/^https?:\/\//, "").replace(/\/$/, ""),
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
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
                  : "Add another Shopify store to your account"
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
              className="space-y-6 py-4"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="storeDomain" className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    Store Domain
                  </Label>
                  <Input
                    id="storeDomain"
                    placeholder="mystore.myshopify.com"
                    value={storeDomain}
                    onChange={(e) => setStoreDomain(e.target.value)}
                    className="bg-secondary/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your Shopify store URL (e.g., mystore.myshopify.com)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accessToken" className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-muted-foreground" />
                    Storefront Access Token
                  </Label>
                  <Input
                    id="accessToken"
                    type="password"
                    placeholder="shpat_xxxxxxxxxxxxxxxxxxxxx"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    className="bg-secondary/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Found in Shopify Admin → Settings → Apps → Develop apps
                  </p>
                </div>
              </div>

              {validationError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <span className="text-sm text-destructive">{validationError}</span>
                </motion.div>
              )}

              <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                <h4 className="font-medium text-sm mb-2">How to get your Storefront Access Token:</h4>
                <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Go to your Shopify Admin</li>
                  <li>Navigate to Settings → Apps and sales channels</li>
                  <li>Click "Develop apps" → "Create an app"</li>
                  <li>Enable Storefront API access</li>
                  <li>Copy the Storefront access token</li>
                </ol>
                <Button
                  variant="link"
                  size="sm"
                  className="mt-2 h-auto p-0 text-primary"
                  onClick={() => window.open("https://help.shopify.com/en/manual/apps/app-types/custom-apps", "_blank")}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View Shopify documentation
                </Button>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleConnect} className="flex-1">
                  Connect Store
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
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Store Connected!</h3>
              <p className="text-muted-foreground mb-6">
                {detectedStoreName} is now connected to your account
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
