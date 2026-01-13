import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RevenueEngineDashboard } from "@/components/revenue-engine/RevenueEngineDashboard";
import { RevenueAppsGrid } from "@/components/revenue-engine/RevenueAppsGrid";
import { LiveRevenueMonitor } from "@/components/revenue-engine/LiveRevenueMonitor";
import { LiveBotActivityFeed } from "@/components/revenue-engine/LiveBotActivityFeed";
import { PayoutMonitorDashboard } from "@/components/revenue-engine/PayoutMonitorDashboard";
import { Rocket, Plug, BarChart3, Bot, Activity, DollarSign, TrendingUp, Zap, BanknoteIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function RevenueEngine() {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 border border-primary/20"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                Revenue Engine
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse">AUTONOMOUS</Badge>
              </h1>
              <p className="text-sm text-muted-foreground">
                1-click revenue mode • Self-thinking Grok CEO • Real $10k+ profit machine
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 animate-pulse">
              <Bot className="w-3 h-3" />
              50 Bots Active
            </Badge>
            <Badge variant="outline" className="gap-1 text-green-500 border-green-500/30">
              <BarChart3 className="w-3 h-3" />
              4.2x ROAS
            </Badge>
            <Badge variant="outline" className="gap-1 text-amber-500 border-amber-500/30">
              <DollarSign className="w-3 h-3" />
              $10k Target
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/30">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-xl font-bold text-green-500">$3,190</p>
                <p className="text-xs text-muted-foreground">Today Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/30">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xl font-bold text-blue-500">4.2x</p>
                <p className="text-xs text-muted-foreground">Current ROAS</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/30">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xl font-bold text-purple-500">50</p>
                <p className="text-xs text-muted-foreground">Active Bots</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/30">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xl font-bold text-amber-500">168</p>
                <p className="text-xs text-muted-foreground">Conversions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="engine" className="w-full">
        <TabsList className="grid w-full max-w-3xl grid-cols-5">
          <TabsTrigger value="engine" className="gap-2">
            <Rocket className="w-4 h-4" />
            Revenue Engine
          </TabsTrigger>
          <TabsTrigger value="live" className="gap-2">
            <Activity className="w-4 h-4" />
            Live Monitor
          </TabsTrigger>
          <TabsTrigger value="payouts" className="gap-2">
            <BanknoteIcon className="w-4 h-4" />
            Payouts
          </TabsTrigger>
          <TabsTrigger value="bots" className="gap-2">
            <Bot className="w-4 h-4" />
            Bot Activity
          </TabsTrigger>
          <TabsTrigger value="apps" className="gap-2">
            <Plug className="w-4 h-4" />
            Revenue Apps
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="engine" className="mt-6">
          <RevenueEngineDashboard />
        </TabsContent>

        <TabsContent value="live" className="mt-6">
          <LiveRevenueMonitor initialRevenue={3190} targetRevenue={10000} />
        </TabsContent>

        <TabsContent value="payouts" className="mt-6">
          <PayoutMonitorDashboard />
        </TabsContent>

        <TabsContent value="bots" className="mt-6">
          <LiveBotActivityFeed />
        </TabsContent>
        
        <TabsContent value="apps" className="mt-6">
          <RevenueAppsGrid />
        </TabsContent>
      </Tabs>
    </div>
  );
}
