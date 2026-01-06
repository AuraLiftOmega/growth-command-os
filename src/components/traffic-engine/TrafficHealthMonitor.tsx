import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Shield
} from "lucide-react";
import { useTrafficEngineStore } from "@/stores/traffic-engine-store";

export const TrafficHealthMonitor = () => {
  const { 
    trafficStreams, 
    maxDependencyThreshold,
    rebalanceTraffic 
  } = useTrafficEngineStore();

  const overDependentStreams = trafficStreams.filter(s => s.dependencyPercent > maxDependencyThreshold);
  const healthScore = 100 - (overDependentStreams.length * 15);
  
  const sourceGroups = trafficStreams.reduce((acc, stream) => {
    if (!acc[stream.source]) {
      acc[stream.source] = { dependency: 0, leads: 0, streams: [] };
    }
    acc[stream.source].dependency += stream.dependencyPercent;
    acc[stream.source].leads += stream.leadsToday;
    acc[stream.source].streams.push(stream);
    return acc;
  }, {} as Record<string, { dependency: number; leads: number; streams: typeof trafficStreams }>);

  return (
    <div className="space-y-6">
      {/* Health Score */}
      <Card className="bg-card/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Traffic Health Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-6">
            <div className="col-span-1">
              <div className="relative w-32 h-32 mx-auto">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-muted/20"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={`${healthScore}, 100`}
                    className={healthScore > 80 ? 'text-emerald-400' : healthScore > 60 ? 'text-amber-400' : 'text-destructive'}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-3xl font-bold">{healthScore}</span>
                  <span className="text-xs text-muted-foreground">Health</span>
                </div>
              </div>
            </div>

            <div className="col-span-3 space-y-4">
              {Object.entries(sourceGroups).map(([source, data]) => (
                <div key={source} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize font-medium">{source} Traffic</span>
                    <span className={data.dependency > maxDependencyThreshold ? 'text-destructive' : 'text-muted-foreground'}>
                      {data.dependency}% dependency • {data.leads} leads today
                    </span>
                  </div>
                  <Progress 
                    value={data.dependency} 
                    className={`h-2 ${data.dependency > maxDependencyThreshold ? '[&>div]:bg-destructive' : ''}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts & Recommendations */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Dependency Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overDependentStreams.length === 0 ? (
              <div className="flex items-center gap-3 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="font-medium text-emerald-400">All Clear</p>
                  <p className="text-xs text-muted-foreground">No traffic source exceeds {maxDependencyThreshold}% dependency</p>
                </div>
              </div>
            ) : (
              overDependentStreams.map(stream => (
                <div key={stream.id} className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg border border-destructive/30">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    <div>
                      <p className="font-medium">{stream.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {stream.dependencyPercent}% dependency exceeds {maxDependencyThreshold}% threshold
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                    ACTION NEEDED
                  </Badge>
                </div>
              ))
            )}
            
            {overDependentStreams.length > 0 && (
              <Button 
                onClick={rebalanceTraffic} 
                className="w-full gap-2"
                variant="outline"
              >
                <RefreshCw className="w-4 h-4" />
                Auto-Rebalance Traffic
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Resilience Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Ad-Free Revenue Capacity</span>
                <span className="text-emerald-400 font-bold">68%</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Revenue sustainable if all paid traffic stops
              </p>
            </div>
            
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Platform Redundancy</span>
                <span className="text-blue-400 font-bold">5 channels</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Active lead sources across different platforms
              </p>
            </div>
            
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Owned vs Rented Ratio</span>
                <span className="text-purple-400 font-bold">45/55</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Target: 60/40 owned to rented traffic
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stream Performance Comparison */}
      <Card className="bg-card/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Stream Performance Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trafficStreams
              .sort((a, b) => b.conversionRate - a.conversionRate)
              .map((stream, index) => (
                <div key={stream.id} className="flex items-center gap-4">
                  <span className="w-6 text-center text-muted-foreground text-sm">#{index + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{stream.name}</span>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-emerald-400">{stream.conversionRate}% conv</span>
                        <span className="text-muted-foreground">${stream.costPerLead.toFixed(2)} CPL</span>
                      </div>
                    </div>
                    <Progress value={stream.conversionRate * 5} className="h-2" />
                  </div>
                  {index === 0 && (
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Top
                    </Badge>
                  )}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
