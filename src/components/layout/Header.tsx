import { motion } from "framer-motion";
import { 
  Search, 
  Bell, 
  Command,
  Plus
} from "lucide-react";

export const Header = () => {
  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="h-16 border-b border-border bg-background/80 backdrop-blur-lg flex items-center justify-between px-6 sticky top-0 z-40"
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <h2 className="font-display font-semibold text-xl">Command Center</h2>
        <div className="flex items-center gap-1 px-2 py-1 rounded bg-muted text-muted-foreground">
          <div className="status-dot status-dot-active" />
          <span className="text-xs font-medium">All systems live</span>
        </div>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search campaigns, creatives, products..."
            className="w-full pl-10 pr-16 py-2.5 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-muted-foreground">
            <Command className="w-3 h-3" />
            <span className="text-xs">K</span>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        <button className="relative p-2.5 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
        </button>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          New Campaign
        </button>
      </div>
    </motion.header>
  );
};
