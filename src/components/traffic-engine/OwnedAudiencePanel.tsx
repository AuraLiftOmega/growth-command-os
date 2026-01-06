import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Mail, 
  Smartphone,
  Users,
  Lock,
  TrendingUp,
  DollarSign,
  Shield,
  Database,
  Zap,
  CheckCircle2
} from "lucide-react";
import { useTrafficEngineStore } from "@/stores/traffic-engine-store";

export const OwnedAudiencePanel = () => {
  const { 
    ownedAudienceSize, 
    emailCaptureRate, 
    smsOptInRate 
  } = useTrafficEngineStore();

  const emailList = Math.floor(ownedAudienceSize * 0.92);
  const smsList = Math.floor(ownedAudienceSize * 0.34);
  const crmContacts = ownedAudienceSize;

  const nurtureCampaigns = [
    { name: 'Welcome Sequence', status: 'active', openRate: 48.2, clickRate: 12.4, revenue: 34500 },
    { name: 'Proof Drip', status: 'active', openRate: 42.1, clickRate: 8.7, revenue: 23000 },
    { name: 'Upgrade Prompts', status: 'active', openRate: 38.4, clickRate: 15.2, revenue: 67800 },
    { name: 'Win-Back', status: 'active', openRate: 22.8, clickRate: 4.3, revenue: 12400 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-500/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Database className="w-7 h-7 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold">OWNED AUDIENCE PRIORITIZATION</h3>
                <p className="text-muted-foreground text-sm">
                  Platform-immune • Repeatable monetization • Long-term leverage
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/50">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-bold text-emerald-400">OWNED & CONTROLLED</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Rule */}
      <Card className="bg-card/60 border-purple-500/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Shield className="w-6 h-6 text-purple-400" />
            <div>
              <p className="text-sm font-bold text-purple-400">OWNED AUDIENCE RULE</p>
              <p className="text-xs text-muted-foreground">
                Owned audiences must: Monetize repeatedly • Be immune to platform shutdowns • Represent long-term leverage
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audience Channels */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-card/60">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-400" />
                <span className="font-medium">Email List</span>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                Primary
              </Badge>
            </div>
            <p className="text-3xl font-bold mb-2">{emailList.toLocaleString()}</p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Capture Rate</span>
                <span className="text-emerald-400">{emailCaptureRate}%</span>
              </div>
              <Progress value={emailCaptureRate} className="h-1.5" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/60">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <span className="font-medium">SMS List</span>
              </div>
              <Badge variant="outline">Secondary</Badge>
            </div>
            <p className="text-3xl font-bold mb-2">{smsList.toLocaleString()}</p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Opt-in Rate</span>
                <span className="text-emerald-400">{smsOptInRate}%</span>
              </div>
              <Progress value={smsOptInRate} className="h-1.5" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/60">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-purple-400" />
                <span className="font-medium">CRM Contacts</span>
              </div>
              <Badge variant="outline">Master</Badge>
            </div>
            <p className="text-3xl font-bold mb-2">{crmContacts.toLocaleString()}</p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Data Completeness</span>
                <span className="text-emerald-400">87%</span>
              </div>
              <Progress value={87} className="h-1.5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Capture Pipeline */}
      <Card className="bg-card/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Traffic → Owned Conversion Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1 text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-2xl font-bold">100%</p>
              <p className="text-xs text-muted-foreground">All Traffic</p>
            </div>
            <div className="text-muted-foreground">→</div>
            <div className="flex-1 text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <p className="text-2xl font-bold text-blue-400">34.2%</p>
              <p className="text-xs text-muted-foreground">Email Captured</p>
            </div>
            <div className="text-muted-foreground">→</div>
            <div className="flex-1 text-center p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
              <p className="text-2xl font-bold text-emerald-400">12.8%</p>
              <p className="text-xs text-muted-foreground">SMS Captured</p>
            </div>
            <div className="text-muted-foreground">→</div>
            <div className="flex-1 text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
              <p className="text-2xl font-bold text-purple-400">8.4%</p>
              <p className="text-xs text-muted-foreground">Buyer</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            All traffic is immediately funneled into owned channels. Platform dependency drops to zero.
          </p>
        </CardContent>
      </Card>

      {/* Automated Nurture */}
      <Card className="bg-card/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Automated Nurture Campaigns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {nurtureCampaigns.map((campaign, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <div>
                    <p className="font-medium">{campaign.name}</p>
                    <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                      {campaign.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-right text-sm">
                  <div>
                    <p className="font-bold">{campaign.openRate}%</p>
                    <p className="text-xs text-muted-foreground">Open</p>
                  </div>
                  <div>
                    <p className="font-bold">{campaign.clickRate}%</p>
                    <p className="text-xs text-muted-foreground">Click</p>
                  </div>
                  <div>
                    <p className="font-bold text-emerald-400">${campaign.revenue.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Platform Immunity */}
      <Card className="bg-card/60 border-emerald-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            Platform Immunity Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-lg text-center border border-emerald-500/30">
              <Lock className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
              <p className="font-bold text-emerald-400">Immune</p>
              <p className="text-xs text-muted-foreground">Ad Account Bans</p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-lg text-center border border-emerald-500/30">
              <Lock className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
              <p className="font-bold text-emerald-400">Immune</p>
              <p className="text-xs text-muted-foreground">Algorithm Changes</p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-lg text-center border border-emerald-500/30">
              <Lock className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
              <p className="font-bold text-emerald-400">Immune</p>
              <p className="text-xs text-muted-foreground">Policy Updates</p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-lg text-center border border-emerald-500/30">
              <Lock className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
              <p className="font-bold text-emerald-400">Immune</p>
              <p className="text-xs text-muted-foreground">Cost Increases</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
