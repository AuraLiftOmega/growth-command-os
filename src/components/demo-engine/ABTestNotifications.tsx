/**
 * A/B TEST NOTIFICATIONS
 * 
 * Automatic notifications when tests reach statistical significance:
 * - In-app notifications
 * - Email notifications via Resend
 * - Slack, Discord, and Microsoft Teams webhooks
 * - Scheduled digests (daily/weekly)
 * - Database persistence for all settings
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Award,
  TrendingUp,
  CheckCircle2,
  X,
  ChevronRight,
  Mail,
  Sparkles,
  AlertTriangle,
  BarChart3,
  Send,
  Loader2,
  Calendar,
  MessageSquare,
  Hash,
  Clock,
  Settings2,
  Play,
  TestTube2,
  Save,
  Users,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ABTestNotification {
  id: string;
  testId: string;
  testName: string;
  type: 'significance_reached' | 'winner_found' | 'sample_milestone' | 'test_complete';
  title: string;
  message: string;
  winnerName?: string;
  improvement?: number;
  confidence?: number;
  totalViews?: number;
  totalConversions?: number;
  revenueAttributed?: number;
  createdAt: string;
  read: boolean;
  actionTaken: boolean;
  emailSent: boolean;
}

interface NotificationPreferences {
  inApp: boolean;
  email: boolean;
  emailAddress: string;
  significanceThreshold: number;
  sampleMilestones: boolean;
  autoWinnerDeclaration: boolean;
  autoSendEmail: boolean;
  // Digest settings
  digestEnabled: boolean;
  digestFrequency: 'daily' | 'weekly';
  digestTime: string;
  // Slack settings
  slackEnabled: boolean;
  slackWebhookUrl: string;
  // Discord settings
  discordEnabled: boolean;
  discordWebhookUrl: string;
  // Teams settings
  teamsEnabled: boolean;
  teamsWebhookUrl: string;
}

interface ABTestNotificationsProps {
  onViewTest?: (testId: string) => void;
}

// Demo notifications
const DEMO_NOTIFICATIONS: ABTestNotification[] = [
  {
    id: 'notif-1',
    testId: 'test-1',
    testName: 'Enterprise vs Aries Variant',
    type: 'significance_reached',
    title: '🎯 Statistical Significance Reached!',
    message: 'Your A/B test has reached 94.2% confidence. The Aries variant is outperforming by 42.7%.',
    winnerName: 'Aries (Challenger)',
    improvement: 42.7,
    confidence: 94.2,
    totalViews: 1670,
    totalConversions: 216,
    revenueAttributed: 623700,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    read: false,
    actionTaken: false,
    emailSent: false,
  },
  {
    id: 'notif-2',
    testId: 'test-2',
    testName: 'Short vs Long Demo Length',
    type: 'winner_found',
    title: '🏆 Winner Declared!',
    message: 'Short Demo (90s) has been declared the winner with 98.7% confidence and 48% improvement in conversions.',
    winnerName: 'Short Demo (90s)',
    improvement: 48,
    confidence: 98.7,
    totalViews: 2423,
    totalConversions: 243,
    revenueAttributed: 768400,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
    actionTaken: true,
    emailSent: true,
  },
  {
    id: 'notif-3',
    testId: 'test-1',
    testName: 'Enterprise vs Aries Variant',
    type: 'sample_milestone',
    title: '📊 Sample Milestone Reached',
    message: 'Your test has reached 1,000 total views. Statistical reliability is improving.',
    totalViews: 1000,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    read: true,
    actionTaken: false,
    emailSent: false,
  },
];

// Demo tests for digest
const DEMO_TESTS = [
  {
    id: 'test-1',
    name: 'Enterprise vs Aries Variant',
    status: 'running' as const,
    confidence: 94.2,
    improvement: 42.7,
    totalViews: 1670,
    totalConversions: 216,
    revenueAttributed: 623700,
    daysRunning: 7,
  },
  {
    id: 'test-2',
    name: 'Short vs Long Demo Length',
    status: 'winner_declared' as const,
    confidence: 98.7,
    improvement: 48,
    totalViews: 2423,
    totalConversions: 243,
    revenueAttributed: 768400,
    winnerName: 'Short Demo (90s)',
    daysRunning: 14,
  },
  {
    id: 'test-3',
    name: 'SaaS vs Fintech Industry Demo',
    status: 'running' as const,
    confidence: 72.3,
    improvement: 18.5,
    totalViews: 892,
    totalConversions: 89,
    revenueAttributed: 234500,
    daysRunning: 5,
  },
];

const DEFAULT_PREFERENCES: NotificationPreferences = {
  inApp: true,
  email: true,
  emailAddress: '',
  significanceThreshold: 95,
  sampleMilestones: true,
  autoWinnerDeclaration: false,
  autoSendEmail: false,
  digestEnabled: false,
  digestFrequency: 'daily',
  digestTime: '09:00',
  slackEnabled: false,
  slackWebhookUrl: '',
  discordEnabled: false,
  discordWebhookUrl: '',
  teamsEnabled: false,
  teamsWebhookUrl: '',
};

export const ABTestNotifications = ({ onViewTest }: ABTestNotificationsProps) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<ABTestNotification[]>(DEMO_NOTIFICATIONS);
  const [showPanel, setShowPanel] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState<string | null>(null);
  const [isSendingDigest, setIsSendingDigest] = useState(false);
  const [isSendingSlack, setIsSendingSlack] = useState(false);
  const [isSendingDiscord, setIsSendingDiscord] = useState(false);
  const [isSendingTeams, setIsSendingTeams] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('notifications');
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Load settings from database
  const loadSettings = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ab_test_notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found is OK
        throw error;
      }

      if (data) {
        setPreferences({
          inApp: data.in_app_enabled ?? true,
          email: data.email_enabled ?? true,
          emailAddress: data.email_address ?? '',
          significanceThreshold: data.significance_threshold ?? 95,
          sampleMilestones: data.sample_milestones ?? true,
          autoWinnerDeclaration: data.auto_winner_declaration ?? false,
          autoSendEmail: data.auto_send_email ?? false,
          digestEnabled: data.digest_enabled ?? false,
          digestFrequency: (data.digest_frequency as 'daily' | 'weekly') ?? 'daily',
          digestTime: data.digest_time ?? '09:00',
          slackEnabled: data.slack_enabled ?? false,
          slackWebhookUrl: data.slack_webhook_url ?? '',
          discordEnabled: data.discord_enabled ?? false,
          discordWebhookUrl: data.discord_webhook_url ?? '',
          teamsEnabled: data.teams_enabled ?? false,
          teamsWebhookUrl: data.teams_webhook_url ?? '',
        });
      }
    } catch (error: any) {
      console.error('Failed to load notification settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Save settings to database
  const saveSettings = useCallback(async () => {
    if (!user?.id) {
      toast.error('Please sign in to save settings');
      return;
    }

    setIsSaving(true);
    try {
      const settingsData = {
        user_id: user.id,
        email_address: preferences.emailAddress,
        in_app_enabled: preferences.inApp,
        email_enabled: preferences.email,
        auto_winner_declaration: preferences.autoWinnerDeclaration,
        auto_send_email: preferences.autoSendEmail,
        significance_threshold: preferences.significanceThreshold,
        sample_milestones: preferences.sampleMilestones,
        digest_enabled: preferences.digestEnabled,
        digest_frequency: preferences.digestFrequency,
        digest_time: preferences.digestTime,
        slack_enabled: preferences.slackEnabled,
        slack_webhook_url: preferences.slackWebhookUrl,
        discord_enabled: preferences.discordEnabled,
        discord_webhook_url: preferences.discordWebhookUrl,
        teams_enabled: preferences.teamsEnabled,
        teams_webhook_url: preferences.teamsWebhookUrl,
      };

      const { error } = await supabase
        .from('ab_test_notification_settings')
        .upsert(settingsData, { onConflict: 'user_id' });

      if (error) throw error;

      setHasUnsavedChanges(false);
      toast.success('Settings saved successfully!');

      // Update digest schedule if enabled
      if (preferences.digestEnabled) {
        await updateDigestSchedule();
      }
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings', {
        description: error.message || 'Please try again',
      });
    } finally {
      setIsSaving(false);
    }
  }, [user?.id, preferences]);

  // Update digest schedule in database
  const updateDigestSchedule = async () => {
    if (!user?.id) return;

    try {
      // Get settings ID
      const { data: settings } = await supabase
        .from('ab_test_notification_settings')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!settings) return;

      // Calculate next scheduled time
      const now = new Date();
      const [hours, minutes] = preferences.digestTime.split(':').map(Number);
      const nextScheduled = new Date();
      nextScheduled.setHours(hours, minutes, 0, 0);
      
      if (nextScheduled <= now) {
        nextScheduled.setDate(nextScheduled.getDate() + (preferences.digestFrequency === 'weekly' ? 7 : 1));
      }

      // Upsert schedule
      await supabase
        .from('ab_test_digest_schedules')
        .upsert({
          user_id: user.id,
          settings_id: settings.id,
          digest_type: preferences.digestFrequency,
          scheduled_time: preferences.digestTime,
          next_scheduled_at: nextScheduled.toISOString(),
          is_active: preferences.digestEnabled,
        }, { onConflict: 'settings_id' });
    } catch (error) {
      console.error('Failed to update digest schedule:', error);
    }
  };

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Track unsaved changes
  const updatePreferences = useCallback((updater: (prev: NotificationPreferences) => NotificationPreferences) => {
    setPreferences(prev => {
      const newPrefs = updater(prev);
      setHasUnsavedChanges(true);
      return newPrefs;
    });
  }, []);

  // Send email notification
  const sendEmailNotification = useCallback(async (notification: ABTestNotification) => {
    if (!preferences.emailAddress) {
      toast.error('Please enter an email address in preferences');
      return;
    }

    setIsSendingEmail(notification.id);

    try {
      const { data, error } = await supabase.functions.invoke('send-ab-test-notification', {
        body: {
          recipientEmail: preferences.emailAddress,
          recipientName: 'Team',
          notificationType: notification.type === 'winner_found' ? 'winner_declared' : notification.type,
          testName: notification.testName,
          winnerName: notification.winnerName,
          improvement: notification.improvement,
          confidence: notification.confidence,
          totalViews: notification.totalViews,
          totalConversions: notification.totalConversions,
          revenueAttributed: notification.revenueAttributed,
          testDuration: '7 days',
          recommendedActions: [
            'Review the full test results in your dashboard',
            'Apply the winning variant to 100% of traffic',
            'Document learnings for future tests',
            'Plan your next optimization experiment',
          ],
          dashboardUrl: window.location.origin + '/?tab=ab-testing',
        },
      });

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, emailSent: true } : n)
      );

      toast.success('Email notification sent!', {
        description: `Sent to ${preferences.emailAddress}`,
      });
    } catch (error: any) {
      console.error('Failed to send email:', error);
      toast.error('Failed to send email', {
        description: error.message || 'Please try again',
      });
    } finally {
      setIsSendingEmail(null);
    }
  }, [preferences.emailAddress]);

  // Send digest
  const sendDigest = useCallback(async (type: 'email' | 'slack' | 'discord' | 'teams') => {
    const digestData = {
      recipientEmail: preferences.emailAddress,
      recipientName: 'Team',
      digestType: preferences.digestFrequency,
      tests: DEMO_TESTS,
      totalActiveTests: DEMO_TESTS.filter(t => t.status === 'running').length,
      totalRevenue: DEMO_TESTS.reduce((sum, t) => sum + t.revenueAttributed, 0),
      topPerformer: DEMO_TESTS.reduce((best, t) => 
        (t.improvement || 0) > (best.improvement || 0) ? t : best, DEMO_TESTS[0]),
      dashboardUrl: window.location.origin + '/?tab=ab-testing',
    };

    if (type === 'email') {
      if (!preferences.emailAddress) {
        toast.error('Please enter an email address');
        return;
      }
      setIsSendingDigest(true);
    } else if (type === 'slack') {
      if (!preferences.slackWebhookUrl) {
        toast.error('Please enter a Slack webhook URL');
        return;
      }
      setIsSendingSlack(true);
    } else if (type === 'discord') {
      if (!preferences.discordWebhookUrl) {
        toast.error('Please enter a Discord webhook URL');
        return;
      }
      setIsSendingDiscord(true);
    } else if (type === 'teams') {
      if (!preferences.teamsWebhookUrl) {
        toast.error('Please enter a Teams webhook URL');
        return;
      }
      setIsSendingTeams(true);
    }

    try {
      const { data, error } = await supabase.functions.invoke('send-ab-test-digest', {
        body: {
          type,
          webhookUrl: type === 'slack' ? preferences.slackWebhookUrl : 
                      type === 'discord' ? preferences.discordWebhookUrl : 
                      type === 'teams' ? preferences.teamsWebhookUrl : undefined,
          ...digestData,
        },
      });

      if (error) throw error;

      const channelName = type === 'email' ? `to ${preferences.emailAddress}` : 
                          type === 'slack' ? 'to Slack channel' : 
                          type === 'discord' ? 'to Discord channel' : 'to Teams channel';

      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} digest sent!`, {
        description: channelName,
      });
    } catch (error: any) {
      console.error(`Failed to send ${type} digest:`, error);
      toast.error(`Failed to send ${type} digest`, {
        description: error.message || 'Please try again',
      });
    } finally {
      setIsSendingDigest(false);
      setIsSendingSlack(false);
      setIsSendingDiscord(false);
      setIsSendingTeams(false);
    }
  }, [preferences]);

  // Mark notification as read
  const markAsRead = useCallback((notifId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notifId ? { ...n, read: true } : n)
    );
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  }, []);

  // Take action on notification
  const takeAction = useCallback((notification: ABTestNotification) => {
    markAsRead(notification.id);
    setNotifications(prev =>
      prev.map(n => n.id === notification.id ? { ...n, actionTaken: true } : n)
    );
    onViewTest?.(notification.testId);
    setShowPanel(false);
  }, [markAsRead, onViewTest]);

  // Dismiss notification
  const dismissNotification = useCallback((notifId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notifId));
  }, []);

  // Simulate real-time notification with auto email (for demo)
  useEffect(() => {
    const timer = setTimeout(() => {
      const existingNotif = notifications.find(n => n.id === 'notif-realtime');
      if (!existingNotif && notifications.length < 5) {
        const newNotif: ABTestNotification = {
          id: 'notif-realtime',
          testId: 'test-1',
          testName: 'Enterprise vs Aries Variant',
          type: 'significance_reached',
          title: '📈 Confidence Increasing',
          message: 'Test confidence has increased to 94.5%. Getting closer to the 95% threshold!',
          confidence: 94.5,
          totalViews: 1720,
          totalConversions: 224,
          createdAt: new Date().toISOString(),
          read: false,
          actionTaken: false,
          emailSent: false,
        };
        setNotifications(prev => [newNotif, ...prev]);
        
        if (preferences.inApp) {
          toast.info(newNotif.title, {
            description: newNotif.message,
            action: {
              label: 'View Test',
              onClick: () => onViewTest?.(newNotif.testId),
            },
          });
        }

        // Auto-send email if enabled
        if (preferences.autoSendEmail && preferences.email && preferences.emailAddress) {
          sendEmailNotification(newNotif);
        }
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [notifications, preferences, onViewTest, sendEmailNotification]);

  const getNotificationIcon = (type: ABTestNotification['type']) => {
    switch (type) {
      case 'significance_reached':
        return <Sparkles className="w-5 h-5 text-primary" />;
      case 'winner_found':
        return <Award className="w-5 h-5 text-amber-500" />;
      case 'sample_milestone':
        return <BarChart3 className="w-5 h-5 text-blue-500" />;
      case 'test_complete':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setShowPanel(!showPanel)}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>

      {/* Notification Panel */}
      <AnimatePresence>
        {showPanel && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setShowPanel(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-12 w-[440px] bg-background border rounded-lg shadow-lg z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">A/B Test Notifications</h3>
                  <p className="text-xs text-muted-foreground">
                    {unreadCount} unread notifications
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {hasUnsavedChanges && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={saveSettings}
                      disabled={isSaving}
                      className="h-7 text-xs gap-1"
                    >
                      {isSaving ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Save className="w-3 h-3" />
                      )}
                      Save
                    </Button>
                  )}
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                      Mark all read
                    </Button>
                  )}
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-72 overflow-y-auto">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <Loader2 className="w-8 h-8 mx-auto text-muted-foreground mb-2 animate-spin" />
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  </div>
                ) : notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        "p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors",
                        !notification.read && "bg-primary/5"
                      )}
                      onClick={() => takeAction(notification)}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-sm">
                              {notification.title}
                            </p>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {/* Send Email Button */}
                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                  "h-6 w-6",
                                  notification.emailSent && "text-green-500"
                                )}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!notification.emailSent) {
                                    sendEmailNotification(notification);
                                  }
                                }}
                                disabled={notification.emailSent || isSendingEmail === notification.id}
                              >
                                {isSendingEmail === notification.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : notification.emailSent ? (
                                  <CheckCircle2 className="w-3 h-3" />
                                ) : (
                                  <Mail className="w-3 h-3" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  dismissNotification(notification.id);
                                }}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          
                          {/* Stats badges */}
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {notification.confidence && (
                              <Badge variant="secondary" className="text-xs">
                                {notification.confidence}% confidence
                              </Badge>
                            )}
                            {notification.improvement && (
                              <Badge className="text-xs bg-green-500/10 text-green-600">
                                +{notification.improvement}% improvement
                              </Badge>
                            )}
                            {notification.emailSent && (
                              <Badge variant="outline" className="text-xs gap-1">
                                <Mail className="w-2 h-2" />
                                Emailed
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <Bell className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No notifications yet
                    </p>
                  </div>
                )}
              </div>

              {/* Tabbed Settings */}
              <div className="border-t">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full rounded-none border-b bg-muted/30 p-0 h-auto">
                    <TabsTrigger value="notifications" className="flex-1 rounded-none data-[state=active]:bg-background py-2 text-xs">
                      <Bell className="w-3 h-3 mr-1" />
                      Settings
                    </TabsTrigger>
                    <TabsTrigger value="digest" className="flex-1 rounded-none data-[state=active]:bg-background py-2 text-xs">
                      <Calendar className="w-3 h-3 mr-1" />
                      Digest
                    </TabsTrigger>
                    <TabsTrigger value="webhooks" className="flex-1 rounded-none data-[state=active]:bg-background py-2 text-xs">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Webhooks
                    </TabsTrigger>
                  </TabsList>

                  {/* Settings Tab */}
                  <TabsContent value="notifications" className="p-4 space-y-3 m-0">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <Input
                        type="email"
                        placeholder="Enter email for notifications"
                        className="h-8 text-xs"
                        value={preferences.emailAddress}
                        onChange={(e) => 
                          updatePreferences(prev => ({ ...prev, emailAddress: e.target.value }))
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center justify-between p-2 rounded bg-background">
                        <Label className="text-xs">In-app</Label>
                        <Switch
                          checked={preferences.inApp}
                          onCheckedChange={(checked) => 
                            updatePreferences(prev => ({ ...prev, inApp: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-background">
                        <Label className="text-xs">Email</Label>
                        <Switch
                          checked={preferences.email}
                          onCheckedChange={(checked) =>
                            updatePreferences(prev => ({ ...prev, email: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-background">
                        <Label className="text-xs">Auto-winners</Label>
                        <Switch
                          checked={preferences.autoWinnerDeclaration}
                          onCheckedChange={(checked) =>
                            updatePreferences(prev => ({ ...prev, autoWinnerDeclaration: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-background">
                        <Label className="text-xs">Auto-email</Label>
                        <Switch
                          checked={preferences.autoSendEmail}
                          onCheckedChange={(checked) =>
                            updatePreferences(prev => ({ ...prev, autoSendEmail: checked }))
                          }
                        />
                      </div>
                    </div>

                    {!user && (
                      <div className="text-xs text-amber-600 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                        ⚠️ Sign in to save your notification settings
                      </div>
                    )}
                  </TabsContent>

                  {/* Digest Tab */}
                  <TabsContent value="digest" className="p-4 space-y-3 m-0">
                    <div className="flex items-center justify-between p-2 rounded bg-background">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <Label className="text-xs">Scheduled Digests</Label>
                      </div>
                      <Switch
                        checked={preferences.digestEnabled}
                        onCheckedChange={(checked) =>
                          updatePreferences(prev => ({ ...prev, digestEnabled: checked }))
                        }
                      />
                    </div>

                    {preferences.digestEnabled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3"
                      >
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs text-muted-foreground mb-1 block">Frequency</Label>
                            <Select
                              value={preferences.digestFrequency}
                              onValueChange={(value: 'daily' | 'weekly') =>
                                updatePreferences(prev => ({ ...prev, digestFrequency: value }))
                              }
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground mb-1 block">Time</Label>
                            <Input
                              type="time"
                              className="h-8 text-xs"
                              value={preferences.digestTime}
                              onChange={(e) =>
                                updatePreferences(prev => ({ ...prev, digestTime: e.target.value }))
                              }
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>

                        <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                          <div className="flex items-center gap-2 mb-2">
                            <TestTube2 className="w-4 h-4 text-primary" />
                            <span className="text-xs font-medium">Test Digest Now</span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">
                            Send a test digest with your current {DEMO_TESTS.length} active tests
                          </p>
                          <Button
                            size="sm"
                            className="w-full h-8 text-xs gap-1"
                            onClick={() => sendDigest('email')}
                            disabled={isSendingDigest || !preferences.emailAddress}
                          >
                            {isSendingDigest ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send className="w-3 h-3" />
                                Send {preferences.digestFrequency} Digest
                              </>
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </TabsContent>

                  {/* Webhooks Tab */}
                  <TabsContent value="webhooks" className="p-4 space-y-4 m-0 max-h-64 overflow-y-auto">
                    {/* Slack Integration */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-[#4A154B] rounded flex items-center justify-center">
                            <Hash className="w-3 h-3 text-white" />
                          </div>
                          <Label className="text-xs font-medium">Slack</Label>
                        </div>
                        <Switch
                          checked={preferences.slackEnabled}
                          onCheckedChange={(checked) =>
                            updatePreferences(prev => ({ ...prev, slackEnabled: checked }))
                          }
                        />
                      </div>
                      
                      {preferences.slackEnabled && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-2"
                        >
                          <Input
                            placeholder="https://hooks.slack.com/services/..."
                            className="h-8 text-xs"
                            value={preferences.slackWebhookUrl}
                            onChange={(e) =>
                              updatePreferences(prev => ({ ...prev, slackWebhookUrl: e.target.value }))
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full h-8 text-xs gap-1"
                            onClick={() => sendDigest('slack')}
                            disabled={isSendingSlack || !preferences.slackWebhookUrl}
                          >
                            {isSendingSlack ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Play className="w-3 h-3" />
                                Test Slack Webhook
                              </>
                            )}
                          </Button>
                        </motion.div>
                      )}
                    </div>

                    {/* Discord Integration */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-[#5865F2] rounded flex items-center justify-center">
                            <MessageSquare className="w-3 h-3 text-white" />
                          </div>
                          <Label className="text-xs font-medium">Discord</Label>
                        </div>
                        <Switch
                          checked={preferences.discordEnabled}
                          onCheckedChange={(checked) =>
                            updatePreferences(prev => ({ ...prev, discordEnabled: checked }))
                          }
                        />
                      </div>
                      
                      {preferences.discordEnabled && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-2"
                        >
                          <Input
                            placeholder="https://discord.com/api/webhooks/..."
                            className="h-8 text-xs"
                            value={preferences.discordWebhookUrl}
                            onChange={(e) =>
                              updatePreferences(prev => ({ ...prev, discordWebhookUrl: e.target.value }))
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full h-8 text-xs gap-1"
                            onClick={() => sendDigest('discord')}
                            disabled={isSendingDiscord || !preferences.discordWebhookUrl}
                          >
                            {isSendingDiscord ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Play className="w-3 h-3" />
                                Test Discord Webhook
                              </>
                            )}
                          </Button>
                        </motion.div>
                      )}
                    </div>

                    {/* Microsoft Teams Integration */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-[#6264A7] rounded flex items-center justify-center">
                            <Users className="w-3 h-3 text-white" />
                          </div>
                          <Label className="text-xs font-medium">Microsoft Teams</Label>
                        </div>
                        <Switch
                          checked={preferences.teamsEnabled}
                          onCheckedChange={(checked) =>
                            updatePreferences(prev => ({ ...prev, teamsEnabled: checked }))
                          }
                        />
                      </div>
                      
                      {preferences.teamsEnabled && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-2"
                        >
                          <Input
                            placeholder="https://outlook.office.com/webhook/..."
                            className="h-8 text-xs"
                            value={preferences.teamsWebhookUrl}
                            onChange={(e) =>
                              updatePreferences(prev => ({ ...prev, teamsWebhookUrl: e.target.value }))
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full h-8 text-xs gap-1"
                            onClick={() => sendDigest('teams')}
                            disabled={isSendingTeams || !preferences.teamsWebhookUrl}
                          >
                            {isSendingTeams ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Play className="w-3 h-3" />
                                Test Teams Webhook
                              </>
                            )}
                          </Button>
                        </motion.div>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                      💡 Webhooks receive instant notifications when tests reach significance or a winner is declared.
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ABTestNotifications;
