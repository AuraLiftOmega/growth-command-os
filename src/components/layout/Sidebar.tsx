import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Settings,
  TrendingUp,
  Brain,
  Zap,
  Target,
  LogOut,
  ShoppingCart,
  CreditCard
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard", path: "/dashboard" },
  { icon: <Zap className="w-5 h-5" />, label: "OMEGA Command", path: "/omega-command" },
  { icon: <Brain className="w-5 h-5" />, label: "CEO Brain", path: "/ceo-brain" },
  { icon: <Target className="w-5 h-5" />, label: "War Room", path: "/war-room" },
  { icon: <ShoppingCart className="w-5 h-5" />, label: "Store", path: "/store", badge: "LIVE" },
  { icon: <CreditCard className="w-5 h-5" />, label: "Pricing", path: "/pricing" },
];

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const userInitials = user?.email?.slice(0, 2).toUpperCase() || "U";

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg">AURAOMEGA</h1>
            <p className="text-xs text-muted-foreground">Revenue OS</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.path);
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
                <Badge className="bg-success/20 text-success text-[10px] px-1.5 py-0">
                  {item.badge}
                </Badge>
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
      <div className="p-4 border-t border-sidebar-border space-y-3">
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
        </motion.button>

        {/* User Card */}
        <div className="p-4 rounded-xl bg-sidebar-accent/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center text-primary-foreground font-bold text-sm">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.email || "User"}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-3 h-3" />
            Sign Out
          </button>
        </div>
      </div>
    </motion.aside>
  );
};
