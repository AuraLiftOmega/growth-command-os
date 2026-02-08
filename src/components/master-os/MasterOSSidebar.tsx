import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { cn } from '@/lib/utils';
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
  SidebarGroupContent, SidebarGroupLabel, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { OrgSwitcher } from './OrgSwitcher';
import {
  LayoutDashboard, Users, Briefcase, FolderKanban, Zap, Brain,
  CreditCard, Package, Settings, LogOut, Globe, Megaphone, BarChart3,
  Shield, FileText, Rocket, Layers, Target, Mail, ShoppingBag, DollarSign, Radio,
} from 'lucide-react';

const sections = [
  {
    label: 'Core',
    items: [
      { title: 'System Console', icon: LayoutDashboard, path: '/console' },
      { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
      { title: 'Settings', icon: Settings, path: '/settings/account' },
      { title: 'Billing', icon: CreditCard, path: '/settings/billing' },
      { title: 'Integrations', icon: Layers, path: '/settings/integrations' },
    ],
  },
  {
    label: 'CRM',
    items: [
      { title: 'Contacts', icon: Users, path: '/crm/contacts' },
      { title: 'Companies', icon: Briefcase, path: '/crm/companies' },
      { title: 'Deals', icon: Target, path: '/crm/deals' },
      { title: 'Pipelines', icon: BarChart3, path: '/crm/pipelines' },
    ],
  },
  {
    label: 'Projects',
    items: [
      { title: 'All Projects', icon: FolderKanban, path: '/projects' },
    ],
  },
  {
    label: 'Experiences',
    items: [
      { title: 'All Experiences', icon: Globe, path: '/experiences' },
      { title: 'New Experience', icon: Rocket, path: '/experiences/new' },
    ],
  },
  {
    label: 'Automations',
    items: [
      { title: 'All Automations', icon: Zap, path: '/automations' },
      { title: 'New Automation', icon: Zap, path: '/automations/new' },
    ],
  },
  {
    label: 'Comms',
    items: [
      { title: 'OMEGA Comms', icon: Radio, path: '/comms' },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { title: 'Brain', icon: Brain, path: '/brain' },
      { title: 'Reports', icon: FileText, path: '/brain/reports' },
    ],
  },
  {
    label: 'Commerce',
    items: [
      { title: 'Internal Products', icon: Package, path: '/products' },
      { title: 'Orders', icon: ShoppingBag, path: '/products?tab=orders' },
      { title: 'Store', icon: ShoppingBag, path: '/store' },
      { title: 'Revenue Command', icon: DollarSign, path: '/revenue-command' },
    ],
  },
  {
    label: 'Admin',
    items: [
      { title: 'Users', icon: Shield, path: '/admin/users' },
      { title: 'Organizations', icon: Briefcase, path: '/admin/organizations' },
      { title: 'Logs', icon: FileText, path: '/admin/logs' },
    ],
  },
];

export function MasterOSSidebar() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { currentRole } = useOrganization();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');
  const userInitials = user?.email?.slice(0, 2).toUpperCase() || 'U';

  // Filter admin section for non-admin users
  const visibleSections = sections.filter(s => {
    if (s.label === 'Admin') return currentRole === 'owner' || currentRole === 'admin';
    return true;
  });

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-3">
        {!collapsed ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-black text-sm">M</span>
              </div>
              <span className="font-bold text-lg tracking-tight">MASTER_OS</span>
            </div>
            <OrgSwitcher />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center mx-auto">
            <span className="text-primary-foreground font-black text-sm">M</span>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="scrollbar-thin">
        {visibleSections.map(section => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map(item => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild isActive={isActive(item.path)}>
                      <NavLink to={item.path} className="flex items-center gap-3">
                        <item.icon className="w-4 h-4" />
                        {!collapsed && <span className="flex-1">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        {!collapsed && (
          <div className="p-3 rounded-xl bg-sidebar-accent/50">
            <div className="flex items-center gap-3">
              <Avatar className="w-9 h-9">
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-xs font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.email?.split('@')[0] || 'User'}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{currentRole || 'Member'}</p>
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
