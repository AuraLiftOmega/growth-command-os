import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Video, 
  MessageSquare, 
  BarChart3, 
  Settings,
  Sparkles,
  Store,
  Calendar,
  Users,
  Zap
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription, PLAN_FEATURES } from "@/hooks/useSubscription";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { icon: <LayoutDashboard className="w-5 h-5" />, label: "Command Center", path: "/" },
  { icon: <Video className="w-5 h-5" />, label: "Video Generator", path: "/", badge: "AI" },
  { icon: <MessageSquare className="w-5 h-5" />, label: "Inbox", path: "/" },
  { icon: <BarChart3 className="w-5 h-5" />, label: "Analytics", path: "/" },
  { icon: <Store className="w-5 h-5" />, label: "Products", path: "/" },
  { icon: <Calendar className="w-5 h-5" />, label: "Scheduler", path: "/" },
  { icon: <Users className="w-5 h-5" />, label: "Audiences", path: "/" },
  { icon: <Zap className="w-5 h-5" />, label: "Automations", path: "/" },
];

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription, isTrialing, trialDaysLeft } = useSubscription();

  const isActive = (path: string) => {
    if (path === "/settings") return location.pathname === "/settings";
    return location.pathname === "/" && path === "/";
  };

  const planName = subscription ? PLAN_FEATURES[subscription.plan].name : "Free";
  const userInitials = user?.email?.slice(0, 2).toUpperCase() || "U";

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-50"
    >
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg">Omega</h1>
            <p className="text-xs text-muted-foreground">AI Commerce Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const active = isActive(item.path) && item.label === "Command Center";
          return (
            <motion.button
              key={item.label}
              onClick={() => navigate(item.path)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <span className={active ? "text-primary" : ""}>
                {item.icon}
              </span>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-primary">
                  {item.badge}
                </span>
              )}
              {active && (
                <motion.div
                  layoutId="activeIndicator"
                  className="w-1 h-6 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-sidebar-border">
        <motion.button 
          onClick={() => navigate("/settings")}
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
            location.pathname === "/settings"
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
          }`}
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
          {location.pathname === "/settings" && (
            <motion.div
              layoutId="activeIndicator"
              className="w-1 h-6 bg-primary rounded-full ml-auto"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </motion.button>

        {/* User Card */}
        <div className="mt-4 p-4 rounded-xl bg-sidebar-accent/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-primary-foreground font-bold text-sm">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.email || "User"}</p>
              <div className="flex items-center gap-1">
                <p className="text-xs text-muted-foreground">{planName}</p>
                {isTrialing && (
                  <Badge variant="outline" className="text-[9px] px-1 py-0">
                    {trialDaysLeft}d left
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};
