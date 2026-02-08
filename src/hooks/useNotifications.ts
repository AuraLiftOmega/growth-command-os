import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  title: string;
  body: string;
  icon: string;
  image_url?: string;
  action_url?: string;
  action_label?: string;
  category: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  channel: string;
  group_key?: string;
  read_at: string | null;
  dismissed_at: string | null;
  delivered_at: string;
  expires_at?: string;
  source_type?: string;
  source_id?: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .is('dismissed_at', null)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('[Notifications] Fetch error:', error);
      return;
    }

    const items = (data || []) as unknown as Notification[];
    setNotifications(items);
    setUnreadCount(items.filter(n => !n.read_at).length);
    setIsLoading(false);
  }, []);

  // Subscribe to realtime
  useEffect(() => {
    fetchNotifications();

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel(`notifications:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const newNotif = payload.new as unknown as Notification;
            console.log('[Notifications] Realtime INSERT:', newNotif.title);

            setNotifications(prev => [newNotif, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Show toast for high/critical priority
            if (newNotif.priority === 'high' || newNotif.priority === 'critical') {
              toast({
                title: newNotif.title,
                description: newNotif.body,
                variant: newNotif.priority === 'critical' ? 'destructive' : 'default',
              });
            }

            // Browser notification if permitted
            if (Notification.permission === 'granted' && document.hidden) {
              new Notification(newNotif.title, {
                body: newNotif.body,
                icon: '/icon-192.png',
                tag: newNotif.id,
              });
            }
          }
        )
        .subscribe();

      channelRef.current = channel;
    };

    setupRealtime();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [fetchNotifications, toast]);

  // Mark as read
  const markAsRead = useCallback(async (notificationId: string) => {
    const now = new Date().toISOString();
    await supabase
      .from('notifications')
      .update({ read_at: now })
      .eq('id', notificationId);

    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read_at: now } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const now = new Date().toISOString();
    await supabase
      .from('notifications')
      .update({ read_at: now })
      .eq('user_id', user.id)
      .is('read_at', null);

    setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at || now })));
    setUnreadCount(0);
  }, []);

  // Dismiss
  const dismiss = useCallback(async (notificationId: string) => {
    const now = new Date().toISOString();
    await supabase
      .from('notifications')
      .update({ dismissed_at: now })
      .eq('id', notificationId);

    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setUnreadCount(prev => {
      const was = notifications.find(n => n.id === notificationId);
      return was && !was.read_at ? Math.max(0, prev - 1) : prev;
    });
  }, [notifications]);

  // Clear all
  const clearAll = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const now = new Date().toISOString();
    await supabase
      .from('notifications')
      .update({ dismissed_at: now })
      .eq('user_id', user.id)
      .is('dismissed_at', null);

    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    dismiss,
    clearAll,
    refresh: fetchNotifications,
  };
}
