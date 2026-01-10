import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Plus,
  Search,
  Moon,
  Sun,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { DOMINION_LOGO_URL } from "@/lib/store-config";
import { ShopifySyncIndicator } from "@/components/dashboard/ShopifySyncIndicator";

interface DashboardTopNavProps {
  onCreateAd?: () => void;
}

export function DashboardTopNav({ onCreateAd }: DashboardTopNavProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(true);
  const [notifications] = useState([
    { id: 1, title: "New order received", time: "2m ago", unread: true },
    { id: 2, title: "Video ad published", time: "1h ago", unread: true },
    { id: 3, title: "Weekly report ready", time: "3h ago", unread: false },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;
  const userInitials = user?.email?.slice(0, 2).toUpperCase() || "U";

  const handleThemeToggle = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <SidebarTrigger className="lg:hidden" />
          
          {/* AURAOMEGA Logo (mobile) */}
          <img 
            src={DOMINION_LOGO_URL} 
            alt="AURAOMEGA" 
            className="h-8 w-auto lg:hidden" 
          />

          {/* Sync Status */}
          <ShopifySyncIndicator compact />

          {/* Search */}
          <div className="hidden md:flex relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products, ads, analytics..."
              className="w-[280px] lg:w-[360px] pl-10 bg-muted/50 border-border/50 focus:border-primary/50"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground bg-background px-1.5 py-0.5 rounded border border-border">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Create New Ad Button */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={onCreateAd || (() => navigate("/dashboard/video-studio"))}
              className="btn-power gap-2 hidden sm:flex"
            >
              <Sparkles className="w-4 h-4" />
              Create New Ad
            </Button>
            <Button
              onClick={onCreateAd || (() => navigate("/dashboard/video-studio"))}
              size="icon"
              className="btn-power sm:hidden"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </motion.div>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleThemeToggle}
            className="text-muted-foreground hover:text-foreground"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-muted-foreground hover:text-foreground"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="text-[10px]">
                    {unreadCount} new
                  </Badge>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex items-start gap-3 p-3 cursor-pointer"
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      notification.unread ? "bg-primary" : "bg-muted"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {notification.time}
                    </p>
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center justify-center text-primary">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="gap-2 pl-2 pr-3 h-9 hover:bg-muted/50"
              >
                <Avatar className="w-7 h-7">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-xs font-bold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden lg:block text-sm font-medium">
                  {user?.email?.split("@")[0] || "User"}
                </span>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <p className="font-medium">{user?.email?.split("@")[0]}</p>
                <p className="text-xs text-muted-foreground font-normal">
                  {user?.email}
                </p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                Account Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/pricing")}>
                Billing & Plans
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={signOut}
                className="text-destructive focus:text-destructive"
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
