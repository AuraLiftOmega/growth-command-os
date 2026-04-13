import { useState } from "react";
import {
  Home,
  ShoppingBag,
  Video,
  Share2,
  BarChart3,
  Settings,
  LogOut,
  Brain,
  Sparkles,
  Plug,
  DollarSign,
  Truck,
  Rocket,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OmegaAIBrain } from "./OmegaAIBrain";
import { GitHubExportButton } from "./GitHubExportButton";
import { DominionLogo } from "@/components/DominionLogo";

const mainNavItems = [
  { title: "Home", icon: Home, path: "/dashboard", badge: null },
  { title: "Revenue Engine", icon: Rocket, path: "/dashboard/revenue-engine", badge: "💰" },
  { title: "Products", icon: ShoppingBag, path: "/dashboard/products", badge: "Sync" },
  { title: "CJ Dropshipping", icon: Truck, path: "/dashboard/cj-dropshipping", badge: "Source" },
  { title: "Video Ad Studio", icon: Video, path: "/dashboard/video-ad-studio", badge: null },
  { title: "Social Channels", icon: Share2, path: "/dashboard/social-channels", badge: "Live" },
  { title: "Integrations", icon: Plug, path: "/dashboard/integrations", badge: null },
  { title: "Profit Engine", icon: DollarSign, path: "/dashboard/profit-engine", badge: null },
  { title: "Analytics", icon: BarChart3, path: "/dashboard/analytics", badge: null },
  { title: "Grok CEO", icon: Brain, path: "/dashboard/super-grok-ceo", badge: "AI" },
];

export function DashboardSidebar() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [omegaOpen, setOmegaOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const userInitials = user?.email?.slice(0, 2).toUpperCase() || "U";

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <DominionLogo 
          size={collapsed ? "sm" : "md"} 
          showText={!collapsed} 
          linkTo="/dashboard" 
        />
      </SidebarHeader>

      <SidebarContent className="scrollbar-thin">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.path)}>
                    <NavLink to={item.path} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      {!collapsed && (
                        <>
                          <span className="flex-1">{item.title}</span>
                          {item.badge && (
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[9px] px-1.5 py-0 h-4",
                                item.badge === "Live"
                                  ? "border-accent text-accent"
                                  : "border-success text-success"
                              )}
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Omega AI Brain Toggle */}
        {!collapsed && (
          <SidebarGroup>
            <SidebarGroupContent>
              <Button
                variant={omegaOpen ? "default" : "outline"}
                className="w-full gap-2 justify-start"
                onClick={() => setOmegaOpen(!omegaOpen)}
              >
                <Sparkles className="w-4 h-4" />
                <span>OMEGA AI</span>
                <Badge variant="secondary" className="ml-auto text-[9px]">
                  {omegaOpen ? 'Open' : 'Ask'}
                </Badge>
              </Button>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Omega AI Brain Panel */}
      <OmegaAIBrain isExpanded={omegaOpen} onToggle={() => setOmegaOpen(false)} />
      <SidebarFooter className="border-t border-sidebar-border p-3">
        {/* GitHub Export */}
        {!collapsed && <GitHubExportButton className="w-full mb-2" />}
        
        {/* Settings */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/settings")}>
              <NavLink to="/dashboard/settings" className="flex items-center gap-3">
                <Settings className="w-4 h-4" />
                {!collapsed && <span>Settings</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* User Card */}
        {!collapsed && (
          <div className="mt-3 p-3 rounded-xl bg-sidebar-accent/50">
            <div className="flex items-center gap-3">
              <Avatar className="w-9 h-9">
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-xs font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.email?.split("@")[0] || "User"}
                </p>
                <p className="text-[10px] text-muted-foreground">Pro Plan</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-3 h-3" />
              Sign Out
            </button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
