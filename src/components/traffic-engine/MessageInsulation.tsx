import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { 
  Shield, 
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  Ban,
  Eye,
  Zap
} from "lucide-react";
import { useTrafficEngineStore } from "@/stores/traffic-engine-store";

export const MessageInsulation = () => {
  const { 
    messageTemplates, 
    messageRotationEnabled,
    rotateMessage 
  } = useTrafficEngineStore();

  const safeMessages = messageTemplates.filter(m => m.riskLevel === 'safe');
  const avgPerformance = messageTemplates.reduce((sum, m) => sum + m.performance, 0) / messageTemplates.length;

  const policyRiskTerms = [
    'guarantee', 'promise', 'income', 'earn', 'make money', 
    'fast results', 'overnight', 'secret', 'hack', 'trick'
  ];

  const safeFrameworks = [
    { type: 'System-Based', example: '"We built infrastructure that systematizes growth."', risk: 'safe' },
    { type: 'Replacement Narrative', example: '"Replacing agency dependency with owned execution."', risk: 'safe' },
    { type: 'Process Focus', example: '"A process for consistent output without headcount."', risk: 'safe' },
    { type: 'Outcome Observation', example: '"Operators using this see reduced overhead."', risk: 'safe' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Shield className="w-7 h-7 text-amber-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold">MESSAGE INSULATION SYSTEM</h3>
                <p className="text-muted-foreground text-sm">
                  Policy-safe messaging • Continuous rotation • Zero platform flags
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right mr-4">
                <p className="text-sm text-muted-foreground">Auto-Rotation</p>
                <p className="font-bold text-emerald-400">
                  {messageRotationEnabled ? 'ACTIVE' : 'PAUSED'}
                </p>
              </div>
              <Switch 
                checked={messageRotationEnabled}
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Reduction Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-card/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-2xl font-bold text-emerald-400">{safeMessages.length}</p>
                <p className="text-xs text-muted-foreground">Safe Templates</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-2xl font-bold">
                  {messageTemplates.reduce((sum, m) => sum + m.rotationCount, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Total Rotations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-2xl font-bold">{avgPerformance.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Avg Performance</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-emerald-400">0</p>
                <p className="text-xs text-muted-foreground">Platform Flags</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Forbidden Terms */}
        <Card className="bg-card/60 border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ban className="w-5 h-5 text-destructive" />
              Policy-Risk Terms (Auto-Blocked)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {policyRiskTerms.map((term, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="bg-destructive/10 text-destructive border-destructive/30"
                >
                  <Ban className="w-3 h-3 mr-1" />
                  {term}
                </Badge>
              ))}
            </div>
            <div className="mt-4 p-3 bg-destructive/10 rounded-lg border border-destructive/30">
              <p className="text-xs text-muted-foreground">
                These terms trigger automatic message rejection. System-based narratives replace income claims.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Safe Frameworks */}
        <Card className="bg-card/60 border-emerald-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Safe Messaging Frameworks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {safeFrameworks.map((framework, index) => (
              <div key={index} className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                    {framework.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground italic">{framework.example}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Active Templates */}
      <Card className="bg-card/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Active Message Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {messageTemplates.map((template) => (
              <div 
                key={template.id} 
                className={`p-4 rounded-lg border ${
                  template.riskLevel === 'safe' ? 'bg-emerald-500/5 border-emerald-500/30' :
                  template.riskLevel === 'moderate' ? 'bg-amber-500/5 border-amber-500/30' :
                  'bg-destructive/5 border-destructive/30'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={
                        template.riskLevel === 'safe' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                        template.riskLevel === 'moderate' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                        'bg-destructive/10 text-destructive border-destructive/30'
                      }
                    >
                      {template.riskLevel} risk
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Rotated {template.rotationCount} times
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold">{template.performance}/10</p>
                      <p className="text-xs text-muted-foreground">Performance</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => rotateMessage(template.id)}
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Rotate
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic">"{template.content}"</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insulation Benefits */}
      <Card className="bg-card/60">
        <CardHeader>
          <CardTitle>Insulation Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <AlertTriangle className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <p className="font-bold">Reduced Reports</p>
              <p className="text-xs text-muted-foreground">-94% vs industry avg</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <Eye className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="font-bold">Fewer Reviews</p>
              <p className="text-xs text-muted-foreground">Zero manual holds</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <Shield className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="font-bold">No Moderation</p>
              <p className="text-xs text-muted-foreground">Clean platform record</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Final Rule */}
      <Card className="bg-card/60 border-amber-500/30">
        <CardContent className="p-4">
          <div className="text-center">
            <p className="font-bold text-amber-400 mb-1">MESSAGE INSULATION LAW</p>
            <p className="text-xs text-muted-foreground">
              Avoid policy-risk language. Rotate framing continuously. Use system-based narratives instead of claims.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
