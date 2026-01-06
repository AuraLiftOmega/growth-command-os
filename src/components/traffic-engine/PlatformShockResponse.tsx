import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  AlertTriangle, 
  Shield, 
  Zap,
  Ban,
  TrendingDown,
  Eye,
  Radio,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from "lucide-react";
import { useTrafficEngineStore } from "@/stores/traffic-engine-store";

export const PlatformShockResponse = () => {
  const { 
    shockResponseMode,
    setShockResponseMode,
    platformShockEvents,
    addPlatformShockEvent,
    resolvePlatformShock,
    trafficStreams
  } = useTrafficEngineStore();

  const shockTriggers = [
    { type: 'ban', label: 'Ad Account Ban', icon: Ban, severity: 'critical' },
    { type: 'throttle', label: 'Spend Throttling', icon: TrendingDown, severity: 'warning' },
    { type: 'suppression', label: 'Algorithm Suppression', icon: Eye, severity: 'warning' },
    { type: 'policy_violation', label: 'Policy Violation', icon: AlertCircle, severity: 'moderate' }
  ];

  const responseActions = [
    { trigger: 'Ad Account Ban', actions: ['Pause all paid traffic', 'Escalate outbound by 150%', 'Boost organic posting frequency', 'Monetize owned audience'] },
    { trigger: 'Spend Throttling', actions: ['Reduce spend concentration', 'Rotate to secondary accounts', 'Increase organic reach'] },
    { trigger: 'Algorithm Suppression', actions: ['Shift content strategy', 'Activate proof virality', 'Increase email cadence'] },
    { trigger: 'Policy Violation', actions: ['Rotate messaging', 'Activate safe templates', 'Review content queue'] }
  ];

  const simulateShock = (type: string) => {
    addPlatformShockEvent({
      platform: 'Meta',
      eventType: type as any,
      timestamp: new Date(),
      resolved: false,
      autoResponse: `Auto-responding to ${type}: Rerouting traffic...`
    });
  };

  return (
    <div className="space-y-6">
      {/* Shock Mode Control */}
      <Card className={`${shockResponseMode ? 'bg-destructive/20 border-destructive' : 'bg-card/60'}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl ${shockResponseMode ? 'bg-destructive/30' : 'bg-primary/20'} flex items-center justify-center`}>
                <AlertTriangle className={`w-7 h-7 ${shockResponseMode ? 'text-destructive animate-pulse' : 'text-primary'}`} />
              </div>
              <div>
                <h3 className="text-xl font-bold">PLATFORM SHOCK RESPONSE MODE</h3>
                <p className="text-muted-foreground text-sm">
                  {shockResponseMode 
                    ? 'Active: Paid traffic paused, alternatives escalated' 
                    : 'Standby: Ready to respond to platform disruptions'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right mr-4">
                <p className="text-sm text-muted-foreground">Response Mode</p>
                <p className={`font-bold ${shockResponseMode ? 'text-destructive' : 'text-emerald-400'}`}>
                  {shockResponseMode ? 'ACTIVE' : 'STANDBY'}
                </p>
              </div>
              <Switch 
                checked={shockResponseMode} 
                onCheckedChange={setShockResponseMode}
                className="data-[state=checked]:bg-destructive"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shock Triggers */}
      <Card className="bg-card/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Shock Triggers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {shockTriggers.map((trigger) => (
              <div 
                key={trigger.type} 
                className="p-4 bg-muted/30 rounded-lg border border-border hover:border-amber-500/50 transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  <trigger.icon className={`w-5 h-5 ${
                    trigger.severity === 'critical' ? 'text-destructive' :
                    trigger.severity === 'warning' ? 'text-amber-400' :
                    'text-muted-foreground'
                  }`} />
                  <span className="font-medium text-sm">{trigger.label}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-xs"
                  onClick={() => simulateShock(trigger.type)}
                >
                  Simulate
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Response Protocols */}
      <Card className="bg-card/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Auto-Response Protocols
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {responseActions.map((protocol, index) => (
              <div key={index} className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="font-medium">{protocol.trigger}</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {protocol.actions.map((action, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      {action}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Events */}
      <Card className="bg-card/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-primary" />
            Active Shock Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          {platformShockEvents.filter(e => !e.resolved).length === 0 ? (
            <div className="p-6 text-center bg-emerald-500/10 rounded-lg border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="font-medium text-emerald-400">No Active Disruptions</p>
              <p className="text-xs text-muted-foreground mt-1">All platforms operating normally</p>
            </div>
          ) : (
            <div className="space-y-3">
              {platformShockEvents.filter(e => !e.resolved).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 bg-destructive/10 rounded-lg border border-destructive/30">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-destructive animate-pulse" />
                    <div>
                      <p className="font-medium">{event.platform}: {event.eventType}</p>
                      <p className="text-xs text-muted-foreground">{event.autoResponse}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => resolvePlatformShock(event.id)}
                  >
                    Resolve
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Traffic State */}
      <Card className="bg-card/60">
        <CardHeader>
          <CardTitle>Current Traffic Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            {trafficStreams.map((stream) => (
              <div 
                key={stream.id} 
                className={`p-3 rounded-lg text-center ${
                  stream.status === 'paused' ? 'bg-muted/30 opacity-50' : 'bg-primary/10'
                }`}
              >
                <p className="text-2xl font-bold">{stream.dependencyPercent}%</p>
                <p className="text-xs text-muted-foreground">{stream.name}</p>
                <Badge 
                  variant="outline" 
                  className={`mt-2 text-xs ${
                    stream.status === 'paused' ? 'bg-muted text-muted-foreground' : 'bg-emerald-500/10 text-emerald-400'
                  }`}
                >
                  {stream.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
