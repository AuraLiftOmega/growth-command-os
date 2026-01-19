import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  ShieldCheck, 
  CreditCard,
  Database,
  Github,
  Wallet,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";

interface AuditPhase {
  id: string;
  name: string;
  icon: any;
  status: 'pending' | 'in-progress' | 'complete' | 'user-action';
  completedItems: number;
  totalItems: number;
}

export const SecurityStatusDashboard = () => {
  const [phases, setPhases] = useState<AuditPhase[]>([
    {
      id: 'stripe',
      name: 'Stripe Security',
      icon: CreditCard,
      status: 'user-action',
      completedItems: 0,
      totalItems: 7
    },
    {
      id: 'supabase',
      name: 'Secrets & Roles',
      icon: Database,
      status: 'complete',
      completedItems: 28,
      totalItems: 28
    },
    {
      id: 'github',
      name: 'GitHub Audit',
      icon: Github,
      status: 'user-action',
      completedItems: 0,
      totalItems: 9
    },
    {
      id: 'wallet',
      name: 'Wallet Safety',
      icon: Wallet,
      status: 'user-action',
      completedItems: 0,
      totalItems: 2
    }
  ]);

  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    const total = phases.reduce((acc, p) => acc + p.totalItems, 0);
    const completed = phases.reduce((acc, p) => acc + p.completedItems, 0);
    setOverallProgress(Math.round((completed / total) * 100));
  }, [phases]);

  const getStatusIcon = (status: AuditPhase['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'in-progress':
        return <RefreshCw className="w-5 h-5 text-primary animate-spin" />;
      case 'user-action':
        return <Clock className="w-5 h-5 text-amber-500" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: AuditPhase['status']) => {
    switch (status) {
      case 'complete':
        return <Badge className="bg-success">Complete</Badge>;
      case 'in-progress':
        return <Badge>In Progress</Badge>;
      case 'user-action':
        return <Badge className="bg-amber-500">User Action Required</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const exportSnapshot = () => {
    const snapshot = {
      exportedAt: new Date().toISOString(),
      phases,
      overallProgress,
      disclaimer: 'This is a read-only security snapshot for audit purposes.'
    };
    
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-snapshot-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Security snapshot exported');
  };

  const allComplete = phases.every(p => p.status === 'complete');

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <Card className={`border-2 ${
        allComplete 
          ? 'border-success/30 bg-success/5' 
          : 'border-amber-500/30 bg-amber-500/5'
      }`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                allComplete ? 'bg-success/20' : 'bg-amber-500/20'
              }`}>
                {allComplete ? (
                  <ShieldCheck className="w-8 h-8 text-success" />
                ) : (
                  <Shield className="w-8 h-8 text-amber-500" />
                )}
              </div>
              <div>
                <CardTitle className="text-2xl">
                  {allComplete ? '✅ Security Audit Complete' : '⏳ Security Audit In Progress'}
                </CardTitle>
                <CardDescription className="text-base">
                  {allComplete 
                    ? 'All security checks have been verified. Your system is secure.'
                    : 'Some items require your manual verification. Complete all checklists.'}
                </CardDescription>
              </div>
            </div>
            <Button onClick={exportSnapshot} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export Snapshot
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Overall Progress</span>
              <span className="font-medium">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Phase Status Grid */}
      <div className="grid grid-cols-2 gap-4">
        {phases.map(phase => {
          const Icon = phase.icon;
          const progress = Math.round((phase.completedItems / phase.totalItems) * 100);
          
          return (
            <Card key={phase.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{phase.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {phase.completedItems}/{phase.totalItems} items
                      </CardDescription>
                    </div>
                  </div>
                  {getStatusIcon(phase.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Progress value={progress} className="h-1.5" />
                <div className="flex items-center justify-between">
                  {getStatusBadge(phase.status)}
                  <span className="text-xs text-muted-foreground">{progress}%</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Checklist Completion Tracker */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Completion Tracker
          </CardTitle>
          <CardDescription>
            Track your progress through each security verification phase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {phases.map(phase => {
              const Icon = phase.icon;
              const progress = Math.round((phase.completedItems / phase.totalItems) * 100);
              
              return (
                <div key={phase.id} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{phase.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {phase.completedItems}/{phase.totalItems}
                      </span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                  </div>
                  <div className="shrink-0">
                    {getStatusIcon(phase.status)}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Security Guidelines */}
      <Card className="border-blue-500/30 bg-blue-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-400">
            <Shield className="w-5 h-5" />
            Security Audit Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <p className="font-medium text-blue-400 mb-1">Calm & Factual</p>
              <p className="text-xs text-muted-foreground">
                This audit uses factual data only. No assumptions about compromise.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10">
              <p className="font-medium text-blue-400 mb-1">User Confirmed</p>
              <p className="text-xs text-muted-foreground">
                All critical actions require your explicit confirmation.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10">
              <p className="font-medium text-blue-400 mb-1">One-Time Audit</p>
              <p className="text-xs text-muted-foreground">
                This audit runs once unless you manually re-trigger it.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
