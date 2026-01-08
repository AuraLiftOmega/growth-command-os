import { SmartSidebar } from "@/components/layout/SmartSidebar";
import { Header } from "@/components/layout/Header";
import { LethalWarRoom } from "@/components/war-room/LethalWarRoom";
import { CRMDashboard } from "@/components/crm/CRMDashboard";
import { LiveProfitEngine } from "@/components/autonomous/LiveProfitEngine";
import { RealVideoSwarm } from "@/components/autonomous/RealVideoSwarm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Users, Zap, DollarSign, Flame, Video, Rocket } from "lucide-react";
import { CEOChatWidget } from "@/components/ceo-engine/CEOChatWidget";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

const WarRoom = () => {
  const [swarmVideos, setSwarmVideos] = useState<any[]>([]);
  const [swarmActive, setSwarmActive] = useState(false);

  const handleSwarmComplete = (videos: any[]) => {
    setSwarmVideos(videos);
    setSwarmActive(false);
    toast.success(`🎉 Swarm complete! ${videos.filter(v => v.status === 'published').length} videos published!`);
  };

  return (
    <div className="min-h-screen bg-background flex w-full">
      <SmartSidebar />
      <div className="flex-1 ml-64 transition-all duration-300">
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
                  {swarmActive && (
                    <Badge className="bg-primary/20 text-primary animate-pulse gap-1">
                      <Rocket className="w-3 h-3" />
                      SWARM ACTIVE
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">
                  Real-time autonomous revenue generation • 15 products • 6 channels • Real Replicate AI
                </p>
              </div>
            </div>
          </motion.div>

          <Tabs defaultValue="swarm" className="space-y-6">
            <TabsList className="bg-card border">
              <TabsTrigger value="swarm" className="gap-2">
                <Video className="h-4 w-4" />
                Video Swarm
              </TabsTrigger>
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

            <TabsContent value="swarm">
              <RealVideoSwarm onComplete={handleSwarmComplete} />
            </TabsContent>

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
