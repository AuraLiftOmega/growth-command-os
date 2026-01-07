import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { LethalWarRoom } from "@/components/war-room/LethalWarRoom";
import { CRMDashboard } from "@/components/crm/CRMDashboard";
import { LiveProfitEngine } from "@/components/autonomous/LiveProfitEngine";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Users, Zap, Brain, DollarSign, Flame } from "lucide-react";
import { CEOChatWidget } from "@/components/ceo-engine/CEOChatWidget";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const WarRoom = () => {
  return (
    <div className="min-h-screen bg-background flex w-full">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-6 pt-24">
          {/* War Room Hero */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 rounded-xl bg-gradient-to-br from-destructive to-chart-3 shadow-lg">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-display font-bold">WAR ROOM</h1>
                  <Badge className="bg-success/20 text-success animate-pulse">
                    PROFITS COMPOUNDING
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  Real-time autonomous revenue generation across all channels
                </p>
              </div>
            </div>
          </motion.div>

          <Tabs defaultValue="live-profits" className="space-y-6">
            <TabsList className="bg-card border">
              <TabsTrigger value="live-profits" className="gap-2">
                <DollarSign className="h-4 w-4" />
                Live Profits
              </TabsTrigger>
              <TabsTrigger value="war-room" className="gap-2">
                <Target className="h-4 w-4" />
                Sales Tactics
              </TabsTrigger>
              <TabsTrigger value="crm" className="gap-2">
                <Users className="h-4 w-4" />
                CRM Hub
              </TabsTrigger>
              <TabsTrigger value="autonomy" className="gap-2">
                <Zap className="h-4 w-4" />
                Autonomy Control
              </TabsTrigger>
            </TabsList>

            <TabsContent value="live-profits">
              <LiveProfitEngine />
            </TabsContent>

            <TabsContent value="war-room">
              <LethalWarRoom />
            </TabsContent>

            <TabsContent value="crm">
              <CRMDashboard />
            </TabsContent>

            <TabsContent value="autonomy">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                  <CEOChatWidget />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Background Effects */}
      <div className="fixed top-0 right-0 w-[800px] h-[800px] pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-gradient-radial from-success/30 via-primary/10 to-transparent blur-3xl" />
      </div>
    </div>
  );
};

export default WarRoom;
