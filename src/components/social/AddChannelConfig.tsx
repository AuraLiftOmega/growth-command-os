/**
 * ADD CHANNEL CONFIG - Infinite Channel Self-Integration
 * Allows users to add new channels dynamically
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Key, Globe, Loader2, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ChannelConfig {
  platform: string;
  clientId: string;
  clientSecret: string;
  redirectUri?: string;
}

const AVAILABLE_PLATFORMS = [
  { id: "amazon", name: "Amazon", icon: "📦", type: "sales" },
  { id: "etsy", name: "Etsy", icon: "🎨", type: "sales" },
  { id: "ebay", name: "eBay", icon: "🛒", type: "sales" },
  { id: "walmart", name: "Walmart", icon: "🏪", type: "sales" },
  { id: "threads", name: "Threads", icon: "🧵", type: "social" },
  { id: "snapchat", name: "Snapchat", icon: "👻", type: "social" },
  { id: "discord", name: "Discord", icon: "🎮", type: "social" },
  { id: "telegram", name: "Telegram", icon: "✈️", type: "social" },
];

export function AddChannelConfig() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [config, setConfig] = useState<ChannelConfig>({
    platform: "",
    clientId: "",
    clientSecret: "",
    redirectUri: "",
  });

  const handleAddChannel = async () => {
    if (!config.platform || !config.clientId || !config.clientSecret) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!user) {
      toast.error("Please log in first");
      return;
    }

    setIsAdding(true);
    try {
      // Store channel config in social_tokens table
      const { error } = await supabase.from("social_tokens").insert([{
        user_id: user.id,
        channel: config.platform,
        access_token_encrypted: config.clientId, // Store client ID
        refresh_token_encrypted: config.clientSecret, // Store client secret
        token_type: "oauth_config",
        expires_at: null,
        account_name: `${config.platform}_config`,
        account_id: `config_${Date.now()}`,
        is_connected: true,
      }]);

      if (error) throw error;

      setIsSuccess(true);
      toast.success(`${config.platform} channel added! Omega will auto-tailor content.`);
      
      // Reset after 2 seconds
      setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
        setConfig({ platform: "", clientId: "", clientSecret: "", redirectUri: "" });
      }, 2000);
    } catch (err) {
      console.error("Add channel error:", err);
      toast.error("Failed to add channel");
    } finally {
      setIsAdding(false);
    }
  };

  const selectedPlatform = AVAILABLE_PLATFORMS.find(p => p.id === config.platform);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-dashed">
          <Plus className="w-4 h-4" />
          Add New Channel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Add New Channel
          </DialogTitle>
          <DialogDescription>
            Add any platform with OAuth credentials. Omega will auto-tailor content for each channel.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-8 gap-4"
          >
            <div className="p-4 rounded-full bg-success/20">
              <CheckCircle2 className="w-12 h-12 text-success" />
            </div>
            <div className="text-center">
              <p className="font-medium">Channel Added Successfully!</p>
              <p className="text-sm text-muted-foreground">
                {selectedPlatform?.icon} {selectedPlatform?.name} is now connected
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Platform</Label>
              <Select
                value={config.platform}
                onValueChange={(value) => setConfig({ ...config, platform: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a platform" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_PLATFORMS.map((platform) => (
                    <SelectItem key={platform.id} value={platform.id}>
                      <div className="flex items-center gap-2">
                        <span>{platform.icon}</span>
                        <span>{platform.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({platform.type})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                Client ID / API Key
              </Label>
              <Input
                type="text"
                placeholder="Enter client ID or API key"
                value={config.clientId}
                onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                Client Secret / API Secret
              </Label>
              <Input
                type="password"
                placeholder="Enter client secret"
                value={config.clientSecret}
                onChange={(e) => setConfig({ ...config, clientSecret: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Redirect URI (optional)
              </Label>
              <Input
                type="url"
                placeholder="https://your-app.com/oauth/callback"
                value={config.redirectUri}
                onChange={(e) => setConfig({ ...config, redirectUri: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Default: {window.location.origin}/oauth/callback
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              <p className="font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Omega AI Auto-Tailor
              </p>
              <p className="text-muted-foreground mt-1">
                Once connected, Omega will automatically adapt your content for {selectedPlatform?.name || "this platform"}'s best practices, optimal posting times, and audience preferences.
              </p>
            </div>

            <Button
              onClick={handleAddChannel}
              disabled={isAdding || !config.platform || !config.clientId || !config.clientSecret}
              className="w-full"
            >
              {isAdding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding Channel...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add {selectedPlatform?.name || "Channel"}
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}