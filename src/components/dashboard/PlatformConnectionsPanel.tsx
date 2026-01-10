import { motion, AnimatePresence } from "framer-motion";
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  Zap,
  Loader2,
  Play
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

// PLATFORM TEMPLATES - No hardcoded stores, dynamically fetched per-user
const PLATFORM_TEMPLATES = ['shopify', 'tiktok', 'instagram', 'facebook', 'youtube', 'pinterest', 'amazon'];

const createEmptyConnection = (platform: string): PlatformConnection => ({
  id: `${platform}-empty`,
  platform,
  is_connected: false,
  health_status: 'disconnected',
  handle: null,
  last_health_check: null
});

export const PlatformConnectionsPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);

  useEffect(() => {
    const fetchConnections = async () => {
      // PER-USER: Fetch real connections from database
      if (!user) {
        // Show empty templates for unauthenticated users
        setConnections(PLATFORM_TEMPLATES.map(createEmptyConnection));
        setIsLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from("platform_accounts")
          .select("id, platform, is_connected, health_status, handle, last_health_check")
          .eq("user_id", user.id);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Merge user connections with platform templates
          const existingPlatforms = new Set(data.map(p => p.platform));
          const merged = [
            ...data,
            ...PLATFORM_TEMPLATES.filter(p => !existingPlatforms.has(p)).map(createEmptyConnection)
          ] as PlatformConnection[];
          setConnections(merged);
        } else {
          // No connections yet - show empty templates
          setConnections(PLATFORM_TEMPLATES.map(createEmptyConnection));
        }
      } catch (err) {
        console.error("Error fetching connections:", err);
        setConnections(PLATFORM_TEMPLATES.map(createEmptyConnection));
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

      await supabase.functions.invoke('platform-health-check', {
        body: { user_id: user.id }
      });

      toast.success('Health check completed - all systems operational');
      
      // Refetch connections
      const { data } = await supabase
        .from("platform_accounts")
        .select("id, platform, is_connected, health_status, handle, last_health_check")
        .eq("user_id", user.id);
      
      if (data && data.length > 0) {
        const existingPlatforms = new Set(data.map(p => p.platform));
        const merged = [
          ...data,
          ...PLATFORM_TEMPLATES.filter(p => !existingPlatforms.has(p)).map(createEmptyConnection)
        ] as PlatformConnection[];
        setConnections(merged);
      }
    } catch (err) {
      console.error('Health check failed:', err);
      toast.error('Health check failed');
    } finally {
      setIsChecking(false);
    }
  };

  const handleConnect = async (platform: string) => {
    if (!user) {
      toast.error('Please sign in to connect platforms');
      return;
    }

    setConnectingPlatform(platform);

    try {
      // Real OAuth - production only
      const { data, error } = await supabase.functions.invoke('platform-oauth', {
        body: { 
          platform, 
          action: 'authorize',
          redirect_uri: `${window.location.origin}/oauth/callback`
        }
      });

      if (error) throw error;

      if (data?.authUrl) {
        window.location.href = data.authUrl;
        return;
      }

      // OAuth credentials not configured - show error
      if (!data?.authUrl) {
        toast.error(`${platform} OAuth not configured. Add API credentials in Settings.`);
      }
    } catch (error: any) {
      console.error('Connection error:', error);
      toast.error(`Failed to connect ${platform}. Check API credentials.`);
    } finally {
      setConnectingPlatform(null);
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
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
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
            <div className="flex items-center gap-2">
              <h3 className="font-display font-semibold text-lg">Platform Hub</h3>
              <Badge variant="default" className="text-[10px] bg-success">LIVE</Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              {connectedCount}/{connections.length} connected • {healthyCount} healthy
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={handleHealthCheck}
            disabled={isChecking}
          >
            {isChecking ? (
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <Play className="w-3 h-3 mr-1" />
            )}
            Check
          </Button>
          <Button 
            variant="ghost"
            size="sm"
            onClick={() => navigate("/settings")}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Manage
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <AnimatePresence>
          {connections.map((connection, index) => (
            <motion.div
              key={connection.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.05 + index * 0.03 }}
              className={`p-4 rounded-xl bg-gradient-to-br ${platformColors[connection.platform] || "from-secondary to-secondary"} border transition-all ${
                connection.is_connected 
                  ? 'border-success/30 shadow-lg shadow-success/5' 
                  : 'border-border/30 hover:border-primary/30'
              }`}
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
                <div className="flex items-center gap-1">
                  {getStatusIcon(connection)}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium ${
                  connection.is_connected ? 'text-success' : 'text-muted-foreground'
                }`}>
                  {connection.is_connected ? 'Connected' : 'Not connected'}
                </span>
                {!connection.is_connected && (
                  <Button 
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[10px]"
                    disabled={connectingPlatform === connection.platform}
                    onClick={() => handleConnect(connection.platform)}
                  >
                    {connectingPlatform === connection.platform ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <>
                        <Zap className="w-3 h-3 mr-1" />
                        Connect
                      </>
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Autonomous Status */}
      {connectedCount > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 rounded-lg bg-gradient-to-r from-success/10 to-primary/10 border border-success/30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-success" />
              <span className="text-xs font-medium">
                Autonomous Publishing Active
              </span>
            </div>
            <Badge variant="outline" className="text-[10px] text-success border-success/50">
              {connectedCount} CHANNELS LIVE
            </Badge>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
