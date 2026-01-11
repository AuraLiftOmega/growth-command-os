import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Video, 
  Mic, 
  Brain, 
  CreditCard, 
  Workflow, 
  ShoppingBag,
  Target,
  Globe,
  CheckSquare,
  Github,
  Database,
  Cloud,
  Check,
  Loader2,
  ExternalLink,
  Mail
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// Revenue accounts for pre-fill
const REVENUE_ACCOUNTS = [
  { email: "ryanauralift@gmail.com", label: "Primary", isDefault: true },
  { email: "rfloweroflife@gmail.com", label: "Secondary", isDefault: false },
  { email: "gizmogadgetdenver@gmail.com", label: "Tertiary", isDefault: false },
];

interface RevenueApp {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: "video" | "ai" | "payments" | "automation" | "ecommerce" | "ads" | "domains" | "tasks" | "deploy" | "database";
  status: "connected" | "pending" | "not_connected";
  secretKey?: string;
  oauthUrl?: string;
}

const REVENUE_APPS: RevenueApp[] = [
  {
    id: "did",
    name: "D-ID",
    description: "AI video generation with realistic avatars",
    icon: Video,
    category: "video",
    status: "connected",
    secretKey: "DID_API_KEY",
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    description: "Ultra-realistic AI voice synthesis",
    icon: Mic,
    category: "ai",
    status: "connected",
    secretKey: "ELEVENLABS_API_KEY",
  },
  {
    id: "grok",
    name: "xAI Grok",
    description: "Grok CEO brain for revenue optimization",
    icon: Brain,
    category: "ai",
    status: "connected",
    secretKey: "XAI_API_KEY",
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Payment processing & subscriptions",
    icon: CreditCard,
    category: "payments",
    status: "connected",
    secretKey: "STRIPE_SECRET_KEY",
  },
  {
    id: "n8n",
    name: "n8n",
    description: "Workflow automation engine",
    icon: Workflow,
    category: "automation",
    status: "connected",
  },
  {
    id: "shopify",
    name: "Shopify",
    description: "E-commerce platform - AuraLift Essentials",
    icon: ShoppingBag,
    category: "ecommerce",
    status: "connected",
  },
  {
    id: "google_ads",
    name: "Google Ads",
    description: "Paid advertising & scaling",
    icon: Target,
    category: "ads",
    status: "connected",
    oauthUrl: "https://ads.google.com",
  },
  {
    id: "unstoppable",
    name: "Unstoppable Domains",
    description: "Web3 domain portfolio & sales",
    icon: Globe,
    category: "domains",
    status: "connected",
    oauthUrl: "https://unstoppabledomains.com",
  },
  {
    id: "clickup",
    name: "ClickUp",
    description: "Task management & project tracking",
    icon: CheckSquare,
    category: "tasks",
    status: "connected",
    secretKey: "CLICKUP_API_TOKEN",
  },
  {
    id: "github",
    name: "GitHub",
    description: "Code repository & deployments",
    icon: Github,
    category: "deploy",
    status: "connected",
  },
  {
    id: "supabase",
    name: "Supabase",
    description: "Database & authentication",
    icon: Database,
    category: "database",
    status: "connected",
  },
  {
    id: "vercel",
    name: "Vercel",
    description: "Frontend hosting & edge functions",
    icon: Cloud,
    category: "deploy",
    status: "connected",
  },
];

export function RevenueAppsGrid() {
  const { user } = useAuth();
  const [apps, setApps] = useState(REVENUE_APPS);
  const [selectedEmail, setSelectedEmail] = useState(REVENUE_ACCOUNTS[0].email);
  const [connecting, setConnecting] = useState<string | null>(null);

  const handleConnect = async (app: RevenueApp) => {
    setConnecting(app.id);
    
    try {
      if (app.oauthUrl) {
        // Open OAuth flow in new window
        window.open(`${app.oauthUrl}?email=${encodeURIComponent(selectedEmail)}`, "_blank");
        toast.info(`Opening ${app.name} OAuth...`, {
          description: `Connect with ${selectedEmail}`,
        });
      } else if (app.secretKey) {
        // Check if secret exists
        const { data } = await supabase.functions.invoke("check-secret", {
          body: { secretName: app.secretKey }
        });
        
        if (data?.exists) {
          setApps(prev => prev.map(a => 
            a.id === app.id ? { ...a, status: "connected" } : a
          ));
          toast.success(`${app.name} connected!`);
        }
      }
      
      // Save connection to database
      if (user) {
        await supabase.from("integration_tokens").upsert({
          user_id: user.id,
          integration_name: app.id,
          integration_category: app.category,
          connection_type: app.oauthUrl ? "oauth" : "api_key",
          is_connected: true,
          sync_status: "success",
          last_sync_at: new Date().toISOString(),
          metadata: { email: selectedEmail },
        });
      }
      
      // Update local state
      setApps(prev => prev.map(a => 
        a.id === app.id ? { ...a, status: "connected" } : a
      ));
      
    } catch (error) {
      console.error("Connection error:", error);
      toast.error(`Failed to connect ${app.name}`);
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (app: RevenueApp) => {
    if (user) {
      await supabase
        .from("integration_tokens")
        .delete()
        .eq("user_id", user.id)
        .eq("integration_name", app.id);
    }
    
    setApps(prev => prev.map(a => 
      a.id === app.id ? { ...a, status: "not_connected" } : a
    ));
    
    toast.info(`${app.name} disconnected`);
  };

  const connectedCount = apps.filter(a => a.status === "connected").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Revenue Apps</h2>
          <p className="text-sm text-muted-foreground">
            {connectedCount}/{apps.length} connected • 1-click OAuth with pre-filled emails
          </p>
        </div>
        
        {/* Account Selector */}
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-muted-foreground" />
          <select
            value={selectedEmail}
            onChange={(e) => setSelectedEmail(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm"
          >
            {REVENUE_ACCOUNTS.map((acc) => (
              <option key={acc.email} value={acc.email}>
                {acc.email} ({acc.label})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Apps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {apps.map((app) => {
          const Icon = app.icon;
          const isConnected = app.status === "connected";
          const isPending = app.status === "pending";
          const isConnecting = connecting === app.id;
          
          return (
            <Card 
              key={app.id}
              className={`transition-all ${
                isConnected 
                  ? "border-success/30 bg-success/5" 
                  : isPending 
                    ? "border-warning/30 bg-warning/5"
                    : "hover:border-primary/30"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isConnected 
                        ? "bg-success/20" 
                        : isPending
                          ? "bg-warning/20"
                          : "bg-muted"
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        isConnected 
                          ? "text-success" 
                          : isPending
                            ? "text-warning"
                            : "text-muted-foreground"
                      }`} />
                    </div>
                    <div>
                      <CardTitle className="text-sm">{app.name}</CardTitle>
                      <Badge 
                        variant="outline" 
                        className={`text-[9px] mt-1 ${
                          isConnected 
                            ? "border-success text-success"
                            : isPending
                              ? "border-warning text-warning"
                              : ""
                        }`}
                      >
                        {isConnected ? "Connected" : isPending ? "Pending" : "Not Connected"}
                      </Badge>
                    </div>
                  </div>
                  
                  {isConnected && (
                    <Check className="w-5 h-5 text-success" />
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-xs text-muted-foreground mb-4">{app.description}</p>
                
                <div className="flex gap-2">
                  {isConnected ? (
                    <>
                      <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => handleDisconnect(app)}>
                        Disconnect
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </>
                  ) : (
                    <Button 
                      size="sm" 
                      className="w-full text-xs"
                      onClick={() => handleConnect(app)}
                      disabled={isConnecting}
                    >
                      {isConnecting ? (
                        <Loader2 className="w-3 h-3 animate-spin mr-1" />
                      ) : null}
                      Connect with {selectedEmail.split("@")[0]}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
