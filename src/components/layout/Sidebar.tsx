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
import { useState } from "react";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: string;
}

const navItems: NavItem[] = [
  { icon: <LayoutDashboard className="w-5 h-5" />, label: "Command Center", active: true },
  { icon: <Video className="w-5 h-5" />, label: "Video Generator", badge: "AI" },
  { icon: <MessageSquare className="w-5 h-5" />, label: "Inbox" },
  { icon: <BarChart3 className="w-5 h-5" />, label: "Analytics" },
  { icon: <Store className="w-5 h-5" />, label: "Products" },
  { icon: <Calendar className="w-5 h-5" />, label: "Scheduler" },
  { icon: <Users className="w-5 h-5" />, label: "Audiences" },
  { icon: <Zap className="w-5 h-5" />, label: "Automations" },
];

export const Sidebar = () => {
  const [activeIndex, setActiveIndex] = useState(0);

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
            <h1 className="font-display font-bold text-lg">Command</h1>
            <p className="text-xs text-muted-foreground">AI Commerce OS</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item, index) => (
          <motion.button
            key={item.label}
            onClick={() => setActiveIndex(index)}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              activeIndex === index
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
            }`}
          >
            <span className={activeIndex === index ? "text-primary" : ""}>
              {item.icon}
            </span>
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-primary">
                {item.badge}
              </span>
            )}
            {activeIndex === index && (
              <motion.div
                layoutId="activeIndicator"
                className="w-1 h-6 bg-primary rounded-full"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-sidebar-border">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all">
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </button>

        {/* User Card */}
        <div className="mt-4 p-4 rounded-xl bg-sidebar-accent/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-primary-foreground font-bold text-sm">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">John Doe</p>
              <p className="text-xs text-muted-foreground truncate">Premium Plan</p>
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};
