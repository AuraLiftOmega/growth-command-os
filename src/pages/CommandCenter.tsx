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
  ShieldAlert,
  Globe,
  Link2,
  Megaphone,
  Building2,
  DollarSign,
  Radio
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
import { 
  IndustryAdaptationEngine, 
  SelfMarketingEngine, 
  IntegrationSovereignty, 
  MultiTenantControl,
  GovernanceController 
} from "@/components/universal";
import { CashEngineDashboard } from "@/components/cash-engine";
import { TrafficEngineDashboard } from "@/components/traffic-engine";
import { useDominionStore } from "@/stores/dominion-core-store";
import { useCashEngineStore } from "@/stores/cash-engine-store";
import { useTrafficEngineStore } from "@/stores/traffic-engine-store";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CommandCenter = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  const { industry, tenantMode, isSelfMarketingActive } = useDominionStore();
  const { isActive: isCashEngineActive } = useCashEngineStore();
  const { isActive: isTrafficEngineActive } = useTrafficEngineStore();
  return (
    <div className="min-h-screen bg-background flex w-full">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-6 pt-24">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Crown className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="font-display text-3xl font-bold gradient-text">
                    DOMINION COMMAND
                  </h1>
                  <p className="text-muted-foreground">
                    Universal Revenue Operating System • {tenantMode === 'founder' ? 'Founder Mode' : tenantMode === 'customer' ? 'Customer Mode' : 'Demo Mode'}
                  </p>
                </div>
              </div>
              
              {/* Status Indicators */}
              <div className="flex items-center gap-4">
                {industry && (
                  <div className="px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20">
                    <span className="text-xs font-medium text-accent capitalize">{industry}</span>
                  </div>
                )}
                {isSelfMarketingActive && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs font-medium text-primary">Self-Marketing Live</span>
                  </div>
                )}
                {isCashEngineActive && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10 border border-success/20">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span className="text-xs font-medium text-success">Cash Engine Active</span>
                  </div>
                )}
                {isTrafficEngineActive && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-medium text-emerald-400">Traffic Engine Live</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-card/60 border border-border p-1 h-auto flex-wrap">
              {/* Core Operations */}
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
                Messages
              </TabsTrigger>
              <TabsTrigger value="power-users" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
                <Users className="w-4 h-4" />
                Power Users
              </TabsTrigger>
              <TabsTrigger value="dm-engine" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
                <Zap className="w-4 h-4" />
                DM Engine
              </TabsTrigger>
              
              {/* U-ROS Modules */}
              <div className="w-px h-6 bg-border mx-1" />
              <TabsTrigger value="industry" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground gap-2">
                <Globe className="w-4 h-4" />
                Industry
              </TabsTrigger>
              <TabsTrigger value="integrations" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground gap-2">
                <Link2 className="w-4 h-4" />
                Integrations
              </TabsTrigger>
              <TabsTrigger value="self-marketing" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground gap-2">
                <Megaphone className="w-4 h-4" />
                Self-Marketing
              </TabsTrigger>
              <TabsTrigger value="multi-tenant" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground gap-2">
                <Building2 className="w-4 h-4" />
                Multi-Tenant
              </TabsTrigger>
              <TabsTrigger value="cash-engine" className="data-[state=active]:bg-success data-[state=active]:text-success-foreground gap-2">
                <DollarSign className="w-4 h-4" />
                Cash Engine
              </TabsTrigger>
              <TabsTrigger value="traffic-engine" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white gap-2">
                <Radio className="w-4 h-4" />
                Traffic Engine
              </TabsTrigger>
              
              {/* Defense & Scale */}
              <div className="w-px h-6 bg-border mx-1" />
              <TabsTrigger value="rollout" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
                <Rocket className="w-4 h-4" />
                Rollout
              </TabsTrigger>
              <TabsTrigger value="proof" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
                <TrendingUp className="w-4 h-4" />
                Proof
              </TabsTrigger>
              <TabsTrigger value="org-scaling" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
                <Network className="w-4 h-4" />
                Org Scale
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
              <TabsTrigger value="governance" className="data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground gap-2">
                <Crown className="w-4 h-4" />
                Governance
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
                Revenue War Room
              </Button>
            </div>

            {/* Core Operations */}
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

            {/* U-ROS Modules */}
            <TabsContent value="industry" className="mt-0">
              <IndustryAdaptationEngine />
            </TabsContent>

            <TabsContent value="integrations" className="mt-0">
              <IntegrationSovereignty />
            </TabsContent>

            <TabsContent value="self-marketing" className="mt-0">
              <SelfMarketingEngine />
            </TabsContent>

            <TabsContent value="multi-tenant" className="mt-0">
              <MultiTenantControl />
            </TabsContent>

            <TabsContent value="cash-engine" className="mt-0">
              <CashEngineDashboard />
            </TabsContent>

            <TabsContent value="traffic-engine" className="mt-0">
              <TrafficEngineDashboard />
            </TabsContent>

            {/* Defense & Scale */}
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

            <TabsContent value="governance" className="mt-0">
              <GovernanceController />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default CommandCenter;
