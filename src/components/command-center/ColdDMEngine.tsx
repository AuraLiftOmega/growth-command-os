import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  MessageCircle, 
  Target, 
  Filter, 
  Shield, 
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Eye,
  Reply,
  UserX,
  Zap
} from "lucide-react";

const ColdDMEngine = () => {
  const [engineActive, setEngineActive] = useState(true);
  const [autoQualification, setAutoQualification] = useState(true);
  const [calendarProtection, setCalendarProtection] = useState(true);

  // Mock metrics - would be real data in production
  const metrics = {
    dmsSentToday: 47,
    dailyLimit: 100,
    openRate: 34.2,
    replyRate: 12.8,
    qualifiedLeads: 6,
    meetingsBooked: 2,
    rejectedTargets: 23
  };

  const dmSequence = [
    {
      step: 1,
      trigger: "Initial Contact",
      message: "Saw you're scaling [brand].",
      timing: "Immediate"
    },
    {
      step: 2,
      trigger: "If Opened",
      message: "We're rolling out a private system replacing agencies and content teams by running creative + scaling autonomously.",
      timing: "+24h"
    },
    {
      step: 3,
      trigger: "If Engaged",
      message: "Not for beginners or low spend.",
      timing: "+48h"
    },
    {
      step: 4,
      trigger: "Final Touch",
      message: "If you're already spending and want to move faster, I can explain.",
      timing: "+72h"
    }
  ];

  const targetFilters = [
    { name: "Revenue Signals", status: "active", description: "Detects $20k+/mo indicators" },
    { name: "Active Ads", status: "active", description: "Running paid traffic" },
    { name: "Ecom Infrastructure", status: "active", description: "Shopify, WooCommerce, etc." },
    { name: "Operator Behavior", status: "active", description: "Decision-maker patterns" }
  ];

  const autoReject = [
    "Beginners",
    "Motivational accounts",
    "Coaches",
    "\"Just starting\" language",
    "No revenue signals",
    "Course sellers"
  ];

  const responseClassification = [
    { type: "High Intent", action: "Qualify Immediately", color: "bg-emerald-500" },
    { type: "Weak Curiosity", action: "Discard", color: "bg-yellow-500" },
    { type: "Objection", action: "Controlled Response", color: "bg-orange-500" },
    { type: "Noise", action: "Ignore", color: "bg-muted" }
  ];

  const qualificationGate = [
    { field: "Monthly Revenue Range", required: true },
    { field: "Current Ad Spend", required: true },
    { field: "Growth Bottleneck", required: true },
    { field: "Decision Maker", required: true }
  ];

  return (
    <div className="space-y-6">
      {/* Engine Status Header */}
      <Card className="bg-gradient-to-r from-primary/20 to-purple-500/20 border-primary/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                <Zap className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">COLD DM AUTOMATION ENGINE</h2>
                <p className="text-muted-foreground">
                  Lethal lead generation without spam, brand damage, or calendar pollution
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right mr-4">
                <p className="text-sm text-muted-foreground">Engine Status</p>
                <p className={`font-bold ${engineActive ? 'text-emerald-400' : 'text-destructive'}`}>
                  {engineActive ? 'ACTIVE' : 'PAUSED'}
                </p>
              </div>
              <Switch 
                checked={engineActive} 
                onCheckedChange={setEngineActive}
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-card/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Send className="w-5 h-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{metrics.dmsSentToday}</p>
                <p className="text-xs text-muted-foreground">DMs Sent Today</p>
              </div>
            </div>
            <Progress value={(metrics.dmsSentToday / metrics.dailyLimit) * 100} className="mt-2 h-1" />
            <p className="text-xs text-muted-foreground mt-1">{metrics.dailyLimit - metrics.dmsSentToday} remaining</p>
          </CardContent>
        </Card>

        <Card className="bg-card/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-2xl font-bold">{metrics.openRate}%</p>
                <p className="text-xs text-muted-foreground">Open Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Reply className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-2xl font-bold">{metrics.replyRate}%</p>
                <p className="text-xs text-muted-foreground">Reply Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-2xl font-bold">{metrics.meetingsBooked}</p>
                <p className="text-xs text-muted-foreground">Meetings Booked</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Target Intelligence Filters */}
        <Card className="bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Target Intelligence Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {targetFilters.map((filter, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium">{filter.name}</p>
                  <p className="text-xs text-muted-foreground">{filter.description}</p>
                </div>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
            ))}

            <Separator className="my-4" />

            <div>
              <p className="text-sm font-semibold text-destructive mb-3 flex items-center gap-2">
                <UserX className="w-4 h-4" />
                Auto-Reject Profiles
              </p>
              <div className="flex flex-wrap gap-2">
                {autoReject.map((item, index) => (
                  <Badge key={index} variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                    <XCircle className="w-3 h-3 mr-1" />
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* DM Sequence */}
        <Card className="bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              Adaptive DM Sequence
              <Badge variant="outline" className="ml-auto">Max 4 Touches</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dmSequence.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                      {step.step}
                    </div>
                    {index < dmSequence.length - 1 && (
                      <div className="w-px h-full bg-border mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{step.trigger}</p>
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {step.timing}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground italic">"{step.message}"</p>
                  </div>
                </div>
              </div>
            ))}

            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <p className="text-sm font-medium text-amber-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Sequence Rules
              </p>
              <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                <li>• No chasing — silence = exit</li>
                <li>• Authority {">"} friendliness</li>
                <li>• Max 4 touches per prospect</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Response Intelligence */}
        <Card className="bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              Response Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {responseClassification.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <p className="font-medium">{item.type}</p>
                </div>
                <Badge variant="outline">{item.action}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Qualification Gate */}
        <Card className="bg-card/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Auto-Qualification Gate
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Enabled</span>
                <Switch 
                  checked={autoQualification} 
                  onCheckedChange={setAutoQualification}
                  className="data-[state=checked]:bg-emerald-500"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">
              Required before calendar access is granted:
            </p>
            {qualificationGate.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <p className="font-medium">{item.field}</p>
                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                  REQUIRED
                </Badge>
              </div>
            ))}
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
              <p className="text-sm font-bold text-destructive">
                FAIL = NO CALENDAR ACCESS
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Protection */}
      <Card className="bg-card/60">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Calendar Protection Logic
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Active</span>
              <Switch 
                checked={calendarProtection} 
                onCheckedChange={setCalendarProtection}
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <p className="text-2xl font-bold text-primary">5</p>
              <p className="text-sm text-muted-foreground">Daily Booking Cap</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <p className="text-2xl font-bold text-emerald-400">Enabled</p>
              <p className="text-sm text-muted-foreground">Priority to Highest Spenders</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <p className="text-2xl font-bold text-amber-400">Auto</p>
              <p className="text-sm text-muted-foreground">Shutdown When Full</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4 text-center">
            No human scheduling chaos. System controls all calendar access.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ColdDMEngine;
