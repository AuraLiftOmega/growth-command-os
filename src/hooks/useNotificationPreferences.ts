import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface NotificationPrefs {
  in_app_enabled: boolean;
  push_enabled: boolean;
  email_enabled: boolean;
  discord_enabled: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  timezone: string;
  digest_enabled: boolean;
  digest_frequency: string;
  digest_time: string;
  critical_always_push: boolean;
  batch_low_priority: boolean;
  category_overrides: Record<string, { enabled: boolean; channels: string[] }>;
}

const DEFAULT_PREFS: NotificationPrefs = {
  in_app_enabled: true,
  push_enabled: true,
  email_enabled: true,
  discord_enabled: false,
  quiet_hours_enabled: false,
  quiet_hours_start: '22:00',
  quiet_hours_end: '08:00',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  digest_enabled: false,
  digest_frequency: 'daily',
  digest_time: '09:00',
  critical_always_push: true,
  batch_low_priority: true,
  category_overrides: {},
};

export function useNotificationPreferences() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setPrefs({
          ...DEFAULT_PREFS,
          ...data,
          category_overrides: (data.category_overrides as Record<string, { enabled: boolean; channels: string[] }>) || {},
        });
      }
      setIsLoading(false);
    };
    load();
  }, []);

  const updatePrefs = useCallback(async (updates: Partial<NotificationPrefs>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newPrefs = { ...prefs, ...updates };
    setPrefs(newPrefs);

    await supabase
      .from('notification_preferences')
      .upsert({
        user_id: user.id,
        ...newPrefs,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
  }, [prefs]);

  return { prefs, isLoading, updatePrefs };
}
