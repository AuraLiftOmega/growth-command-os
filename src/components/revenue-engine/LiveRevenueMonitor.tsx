import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  TrendingUp, 
  Zap, 
  ShoppingCart,
  CreditCard,
  ArrowUpRight,
  Activity,
  Clock,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useStripeAnalytics, StripeRevenueEvent } from "@/hooks/useStripeAnalytics";

interface LiveRevenueMonitorProps {
  targetRevenue?: number;
}

export function LiveRevenueMonitor({ 
  targetRevenue = 10000 
}: LiveRevenueMonitorProps) {
  const { metrics, isLoading, error, refresh, isLive } = useStripeAnalytics(30000);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const handleRefresh = () => {
    refresh();
    setLastRefresh(new Date());
  };

  const progressPercentage = Math.min((metrics.todayRevenue / targetRevenue) * 100, 100);
  const remainingToTarget = Math.max(targetRevenue - metrics.todayRevenue, 0);

  const getEventIcon = (type: string) => {
    switch (type) {
      case "sale": return <ShoppingCart className="w-3 h-3" />;
      case "subscription": return <CreditCard className="w-3 h-3" />;
      case "upsell": return <ArrowUpRight className="w-3 h-3" />;
      case "refund": return <DollarSign className="w-3 h-3 text-destructive" />;
      default: return <DollarSign className="w-3 h-3" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "sale": return "text-green-500";
      case "subscription": return "text-blue-500";
      case "upsell": return "text-purple-500";
      case "refund": return "text-destructive";
      default: return "text-green-500";
    }
  };

  return (
    <div className="space-y-4">
      {/* Revenue Progress Header */}
      <Card className="border-green-500/30 bg-gradient-to-br from-green-500/5 via-background to-emerald-500/5">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="w-5 h-5 text-green-500 animate-pulse" />
              Live Stripe Revenue
              {isLive ? (
                <Badge className="bg-green-500 text-xs">💰 LIVE</Badge>
              ) : (
                <Badge variant="outline" className="text-xs">Connecting...</Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {lastRefresh.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
            </div>
          )}
          
          <div className="space-y-4">
            {/* Big Revenue Number */}
            <div className="flex items-end justify-between">
              <div>
                <motion.p 
                  key={metrics.todayRevenue}
                  initial={{ scale: 1.1, color: "#22c55e" }}
                  animate={{ scale: 1, color: "inherit" }}
                  className="text-4xl font-bold"
                >
                  ${metrics.todayRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </motion.p>
                <p className="text-sm text-muted-foreground">Total Revenue Today</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-500">
                  ${remainingToTarget.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">to ${targetRevenue.toLocaleString()} target</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Progress to ${targetRevenue.toLocaleString()}</span>
                <span className="font-medium">{progressPercentage.toFixed(1)}%</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Live Chart */}
            <div className="h-32">
              {metrics.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.chartData}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="time" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#888' }}
                    />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#22c55e" 
                      strokeWidth={2}
                      fill="url(#revenueGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <p className="text-sm">No revenue data yet today</p>
                </div>
              )}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-border/50">
              <div className="text-center">
                <p className="text-lg font-bold">{metrics.todayConversions}</p>
                <p className="text-xs text-muted-foreground">Orders Today</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold">${metrics.avgOrderValue.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Avg Order</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold">${metrics.weekRevenue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">This Week</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Events Feed */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Live Sales Feed
            <Badge variant="outline" className="text-xs">
              {metrics.revenueEvents.length} events
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48">
            <AnimatePresence>
              {metrics.revenueEvents.length > 0 ? (
                <div className="space-y-2">
                  {metrics.revenueEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: "auto" }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className={`flex items-center justify-between p-2 rounded-lg bg-muted/50 border ${
                        index === 0 ? 'border-green-500/30 bg-green-500/5' : 'border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center bg-background ${getEventColor(event.type)}`}>
                          {getEventIcon(event.type)}
                        </div>
                        <div>
                          <p className="text-xs font-medium truncate max-w-[150px]">
                            {event.product}
                          </p>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                            {event.channel} • {new Date(event.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${getEventColor(event.type)}`}>
                          +${event.amount.toFixed(2)}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase">
                          {event.type}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No sales yet today</p>
                  <p className="text-xs">Real Stripe transactions will appear here</p>
                </div>
              )}
            </AnimatePresence>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
