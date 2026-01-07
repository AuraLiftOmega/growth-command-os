import { motion } from "framer-motion";
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface PlatformConnection {
  id: string;
  platform: string;
  is_connected: boolean;
  health_status: 'healthy' | 'degraded' | 'disconnected' | null;
  handle: string | null;
  last_health_check: string | null;
}

const platformIcons: Record<string, string> = {
  shopify: "🛍️",
  tiktok: "🎵",
  instagram: "📸",
  facebook: "📘",
  amazon: "📦",
  pinterest: "📌",
  youtube: "📺",
};

const platformColors: Record<string, string> = {
  shopify: "from-green-500/20 to-green-600/20",
  tiktok: "from-pink-500/20 to-cyan-500/20",
  instagram: "from-purple-500/20 to-pink-500/20",
  facebook: "from-blue-500/20 to-blue-600/20",
  amazon: "from-orange-500/20 to-yellow-500/20",
  pinterest: "from-red-500/20 to-red-600/20",
  youtube: "from-red-600/20 to-red-700/20",
};

export const PlatformConnectionsPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [hasRealData, setHasRealData] = useState(false);

  useEffect(() => {
    const fetchConnections = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("platform_accounts")
          .select("id, platform, is_connected, health_status, handle, last_health_check")
          .eq("user_id", user.id);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setConnections(data as PlatformConnection[]);
          setHasRealData(true);
        } else {
          // Show Shopify as connected (we have the integration)
          // Other platforms as not connected
          setConnections([
            { id: 'shopify-default', platform: 'shopify', is_connected: true, health_status: 'healthy', handle: 'lovable-project-7fb70', last_health_check: new Date().toISOString() },
            { id: 'tiktok-default', platform: 'tiktok', is_connected: false, health_status: 'disconnected', handle: null, last_health_check: null },
            { id: 'instagram-default', platform: 'instagram', is_connected: false, health_status: 'disconnected', handle: null, last_health_check: null },
            { id: 'facebook-default', platform: 'facebook', is_connected: false, health_status: 'disconnected', handle: null, last_health_check: null },
            { id: 'youtube-default', platform: 'youtube', is_connected: false, health_status: 'disconnected', handle: null, last_health_check: null },
            { id: 'pinterest-default', platform: 'pinterest', is_connected: false, health_status: 'disconnected', handle: null, last_health_check: null },
          ]);
          setHasRealData(false);
        }
      } catch (err) {
        console.error("Error fetching connections:", err);
        setConnections([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConnections();
  }, [user]);

  const handleHealthCheck = async () => {
    if (!user) return;
    setIsChecking(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/platform-health-check`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${session.session.access_token}`,
          },
          body: JSON.stringify({ user_id: user.id }),
        }
      );

      if (response.ok) {
        toast.success('Health check completed');
        // Refetch connections
        const { data } = await supabase
          .from("platform_accounts")
          .select("id, platform, is_connected, health_status, handle, last_health_check")
          .eq("user_id", user.id);
        
        if (data && data.length > 0) {
          setConnections(data as PlatformConnection[]);
          setHasRealData(true);
        }
      }
    } catch (err) {
      console.error('Health check failed:', err);
      toast.error('Health check failed');
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusIcon = (connection: PlatformConnection) => {
    if (!connection.is_connected) return <WifiOff className="w-3 h-3 text-muted-foreground" />;
    switch (connection.health_status) {
      case "healthy": return <CheckCircle2 className="w-3 h-3 text-success" />;
      case "degraded": return <AlertTriangle className="w-3 h-3 text-warning" />;
      default: return <Clock className="w-3 h-3 text-muted-foreground" />;
    }
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

  const connectedCount = connections.filter(c => c.is_connected).length;
  const healthyCount = connections.filter(c => c.health_status === 'healthy').length;

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
              {connectedCount} connected • {healthyCount} healthy
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleHealthCheck}
            disabled={isChecking}
            className="px-3 py-1.5 rounded-lg bg-secondary text-foreground text-xs font-medium hover:bg-secondary/80 transition-colors flex items-center gap-1"
          >
            <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
            Check
          </button>
          <button 
            onClick={() => navigate("/settings")}
            className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            Manage
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {connections.map((connection, index) => (
          <motion.div
            key={connection.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
            className={`p-4 rounded-xl bg-gradient-to-br ${platformColors[connection.platform] || "from-secondary to-secondary"} border border-border/30 hover:border-primary/30 transition-all`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{platformIcons[connection.platform]}</span>
                <div>
                  <p className="text-sm font-semibold capitalize">{connection.platform}</p>
                  {connection.handle && (
                    <p className="text-[10px] text-muted-foreground">{connection.handle}</p>
                  )}
                </div>
              </div>
              {getStatusIcon(connection)}
            </div>

            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium ${
                connection.is_connected ? 'text-success' : 'text-muted-foreground'
              }`}>
                {connection.is_connected ? 'Connected' : 'Not connected'}
              </span>
              {!connection.is_connected && (
                <button 
                  onClick={() => {
                    if (connection.platform === 'shopify') {
                      navigate('/settings');
                    } else {
                      toast.info(`${connection.platform} connection coming soon`);
                    }
                  }}
                  className="text-[10px] text-primary font-medium hover:underline"
                >
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
            <div className={`w-2 h-2 rounded-full ${
              healthyCount === connectedCount ? 'bg-success animate-pulse' : 'bg-warning'
            }`} />
            <span className="text-xs text-muted-foreground">
              {healthyCount === connectedCount 
                ? 'All connected APIs healthy' 
                : `${healthyCount}/${connectedCount} APIs healthy`
              }
            </span>
          </div>
          {!hasRealData && (
            <span className="text-[10px] text-muted-foreground">
              Run health check for live status
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
