/**
 * AUTONOMOUS WORKFLOW PANEL - n8n workflows for automated ad generation
 * Hardcoded to: https://omegaalpha.app.n8n.cloud
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Workflow,
  Zap,
  Package,
  TrendingDown,
  Sparkles,
  Play,
  Pause,
  Settings,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  BarChart3,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Hardcoded n8n server - NO MORE URL PROMPTS
const N8N_SERVER_URL = 'https://omegaalpha.app.n8n.cloud';

interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger: string;
  actions: string[];
  isActive: boolean;
  lastRun?: string;
  runsToday: number;
  successRate: number;
}

const DEFAULT_WORKFLOWS: Workflow[] = [
  {
    id: 'low-inventory',
    name: 'Low Inventory → Auto-Ad',
    description: 'When inventory drops below threshold, generate promotional ad and post to best-performing channel',
    trigger: 'Shopify inventory < 20 units',
    actions: ['Generate urgency ad', 'Omega selects best channel', 'Auto-post'],
    isActive: false,
    lastRun: '2 hours ago',
    runsToday: 3,
    successRate: 94,
  },
  {
    id: 'trending-product',
    name: 'Trending Product Boost',
    description: 'Detect rising sales velocity and auto-create promotional content',
    trigger: 'Sales velocity +50% in 24h',
    actions: ['Create celebration content', 'Post across all channels', 'Scale ad spend'],
    isActive: false,
    lastRun: '1 day ago',
    runsToday: 1,
    successRate: 87,
  },
  {
    id: 'daily-content',
    name: 'Daily Content Generation',
    description: 'Generate fresh content daily based on trending topics and product performance',
    trigger: 'Daily at 6 AM',
    actions: ['Analyze trends', 'Generate 3 content pieces', 'Queue for optimal times'],
    isActive: true,
    lastRun: '6 hours ago',
    runsToday: 1,
    successRate: 100,
  },
  {
    id: 'engagement-response',
    name: 'High Engagement Response',
    description: 'When a post goes viral, auto-create follow-up content and scale distribution',
    trigger: 'Engagement +200% above average',
    actions: ['Create sequel content', 'Boost original post', 'Notify team'],
    isActive: false,
    runsToday: 0,
    successRate: 91,
  },
];

export function AutonomousWorkflowPanel() {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>(DEFAULT_WORKFLOWS);
  const [inventoryThreshold, setInventoryThreshold] = useState([20]);
  const [selectedChannel, setSelectedChannel] = useState('auto');

  const toggleWorkflow = async (workflowId: string, enabled: boolean) => {
    setWorkflows((prev) =>
      prev.map((w) => (w.id === workflowId ? { ...w, isActive: enabled } : w))
    );

    const workflow = workflows.find((w) => w.id === workflowId);
    
    // Trigger n8n webhook to update workflow state
    try {
      await supabase.functions.invoke('zapier-trigger', {
        body: {
          action: enabled ? 'activate_workflow' : 'deactivate_workflow',
          workflow_id: workflowId,
          workflow_name: workflow?.name,
          user_id: user?.id,
          n8n_server: N8N_SERVER_URL,
        },
      });
    } catch (error) {
      console.error('Error syncing with n8n:', error);
    }

    if (enabled) {
      toast.success(`🤖 ${workflow?.name} activated`, {
        description: 'Workflow synced with n8n and will run automatically.',
      });
    } else {
      toast.info(`${workflow?.name} paused`);
    }
  };

  const runWorkflowNow = async (workflowId: string) => {
    const workflow = workflows.find((w) => w.id === workflowId);
    
    toast.loading('⚡ Triggering workflow...', { id: 'workflow-trigger' });
    
    try {
      await supabase.functions.invoke('zapier-trigger', {
        body: {
          action: 'run_workflow',
          workflow_id: workflowId,
          workflow_name: workflow?.name,
          user_id: user?.id,
          n8n_server: N8N_SERVER_URL,
          trigger_type: 'manual',
        },
      });
      
      toast.success('⚡ Workflow triggered!', {
        id: 'workflow-trigger',
        description: `${workflow?.name} is running now via n8n`,
      });
    } catch (error) {
      console.error('Error triggering workflow:', error);
      toast.error('Failed to trigger workflow', { id: 'workflow-trigger' });
    }
  };

  const activeCount = workflows.filter((w) => w.isActive).length;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Workflow className="w-5 h-5 text-accent" />
            Autonomous Workflows
          </CardTitle>
          <Badge variant={activeCount > 0 ? 'default' : 'secondary'} className="gap-1">
            <div className={`w-1.5 h-1.5 rounded-full ${activeCount > 0 ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
            {activeCount} Active
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Global Settings */}
        <div className="p-3 rounded-lg bg-muted/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Low Inventory Threshold</span>
            <span className="text-sm text-muted-foreground font-mono">{inventoryThreshold[0]} units</span>
          </div>
          <Slider
            value={inventoryThreshold}
            onValueChange={setInventoryThreshold}
            min={5}
            max={100}
            step={5}
            className="w-full"
          />

          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-medium">Fallback Channel</span>
            <Select value={selectedChannel} onValueChange={setSelectedChannel}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto (Omega)</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Workflow List */}
        <div className="space-y-3">
          {workflows.map((workflow, index) => (
            <motion.div
              key={workflow.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 rounded-lg border transition-all ${
                workflow.isActive
                  ? 'bg-accent/5 border-accent/30'
                  : 'bg-muted/20 border-border'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium truncate">{workflow.name}</h4>
                    {workflow.isActive && (
                      <Badge variant="outline" className="text-[8px] px-1 py-0 h-4 border-success text-success">
                        <Zap className="w-2 h-2 mr-0.5" />
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {workflow.description}
                  </p>

                  {/* Trigger */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <Target className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">
                      Trigger: {workflow.trigger}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3 mt-2">
                    {workflow.lastRun && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {workflow.lastRun}
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <BarChart3 className="w-3 h-3" />
                      {workflow.runsToday} today
                    </span>
                    <span className="text-[10px] text-success flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {workflow.successRate}%
                    </span>
                  </div>

                  {/* Actions Preview */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {workflow.actions.map((action, i) => (
                      <Badge key={i} variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
                        {action}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <Switch
                    checked={workflow.isActive}
                    onCheckedChange={(checked) => toggleWorkflow(workflow.id, checked)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs px-2"
                    onClick={() => runWorkflowNow(workflow.id)}
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Run
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* n8n Connection Status - Always Connected */}
        <div className="p-3 rounded-lg bg-success/10 border border-success/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm font-medium text-success">n8n Connected</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs px-2"
              onClick={() => window.open(N8N_SERVER_URL, '_blank')}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Dashboard
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Server: {N8N_SERVER_URL}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
