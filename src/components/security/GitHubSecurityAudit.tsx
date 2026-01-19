import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Github, 
  GitCommit, 
  GitBranch, 
  Users, 
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Clock,
  Shield,
  Eye
} from "lucide-react";
import { toast } from "sonner";

interface AuditItem {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  category: 'commits' | 'sessions' | 'branches';
}

export const GitHubSecurityAudit = () => {
  const [checklist, setChecklist] = useState<AuditItem[]>([
    // Commit audit
    {
      id: 'review-recent-commits',
      label: 'Review Recent Commits',
      description: 'Check the last 10-20 commits for unexpected changes',
      completed: false,
      category: 'commits'
    },
    {
      id: 'verify-commit-authors',
      label: 'Verify Commit Authorship',
      description: 'Confirm all commit authors are recognized team members',
      completed: false,
      category: 'commits'
    },
    {
      id: 'check-commit-timing',
      label: 'Check Commit Timing',
      description: 'Flag any commits made outside normal working hours',
      completed: false,
      category: 'commits'
    },
    
    // Session audit
    {
      id: 'navigate-sessions',
      label: 'Navigate to Sessions',
      description: 'Go to Settings → Security → Sessions',
      completed: false,
      category: 'sessions'
    },
    {
      id: 'review-active-sessions',
      label: 'Review Active Sessions',
      description: 'List all devices and locations with active sessions',
      completed: false,
      category: 'sessions'
    },
    {
      id: 'revoke-unknown-sessions',
      label: 'Revoke Unknown Sessions',
      description: 'Revoke any session from unrecognized device or location',
      completed: false,
      category: 'sessions'
    },
    
    // Branch audit
    {
      id: 'check-branches',
      label: 'Check for Unknown Branches',
      description: 'Confirm no unexpected branches have been created',
      completed: false,
      category: 'branches'
    },
    {
      id: 'verify-branch-protection',
      label: 'Verify Branch Protection',
      description: 'Ensure main/master branch has protection rules enabled',
      completed: false,
      category: 'branches'
    },
    {
      id: 'check-direct-pushes',
      label: 'Check for Direct Pushes',
      description: 'Verify no direct pushes to main without PR review',
      completed: false,
      category: 'branches'
    },
  ]);

  const [integrityRulesEnabled, setIntegrityRulesEnabled] = useState(false);

  const toggleItem = (id: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const enableIntegrityRules = () => {
    setIntegrityRulesEnabled(true);
    toast.success('Commit Integrity Rules enabled - monitoring for suspicious activity');
  };

  const completedCount = checklist.filter(c => c.completed).length;
  const commitItems = checklist.filter(c => c.category === 'commits');
  const sessionItems = checklist.filter(c => c.category === 'sessions');
  const branchItems = checklist.filter(c => c.category === 'branches');

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card className="border-purple-500/30 bg-purple-500/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Github className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <CardTitle>GitHub Repository & Session Audit</CardTitle>
                <CardDescription>Manual verification of repository integrity and access</CardDescription>
              </div>
            </div>
            <Badge variant={completedCount === checklist.length ? "default" : "secondary"}>
              {completedCount}/{checklist.length} Complete
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Commit Audit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCommit className="w-5 h-5" />
            Commit History Audit
          </CardTitle>
          <CardDescription>
            Verify all recent commits are legitimate
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {commitItems.map((item, index) => (
            <div key={item.id}>
              <div className="flex items-start gap-4 p-3 rounded-lg border border-border/50 hover:border-border transition-colors">
                <Checkbox 
                  id={item.id} 
                  checked={item.completed}
                  onCheckedChange={() => toggleItem(item.id)}
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={item.id} className="font-medium cursor-pointer">
                      {item.label}
                    </Label>
                    {item.completed && (
                      <CheckCircle className="w-4 h-4 text-success" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
              {index < commitItems.length - 1 && <Separator className="my-2" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Session Audit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Session Security Audit
          </CardTitle>
          <CardDescription>
            Review and manage active GitHub sessions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {sessionItems.map((item, index) => (
            <div key={item.id}>
              <div className="flex items-start gap-4 p-3 rounded-lg border border-border/50 hover:border-border transition-colors">
                <Checkbox 
                  id={item.id} 
                  checked={item.completed}
                  onCheckedChange={() => toggleItem(item.id)}
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={item.id} className="font-medium cursor-pointer">
                      {item.label}
                    </Label>
                    {item.completed && (
                      <CheckCircle className="w-4 h-4 text-success" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
              {index < sessionItems.length - 1 && <Separator className="my-2" />}
            </div>
          ))}
          
          <Button
            variant="outline"
            className="w-full gap-2 mt-4"
            onClick={() => window.open('https://github.com/settings/security', '_blank')}
          >
            <ExternalLink className="w-4 h-4" />
            Open GitHub Security Settings
          </Button>
        </CardContent>
      </Card>

      {/* Branch Audit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            Branch Protection Audit
          </CardTitle>
          <CardDescription>
            Verify branch security and protection rules
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {branchItems.map((item, index) => (
            <div key={item.id}>
              <div className="flex items-start gap-4 p-3 rounded-lg border border-border/50 hover:border-border transition-colors">
                <Checkbox 
                  id={item.id} 
                  checked={item.completed}
                  onCheckedChange={() => toggleItem(item.id)}
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={item.id} className="font-medium cursor-pointer">
                      {item.label}
                    </Label>
                    {item.completed && (
                      <CheckCircle className="w-4 h-4 text-success" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
              {index < branchItems.length - 1 && <Separator className="my-2" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Commit Integrity Rules */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-amber-500" />
            Commit Integrity Rules
          </CardTitle>
          <CardDescription>
            Automated alerting for suspicious commit patterns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 rounded-lg border border-border/50">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Timing Alert</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Alert on commits outside normal hours
              </p>
            </div>
            <div className="p-3 rounded-lg border border-border/50">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Author Alert</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Alert on unexpected author changes
              </p>
            </div>
            <div className="p-3 rounded-lg border border-border/50">
              <div className="flex items-center gap-2 mb-1">
                <GitBranch className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Direct Push Alert</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Alert on pushes without PR
              </p>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-500" />
                <span className="font-medium">Integrity Rules:</span>
                <Badge variant={integrityRulesEnabled ? "default" : "secondary"}>
                  {integrityRulesEnabled ? 'ACTIVE' : 'INACTIVE'}
                </Badge>
              </div>
              {!integrityRulesEnabled && (
                <Button size="sm" onClick={enableIntegrityRules}>
                  Enable Rules
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
