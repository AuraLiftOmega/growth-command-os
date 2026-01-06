import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type NotificationType = 
  | 'ab_test_winner'
  | 'new_lead'
  | 'revenue_milestone'
  | 'creative_performance'
  | 'system_alert'
  | 'custom';

interface SlackBlock {
  type: string;
  text?: { type: string; text: string };
  fields?: { type: string; text: string }[];
  elements?: { type: string; text: string }[];
  [key: string]: any;
}

interface SendMessageOptions {
  channel: string;
  text: string;
  blocks?: SlackBlock[];
  threadTs?: string;
  teamId: string;
}

interface SendNotificationOptions {
  channel: string;
  notificationType: NotificationType;
  data: Record<string, any>;
  teamId: string;
}

interface SlackNotificationResult {
  ok: boolean;
  ts?: string;
  error?: string;
}

export function useSlackNotifications() {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  // Send a custom message to a Slack channel
  const sendMessage = useCallback(async (options: SendMessageOptions): Promise<SlackNotificationResult> => {
    setIsSending(true);
    setLastError(null);

    try {
      const { data, error } = await supabase.functions.invoke('slack-webhook/send', {
        body: {
          channel: options.channel,
          text: options.text,
          blocks: options.blocks,
          thread_ts: options.threadTs,
          team_id: options.teamId,
        },
      });

      if (error) throw error;

      if (data.ok) {
        toast({
          title: 'Message Sent',
          description: 'Slack notification delivered successfully.',
        });
        return { ok: true, ts: data.ts };
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send Slack message';
      setLastError(errorMessage);
      toast({
        title: 'Failed to Send',
        description: errorMessage,
        variant: 'destructive',
      });
      return { ok: false, error: errorMessage };
    } finally {
      setIsSending(false);
    }
  }, [toast]);

  // Send a pre-formatted notification
  const sendNotification = useCallback(async (options: SendNotificationOptions): Promise<SlackNotificationResult> => {
    setIsSending(true);
    setLastError(null);

    try {
      const { data, error } = await supabase.functions.invoke('slack-webhook/notify', {
        body: {
          channel: options.channel,
          notification_type: options.notificationType,
          data: options.data,
          team_id: options.teamId,
        },
      });

      if (error) throw error;

      if (data.ok) {
        toast({
          title: 'Notification Sent',
          description: `${options.notificationType.replace(/_/g, ' ')} notification delivered.`,
        });
        return { ok: true, ts: data.ts };
      } else {
        throw new Error(data.error || 'Failed to send notification');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send notification';
      setLastError(errorMessage);
      toast({
        title: 'Failed to Send',
        description: errorMessage,
        variant: 'destructive',
      });
      return { ok: false, error: errorMessage };
    } finally {
      setIsSending(false);
    }
  }, [toast]);

  // Convenience methods for specific notification types
  const notifyABTestWinner = useCallback((
    teamId: string,
    channel: string,
    testName: string,
    winner: string,
    improvement: number,
    significance: number
  ) => {
    return sendNotification({
      teamId,
      channel,
      notificationType: 'ab_test_winner',
      data: { test_name: testName, winner, improvement, significance },
    });
  }, [sendNotification]);

  const notifyNewLead = useCallback((
    teamId: string,
    channel: string,
    name: string,
    email: string,
    source: string,
    score?: number
  ) => {
    return sendNotification({
      teamId,
      channel,
      notificationType: 'new_lead',
      data: { name, email, source, score },
    });
  }, [sendNotification]);

  const notifyRevenueMilestone = useCallback((
    teamId: string,
    channel: string,
    amount: string,
    period: string,
    message?: string
  ) => {
    return sendNotification({
      teamId,
      channel,
      notificationType: 'revenue_milestone',
      data: { amount, period, message },
    });
  }, [sendNotification]);

  const notifyCreativePerformance = useCallback((
    teamId: string,
    channel: string,
    creativeName: string,
    alertType: string,
    message: string,
    ctr: number,
    roas: number
  ) => {
    return sendNotification({
      teamId,
      channel,
      notificationType: 'creative_performance',
      data: { creative_name: creativeName, alert_type: alertType, message, ctr, roas },
    });
  }, [sendNotification]);

  const notifySystemAlert = useCallback((
    teamId: string,
    channel: string,
    title: string,
    message: string,
    severity: 'info' | 'warning' | 'error' = 'info'
  ) => {
    return sendNotification({
      teamId,
      channel,
      notificationType: 'system_alert',
      data: { title, message, severity },
    });
  }, [sendNotification]);

  return {
    sendMessage,
    sendNotification,
    notifyABTestWinner,
    notifyNewLead,
    notifyRevenueMilestone,
    notifyCreativePerformance,
    notifySystemAlert,
    isSending,
    lastError,
  };
}
