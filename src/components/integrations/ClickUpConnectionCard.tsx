/**
 * ClickUp Connection Card - AURAOMEGA Empire Integration
 * Workspace: AURAOMEGA Empire | Space: AuraOmega
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Loader2, 
  Play, 
  RefreshCw,
  ExternalLink,
  Zap,
  FolderOpen,
  ListTodo,
  Target,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface WorkspaceSummary {
  workspace: {
    id: string;
    name: string;
    members: number;
  };
  spaces: {
    id: string;
    name: string;
    folders: {
      id: string;
      name: string;
      lists: { id: string; name: string; taskCount: number }[];
    }[];
    folderlessLists: { id: string; name: string; taskCount: number }[];
  }[];
  totalFolders: number;
  totalLists: number;
  totalTasks: number;
}

interface ConnectionStatus {
  isConnected: boolean;
  lastTestAt: string | null;
  testStatus: 'idle' | 'testing' | 'success' | 'error';
  workspaceName: string | null;
  summary: WorkspaceSummary | null;
  error: string | null;
}

export function ClickUpConnectionCard() {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    lastTestAt: null,
    testStatus: 'idle',
    workspaceName: null,
    summary: null,
    error: null,
  });
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [isCreatingTasks, setIsCreatingTasks] = useState(false);

  useEffect(() => {
    testConnection();
  }, []);

  const callClickUpFunction = async (action: string, data?: Record<string, unknown>) => {
    const { data: response, error } = await supabase.functions.invoke('clickup-workspace', {
      body: { action, data },
    });

    if (error) throw error;
    if (response?.error) throw new Error(response.error);
    
    return response;
  };

  const testConnection = async () => {
    setStatus(prev => ({ ...prev, testStatus: 'testing', error: null }));
    
    try {
      const result = await callClickUpFunction('test');
      
      if (result.success && result.workspaces?.length > 0) {
        setStatus({
          isConnected: true,
          lastTestAt: new Date().toISOString(),
          testStatus: 'success',
          workspaceName: result.workspaces[0].name,
          summary: null,
          error: null,
        });
        toast.success(`Connected to ClickUp: ${result.workspaces[0].name}`);
        
        // Fetch summary after successful connection
        fetchSummary();
      } else {
        throw new Error('No workspaces found');
      }
    } catch (error) {
      console.error('ClickUp connection error:', error);
      setStatus({
        isConnected: false,
        lastTestAt: new Date().toISOString(),
        testStatus: 'error',
        workspaceName: null,
        summary: null,
        error: error instanceof Error ? error.message : 'Connection failed',
      });
      toast.error('ClickUp connection failed. Check API token.');
    }
  };

  const fetchSummary = async () => {
    try {
      const summary = await callClickUpFunction('summary');
      setStatus(prev => ({ ...prev, summary }));
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    }
  };

  const setupWorkspace = async () => {
    setIsSettingUp(true);
    
    try {
      const result = await callClickUpFunction('setup');
      toast.success('AURAOMEGA workspace structure created!', {
        description: `Created ${result.createdFolders?.length || 0} folders and ${result.createdLists?.length || 0} lists`,
      });
      
      // Refresh summary
      await fetchSummary();
    } catch (error) {
      console.error('Setup error:', error);
      toast.error('Workspace setup failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsSettingUp(false);
    }
  };

  const createSampleTasks = async () => {
    setIsCreatingTasks(true);
    
    try {
      const result = await callClickUpFunction('createTasks');
      toast.success('Sample tasks created!', {
        description: `Created ${result.created?.length || 0} tasks`,
      });
      
      // Refresh summary
      await fetchSummary();
    } catch (error) {
      console.error('Task creation error:', error);
      toast.error('Task creation failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsCreatingTasks(false);
    }
  };

  const { summary } = status;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
              ✨
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                ClickUp
                {status.isConnected ? (
                  <Badge variant="outline" className="bg-success/20 text-success border-success/30">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                ) : status.testStatus === 'testing' ? (
                  <Badge variant="outline" className="bg-warning/20 text-warning border-warning/30">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Testing...
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-destructive/20 text-destructive border-destructive/30">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Disconnected
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {status.workspaceName || 'AURAOMEGA Empire'} - Project Management
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={testConnection}
            disabled={status.testStatus === 'testing'}
          >
            <RefreshCw className={`w-4 h-4 ${status.testStatus === 'testing' ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {status.error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            {status.error}
          </div>
        )}

        {status.isConnected && summary && (
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <FolderOpen className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-2xl font-bold">{summary.totalFolders}</p>
              <p className="text-xs text-muted-foreground">Folders</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <ListTodo className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-2xl font-bold">{summary.totalLists}</p>
              <p className="text-xs text-muted-foreground">Lists</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <Target className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-2xl font-bold">{summary.totalTasks}</p>
              <p className="text-xs text-muted-foreground">Tasks</p>
            </div>
          </div>
        )}

        {status.isConnected && summary && summary.spaces.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Spaces</p>
            <div className="space-y-1.5">
              {summary.spaces.map(space => (
                <div 
                  key={space.id} 
                  className="flex items-center justify-between p-2 rounded-md bg-muted/30"
                >
                  <span className="text-sm font-medium">{space.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {space.folders.length} folders
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {status.isConnected && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={setupWorkspace}
                disabled={isSettingUp}
                className="gap-2"
              >
                {isSettingUp ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                Setup AURAOMEGA
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={createSampleTasks}
                disabled={isCreatingTasks}
                className="gap-2"
              >
                {isCreatingTasks ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Create Tasks
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open('https://app.clickup.com', '_blank')}
            className="gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Open ClickUp
          </Button>
        </div>

        {status.lastTestAt && (
          <p className="text-xs text-muted-foreground text-right">
            Last tested: {new Date(status.lastTestAt).toLocaleTimeString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
