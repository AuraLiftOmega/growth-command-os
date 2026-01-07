import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Zap, 
  TrendingUp, 
  DollarSign, 
  MessageSquare,
  Calendar,
  Target,
  Rocket,
  Activity,
  Bot,
  Settings2,
  Sparkles,
  BarChart3,
  Users,
  ShoppingCart,
  Bell,
  ChevronRight,
  Play,
  Loader2
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CEOChatWidget } from '@/components/ceo-engine/CEOChatWidget';
import { CEOOnboarding } from '@/components/ceo-engine/CEOOnboarding';
import { CEOInsightsPanel } from '@/components/ceo-engine/CEOInsightsPanel';
import { CEOAutonomousActions } from '@/components/ceo-engine/CEOAutonomousActions';
import { CEOCalendarWidget } from '@/components/ceo-engine/CEOCalendarWidget';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useRevenueEngine } from '@/hooks/useRevenueEngine';

export default function CEOBrain() {
  const { user } = useAuth();
  const { isConfigured, industry, dealSize } = useRevenueEngine();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [ceoStats, setCeoStats] = useState({
    totalRevenue: 0,
    conversionsToday: 0,
    activeChats: 0,
    bookingsToday: 0,
    autonomousActions: 0,
    aiDecisions: 0,
  });
  const [recentActions, setRecentActions] = useState<Array<{
    id: string;
    type: string;
    description: string;
    timestamp: Date;
    impact: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCEOStats();
      fetchRecentActions();
    }
  }, [user]);

  const fetchCEOStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch bookings today
      const { count: bookingsCount } = await supabase
        .from('demo_bookings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .gte('created_at', today);

      // Fetch active conversations
      const { count: chatsCount } = await supabase
        .from('ai_sales_conversations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .gte('last_message_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      // Fetch revenue events
      const { data: revenueData } = await supabase
        .from('revenue_events')
        .select('amount')
        .eq('user_id', user?.id)
        .gte('created_at', today);

      const totalRevenue = revenueData?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

      setCeoStats({
        totalRevenue,
        conversionsToday: Math.floor(Math.random() * 15) + 3,
        activeChats: chatsCount || 0,
        bookingsToday: bookingsCount || 0,
        autonomousActions: Math.floor(Math.random() * 28) + 12,
        aiDecisions: Math.floor(Math.random() * 50) + 25,
      });
    } catch (error) {
      console.error('Error fetching CEO stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentActions = async () => {
    // Simulate AI autonomous actions
    setRecentActions([
      {
        id: '1',
        type: 'price_optimization',
        description: 'Increased margin on Product X by 8% based on demand signals',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        impact: '+$1,240 projected',
      },
      {
        id: '2',
        type: 'ad_scaling',
        description: 'Scaled winning ad creative 3x, paused 2 underperformers',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        impact: '+$3,800 revenue',
      },
      {
        id: '3',
        type: 'chat_conversion',
        description: 'Closed enterprise deal via AI chat - auto-booked demo',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        impact: '$15,000 deal',
      },
      {
        id: '4',
        type: 'inventory_alert',
        description: 'Auto-reordered top-selling SKU before stockout',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        impact: 'Prevented $5K loss',
      },
    ]);
  };

  const formatTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading CEO Brain...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-64">
        <Header />
        
        <div className="p-6">
          {/* CEO Brain Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold flex items-center gap-2">
                    CEO Brain
                    <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                      <Zap className="w-3 h-3 mr-1" />
                      AUTONOMOUS
                    </Badge>
                  </h1>
                  <p className="text-muted-foreground">
                    AI-powered billionaire CEO making ruthless, income-maximizing decisions 24/7
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => setShowOnboarding(true)}>
                  <Settings2 className="w-4 h-4 mr-2" />
                  Configure Brain
                </Button>
                <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                  <Rocket className="w-4 h-4 mr-2" />
                  Activate Full Auto
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Real-time Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
              <Card className="border-success/30 bg-success/5">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-success" />
                    <span className="text-xs text-muted-foreground">Today's Revenue</span>
                  </div>
                  <p className="text-2xl font-bold text-success">${ceoStats.totalRevenue.toLocaleString()}</p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-primary" />
                    <span className="text-xs text-muted-foreground">Conversions</span>
                  </div>
                  <p className="text-2xl font-bold">{ceoStats.conversionsToday}</p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    <span className="text-xs text-muted-foreground">Active Chats</span>
                  </div>
                  <p className="text-2xl font-bold">{ceoStats.activeChats}</p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-purple-500" />
                    <span className="text-xs text-muted-foreground">Bookings Today</span>
                  </div>
                  <p className="text-2xl font-bold">{ceoStats.bookingsToday}</p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="border-amber-500/30 bg-amber-500/5">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="w-4 h-4 text-amber-500" />
                    <span className="text-xs text-muted-foreground">Auto Actions</span>
                  </div>
                  <p className="text-2xl font-bold text-amber-500">{ceoStats.autonomousActions}</p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-violet-500" />
                    <span className="text-xs text-muted-foreground">AI Decisions</span>
                  </div>
                  <p className="text-2xl font-bold">{ceoStats.aiDecisions}</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column - Chat & Calendar */}
            <div className="col-span-12 lg:col-span-5 space-y-6">
              <CEOChatWidget />
              <CEOCalendarWidget />
            </div>

            {/* Middle Column - Insights & Actions */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              <CEOInsightsPanel />
              
              {/* Recent Autonomous Actions */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-amber-500" />
                      <CardTitle className="text-base">Autonomous Actions</CardTitle>
                    </div>
                    <Badge variant="outline" className="text-xs">Live</Badge>
                  </div>
                  <CardDescription>
                    CEO Brain executing income-maximizing decisions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[280px]">
                    <div className="space-y-3">
                      {recentActions.map((action) => (
                        <motion.div
                          key={action.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-3 rounded-lg bg-muted/50 border"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {action.type.replace('_', ' ')}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(action.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm mb-2">{action.description}</p>
                          <div className="flex items-center gap-1 text-xs text-success">
                            <TrendingUp className="w-3 h-3" />
                            {action.impact}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Autonomous Control */}
            <div className="col-span-12 lg:col-span-3 space-y-6">
              <CEOAutonomousActions />
              
              {/* Quick Stats */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    CEO Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Revenue Goal</span>
                      <span className="text-sm font-medium">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Conversion Rate</span>
                      <span className="text-sm font-medium">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Chat Close Rate</span>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Autonomy Level</span>
                      <span className="text-sm font-medium text-amber-500">85%</span>
                    </div>
                    <Progress value={85} className="h-2 bg-amber-500/20 [&>div]:bg-amber-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* CEO Onboarding Modal */}
      <CEOOnboarding open={showOnboarding} onOpenChange={setShowOnboarding} />
    </div>
  );
}
