import { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  RefreshCw,
  Eye,
  Send,
  ExternalLink
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { paymentsSpine, type SpineProject } from '@/lib/payments-spine';
import { useToast } from '@/hooks/use-toast';

interface ProjectsBindingTableProps {
  projects: SpineProject[];
  selectedProject: string | null;
  onSelectProject: (projectId: string | null) => void;
  onRevalidate: () => void;
  isLoading: boolean;
}

function formatDate(dateString?: string): string {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
}

function getBindingStatus(project: SpineProject): { status: string; color: string; icon: typeof CheckCircle } {
  const binding = project.project_stripe_bindings?.[0];
  
  if (!binding) {
    return { status: 'Not Bound', color: 'bg-muted text-muted-foreground', icon: Clock };
  }
  
  switch (binding.status) {
    case 'ok':
      return { status: 'OK', color: 'bg-emerald-500/10 text-emerald-500', icon: CheckCircle };
    case 'mismatch':
      return { status: 'Mismatch', color: 'bg-red-500/10 text-red-500', icon: XCircle };
    case 'error':
      return { status: 'Error', color: 'bg-amber-500/10 text-amber-500', icon: AlertTriangle };
    default:
      return { status: 'Pending', color: 'bg-blue-500/10 text-blue-500', icon: Clock };
  }
}

function maskAccountId(accountId?: string): string {
  if (!accountId || accountId === 'not_provided') return 'Not provided';
  if (accountId.length < 12) return accountId;
  return `${accountId.slice(0, 8)}...${accountId.slice(-4)}`;
}

export function ProjectsBindingTable({
  projects,
  selectedProject,
  onSelectProject,
  onRevalidate,
  isLoading,
}: ProjectsBindingTableProps) {
  const { toast } = useToast();
  const [revalidatingId, setRevalidatingId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState<SpineProject | null>(null);

  const handleRevalidate = async (projectId: string) => {
    setRevalidatingId(projectId);
    try {
      await paymentsSpine.revalidateProject(projectId);
      toast({
        title: 'Revalidation complete',
        description: 'Project binding has been revalidated.',
      });
      onRevalidate();
    } catch (error) {
      toast({
        title: 'Revalidation failed',
        description: 'Could not revalidate project binding.',
        variant: 'destructive',
      });
    } finally {
      setRevalidatingId(null);
    }
  };

  const handleViewDetails = (project: SpineProject) => {
    setSelectedDetails(project);
    setDetailsOpen(true);
  };

  const handleTestAlert = async (projectId: string) => {
    try {
      await paymentsSpine.testAlert('info', projectId);
      toast({
        title: 'Test alert sent',
        description: 'A test alert has been created for this project.',
      });
      onRevalidate();
    } catch (error) {
      toast({
        title: 'Failed to send test alert',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project Name</TableHead>
              <TableHead>Project ID</TableHead>
              <TableHead>Env</TableHead>
              <TableHead>Domain</TableHead>
              <TableHead>Platform Account</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Validated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 8 }).map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-12 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <AlertTriangle className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Projects Registered</h3>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          No projects have been registered with the Payments Spine yet. 
          Projects will appear here once they call the registration endpoint on boot.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border bg-card overflow-hidden">
        <ScrollArea className="w-full">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Project Name</TableHead>
                <TableHead className="font-semibold">Project ID</TableHead>
                <TableHead className="font-semibold">Env</TableHead>
                <TableHead className="font-semibold">Domain</TableHead>
                <TableHead className="font-semibold">Platform Account</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Last Validated</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => {
                const bindingInfo = getBindingStatus(project);
                const binding = project.project_stripe_bindings?.[0];
                const isMismatch = binding?.status === 'mismatch';
                
                return (
                  <TableRow 
                    key={project.id}
                    className={cn(
                      'transition-colors',
                      isMismatch && 'bg-red-500/5 hover:bg-red-500/10'
                    )}
                  >
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {project.project_id}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(
                        project.env === 'prod' ? 'border-emerald-500/30 text-emerald-500' :
                        project.env === 'staging' ? 'border-amber-500/30 text-amber-500' :
                        'border-blue-500/30 text-blue-500'
                      )}>
                        {project.env}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                      {project.domain || '-'}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {maskAccountId(binding?.reported_platform_account_id)}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn('gap-1', bindingInfo.color)}>
                        <bindingInfo.icon className="h-3 w-3" />
                        {bindingInfo.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(binding?.last_validated_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleViewDetails(project)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleRevalidate(project.project_id)}
                          disabled={revalidatingId === project.project_id}
                        >
                          <RefreshCw className={cn(
                            'h-4 w-4',
                            revalidatingId === project.project_id && 'animate-spin'
                          )} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleTestAlert(project.project_id)}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedDetails?.name}</DialogTitle>
            <DialogDescription>
              Project ID: {selectedDetails?.project_id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedDetails && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Environment</p>
                  <p className="font-medium capitalize">{selectedDetails.env}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium capitalize">{selectedDetails.status}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Domain</p>
                  <p className="font-medium">{selectedDetails.domain || 'Not set'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Version</p>
                  <p className="font-medium">{selectedDetails.version || 'Unknown'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Registered</p>
                  <p className="font-medium">
                    {new Date(selectedDetails.registered_at).toLocaleString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Last Seen</p>
                  <p className="font-medium">
                    {selectedDetails.last_seen_at 
                      ? new Date(selectedDetails.last_seen_at).toLocaleString()
                      : 'Never'}
                  </p>
                </div>
              </div>

              {selectedDetails.project_stripe_bindings?.[0] && (
                <div className="rounded-lg border p-4 space-y-3">
                  <h4 className="font-semibold">Stripe Binding</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Platform Account ID</p>
                      <p className="font-mono">
                        {selectedDetails.project_stripe_bindings[0].reported_platform_account_id}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Binding Status</p>
                      <Badge className={cn(
                        selectedDetails.project_stripe_bindings[0].status === 'ok' 
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-red-500/10 text-red-500'
                      )}>
                        {selectedDetails.project_stripe_bindings[0].status}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
