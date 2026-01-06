/**
 * A/B TEST NOTIFICATIONS
 * 
 * Automatic notifications when tests reach statistical significance:
 * - In-app notifications
 * - Email notifications via Resend
 * - Winner recommendations
 * - Performance data summaries
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

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
}

interface ABTestNotificationsProps {
  onViewTest?: (testId: string) => void;
}

// Demo notifications
const DEMO_NOTIFICATIONS: ABTestNotification[] = [
  {
    id: 'notif-1',
    testId: 'test-1',
    testName: 'Enterprise vs Intimidation Variant',
    type: 'significance_reached',
    title: '🎯 Statistical Significance Reached!',
    message: 'Your A/B test has reached 94.2% confidence. The Intimidation variant is outperforming by 42.7%.',
    winnerName: 'Intimidation (Challenger)',
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
    testName: 'Enterprise vs Intimidation Variant',
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

export const ABTestNotifications = ({ onViewTest }: ABTestNotificationsProps) => {
  const [notifications, setNotifications] = useState<ABTestNotification[]>(DEMO_NOTIFICATIONS);
  const [showPanel, setShowPanel] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    inApp: true,
    email: true,
    emailAddress: '',
    significanceThreshold: 95,
    sampleMilestones: true,
    autoWinnerDeclaration: false,
    autoSendEmail: false,
  });

  const unreadCount = notifications.filter(n => !n.read).length;

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
          testName: 'Enterprise vs Intimidation Variant',
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
              className="absolute right-0 top-12 w-[420px] bg-background border rounded-lg shadow-lg z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">A/B Test Notifications</h3>
                  <p className="text-xs text-muted-foreground">
                    {unreadCount} unread notifications
                  </p>
                </div>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                    Mark all read
                  </Button>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
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

              {/* Preferences Footer */}
              <div className="p-4 border-t bg-muted/30 space-y-3">
                <p className="text-xs font-medium">Notification Preferences</p>
                
                {/* Email Address Input */}
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <Input
                    type="email"
                    placeholder="Enter email for notifications"
                    className="h-8 text-xs"
                    value={preferences.emailAddress}
                    onChange={(e) => 
                      setPreferences(prev => ({ ...prev, emailAddress: e.target.value }))
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
                        setPreferences(prev => ({ ...prev, inApp: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-background">
                    <Label className="text-xs">Email</Label>
                    <Switch
                      checked={preferences.email}
                      onCheckedChange={(checked) =>
                        setPreferences(prev => ({ ...prev, email: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-background">
                    <Label className="text-xs">Auto-winners</Label>
                    <Switch
                      checked={preferences.autoWinnerDeclaration}
                      onCheckedChange={(checked) =>
                        setPreferences(prev => ({ ...prev, autoWinnerDeclaration: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-background">
                    <Label className="text-xs">Auto-email</Label>
                    <Switch
                      checked={preferences.autoSendEmail}
                      onCheckedChange={(checked) =>
                        setPreferences(prev => ({ ...prev, autoSendEmail: checked }))
                      }
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ABTestNotifications;
