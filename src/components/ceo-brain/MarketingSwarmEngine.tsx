/**
 * MARKETING SWARM ENGINE
 * 
 * Sub-agents for ruthless marketing automation:
 * - Avatar/Video generation swarm
 * - Auto-posting across all channels
 * - Dynamic pricing via ML
 * - A/B testing everything
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Video,
  DollarSign,
  Target,
  Zap,
  Bot,
  Play,
  Pause,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  Megaphone,
  Share2,
  BarChart3,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface SwarmAgent {
  id: string;
  name: string;
  type: 'avatar' | 'video' | 'pricing' | 'posting' | 'testing' | 'targeting';
  status: 'active' | 'idle' | 'processing' | 'error';
  icon: any;
  tasksCompleted: number;
  currentTask?: string;
  efficiency: number;
  lastAction: string;
}

interface SwarmAction {
  id: string;
  agent: string;
  action: string;
  result: string;
  impact: string;
  timestamp: Date;
  status: 'success' | 'pending' | 'failed';
}

export function MarketingSwarmEngine() {
  const [isSwarmActive, setIsSwarmActive] = useState(true);
  const [agents, setAgents] = useState<SwarmAgent[]>([
    {
      id: 'pinterest-swarm',
      name: '📌 Pinterest Publisher',
      type: 'posting',
      status: 'active',
      icon: Share2,
      tasksCompleted: 89,
      currentTask: 'Publishing Radiance Serum video Pin to beauty board',
      efficiency: 97,
      lastAction: '15 sec ago'
    },
    {
      id: 'avatar-gen',
      name: 'Avatar Generator',
      type: 'avatar',
      status: 'processing',
      icon: Users,
      tasksCompleted: 47,
      currentTask: 'Creating female entrepreneur avatar for Pinterest',
      efficiency: 94,
      lastAction: '2 min ago'
    },
    {
      id: 'video-swarm',
      name: 'Video Swarm',
      type: 'video',
      status: 'active',
      icon: Video,
      tasksCompleted: 156,
      currentTask: 'Rendering 2:3 vertical video for Pinterest',
      efficiency: 91,
      lastAction: '1 min ago'
    },
    {
      id: 'dynamic-pricing',
      name: 'Dynamic Pricing AI',
      type: 'pricing',
      status: 'active',
      icon: DollarSign,
      tasksCompleted: 89,
      currentTask: 'Optimizing Vitamin C Serum price for max margin',
      efficiency: 96,
      lastAction: '5 min ago'
    },
    {
      id: 'auto-poster',
      name: 'Multi-Channel Agent',
      type: 'posting',
      status: 'active',
      icon: Megaphone,
      tasksCompleted: 234,
      currentTask: 'Cross-posting to TikTok, IG, FB after Pinterest',
      efficiency: 98,
      lastAction: '30 sec ago'
    },
    {
      id: 'ab-tester',
      name: 'A/B Test Agent',
      type: 'testing',
      status: 'processing',
      icon: BarChart3,
      tasksCompleted: 67,
      currentTask: 'Testing 4 Pin descriptions for engagement',
      efficiency: 89,
      lastAction: '3 min ago'
    }
  ]);

  const [actions, setActions] = useState<SwarmAction[]>([
    {
      id: '0',
      agent: '📌 Pinterest Publisher',
      action: 'Published Radiance Serum video Pin to Beauty board',
      result: 'Video Pin live with rich description & CTA',
      impact: '5K+ impressions projected',
      timestamp: new Date(Date.now() - 30 * 1000),
      status: 'success'
    },
    {
      id: '1',
      agent: 'Video Swarm',
      action: 'Generated 2:3 vertical video for Pinterest',
      result: 'Optimized for Pinterest feed discovery',
      impact: 'Projected 50K+ impressions',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      status: 'success'
    },
    {
      id: '2',
      agent: 'Dynamic Pricing AI',
      action: 'Increased Vitamin C Serum price by 8%',
      result: 'Demand still high, margin improved',
      impact: '+$1,240/day revenue',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      status: 'success'
    },
    {
      id: '3',
      agent: 'Multi-Channel Agent',
      action: 'Cross-posted to TikTok, Instagram, Facebook',
      result: 'Pinterest-first strategy executed',
      impact: '4 platforms synced',
      timestamp: new Date(Date.now() - 8 * 60 * 1000),
      status: 'success'
    },
    {
      id: '4',
      agent: 'A/B Test Agent',
      action: 'Declared winner: Pin description B with emojis',
      result: 'Save rate 6.2% vs 3.1% baseline',
      impact: '+100% saves',
      timestamp: new Date(Date.now() - 12 * 60 * 1000),
      status: 'success'
    }
  ]);

  const [swarmMetrics, setSwarmMetrics] = useState({
    totalTasks: 705,
    activeAgents: 6,
    avgEfficiency: 93,
    revenueGenerated: 48750
  });

  // Simulate swarm activity
  useEffect(() => {
    if (!isSwarmActive) return;

    const interval = setInterval(() => {
      // Randomly update agent status
      setAgents(prev => prev.map(agent => ({
        ...agent,
        tasksCompleted: agent.tasksCompleted + (Math.random() > 0.7 ? 1 : 0),
        status: Math.random() > 0.9 ? 
          (agent.status === 'processing' ? 'active' : 'processing') 
          : agent.status
      })));

      // Add new action occasionally
      if (Math.random() > 0.6) {
        const newActions = [
          { agent: '📌 Pinterest Publisher', action: 'Published new video Pin to Skincare board', result: 'Rich Pin with product link', impact: '+8K reach' },
          { agent: 'Video Swarm', action: 'Created Pinterest-optimized 2:3 video', result: 'Vertical format ready', impact: '+$500 projected' },
          { agent: 'Dynamic Pricing AI', action: 'Adjusted bundle pricing for Pinterest traffic', result: 'Conversion optimized', impact: '+12% margin' },
          { agent: 'Multi-Channel Agent', action: 'Syndicated Pin to TikTok & IG', result: 'Multi-platform queued', impact: '100K reach' },
          { agent: 'Avatar Generator', action: 'Created beauty influencer avatar', result: 'Ready for Pin video', impact: '2x engagement' },
        ];
        
        const randomAction = newActions[Math.floor(Math.random() * newActions.length)];
        const newAction: SwarmAction = {
          id: `action-${Date.now()}`,
          ...randomAction,
          timestamp: new Date(),
          status: 'success'
        };
        
        setActions(prev => [newAction, ...prev].slice(0, 50));
        setSwarmMetrics(prev => ({
          ...prev,
          totalTasks: prev.totalTasks + 1,
          revenueGenerated: prev.revenueGenerated + Math.floor(Math.random() * 200)
        }));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isSwarmActive]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success/20 text-success';
      case 'processing': return 'bg-primary/20 text-primary animate-pulse';
      case 'idle': return 'bg-muted text-muted-foreground';
      case 'error': return 'bg-destructive/20 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const deploySwarm = () => {
    toast.success('🚀 Marketing Swarm deployed! All agents executing...');
    setAgents(prev => prev.map(a => ({ ...a, status: 'processing' })));
    
    setTimeout(() => {
      setAgents(prev => prev.map(a => ({ ...a, status: 'active' })));
    }, 3000);
  };

  return (
    <Card className="border-chart-3/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-chart-3/20 to-chart-4/20">
              <Bot className="w-5 h-5 text-chart-3" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Marketing Swarm Engine
                <Badge 
                  variant="outline" 
                  className={isSwarmActive ? 'text-success border-success/30 animate-pulse' : 'text-muted-foreground'}
                >
                  {isSwarmActive ? '⚡ SWARMING' : 'PAUSED'}
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {swarmMetrics.activeAgents} agents executing {swarmMetrics.totalTasks} tasks
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch 
              checked={isSwarmActive} 
              onCheckedChange={setIsSwarmActive}
            />
            <Button onClick={deploySwarm} className="gap-2" size="sm">
              <Zap className="w-4 h-4" />
              Deploy Swarm
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Swarm Metrics */}
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-muted/30 text-center">
            <p className="text-2xl font-bold text-success">${(swarmMetrics.revenueGenerated / 1000).toFixed(1)}K</p>
            <p className="text-xs text-muted-foreground">Revenue Generated</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 text-center">
            <p className="text-2xl font-bold text-primary">{swarmMetrics.totalTasks}</p>
            <p className="text-xs text-muted-foreground">Tasks Completed</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 text-center">
            <p className="text-2xl font-bold">{swarmMetrics.activeAgents}</p>
            <p className="text-xs text-muted-foreground">Active Agents</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 text-center">
            <p className="text-2xl font-bold text-chart-4">{swarmMetrics.avgEfficiency}%</p>
            <p className="text-xs text-muted-foreground">Avg Efficiency</p>
          </div>
        </div>

        {/* Agent Grid */}
        <div className="grid grid-cols-2 gap-3">
          {agents.map((agent) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 rounded-lg bg-muted/30 border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${
                    agent.status === 'processing' ? 'bg-primary/20' : 'bg-muted'
                  }`}>
                    <agent.icon className={`w-4 h-4 ${
                      agent.status === 'processing' ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{agent.name}</p>
                    <p className="text-[10px] text-muted-foreground">{agent.lastAction}</p>
                  </div>
                </div>
                <Badge className={`text-[10px] ${getStatusColor(agent.status)}`}>
                  {agent.status === 'processing' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                  {agent.status.toUpperCase()}
                </Badge>
              </div>
              
              {agent.currentTask && (
                <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                  {agent.currentTask}
                </p>
              )}
              
              <div className="flex items-center justify-between text-xs">
                <span>{agent.tasksCompleted} tasks</span>
                <div className="flex items-center gap-1">
                  <span className="text-success">{agent.efficiency}%</span>
                  <Progress value={agent.efficiency} className="w-12 h-1.5" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent Actions */}
        <div>
          <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-chart-4" />
            Recent Swarm Actions
          </h4>
          <ScrollArea className="h-[180px]">
            <AnimatePresence>
              {actions.map((action, idx) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-3 rounded-lg bg-muted/20 border mb-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-[10px]">
                          {action.agent}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {Math.round((Date.now() - action.timestamp.getTime()) / 60000)}m ago
                        </span>
                      </div>
                      <p className="text-sm font-medium">{action.action}</p>
                      <p className="text-xs text-muted-foreground">{action.result}</p>
                    </div>
                    <div className="text-right">
                      <CheckCircle className="w-4 h-4 text-success mb-1" />
                      <p className="text-xs text-success font-medium">{action.impact}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
