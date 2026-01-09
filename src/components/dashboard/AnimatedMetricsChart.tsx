/**
 * ANIMATED METRICS CHART - Vivid sales/social metrics with framer-motion & Recharts
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

// Generate sample data
const generateRevenueData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day, i) => ({
    name: day,
    revenue: Math.floor(Math.random() * 5000) + 2000,
    orders: Math.floor(Math.random() * 100) + 30,
    ads: Math.floor(Math.random() * 3000) + 500,
  }));
};

const generateSocialData = () => {
  return [
    { name: 'TikTok', value: 45, color: 'hsl(340, 82%, 52%)' },
    { name: 'Instagram', value: 30, color: 'hsl(330, 80%, 55%)' },
    { name: 'YouTube', value: 15, color: 'hsl(0, 100%, 50%)' },
    { name: 'X', value: 10, color: 'hsl(0, 0%, 20%)' },
  ];
};

const generateEngagementData = () => {
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
  return hours.map((hour) => ({
    hour,
    engagement: Math.floor(Math.random() * 1000) + 100,
    views: Math.floor(Math.random() * 5000) + 500,
  }));
};

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}

function AnimatedCounter({ value, prefix = '', suffix = '', duration = 1.5 }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.floor(easeOutQuart * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return (
    <span>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
}

export function AnimatedMetricsChart() {
  const [revenueData] = useState(generateRevenueData);
  const [socialData] = useState(generateSocialData);
  const [engagementData] = useState(generateEngagementData);
  const [activeTab, setActiveTab] = useState('revenue');

  const totalRevenue = revenueData.reduce((acc, d) => acc + d.revenue, 0);
  const totalOrders = revenueData.reduce((acc, d) => acc + d.orders, 0);
  const avgEngagement = Math.floor(engagementData.reduce((acc, d) => acc + d.engagement, 0) / engagementData.length);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card/95 backdrop-blur-xl border border-border p-3 rounded-lg shadow-lg"
        >
          <p className="text-xs font-medium text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('revenue') || entry.name === 'ads' ? '$' : ''}{entry.value.toLocaleString()}
            </p>
          ))}
        </motion.div>
      );
    }
    return null;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Performance Analytics
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs gap-1 text-success border-success/30">
              <TrendingUp className="w-3 h-3" />
              +23.4%
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Animated Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center p-3 rounded-lg bg-success/10 border border-success/20"
          >
            <p className="text-2xl font-bold font-mono text-success">
              <AnimatedCounter value={totalRevenue} prefix="$" />
            </p>
            <p className="text-[10px] text-muted-foreground uppercase">Weekly Revenue</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center p-3 rounded-lg bg-primary/10 border border-primary/20"
          >
            <p className="text-2xl font-bold font-mono text-primary">
              <AnimatedCounter value={totalOrders} />
            </p>
            <p className="text-[10px] text-muted-foreground uppercase">Orders</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center p-3 rounded-lg bg-accent/10 border border-accent/20"
          >
            <p className="text-2xl font-bold font-mono text-accent">
              <AnimatedCounter value={avgEngagement} />
            </p>
            <p className="text-[10px] text-muted-foreground uppercase">Avg Engagement</p>
          </motion.div>
        </div>

        {/* Chart Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="revenue" className="gap-1.5 text-xs">
              <BarChart3 className="w-3 h-3" />
              Revenue
            </TabsTrigger>
            <TabsTrigger value="social" className="gap-1.5 text-xs">
              <PieChartIcon className="w-3 h-3" />
              Channels
            </TabsTrigger>
            <TabsTrigger value="engagement" className="gap-1.5 text-xs">
              <Activity className="w-3 h-3" />
              Engagement
            </TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="mt-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="h-[250px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(155, 85%, 42%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(155, 85%, 42%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="adsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(270, 85%, 58%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(270, 85%, 58%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 12%, 14%)" />
                  <XAxis dataKey="name" stroke="hsl(220, 8%, 45%)" fontSize={10} />
                  <YAxis stroke="hsl(220, 8%, 45%)" fontSize={10} tickFormatter={(v) => `$${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(155, 85%, 42%)"
                    fill="url(#revenueGradient)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="ads"
                    stroke="hsl(270, 85%, 58%)"
                    fill="url(#adsGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </TabsContent>

          <TabsContent value="social" className="mt-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="h-[250px] flex items-center justify-center"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={socialData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {socialData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-bold font-mono">4</span>
                <span className="text-[10px] text-muted-foreground">Channels</span>
              </div>
            </motion.div>
            <div className="flex justify-center gap-4 mt-2">
              {socialData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="engagement" className="mt-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="h-[250px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={engagementData.slice(0, 12)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 12%, 14%)" />
                  <XAxis dataKey="hour" stroke="hsl(220, 8%, 45%)" fontSize={10} />
                  <YAxis stroke="hsl(220, 8%, 45%)" fontSize={10} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="engagement"
                    stroke="hsl(0, 90%, 50%)"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(0, 90%, 50%)', r: 3 }}
                    activeDot={{ r: 5, fill: 'hsl(0, 90%, 50%)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="hsl(200, 85%, 52%)"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(200, 85%, 52%)', r: 3 }}
                    activeDot={{ r: 5, fill: 'hsl(200, 85%, 52%)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
