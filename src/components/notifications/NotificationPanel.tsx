import { useState } from 'react';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bell, Check, CheckCheck, Trash2, ExternalLink,
  ShoppingCart, Zap, AlertTriangle, DollarSign, Bot,
  Mail, Shield, TrendingUp, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const CATEGORY_ICONS: Record<string, typeof Bell> = {
  system: Bell,
  revenue: DollarSign,
  order: ShoppingCart,
  automation: Zap,
  security: Shield,
  bot: Bot,
  campaign: Mail,
  alert: AlertTriangle,
  performance: TrendingUp,
};

const PRIORITY_STYLES: Record<string, string> = {
  low: 'border-l-muted-foreground/30',
  normal: 'border-l-primary/50',
  high: 'border-l-amber-500',
  critical: 'border-l-destructive',
};

export function NotificationPanel() {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, dismiss, clearAll } = useNotifications();
  const [activeTab, setActiveTab] = useState('all');

  const filtered = activeTab === 'all'
    ? notifications
    : activeTab === 'unread'
      ? notifications.filter(n => !n.read_at)
      : notifications.filter(n => n.category === activeTab);

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-pulse flex flex-col items-center gap-2">
          <Bell className="h-8 w-8 text-muted-foreground/40" />
          <span className="text-xs text-muted-foreground">Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-h-[520px]">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-[10px] h-5 px-1.5">
              {unreadCount}
            </Badge>
          )}
        </div>
        <div className="flex gap-1">
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-[11px]" onClick={markAllAsRead}>
              <CheckCheck className="h-3 w-3 mr-1" /> Read all
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-[11px] text-muted-foreground" onClick={clearAll}>
              <Trash2 className="h-3 w-3 mr-1" /> Clear
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="h-8 w-full justify-start rounded-none border-b bg-transparent px-3 gap-1">
          <TabsTrigger value="all" className="h-6 text-[11px] px-2">All</TabsTrigger>
          <TabsTrigger value="unread" className="h-6 text-[11px] px-2">Unread</TabsTrigger>
          <TabsTrigger value="revenue" className="h-6 text-[11px] px-2">Revenue</TabsTrigger>
          <TabsTrigger value="alert" className="h-6 text-[11px] px-2">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="flex-1 m-0 min-h-0">
          <ScrollArea className="h-[400px]">
            {filtered.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-10 w-10 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No notifications</p>
              </div>
            ) : (
              <div className="divide-y">
                {filtered.map(notif => (
                  <NotificationItem
                    key={notif.id}
                    notification={notif}
                    onRead={markAsRead}
                    onDismiss={dismiss}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NotificationItem({
  notification,
  onRead,
  onDismiss,
}: {
  notification: Notification;
  onRead: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const Icon = CATEGORY_ICONS[notification.category] || Bell;
  const isUnread = !notification.read_at;

  return (
    <div
      className={cn(
        'group flex gap-3 p-3 border-l-2 transition-colors cursor-pointer hover:bg-muted/50',
        PRIORITY_STYLES[notification.priority],
        isUnread ? 'bg-primary/[0.03]' : 'opacity-70'
      )}
      onClick={() => {
        if (isUnread) onRead(notification.id);
        if (notification.action_url) window.open(notification.action_url, '_blank');
      }}
    >
      <div className={cn(
        'mt-0.5 flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center',
        notification.priority === 'critical' ? 'bg-destructive/10 text-destructive' :
        notification.priority === 'high' ? 'bg-amber-500/10 text-amber-500' :
        'bg-primary/10 text-primary'
      )}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('text-sm leading-tight', isUnread && 'font-semibold')}>
            {notification.title}
          </p>
          <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            {isUnread && (
              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={(e) => { e.stopPropagation(); onRead(notification.id); }}>
                <Check className="h-3 w-3" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={(e) => { e.stopPropagation(); onDismiss(notification.id); }}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.body}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[10px] text-muted-foreground">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </span>
          {notification.action_url && (
            <span className="text-[10px] text-primary flex items-center gap-0.5">
              <ExternalLink className="h-2.5 w-2.5" /> {notification.action_label || 'View'}
            </span>
          )}
        </div>
      </div>
      {isUnread && (
        <div className="flex-shrink-0 mt-2">
          <div className="h-2 w-2 rounded-full bg-primary" />
        </div>
      )}
    </div>
  );
}
