/**
 * Social Analytics Panel - Unified dashboard with ROAS, engagement, A/B testing
 */

import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Eye,
  Heart,
  BarChart3,
  Zap,
  Target,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

const revenueData = [
  { date: "Mon", tiktok: 1250, instagram: 890, pinterest: 420, youtube: 680 },
  { date: "Tue", tiktok: 1480, instagram: 1020, pinterest: 510, youtube: 740 },
  { date: "Wed", tiktok: 1320, instagram: 950, pinterest: 380, youtube: 820 },
  { date: "Thu", tiktok: 1890, instagram: 1180, pinterest: 620, youtube: 950 },
  { date: "Fri", tiktok: 2100, instagram: 1350, pinterest: 580, youtube: 1100 },
  { date: "Sat", tiktok: 2450, instagram: 1580, pinterest: 720, youtube: 1280 },
  { date: "Sun", tiktok: 2180, instagram: 1420, pinterest: 650, youtube: 1150 },
];

const abTestData = [
  {
    id: "test-1",
    name: "Hook: Question vs Statement",
    status: "running",
    variantA: { name: "Question Hook", conversions: 156, rate: 4.2 },
    variantB: { name: "Statement Hook", conversions: 189, rate: 5.1 },
    winner: "B",
    confidence: 94,
    daysLeft: 3,
  },
  {
    id: "test-2",
    name: "CTA: Shop Now vs Learn More",
    status: "running",
    variantA: { name: "Shop Now", conversions: 234, rate: 6.8 },
    variantB: { name: "Learn More", conversions: 198, rate: 5.7 },
    winner: "A",
    confidence: 87,
    daysLeft: 5,
  },
  {
    id: "test-3",
    name: "Video Length: 15s vs 30s",
    status: "completed",
    variantA: { name: "15 seconds", conversions: 312, rate: 7.2 },
    variantB: { name: "30 seconds", conversions: 287, rate: 6.4 },
    winner: "A",
    confidence: 96,
    daysLeft: 0,
  },
];

const platformMetrics = [
  {
    platform: "TikTok",
    icon: "🎵",
    roas: 4.2,
    roasChange: 12,
    spend: 2450,
    revenue: 10290,
    conversions: 342,
    ctr: 3.8,
    cpc: 0.42,
  },
  {
    platform: "Instagram",
    icon: "📸",
    roas: 3.1,
    roasChange: -5,
    spend: 1890,
    revenue: 5859,
    conversions: 198,
    ctr: 2.4,
    cpc: 0.68,
  },
  {
    platform: "Pinterest",
    icon: "📌",
    roas: 5.8,
    roasChange: 24,
    spend: 680,
    revenue: 3944,
    conversions: 156,
    ctr: 4.2,
    cpc: 0.31,
  },
  {
    platform: "YouTube",
    icon: "🎬",
    roas: 2.8,
    roasChange: 8,
    spend: 1420,
    revenue: 3976,
    conversions: 112,
    ctr: 1.8,
    cpc: 0.89,
  },
];

function formatCurrency(num: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function SocialAnalyticsPanel() {
  const [selectedPeriod, setSelectedPeriod] = useState("7d");

  const totalRevenue = platformMetrics.reduce((sum, p) => sum + p.revenue, 0);
  const totalSpend = platformMetrics.reduce((sum, p) => sum + p.spend, 0);
  const overallROAS = totalRevenue / totalSpend;
  const totalConversions = platformMetrics.reduce((sum, p) => sum + p.conversions, 0);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold font-mono">
                    {formatCurrency(totalRevenue)}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-success/10">
                  <DollarSign className="w-5 h-5 text-success" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-success">
                <ArrowUpRight className="w-3 h-3" />
                <span>+18.2% vs last week</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Overall ROAS</p>
                  <p className="text-2xl font-bold font-mono">
                    {overallROAS.toFixed(1)}x
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-success">
                <ArrowUpRight className="w-3 h-3" />
                <span>+0.4x improvement</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Spend</p>
                  <p className="text-2xl font-bold font-mono">
                    {formatCurrency(totalSpend)}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-warning/10">
                  <BarChart3 className="w-5 h-5 text-warning" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <span>Ad budget utilized</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Conversions</p>
                  <p className="text-2xl font-bold font-mono">
                    {totalConversions.toLocaleString()}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-accent/10">
                  <Target className="w-5 h-5 text-accent" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-success">
                <ArrowUpRight className="w-3 h-3" />
                <span>+24% vs last week</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="platforms">By Platform</TabsTrigger>
          <TabsTrigger value="ab-tests">A/B Tests</TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Revenue by Channel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="tiktok"
                      stroke="#ff0050"
                      strokeWidth={2}
                      dot={false}
                      name="TikTok"
                    />
                    <Line
                      type="monotone"
                      dataKey="instagram"
                      stroke="#e1306c"
                      strokeWidth={2}
                      dot={false}
                      name="Instagram"
                    />
                    <Line
                      type="monotone"
                      dataKey="pinterest"
                      stroke="#e60023"
                      strokeWidth={2}
                      dot={false}
                      name="Pinterest"
                    />
                    <Line
                      type="monotone"
                      dataKey="youtube"
                      stroke="#ff0000"
                      strokeWidth={2}
                      dot={false}
                      name="YouTube"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Platforms Tab */}
        <TabsContent value="platforms" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {platformMetrics.map((platform, index) => (
              <motion.div
                key={platform.platform}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{platform.icon}</span>
                        <span className="font-semibold">{platform.platform}</span>
                      </div>
                      <Badge
                        variant={platform.roasChange >= 0 ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {platform.roasChange >= 0 ? "+" : ""}
                        {platform.roasChange}% ROAS
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold font-mono text-primary">
                          {platform.roas}x
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase">
                          ROAS
                        </p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold font-mono">
                          {formatCurrency(platform.revenue)}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase">
                          Revenue
                        </p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold font-mono">
                          {platform.conversions}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase">
                          Conv.
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                      <div>
                        <span className="block font-medium text-foreground">
                          {platform.ctr}%
                        </span>
                        CTR
                      </div>
                      <div>
                        <span className="block font-medium text-foreground">
                          ${platform.cpc}
                        </span>
                        CPC
                      </div>
                      <div>
                        <span className="block font-medium text-foreground">
                          {formatCurrency(platform.spend)}
                        </span>
                        Spend
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* A/B Tests Tab */}
        <TabsContent value="ab-tests" className="space-y-4">
          {abTestData.map((test, index) => (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      <span className="font-semibold">{test.name}</span>
                    </div>
                    <Badge
                      variant={test.status === "running" ? "default" : "secondary"}
                    >
                      {test.status === "running"
                        ? `${test.daysLeft}d left`
                        : "Completed"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Variant A */}
                    <div
                      className={`p-3 rounded-lg border ${
                        test.winner === "A"
                          ? "border-success bg-success/5"
                          : "border-border"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium">
                          A: {test.variantA.name}
                        </span>
                        {test.winner === "A" && (
                          <Badge variant="outline" className="text-[9px] text-success">
                            WINNER
                          </Badge>
                        )}
                      </div>
                      <p className="text-2xl font-bold font-mono">
                        {test.variantA.rate}%
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {test.variantA.conversions} conversions
                      </p>
                    </div>

                    {/* Variant B */}
                    <div
                      className={`p-3 rounded-lg border ${
                        test.winner === "B"
                          ? "border-success bg-success/5"
                          : "border-border"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium">
                          B: {test.variantB.name}
                        </span>
                        {test.winner === "B" && (
                          <Badge variant="outline" className="text-[9px] text-success">
                            WINNER
                          </Badge>
                        )}
                      </div>
                      <p className="text-2xl font-bold font-mono">
                        {test.variantB.rate}%
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {test.variantB.conversions} conversions
                      </p>
                    </div>
                  </div>

                  {/* Confidence Bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        Statistical Confidence
                      </span>
                      <span className="font-medium">{test.confidence}%</span>
                    </div>
                    <Progress value={test.confidence} className="h-1.5" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
