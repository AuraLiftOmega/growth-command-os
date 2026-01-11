import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  DollarSign, 
  TrendingUp, 
  Zap, 
  ShoppingCart,
  CreditCard,
  ArrowUpRight,
  Activity,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

interface RevenueEvent {
  id: string;
  type: "sale" | "subscription" | "refund" | "upsell";
  amount: number;
  product: string;
  channel: string;
  timestamp: Date;
  stripeId?: string;
}

interface LiveRevenueMonitorProps {
  initialRevenue?: number;
  targetRevenue?: number;
}

export function LiveRevenueMonitor({ 
  initialRevenue = 3190, 
  targetRevenue = 10000 
}: LiveRevenueMonitorProps) {
  const [totalRevenue, setTotalRevenue] = useState(initialRevenue);
  const [revenueEvents, setRevenueEvents] = useState<RevenueEvent[]>([]);
  const [chartData, setChartData] = useState<Array<{ time: string; revenue: number }>>([]);
  const [isLive, setIsLive] = useState(true);
  const eventIdCounter = useRef(0);

  // Simulated real-time revenue updates (in production, this would be Stripe webhooks)
  useEffect(() => {
    if (!isLive) return;

    // Initialize chart with historical data
    const now = new Date();
    const initialChartData = Array.from({ length: 12 }, (_, i) => {
      const time = new Date(now.getTime() - (11 - i) * 5 * 60000);
      return {
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        revenue: initialRevenue * (0.8 + (i / 12) * 0.2) + Math.random() * 200,
      };
    });
    setChartData(initialChartData);

    // Simulate incoming sales every 15-45 seconds
    const simulateSale = () => {
      const products = [
        { name: "Radiance Vitamin C Serum", price: 38, channel: "TikTok" },
        { name: "Hydra Glow Moisturizer", price: 42, channel: "Instagram" },
        { name: "Retinol Night Cream", price: 55, channel: "Google Ads" },
        { name: "Complete Skincare Set", price: 149, channel: "WhatsApp" },
        { name: "Collagen Boost Eye Cream", price: 35, channel: "Pinterest" },
        { name: "Niacinamide Pore Serum", price: 32, channel: "Email" },
      ];
      
      const product = products[Math.floor(Math.random() * products.length)];
      const eventTypes: RevenueEvent["type"][] = ["sale", "sale", "sale", "upsell"];
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const amount = eventType === "upsell" ? product.price * 1.5 : product.price;

      const newEvent: RevenueEvent = {
        id: `evt-${++eventIdCounter.current}`,
        type: eventType,
        amount,
        product: product.name,
        channel: product.channel,
        timestamp: new Date(),
        stripeId: `pi_${Math.random().toString(36).substring(2, 15)}`,
      };

      setRevenueEvents(prev => [newEvent, ...prev].slice(0, 50));
      setTotalRevenue(prev => prev + amount);
      
      // Update chart
      setChartData(prev => {
        const newData = [...prev.slice(1), {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          revenue: totalRevenue + amount,
        }];
        return newData;
      });
    };

    // Initial sale after 3 seconds
    const initialTimeout = setTimeout(simulateSale, 3000);
    
    // Then random interval between 15-45 seconds
    const interval = setInterval(() => {
      simulateSale();
    }, 15000 + Math.random() * 30000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [isLive, initialRevenue, totalRevenue]);

  const progressPercentage = Math.min((totalRevenue / targetRevenue) * 100, 100);
  const remainingToTarget = Math.max(targetRevenue - totalRevenue, 0);

  const getEventIcon = (type: RevenueEvent["type"]) => {
    switch (type) {
      case "sale": return <ShoppingCart className="w-3 h-3" />;
      case "subscription": return <CreditCard className="w-3 h-3" />;
      case "upsell": return <ArrowUpRight className="w-3 h-3" />;
      case "refund": return <DollarSign className="w-3 h-3 text-destructive" />;
    }
  };

  const getEventColor = (type: RevenueEvent["type"]) => {
    switch (type) {
      case "sale": return "text-green-500";
      case "subscription": return "text-blue-500";
      case "upsell": return "text-purple-500";
      case "refund": return "text-destructive";
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
              {isLive && (
                <Badge className="bg-green-500 animate-pulse text-xs">LIVE</Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Big Revenue Number */}
            <div className="flex items-end justify-between">
              <div>
                <motion.p 
                  key={totalRevenue}
                  initial={{ scale: 1.1, color: "#22c55e" }}
                  animate={{ scale: 1, color: "inherit" }}
                  className="text-4xl font-bold"
                >
                  ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </motion.p>
                <p className="text-sm text-muted-foreground">Total Revenue Today</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-500">
                  ${remainingToTarget.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">to $10k target</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Progress to $10k</span>
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
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
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
              {revenueEvents.length} events
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48">
            <AnimatePresence>
              {revenueEvents.length > 0 ? (
                <div className="space-y-2">
                  {revenueEvents.map((event, index) => (
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
                            {event.channel} • {event.timestamp.toLocaleTimeString()}
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
                  <p className="text-sm">Waiting for sales...</p>
                  <p className="text-xs">Launch Revenue Mode to start</p>
                </div>
              )}
            </AnimatePresence>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
