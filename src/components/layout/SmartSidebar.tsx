import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Settings,
  TrendingUp,
  Brain,
  Zap,
  Target,
  LogOut,
  ShoppingCart,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Search,
  Pin,
  Sparkles,
  X
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  badge?: string;
  pinned?: boolean;
  keywords?: string[];
}

const navItems: NavItem[] = [
  { 
    icon: Pin, 
    label: "Pinterest Swarm", 
    path: "/omega-command", 
    badge: "HOT", 
    pinned: true,
    keywords: ["pinterest", "swarm", "pins", "video", "social"]
  },
  { 
    icon: LayoutDashboard, 
    label: "Dashboard", 
    path: "/dashboard",
    keywords: ["home", "overview", "metrics", "revenue"]
  },
  { 
    icon: Zap, 
    label: "OMEGA Command", 
    path: "/omega-command",
    keywords: ["omega", "command", "automation", "ai"]
  },
  { 
    icon: Brain, 
    label: "CEO Brain", 
    path: "/ceo-brain",
    keywords: ["ceo", "brain", "intelligence", "ai", "strategy"]
  },
  { 
    icon: Target, 
    label: "War Room", 
    path: "/war-room",
    keywords: ["war", "room", "sales", "close", "deals"]
  },
  { 
    icon: ShoppingCart, 
    label: "Store", 
    path: "/store", 
    badge: "LIVE",
    keywords: ["store", "shop", "products", "ecommerce"]
  },
  { 
    icon: CreditCard, 
    label: "Pricing", 
    path: "/pricing",
    keywords: ["pricing", "plans", "subscription", "billing"]
  },
];

export const SmartSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const userInitials = user?.email?.slice(0, 2).toUpperCase() || "U";

  // Filter nav items based on search
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return navItems;
    const query = searchQuery.toLowerCase();
    return navItems.filter(item => 
      item.label.toLowerCase().includes(query) ||
      item.keywords?.some(k => k.includes(query))
    );
  }, [searchQuery]);

  // Separate pinned and regular items
  const pinnedItems = filteredItems.filter(item => item.pinned);
  const regularItems = filteredItems.filter(item => !item.pinned);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    setSearchQuery("");
  };

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.getElementById("sidebar-search");
        searchInput?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1, width: isCollapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "fixed left-0 top-0 bottom-0 bg-sidebar border-r border-sidebar-border flex flex-col z-50",
        isCollapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Logo & Collapse Toggle */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <h1 className="font-bold text-lg">DOMINION</h1>
                  <p className="text-xs text-muted-foreground">Revenue OS</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <motion.button
            onClick={() => setIsCollapsed(!isCollapsed)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-8 h-8 rounded-lg bg-sidebar-accent/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </motion.button>
        </div>
      </div>

      {/* Global Search */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pt-4"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="sidebar-search"
                type="text"
                placeholder="Search... ⌘K"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={cn(
                  "pl-9 pr-8 h-9 bg-sidebar-accent/30 border-sidebar-border text-sm",
                  "placeholder:text-muted-foreground/60",
                  "focus:ring-1 focus:ring-primary/50 focus:border-primary/50",
                  isSearchFocused && "ring-1 ring-primary/50 border-primary/50"
                )}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed Search Icon */}
      {isCollapsed && (
        <div className="px-3 pt-4">
          <motion.button
            onClick={() => setIsCollapsed(false)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full flex items-center justify-center p-2 rounded-lg bg-sidebar-accent/30 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Search className="w-5 h-5" />
          </motion.button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
        {/* Pinned Section */}
        {pinnedItems.length > 0 && (
          <div className="mb-3">
            {!isCollapsed && (
              <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-primary" />
                <span>Pinned</span>
              </div>
            )}
            {pinnedItems.map((item) => (
              <NavButton
                key={`pinned-${item.label}`}
                item={item}
                isActive={isActive(item.path)}
                isCollapsed={isCollapsed}
                onClick={() => handleNavClick(item.path)}
                isPinned
              />
            ))}
          </div>
        )}

        {/* Regular Navigation */}
        {regularItems.length > 0 && (
          <div>
            {!isCollapsed && pinnedItems.length > 0 && (
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Navigation
              </div>
            )}
            {regularItems.map((item) => (
              <NavButton
                key={item.label}
                item={item}
                isActive={isActive(item.path)}
                isCollapsed={isCollapsed}
                onClick={() => handleNavClick(item.path)}
              />
            ))}
          </div>
        )}

        {/* No results */}
        {filteredItems.length === 0 && searchQuery && (
          <div className="px-3 py-8 text-center text-sm text-muted-foreground">
            No results for "{searchQuery}"
          </div>
        )}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        <NavButton
          item={{ icon: Settings, label: "Settings", path: "/settings", keywords: [] }}
          isActive={location.pathname === "/settings"}
          isCollapsed={isCollapsed}
          onClick={() => navigate("/settings")}
        />

        {/* User Card */}
        <div className={cn(
          "rounded-xl bg-sidebar-accent/50 transition-all",
          isCollapsed ? "p-2" : "p-3"
        )}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">
              {userInitials}
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium truncate">{user?.email || "User"}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleSignOut}
                className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-3 h-3" />
                Sign Out
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
};

// NavButton component
interface NavButtonProps {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
  isPinned?: boolean;
}

const NavButton = ({ item, isActive, isCollapsed, onClick, isPinned }: NavButtonProps) => {
  const Icon = item.icon;
  
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ x: isCollapsed ? 0 : 4 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "w-full flex items-center gap-3 rounded-lg text-sm font-medium transition-all",
        isCollapsed ? "justify-center p-3" : "px-3 py-2.5",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
        isPinned && !isActive && "border border-primary/20 bg-primary/5"
      )}
      title={isCollapsed ? item.label : undefined}
    >
      <span className={cn(
        "flex-shrink-0",
        isActive ? "text-primary" : "",
        isPinned && !isActive ? "text-primary" : ""
      )}>
        <Icon className="w-5 h-5" />
      </span>
      <AnimatePresence>
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="flex-1 text-left whitespace-nowrap"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
      {!isCollapsed && item.badge && (
        <Badge className={cn(
          "text-[10px] px-1.5 py-0",
          item.badge === "HOT" 
            ? "bg-primary/20 text-primary" 
            : "bg-success/20 text-success"
        )}>
          {item.badge}
        </Badge>
      )}
      {!isCollapsed && isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="w-1 h-5 bg-primary rounded-full"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </motion.button>
  );
};
