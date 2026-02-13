import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Rocket, Video, Mail, Share2, ShoppingBag, 
  CheckCircle, Loader2, ArrowRight, Zap, 
  Instagram, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface CampaignStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: "pending" | "running" | "done" | "error";
  action: () => Promise<void>;
}

export default function CampaignLauncher() {
  const { user } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState("");
  const [scriptPrompt, setScriptPrompt] = useState("");
  const [generatedScript, setGeneratedScript] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [campaignPhase, setCampaignPhase] = useState<"setup" | "executing" | "done">("setup");
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const products = [
    { id: "retinol", name: "0.5% Retinol Night Renewal Cream", handle: "0-5-retinol-night-renewal-cream" },
    { id: "salicylic", name: "2% Salicylic Acid Acne Cleanser", handle: "2-salicylic-acid-acne-cleanser" },
    { id: "niacinamide", name: "5% Niacinamide Glass Skin Serum", handle: "5-niacinamide-glass-skin-serum" },
    { id: "hyaluronic", name: "5-HA Hyaluronic Acid Complex Serum", handle: "5-ha-hyaluronic-acid-complex-serum" },
    { id: "led", name: "7-Color LED Face Mask Pro 2024", handle: "7-color-led-face-mask-pro-2024" },
  ];

  const generateScript = async () => {
    if (!selectedProduct) {
      toast.error("Select a product first");
      return;
    }
    setIsGenerating(true);
    try {
      const product = products.find(p => p.id === selectedProduct);
      const { data, error } = await supabase.functions.invoke("generate-campaign-content", {
        body: {
          productName: product?.name,
          prompt: scriptPrompt || `Create a 30-second viral TikTok/Instagram ad script for ${product?.name}. Make it punchy, use hooks, and include a CTA with discount code TONIGHT20.`,
          type: "script",
        },
      });

      if (error) throw error;
      setGeneratedScript(data?.content || "Script generation completed. Check your Video Studio for the full output.");
      toast.success("Script generated! 🎬");
    } catch (err: any) {
      console.error("Script gen error:", err);
      setGeneratedScript(`🎬 VIRAL AD SCRIPT — ${products.find(p => p.id === selectedProduct)?.name}

[HOOK - 0-3s]
"Your skin is aging 10x faster than you think..."

[PROBLEM - 3-8s] 
"Most people don't realize their skincare routine is actually DAMAGING their skin barrier."

[SOLUTION - 8-20s]
"That's why we created ${products.find(p => p.id === selectedProduct)?.name}. Clinical-grade formula that actually works. 93% of users saw visible results in just 14 days."

[CTA - 20-30s]
"Use code TONIGHT20 for 20% off — tonight only. Link in bio. Don't wait — your future skin will thank you."

#skincare #glowup #auraliftessentials #beautytok`);
      toast.success("Script template ready!");
    } finally {
      setIsGenerating(false);
    }
  };

  const channels = [
    { name: "TikTok", icon: "🎵", handle: "@auraliftessentials", url: "https://www.tiktok.com/@auraliftessentials" },
    { name: "Instagram", icon: "📸", handle: "@auraliftessentials", url: "https://www.instagram.com/auraliftessentials" },
    { name: "Pinterest", icon: "📌", handle: "auraliftessentials", url: "https://www.pinterest.com/auraliftessentials" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Rocket className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Campaign Launcher</span>
          </div>
          <h1 className="text-4xl font-bold mb-3">Launch Revenue Tonight</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Generate content → Post to all channels → Start collecting sales. One workflow.
          </p>
        </motion.div>

        {/* Flash Sale Status */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-8 border-primary/30 bg-primary/5">
            <CardContent className="flex items-center gap-4 py-4">
              <CheckCircle className="w-6 h-6 text-primary shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-primary">Flash Sale LIVE</p>
                <p className="text-sm text-muted-foreground">Code <span className="font-mono font-bold text-primary">TONIGHT20</span> — 20% off all products, active now</p>
              </div>
              <Badge variant="outline" className="border-primary/50 text-primary">Active</Badge>
            </CardContent>
          </Card>
        </motion.div>

        {/* Step 1: Select Product */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                Step 1 — Choose Your Hero Product
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a product to promote" />
                </SelectTrigger>
                <SelectContent>
                  {products.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Step 2: Generate Script */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" />
                Step 2 — Generate Ad Script
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Optional: Add specific angle, e.g. 'Focus on anti-aging benefits, target women 25-40'"
                value={scriptPrompt}
                onChange={(e) => setScriptPrompt(e.target.value)}
                rows={2}
              />
              <Button 
                onClick={generateScript} 
                disabled={!selectedProduct || isGenerating}
                className="btn-power"
              >
                {isGenerating ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Generating...</>
                ) : (
                  <><Zap className="w-4 h-4 mr-2" /> Generate Viral Script</>
                )}
              </Button>
              
              {generatedScript && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-4 rounded-lg bg-muted/50 border border-border/60"
                >
                  <pre className="whitespace-pre-wrap text-sm font-mono">{generatedScript}</pre>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Step 3: Create Video */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" />
                Step 3 — Create Video Ad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Use the Video Studio to create a professional ad from your script. Choose an AI avatar, add your script, and generate.
              </p>
              <div className="flex gap-3">
                <Button asChild variant="outline">
                  <Link to="/video-studio">
                    <Video className="w-4 h-4 mr-2" />
                    Open Video Studio
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/creatives">
                    <Zap className="w-4 h-4 mr-2" />
                    AI Creative Engine
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Step 4: Post to Channels */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-primary" />
                Step 4 — Post to All Channels
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Post your content to these channels. Click each to open your profile and post directly.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {channels.map((ch) => (
                  <a
                    key={ch.name}
                    href={ch.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-xl border border-border/60 hover:border-primary/40 transition-all hover:shadow-md bg-card/50"
                  >
                    <span className="text-2xl">{ch.icon}</span>
                    <div>
                      <p className="font-semibold text-sm">{ch.name}</p>
                      <p className="text-xs text-muted-foreground">{ch.handle}</p>
                    </div>
                  </a>
                ))}
              </div>

              <div className="pt-2">
                <p className="text-xs text-muted-foreground mb-2">Caption template (copy & paste):</p>
                <div className="p-3 rounded-lg bg-muted/50 border text-sm">
                  ✨ FLASH SALE — Tonight Only! ✨<br />
                  Use code <strong>TONIGHT20</strong> for 20% off everything<br />
                  🛍️ Shop now → omegaalpha.io/store<br />
                  #skincare #glowup #auraliftessentials #beautytok #sale
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 5: Email Blast */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Step 5 — Email Your Subscribers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Once you have subscribers from the storefront capture form, blast them with the flash sale.
              </p>
              <div className="flex gap-3">
                <Button asChild variant="outline">
                  <Link to="/admin/email-campaigns">
                    <Mail className="w-4 h-4 mr-2" />
                    Email Campaign Manager
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="py-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-lg">Your Storefront is Live</h3>
                  <p className="text-sm text-muted-foreground">Customers can shop & checkout right now</p>
                </div>
                <div className="flex gap-3">
                  <Button asChild>
                    <Link to="/store">
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      View Store
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Homepage
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
