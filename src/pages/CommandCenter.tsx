import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Crown, 
  Target, 
  MessageSquare, 
  Users, 
  Swords, 
  Rocket, 
  TrendingUp, 
  Eye,
  Shield,
  Zap,
  Crosshair,
  Network,
  Lock,
  ShieldAlert
} from "lucide-react";
import { StrategicDoctrine } from "@/components/command-center/StrategicDoctrine";
import { MessageVault } from "@/components/command-center/MessageVault";
import { PowerUsersSystem } from "@/components/command-center/PowerUsersSystem";
import { DominationRollout } from "@/components/command-center/DominationRollout";
import { ProofEngine } from "@/components/command-center/ProofEngine";
import { DailyCommandView } from "@/components/command-center/DailyCommandView";
import { PermissionMatrix } from "@/components/command-center/PermissionMatrix";
import ColdDMEngine from "@/components/command-center/ColdDMEngine";
import OrgScalingEngine from "@/components/command-center/OrgScalingEngine";
import CompetitiveKillSwitch from "@/components/command-center/CompetitiveKillSwitch";
import MoatHardeningSystem from "@/components/command-center/MoatHardeningSystem";
import RiskInsulationEngine from "@/components/command-center/RiskInsulationEngine";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CommandCenter = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex w-full">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-6 pt-24">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                <Crown className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold gradient-text">
                  CEO COMMAND CENTER
                </h1>
                <p className="text-muted-foreground">
                  Central nervous system for aggressive market domination
                </p>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-card/60 border border-border p-1 h-auto flex-wrap">
              <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
                <Eye className="w-4 h-4" />
                Daily View
              </TabsTrigger>
              <TabsTrigger value="doctrine" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
                <Target className="w-4 h-4" />
                Doctrine
              </TabsTrigger>
              <TabsTrigger value="messages" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
                <MessageSquare className="w-4 h-4" />
                Message Vault
              </TabsTrigger>
              <TabsTrigger value="power-users" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
                <Users className="w-4 h-4" />
                Power Users
              </TabsTrigger>
              <TabsTrigger value="dm-engine" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
                <Zap className="w-4 h-4" />
                DM Engine
              </TabsTrigger>
              <TabsTrigger value="rollout" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
                <Rocket className="w-4 h-4" />
                Rollout
              </TabsTrigger>
              <TabsTrigger value="proof" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
                <TrendingUp className="w-4 h-4" />
                Proof Engine
              </TabsTrigger>
              <TabsTrigger value="org-scaling" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
                <Network className="w-4 h-4" />
                Org Scaling
              </TabsTrigger>
              <TabsTrigger value="kill-switch" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
                <Crosshair className="w-4 h-4" />
                Kill-Switch
              </TabsTrigger>
              <TabsTrigger value="moat" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
                <Lock className="w-4 h-4" />
                Moat
              </TabsTrigger>
              <TabsTrigger value="risk" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
                <ShieldAlert className="w-4 h-4" />
                Risk
              </TabsTrigger>
              <TabsTrigger value="permissions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
                <Shield className="w-4 h-4" />
                Permissions
              </TabsTrigger>
            </TabsList>

            {/* Quick Access to War Room */}
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => navigate('/war-room')}
                className="gap-2 border-destructive/50 text-destructive hover:bg-destructive/10"
              >
                <Swords className="w-4 h-4" />
                Open Revenue War Room
              </Button>
            </div>

            <TabsContent value="overview" className="mt-0">
              <DailyCommandView />
            </TabsContent>

            <TabsContent value="doctrine" className="mt-0">
              <StrategicDoctrine />
            </TabsContent>

            <TabsContent value="messages" className="mt-0">
              <MessageVault />
            </TabsContent>

            <TabsContent value="power-users" className="mt-0">
              <PowerUsersSystem />
            </TabsContent>

            <TabsContent value="dm-engine" className="mt-0">
              <ColdDMEngine />
            </TabsContent>

            <TabsContent value="rollout" className="mt-0">
              <DominationRollout />
            </TabsContent>

            <TabsContent value="proof" className="mt-0">
              <ProofEngine />
            </TabsContent>

            <TabsContent value="org-scaling" className="mt-0">
              <OrgScalingEngine />
            </TabsContent>

            <TabsContent value="kill-switch" className="mt-0">
              <CompetitiveKillSwitch />
            </TabsContent>

            <TabsContent value="moat" className="mt-0">
              <MoatHardeningSystem />
            </TabsContent>

            <TabsContent value="risk" className="mt-0">
              <RiskInsulationEngine />
            </TabsContent>

            <TabsContent value="permissions" className="mt-0">
              <PermissionMatrix />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default CommandCenter;
