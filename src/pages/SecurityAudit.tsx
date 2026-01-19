import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  CreditCard, 
  Database, 
  Github, 
  Wallet,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  RefreshCw,
  Eye,
  Lock
} from "lucide-react";
import { StripeSecurityAudit } from "@/components/security/StripeSecurityAudit";
import { SupabaseSecretsAudit } from "@/components/security/SupabaseSecretsAudit";
import { GitHubSecurityAudit } from "@/components/security/GitHubSecurityAudit";
import { WalletSecurityAudit } from "@/components/security/WalletSecurityAudit";
import { ThreatDetectionPanel } from "@/components/security/ThreatDetectionPanel";
import { SecurityStatusDashboard } from "@/components/security/SecurityStatusDashboard";
import { useSecurityAudit } from "@/hooks/useSecurityAudit";

const SecurityAudit = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { 
    auditStatus, 
    lastAuditTime, 
    runFullAudit, 
    exportSnapshot,
    isRunning 
  } = useSecurityAudit();

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
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="font-display text-3xl font-bold text-foreground">
                    Security Operations Center
                  </h1>
                  <p className="text-muted-foreground">
                    Platform Hardening & Precautionary Audit • No Active Breach Detected
                  </p>
                </div>
              </div>
              
              {/* Status & Actions */}
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                  auditStatus === 'secure' 
                    ? 'bg-success/10 border-success/30 text-success' 
                    : auditStatus === 'warning'
                    ? 'bg-warning/10 border-warning/30 text-warning'
                    : 'bg-muted/50 border-border text-muted-foreground'
                }`}>
                  {auditStatus === 'secure' ? (
                    <ShieldCheck className="w-5 h-5" />
                  ) : auditStatus === 'warning' ? (
                    <ShieldAlert className="w-5 h-5" />
                  ) : (
                    <Clock className="w-5 h-5" />
                  )}
                  <span className="font-medium">
                    {auditStatus === 'secure' ? '✅ SECURE' : auditStatus === 'warning' ? '⚠️ REVIEW NEEDED' : 'PENDING AUDIT'}
                  </span>
                </div>
                
                <Button
                  variant="outline"
                  onClick={runFullAudit}
                  disabled={isRunning}
                  className="gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
                  {isRunning ? 'Running...' : 'Run Audit'}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={exportSnapshot}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Snapshot
                </Button>
              </div>
            </div>
            
            {lastAuditTime && (
              <p className="text-xs text-muted-foreground mt-2">
                Last audit: {lastAuditTime.toLocaleString()}
              </p>
            )}
          </div>

          {/* Important Notice */}
          <Card className="mb-6 border-blue-500/30 bg-blue-500/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Eye className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-400">Precautionary Audit Only</p>
                  <p className="text-sm text-muted-foreground">
                    This is a one-time security audit. There is NO confirmed breach. 
                    All actions require your manual confirmation before execution.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-card/60 border border-border p-1 h-auto flex-wrap">
              <TabsTrigger value="overview" className="data-[state=active]:bg-success data-[state=active]:text-success-foreground gap-2">
                <Shield className="w-4 h-4" />
                Status Dashboard
              </TabsTrigger>
              <TabsTrigger value="stripe" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
                <CreditCard className="w-4 h-4" />
                Stripe Security
              </TabsTrigger>
              <TabsTrigger value="supabase" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
                <Database className="w-4 h-4" />
                Secrets & Roles
              </TabsTrigger>
              <TabsTrigger value="github" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
                <Github className="w-4 h-4" />
                GitHub Audit
              </TabsTrigger>
              <TabsTrigger value="wallet" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
                <Wallet className="w-4 h-4" />
                Wallet Safety
              </TabsTrigger>
              <TabsTrigger value="threats" className="data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground gap-2">
                <AlertTriangle className="w-4 h-4" />
                Threat Detection
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-0">
              <SecurityStatusDashboard />
            </TabsContent>

            <TabsContent value="stripe" className="mt-0">
              <StripeSecurityAudit />
            </TabsContent>

            <TabsContent value="supabase" className="mt-0">
              <SupabaseSecretsAudit />
            </TabsContent>

            <TabsContent value="github" className="mt-0">
              <GitHubSecurityAudit />
            </TabsContent>

            <TabsContent value="wallet" className="mt-0">
              <WalletSecurityAudit />
            </TabsContent>

            <TabsContent value="threats" className="mt-0">
              <ThreatDetectionPanel />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default SecurityAudit;
