import { motion } from "framer-motion";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  Video,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  Brain,
} from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLiveMetrics } from "@/hooks/useLiveMetrics";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { ShopifySyncStatus } from "@/components/dashboard/ShopifySyncStatus";
import { OmegaAISidebar } from "@/components/dashboard/OmegaAISidebar";
import { STORE_CONFIG, DOMINION_LOGO_URL } from "@/lib/store-config";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ElementType;
  description?: string;
  delay?: number;
}

function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  description,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="metric-card group">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-medium">
                {title}
              </p>
              <p className="text-2xl lg:text-3xl font-bold font-mono tracking-tight">
                {value}
              </p>
              {change && (
                <div className="flex items-center gap-1.5">
                  {changeType === "positive" ? (
                    <ArrowUpRight className="w-3.5 h-3.5 text-success" />
                  ) : changeType === "negative" ? (
                    <ArrowDownRight className="w-3.5 h-3.5 text-destructive" />
                  ) : null}
                  <span
                    className={`text-xs font-medium ${
                      changeType === "positive"
                        ? "text-success"
                        : changeType === "negative"
                        ? "text-destructive"
                        : "text-muted-foreground"
                    }`}
                  >
                    {change}
                  </span>
                  {description && (
                    <span className="text-xs text-muted-foreground">
                      {description}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Icon className="w-5 h-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function DashboardHome() {
  const { metrics } = useLiveMetrics();
  const [omegaOpen, setOmegaOpen] = useState(false);

  const formatCurrency = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
    return `$${num.toFixed(0)}`;
  };

  // Mock real-time data
  const activeAgents = 3;
  const totalAgents = 5;
  const adsRunning = 12;
  const pixelEvents = 847;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img 
            src={DOMINION_LOGO_URL} 
            alt="Dominion" 
            className="h-10 w-auto object-contain"
          />
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">{STORE_CONFIG.name}</h1>
            <p className="text-muted-foreground">
              Real-time overview of your revenue operations
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-success/30 text-success bg-success/10">
            <Activity className="w-3 h-3 mr-1" />
            Live
          </Badge>
          <span className="text-xs text-muted-foreground">
            Last updated: just now
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(metrics.mrr * 12)}
          change={`+${metrics.mrrChange}%`}
          changeType="positive"
          icon={DollarSign}
          description="vs last month"
          delay={0}
        />
        <StatCard
          title="Orders Today"
          value={metrics.totalDeals.toString()}
          change={`+${metrics.leadsChange}`}
          changeType="positive"
          icon={ShoppingCart}
          description="new orders"
          delay={0.05}
        />
        <StatCard
          title="Conversion Rate"
          value={`${metrics.conversionRate.toFixed(1)}%`}
          change="+2.1%"
          changeType="positive"
          icon={TrendingUp}
          delay={0.1}
        />
        <StatCard
          title="Active Visitors"
          value={metrics.totalLeads.toString()}
          change="Real-time"
          changeType="neutral"
          icon={Users}
          delay={0.15}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Active Omega Agents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="metric-card-intelligence">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Zap className="w-4 h-4 text-accent" />
                Omega Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold font-mono">
                    {activeAgents}/{totalAgents}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Active agents running
                  </p>
                </div>
                <div className="text-right">
                  <Badge className="bg-accent/20 text-accent border-0">
                    Autonomous
                  </Badge>
                </div>
              </div>
              <Progress
                value={(activeAgents / totalAgents) * 100}
                className="mt-4 h-1.5"
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Ad Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <Card className="metric-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Video className="w-4 h-4 text-primary" />
                Ad Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold font-mono">{adsRunning}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Active video ads
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-success">
                    {formatCurrency(metrics.todayRevenue)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Revenue today
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pixel Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="metric-card-success">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="w-4 h-4 text-success" />
                Pixel Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold font-mono">{pixelEvents}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Events tracked today
                  </p>
                </div>
                <div className="text-right">
                  <Badge className="bg-success/20 text-success border-0">
                    Healthy
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
      >
        <RevenueChart />
      </motion.div>

      {/* Shopify Sync Status */}
      <ShopifySyncStatus showSyncButton />

      {/* Omega AI Button */}
      <Button
        onClick={() => setOmegaOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-primary to-accent z-30"
      >
        <Brain className="w-6 h-6" />
      </Button>

      {/* Omega AI Sidebar */}
      <OmegaAISidebar isOpen={omegaOpen} onClose={() => setOmegaOpen(false)} />
    </div>
  );
}
