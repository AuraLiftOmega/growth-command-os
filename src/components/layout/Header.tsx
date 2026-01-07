import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  Search, 
  Bell, 
  Command,
  Plus,
  Video,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { CartDrawer } from "@/components/shopify/CartDrawer";
import { StoreSwitcher } from "@/components/shopify/StoreSwitcher";
import { useAuth } from "@/hooks/useAuth";
import { systemEventService } from "@/services/creative-service";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface Notification {
  id: string;
  title: string;
  description: string | null;
  severity: string;
  created_at: string;
  read: boolean;
}

export const Header = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadNotifications = async () => {
      if (!user) return;

      try {
        const events = await systemEventService.fetchRecentEvents(user.id, 5);
        const notifs = (events as Notification[]).map(e => ({ ...e, read: false }));
        setNotifications(notifs);
        setUnreadCount(notifs.filter(n => !n.read).length);
      } catch (error) {
        // Use demo notifications
        setNotifications([
          { id: "1", title: "Creative #47 scaled", description: "ROAS hit 4.2x threshold", severity: "info", created_at: new Date().toISOString(), read: false },
          { id: "2", title: "3 creatives auto-killed", description: "Below performance threshold", severity: "warning", created_at: new Date().toISOString(), read: false },
        ]);
        setUnreadCount(2);
      }
    };

    loadNotifications();
  }, [user]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleNewCampaign = (type: string) => {
    toast.info(`${type} creation will be available soon. Use the Video Generator panel to create content!`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast.info(`Search for "${searchQuery}" - Coming soon!`);
      setSearchQuery("");
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    return `${Math.floor(diffMins / 60)}h ago`;
  };

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="h-16 border-b border-border bg-background/80 backdrop-blur-lg flex items-center justify-between px-6 sticky top-0 z-40"
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <h2 className="font-display font-semibold text-xl">Omega Dashboard</h2>
        <div className="flex items-center gap-1 px-2 py-1 rounded bg-muted text-muted-foreground">
          <div className="status-dot status-dot-active" />
          <span className="text-xs font-medium">All systems live</span>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campaigns, creatives, products..."
            className="w-full pl-10 pr-16 py-2.5 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-muted-foreground">
            <Command className="w-3 h-3" />
            <span className="text-xs">K</span>
          </div>
        </div>
      </form>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Store Switcher */}
        <StoreSwitcher />

        <CartDrawer />
        
        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative p-2.5 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="font-medium text-sm">Notifications</span>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                  Mark all read
                </button>
              )}
            </div>
            <DropdownMenuSeparator />
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <DropdownMenuItem key={notif.id} className="flex items-start gap-3 p-3">
                  <div className={`p-1.5 rounded-lg ${
                    notif.severity === "warning" ? "bg-warning/10" : "bg-primary/10"
                  }`}>
                    {notif.severity === "warning" ? (
                      <AlertTriangle className="w-3 h-3 text-warning" />
                    ) : (
                      <TrendingUp className="w-3 h-3 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${!notif.read ? "text-foreground" : "text-muted-foreground"}`}>
                      {notif.title}
                    </p>
                    {notif.description && (
                      <p className="text-xs text-muted-foreground">{notif.description}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-1">{formatTime(notif.created_at)}</p>
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No notifications
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* New Campaign Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" />
              New Campaign
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleNewCampaign("Video Ad")}>
              <Video className="w-4 h-4 mr-2" />
              Video Ad Campaign
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNewCampaign("Comment Automation")}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Comment Automation
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNewCampaign("Scaling Campaign")}>
              <TrendingUp className="w-4 h-4 mr-2" />
              Scaling Campaign
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
};
