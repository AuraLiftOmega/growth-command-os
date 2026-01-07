import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { LethalWarRoom } from "@/components/war-room/LethalWarRoom";
import { CRMDashboard } from "@/components/crm/CRMDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Users, Zap, Brain } from "lucide-react";
import { CEOChatWidget } from "@/components/ceo-engine/CEOChatWidget";

const WarRoom = () => {
  return (
    <div className="min-h-screen bg-background flex w-full">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-6 pt-24">
          <Tabs defaultValue="war-room" className="space-y-6">
            <TabsList className="bg-card border">
              <TabsTrigger value="war-room" className="gap-2">
                <Target className="h-4 w-4" />
                War Room
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
    </div>
  );
};

export default WarRoom;
