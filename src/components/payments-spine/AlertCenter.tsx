import { useState } from 'react';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle,
  Clock,
  RefreshCw,
  Send,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useAlertActions } from '@/hooks/usePaymentsSpineData';
import { useToast } from '@/hooks/use-toast';
import type { SpineAlert } from '@/lib/payments-spine';

interface AlertCenterProps {
  alerts: SpineAlert[];
  onRefresh: () => void;
  isLoading: boolean;
}

function getAlertIcon(severity: string) {
  switch (severity) {
    case 'critical':
      return AlertTriangle;
    case 'warn':
      return AlertCircle;
    default:
      return Info;
  }
}

function getAlertColors(severity: string, status: string) {
  if (status === 'resolved') {
    return 'bg-muted/50 border-muted';
  }
  
  switch (severity) {
    case 'critical':
      return 'bg-red-500/5 border-red-500/20 hover:border-red-500/40';
    case 'warn':
      return 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40';
    default:
      return 'bg-blue-500/5 border-blue-500/20 hover:border-blue-500/40';
  }
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(diff / 86400000);
  return `${days}d ago`;
}

export function AlertCenter({ alerts, onRefresh, isLoading }: AlertCenterProps) {
  const { toast } = useToast();
  const alertActions = useAlertActions();
  const [statusFilter, setStatusFilter] = useState<string>('open');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<SpineAlert | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredAlerts = alerts.filter(alert => {
    if (statusFilter !== 'all' && alert.status !== statusFilter) return false;
    if (severityFilter !== 'all' && alert.severity !== severityFilter) return false;
    return true;
  });

  const handleAcknowledge = async (alert: SpineAlert) => {
    setIsProcessing(true);
    try {
      await alertActions.acknowledge(alert.id, 'admin');
      toast({ title: 'Alert acknowledged' });
      onRefresh();
    } catch (error) {
      toast({ title: 'Failed to acknowledge alert', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedAlert) return;
    setIsProcessing(true);
    try {
      await alertActions.resolve(selectedAlert.id, 'admin', resolutionNotes);
      toast({ title: 'Alert resolved' });
      setResolveDialogOpen(false);
      setResolutionNotes('');
      setSelectedAlert(null);
      onRefresh();
    } catch (error) {
      toast({ title: 'Failed to resolve alert', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTestAlert = async () => {
    try {
      await alertActions.testAlert('info');
      toast({ title: 'Test alert created' });
      onRefresh();
    } catch (error) {
      toast({ title: 'Failed to create test alert', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <Card className="rounded-2xl">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Alert Center
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="warn">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleTestAlert}>
              <Send className="h-4 w-4 mr-2" />
              Test Alert
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            {filteredAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle className="h-12 w-12 text-emerald-500 mb-4" />
                <h3 className="text-lg font-semibold">All Clear</h3>
                <p className="text-muted-foreground text-sm">
                  No alerts matching your filters.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAlerts.map((alert) => {
                  const Icon = getAlertIcon(alert.severity);
                  
                  return (
                    <div
                      key={alert.id}
                      className={cn(
                        'rounded-xl border p-4 transition-all',
                        getAlertColors(alert.severity, alert.status)
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <Icon className={cn(
                            'h-5 w-5 mt-0.5',
                            alert.severity === 'critical' ? 'text-red-500' :
                            alert.severity === 'warn' ? 'text-amber-500' :
                            'text-blue-500'
                          )} />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{alert.title}</h4>
                              <Badge variant="outline" className="text-xs">
                                {alert.code}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {alert.message}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatRelativeTime(alert.created_at)}
                              </span>
                              {alert.project_id && (
                                <span>Project: {alert.project_id}</span>
                              )}
                              {alert.env && (
                                <Badge variant="outline" className="text-xs">
                                  {alert.env}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            alert.status === 'open' ? 'destructive' :
                            alert.status === 'acknowledged' ? 'default' :
                            'secondary'
                          }>
                            {alert.status}
                          </Badge>
                          
                          {alert.status === 'open' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAcknowledge(alert)}
                              disabled={isProcessing}
                            >
                              Acknowledge
                            </Button>
                          )}
                          
                          {alert.status !== 'resolved' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedAlert(alert);
                                setResolveDialogOpen(true);
                              }}
                            >
                              Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {alert.resolution_notes && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Resolution:</span> {alert.resolution_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Alert</DialogTitle>
            <DialogDescription>
              Add optional notes about how this alert was resolved.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Resolution notes (optional)"
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResolveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleResolve} disabled={isProcessing}>
              {isProcessing ? 'Resolving...' : 'Resolve Alert'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
