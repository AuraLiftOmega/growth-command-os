import { supabase } from '@/integrations/supabase/client';

interface SendNotificationParams {
  user_id?: string;
  user_ids?: string[];
  organization_id?: string;
  title: string;
  body: string;
  icon?: string;
  image_url?: string;
  action_url?: string;
  action_label?: string;
  category?: 'system' | 'revenue' | 'order' | 'automation' | 'security' | 'bot' | 'campaign' | 'alert' | 'performance';
  priority?: 'low' | 'normal' | 'high' | 'critical';
  channel?: 'in_app' | 'push' | 'email' | 'discord' | 'all';
  group_key?: string;
  dedup_key?: string;
  source_type?: string;
  source_id?: string;
  metadata?: Record<string, unknown>;
}

/**
 * OMEGA Notification Engine — Client SDK
 * 
 * Usage:
 *   await notify({
 *     title: 'New Order!',
 *     body: 'Order #1234 for $99.00',
 *     category: 'order',
 *     priority: 'high',
 *     channel: 'all',
 *   });
 */
export async function notify(params: SendNotificationParams) {
  // Auto-fill user_id if not specified
  if (!params.user_id && !params.user_ids && !params.organization_id) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) params.user_id = user.id;
  }

  const { data, error } = await supabase.functions.invoke('send-notification', {
    body: params,
  });

  if (error) {
    console.error('[notify] Failed:', error);
    throw error;
  }

  return data;
}

/**
 * Request browser push notification permission
 */
export async function requestPushPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('[Push] Notifications not supported');
    return false;
  }

  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const result = await Notification.requestPermission();
  return result === 'granted';
}

/**
 * Register push subscription with the server
 */
export async function registerPushSubscription(): Promise<boolean> {
  try {
    const granted = await requestPushPermission();
    if (!granted) return false;

    const registration = await navigator.serviceWorker.ready;
    const subscription = await (registration as any).pushManager?.subscribe({
      userVisibleOnly: true,
      applicationServerKey: undefined, // VAPID key would go here
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const sub = subscription.toJSON();
    
    await supabase.from('push_subscriptions').upsert({
      user_id: user.id,
      endpoint: sub.endpoint!,
      p256dh: sub.keys?.p256dh || '',
      auth: sub.keys?.auth || '',
      user_agent: navigator.userAgent,
      device_name: getDeviceName(),
      is_active: true,
      last_used_at: new Date().toISOString(),
    }, { onConflict: 'user_id,endpoint' });

    console.log('[Push] Subscription registered');
    return true;
  } catch (err) {
    console.error('[Push] Registration failed:', err);
    return false;
  }
}

function getDeviceName(): string {
  const ua = navigator.userAgent;
  if (/iPhone|iPad/.test(ua)) return 'iOS';
  if (/Android/.test(ua)) return 'Android';
  if (/Mac/.test(ua)) return 'Mac';
  if (/Windows/.test(ua)) return 'Windows';
  if (/Linux/.test(ua)) return 'Linux';
  return 'Unknown';
}
