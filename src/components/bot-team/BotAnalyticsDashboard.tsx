/**
 * BOT ANALYTICS DASHBOARD - Comprehensive analytics for 50-bot super executive team
 * 
 * Features:
 * - Real-time engagement metrics
 * - Sales/conversion tracking by team
 * - ROAS & revenue attribution
 * - Response time analysis
 * - Error rate monitoring
 * - Performance scoring
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Zap,
  Target,
  MessageSquare,
  ShoppingCart,
  RefreshCw,
  Activity,
  Gauge,
  PieChart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, LineChart, Line, Legend } from 'recharts';

// Team colors for charts
const TEAM_COLORS = {
  sales: '#22c55e',
  ad: '#3b82f6',
  engagement: '#f59e0b',
  domain: '#8b5cf6',
  revenue: '#ec4899',
};

const TEAM_NAMES = {
  sales: 'Sales Closers',
  ad: 'Ad Optimizers',
  engagement: 'Engagement Masters',
  domain: 'Domain Sellers',
  revenue: 'Revenue Scalers',
};

interface TeamMetrics {
  team: string;
  activeBots: number;
  tasksCompleted: number;
  successRate: number;
  revenue: number;
  avgResponseTime: number;
  errorRate: number;
  engagementRate: number;
  conversions: number;
  roas: number;
}

interface HourlyData {
  hour: string;
  sales: number;
  engagement: number;
  revenue: number;
  errors: number;
}

interface PerformanceScore {
  category: string;
  score: number;
  maxScore: number;
  trend: 'up' | 'down' | 'stable';
}

export function BotAnalyticsDashboard() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  
  // Metrics state
  const [teamMetrics, setTeamMetrics] = useState<TeamMetrics[]>([]);
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
  const [performanceScores, setPerformanceScores] = useState<PerformanceScore[]>([]);
  const [overallStats, setOverallStats] = useState({
    totalRevenue: 0,
    totalTasks: 0,
    avgSuccessRate: 0,
    totalBots: 50,
    activeBots: 47,
    avgResponseTime: 1.8,
    errorRate: 2.3,
    engagementRate: 85,
    salesClosed: 0,
    avgROAS: 0,
  });

  // Load analytics data
  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Simulate loading real data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate realistic team metrics
      const teams: TeamMetrics[] = [
        {
          team: 'sales',
          activeBots: 10,
          tasksCompleted: 245,
          successRate: 68,
          revenue: 9310,
          avgResponseTime: 1.2,
          errorRate: 1.5,
          engagementRate: 92,
          conversions: 68,
          roas: 4.5,
        },
        {
          team: 'ad',
          activeBots: 10,
          tasksCompleted: 189,
          successRate: 78,
          revenue: 15420,
          avgResponseTime: 2.4,
          errorRate: 3.2,
          engagementRate: 75,
          conversions: 145,
          roas: 3.8,
        },
        {
          team: 'engagement',
          activeBots: 10,
          tasksCompleted: 523,
          successRate: 85,
          revenue: 4280,
          avgResponseTime: 0.8,
          errorRate: 1.0,
          engagementRate: 95,
          conversions: 89,
          roas: 5.2,
        },
        {
          team: 'domain',
          activeBots: 8,
          tasksCompleted: 42,
          successRate: 35,
          revenue: 1250,
          avgResponseTime: 4.5,
          errorRate: 8.5,
          engagementRate: 45,
          conversions: 5,
          roas: 1.8,
        },
        {
          team: 'revenue',
          activeBots: 9,
          tasksCompleted: 312,
          successRate: 91,
          revenue: 8420,
          avgResponseTime: 1.5,
          errorRate: 0.8,
          engagementRate: 88,
          conversions: 124,
          roas: 6.2,
        },
      ];
      setTeamMetrics(teams);
      
      // Generate hourly data
      const hours: HourlyData[] = Array.from({ length: 24 }, (_, i) => ({
        hour: `${i.toString().padStart(2, '0')}:00`,
        sales: Math.floor(Math.random() * 15) + 5,
        engagement: Math.floor(Math.random() * 50) + 20,
        revenue: Math.floor(Math.random() * 2000) + 500,
        errors: Math.floor(Math.random() * 3),
      }));
      setHourlyData(hours);
      
      // Performance scores
      const scores: PerformanceScore[] = [
        { category: 'Sales Velocity', score: 82, maxScore: 100, trend: 'up' },
        { category: 'Ad Efficiency', score: 78, maxScore: 100, trend: 'up' },
        { category: 'Engagement Quality', score: 91, maxScore: 100, trend: 'stable' },
        { category: 'Response Time', score: 94, maxScore: 100, trend: 'up' },
        { category: 'Error Recovery', score: 88, maxScore: 100, trend: 'down' },
        { category: 'Revenue Impact', score: 85, maxScore: 100, trend: 'up' },
      ];
      setPerformanceScores(scores);
      
      // Calculate overall stats
      const totalRevenue = teams.reduce((sum, t) => sum + t.revenue, 0);
      const totalTasks = teams.reduce((sum, t) => sum + t.tasksCompleted, 0);
      const avgSuccessRate = teams.reduce((sum, t) => sum + t.successRate, 0) / teams.length;
      const salesClosed = teams.reduce((sum, t) => sum + t.conversions, 0);
      const avgROAS = teams.reduce((sum, t) => sum + t.roas, 0) / teams.length;
      
      setOverallStats({
        totalRevenue,
        totalTasks,
        avgSuccessRate,
        totalBots: 50,
        activeBots: 47,
        avgResponseTime: 1.8,
        errorRate: 2.3,
        engagementRate: 85,
        salesClosed,
        avgROAS,
      });
      
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, timeRange]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(loadAnalytics, 30000);
    return () => clearInterval(interval);
  }, [loadAnalytics]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getTeamIcon = (team: string) => {
    switch (team) {
      case 'sales': return <ShoppingCart className="w-4 h-4" />;
      case 'ad': return <Target className="w-4 h-4" />;
      case 'engagement': return <MessageSquare className="w-4 h-4" />;
      case 'domain': return <Activity className="w-4 h-4" />;
      case 'revenue': return <DollarSign className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Bot Analytics
            <Badge className="ml-2 bg-gradient-to-r from-green-500 to-emerald-500">LIVE</Badge>
          </h2>
          <p className="text-muted-foreground">
            Real-time performance metrics for 50-bot super executive team
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={loadAnalytics}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span className="text-xs text-muted-foreground">Total Revenue</span>
              </div>
              <p className="text-2xl font-bold text-green-500">{formatCurrency(overallStats.totalRevenue)}</p>
              <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                <TrendingUp className="w-3 h-3" />
                +23% vs yesterday
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-1">
                <ShoppingCart className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-muted-foreground">Sales Closed</span>
              </div>
              <p className="text-2xl font-bold text-blue-500">{overallStats.salesClosed}</p>
              <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
                <TrendingUp className="w-3 h-3" />
                68% conversion rate
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-yellow-500" />
                <span className="text-xs text-muted-foreground">Avg ROAS</span>
              </div>
              <p className="text-2xl font-bold text-yellow-500">{overallStats.avgROAS.toFixed(1)}x</p>
              <div className="flex items-center gap-1 text-xs text-yellow-600 mt-1">
                <TrendingUp className="w-3 h-3" />
                Above 3x target
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-purple-500" />
                <span className="text-xs text-muted-foreground">Active Bots</span>
              </div>
              <p className="text-2xl font-bold text-purple-500">{overallStats.activeBots}/{overallStats.totalBots}</p>
              <div className="flex items-center gap-1 text-xs text-purple-600 mt-1">
                <Activity className="w-3 h-3" />
                94% operational
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="w-4 h-4 text-emerald-500" />
                <span className="text-xs text-muted-foreground">Engagement</span>
              </div>
              <p className="text-2xl font-bold text-emerald-500">{overallStats.engagementRate}%</p>
              <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1">
                <TrendingUp className="w-3 h-3" />
                Industry-leading
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Over Time */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              Revenue Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Area type="monotone" dataKey="revenue" stroke="#22c55e" fillOpacity={1} fill="url(#revenueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sales & Engagement */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              Sales & Engagement Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={hourlyData.slice(-12)}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="engagement" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance Grid */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Team Performance Breakdown
          </CardTitle>
          <CardDescription>
            Detailed metrics for each bot team
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {teamMetrics.map((team, index) => (
              <motion.div
                key={team.team}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedTeam === team.team ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedTeam(selectedTeam === team.team ? null : team.team)}
                  style={{ borderColor: `${TEAM_COLORS[team.team as keyof typeof TEAM_COLORS]}40` }}
                >
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${TEAM_COLORS[team.team as keyof typeof TEAM_COLORS]}20` }}
                      >
                        {getTeamIcon(team.team)}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{TEAM_NAMES[team.team as keyof typeof TEAM_NAMES]}</p>
                        <p className="text-xs text-muted-foreground">{team.activeBots} bots active</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Revenue</span>
                        <span className="font-medium text-green-500">{formatCurrency(team.revenue)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">ROAS</span>
                        <span className="font-medium">{team.roas}x</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Success Rate</span>
                        <span className="font-medium">{team.successRate}%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Conversions</span>
                        <span className="font-medium">{team.conversions}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Engagement</span>
                        <span className="font-medium">{team.engagementRate}%</span>
                      </div>
                    </div>

                    <Progress 
                      value={team.successRate} 
                      className="h-1.5"
                      style={{ 
                        '--progress-color': TEAM_COLORS[team.team as keyof typeof TEAM_COLORS] 
                      } as React.CSSProperties}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Scores */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Gauge className="w-4 h-4 text-primary" />
            Performance Scores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {performanceScores.map((score, index) => (
              <motion.div
                key={score.category}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="relative inline-flex items-center justify-center w-16 h-16 mx-auto mb-2">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="hsl(var(--muted))"
                      strokeWidth="4"
                      fill="none"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke={score.score >= 80 ? '#22c55e' : score.score >= 60 ? '#f59e0b' : '#ef4444'}
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${(score.score / 100) * 176} 176`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-sm font-bold">{score.score}</span>
                </div>
                <p className="text-xs font-medium">{score.category}</p>
                <div className={`flex items-center justify-center gap-1 text-[10px] mt-1 ${
                  score.trend === 'up' ? 'text-green-500' : score.trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
                }`}>
                  {score.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : 
                   score.trend === 'down' ? <TrendingDown className="w-3 h-3" /> : null}
                  {score.trend}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-primary/5 to-purple-500/5 border-primary/20">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h4 className="font-semibold">Quick Optimizations</h4>
              <p className="text-sm text-muted-foreground">AI-recommended actions based on analytics</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="outline" className="gap-1">
                <TrendingUp className="w-3 h-3" />
                Scale Sales Team
              </Button>
              <Button size="sm" variant="outline" className="gap-1">
                <Target className="w-3 h-3" />
                Boost Ad Budget
              </Button>
              <Button size="sm" variant="outline" className="gap-1">
                <AlertTriangle className="w-3 h-3" />
                Fix Domain Bots
              </Button>
              <Button size="sm" className="gap-1 bg-gradient-to-r from-primary to-purple-500">
                <Zap className="w-3 h-3" />
                Auto-Optimize All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
