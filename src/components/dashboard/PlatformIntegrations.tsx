import { motion } from "framer-motion";
import { 
  ShoppingBag, 
  Play, 
  Instagram, 
  Facebook, 
  ShoppingCart,
  Palette,
  Image
} from "lucide-react";

interface Platform {
  id: string;
  name: string;
  icon: React.ReactNode;
  status: "connected" | "pending" | "disconnected";
  revenue?: string;
  roas?: string;
}

const platforms: Platform[] = [
  {
    id: "shopify",
    name: "Shopify",
    icon: <ShoppingBag className="w-5 h-5" />,
    status: "connected",
    revenue: "$847.2K",
    roas: "4.2x",
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: <Play className="w-5 h-5" />,
    status: "connected",
    revenue: "$312.8K",
    roas: "5.1x",
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: <Instagram className="w-5 h-5" />,
    status: "connected",
    revenue: "$198.4K",
    roas: "3.8x",
  },
  {
    id: "facebook",
    name: "Meta Ads",
    icon: <Facebook className="w-5 h-5" />,
    status: "connected",
    revenue: "$523.1K",
    roas: "3.2x",
  },
  {
    id: "amazon",
    name: "Amazon",
    icon: <ShoppingCart className="w-5 h-5" />,
    status: "pending",
    revenue: "$156.7K",
    roas: "2.9x",
  },
  {
    id: "etsy",
    name: "Etsy",
    icon: <Palette className="w-5 h-5" />,
    status: "disconnected",
  },
  {
    id: "pinterest",
    name: "Pinterest",
    icon: <Image className="w-5 h-5" />,
    status: "pending",
    revenue: "$42.3K",
    roas: "4.7x",
  },
];

const statusStyles = {
  connected: "status-dot-active",
  pending: "status-dot-warning",
  disconnected: "status-dot-error",
};

const statusLabels = {
  connected: "Live",
  pending: "Syncing",
  disconnected: "Connect",
};

export const PlatformIntegrations = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-semibold text-lg">Platform Performance</h3>
        <button className="text-sm text-primary hover:underline">Manage</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {platforms.map((platform, index) => (
          <motion.div
            key={platform.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
            className={`p-4 rounded-lg bg-secondary/50 border border-border/50 hover:border-primary/30 transition-all cursor-pointer group ${
              platform.status === "disconnected" ? "opacity-60" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-card text-foreground">
                {platform.icon}
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`status-dot ${statusStyles[platform.status]}`} />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  {statusLabels[platform.status]}
                </span>
              </div>
            </div>
            <p className="font-medium text-sm mb-1">{platform.name}</p>
            {platform.revenue && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{platform.revenue}</span>
                <span className="text-success">{platform.roas}</span>
              </div>
            )}
            {platform.status === "disconnected" && (
              <button className="mt-2 text-xs text-primary hover:underline">
                + Connect
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
