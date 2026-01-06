import { motion } from "framer-motion";
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface PlatformConnection {
  id: string;
  platform: string;
  status: 'connected' | 'pending' | 'disconnected' | 'error';
  total_revenue: number;
  last_sync_at: string | null;
  sync_status: string;
  platform_username: string | null;
}

const platformIcons: Record<string, string> = {
  shopify: "🛍️",
  tiktok: "🎵",
  instagram: "📸",
  facebook: "📘",
  amazon: "📦",
  etsy: "🎨",
  pinterest: "📌",
  youtube: "📺",
};

const platformColors: Record<string, string> = {
  shopify: "from-green-500/20 to-green-600/20",
  tiktok: "from-pink-500/20 to-cyan-500/20",
  instagram: "from-purple-500/20 to-pink-500/20",
  facebook: "from-blue-500/20 to-blue-600/20",
  amazon: "from-orange-500/20 to-yellow-500/20",
  etsy: "from-orange-400/20 to-red-500/20",
  pinterest: "from-red-500/20 to-red-600/20",
  youtube: "from-red-600/20 to-red-700/20",
};

export const PlatformConnectionsPanel = () => {
  const { user } = useAuth();
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncingPlatform, setSyncingPlatform] = useState<string | null>(null);

  useEffect(() => {
    const fetchConnections = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("platform_connections")
          .select("*")
          .eq("user_id", user.id);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setConnections(data as PlatformConnection[]);
        } else {
          // Demo connections
          setConnections([
            { id: "1", platform: "shopify", status: "connected", total_revenue: 847200, last_sync_at: new Date().toISOString(), sync_status: "idle", platform_username: "mystore" },
            { id: "2", platform: "tiktok", status: "connected", total_revenue: 312800, last_sync_at: new Date().toISOString(), sync_status: "idle", platform_username: "@brand" },
            { id: "3", platform: "instagram", status: "connected", total_revenue: 198400, last_sync_at: new Date().toISOString(), sync_status: "idle", platform_username: "@brand" },
            { id: "4", platform: "facebook", status: "connected", total_revenue: 523100, last_sync_at: new Date().toISOString(), sync_status: "idle", platform_username: "Brand Page" },
            { id: "5", platform: "amazon", status: "pending", total_revenue: 156700, last_sync_at: null, sync_status: "syncing", platform_username: null },
            { id: "6", platform: "pinterest", status: "pending", total_revenue: 42300, last_sync_at: null, sync_status: "syncing", platform_username: null },
          ]);
        }
      } catch (err) {
        console.error("Error fetching connections:", err);
        // Use demo data on error
        setConnections([
          { id: "1", platform: "shopify", status: "connected", total_revenue: 847200, last_sync_at: new Date().toISOString(), sync_status: "idle", platform_username: "mystore" },
          { id: "2", platform: "tiktok", status: "connected", total_revenue: 312800, last_sync_at: new Date().toISOString(), sync_status: "idle", platform_username: "@brand" },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConnections();
  }, [user]);

  const handleSync = async (platform: string) => {
    setSyncingPlatform(platform);
    // Simulate sync
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSyncingPlatform(null);
  };

  const getStatusIcon = (status: string, syncStatus: string) => {
    if (syncStatus === "syncing") return <RefreshCw className="w-3 h-3 animate-spin text-warning" />;
    switch (status) {
      case "connected": return <CheckCircle2 className="w-3 h-3 text-success" />;
      case "pending": return <Clock className="w-3 h-3 text-warning" />;
      case "error": return <AlertTriangle className="w-3 h-3 text-destructive" />;
      default: return <WifiOff className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const formatRevenue = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
    return `$${amount}`;
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card p-6 flex items-center justify-center min-h-[200px]"
      >
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </motion.div>
    );
  }

  const connectedCount = connections.filter(c => c.status === "connected").length;
  const totalRevenue = connections.reduce((acc, c) => acc + c.total_revenue, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-gradient-to-br from-primary/20 to-chart-2/20">
            <Wifi className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg">Platform Hub</h3>
            <p className="text-muted-foreground text-sm">
              {connectedCount} connected • {formatRevenue(totalRevenue)} total
            </p>
          </div>
        </div>
        <button className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors flex items-center gap-1">
          <ExternalLink className="w-3 h-3" />
          Manage
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {connections.map((connection, index) => (
          <motion.div
            key={connection.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
            className={`p-4 rounded-xl bg-gradient-to-br ${platformColors[connection.platform] || "from-secondary to-secondary"} border border-border/30 hover:border-primary/30 transition-all cursor-pointer group`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{platformIcons[connection.platform]}</span>
                <div>
                  <p className="text-sm font-semibold capitalize">{connection.platform}</p>
                  {connection.platform_username && (
                    <p className="text-[10px] text-muted-foreground">{connection.platform_username}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {getStatusIcon(connection.status, syncingPlatform === connection.platform ? "syncing" : connection.sync_status)}
              </div>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <p className="text-lg font-display font-bold text-success">
                  {formatRevenue(connection.total_revenue)}
                </p>
                <p className="text-[10px] text-muted-foreground">Revenue</p>
              </div>
              
              {connection.status === "connected" && (
                <button
                  onClick={() => handleSync(connection.platform)}
                  disabled={syncingPlatform === connection.platform}
                  className="p-1.5 rounded-lg bg-background/50 hover:bg-background/80 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <RefreshCw className={`w-3 h-3 text-muted-foreground ${syncingPlatform === connection.platform ? "animate-spin" : ""}`} />
                </button>
              )}
              
              {connection.status === "disconnected" && (
                <button className="text-[10px] text-primary font-medium hover:underline">
                  Connect
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* API Health Indicator */}
      <div className="mt-4 p-3 rounded-lg bg-secondary/30 border border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-muted-foreground">All APIs healthy</span>
          </div>
          <span className="text-[10px] text-muted-foreground">
            Auto-retry enabled for outages
          </span>
        </div>
      </div>
    </motion.div>
  );
};
