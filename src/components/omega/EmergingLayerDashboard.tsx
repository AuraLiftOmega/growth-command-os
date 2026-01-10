import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  Globe, Bot, Link2, Zap, Play, Pause, Activity, 
  DollarSign, Users, Box, Sparkles, Radio, Cpu, Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MetaverseDeployment {
  id: string;
  platform: string;
  deployment_type: string;
  status: string;
  location: { x?: number; y?: number; z?: number; parcel?: string };
  interactions_count: number;
  revenue_generated: number;
  created_at: string;
}

interface RobotDeployment {
  id: string;
  robot_type: string;
  location: string;
  task_type: string;
  status: string;
  telemetry: { battery?: number; temperature?: number };
  tasks_completed: number;
  revenue_attributed: number;
}

interface BlockchainLog {
  id: string;
  tx_hash: string;
  tx_type: string;
  amount: number;
  currency: string;
  chain: string;
  confirmed: boolean;
  created_at: string;
}

export function EmergingLayerDashboard() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);
  const [metaverseDeployments, setMetaverseDeployments] = useState<MetaverseDeployment[]>([]);
  const [robotDeployments, setRobotDeployments] = useState<RobotDeployment[]>([]);
  const [blockchainLogs, setBlockchainLogs] = useState<BlockchainLog[]>([]);
  
  // Form states
  const [selectedPlatform, setSelectedPlatform] = useState('decentraland');
  const [selectedRobotType, setSelectedRobotType] = useState('figure_01');
  const [robotLocation, setRobotLocation] = useState('HQ Showroom');
  const [logAmount, setLogAmount] = useState('');

  const fetchStats = async () => {
    if (!session?.access_token) return;
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/blockchain-log`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ action: 'get_stats' })
        }
      );

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setMetaverseDeployments(data.metaverse?.deployments || []);
      setRobotDeployments(data.robots?.deployments || []);
      setBlockchainLogs(data.blockchain?.logs || []);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [session]);

  const deployMetaverseRep = async () => {
    if (!session?.access_token) return;
    setDeploying(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/blockchain-log`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            action: 'deploy_metaverse_rep',
            platform: selectedPlatform,
            deploymentType: 'sales_rep',
            config: { avatar_style: 'professional' }
          })
        }
      );

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      toast.success(`Virtual Sales Rep deployed to ${selectedPlatform}!`);
      fetchStats();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Deployment failed');
    } finally {
      setDeploying(false);
    }
  };

  const deployRobot = async () => {
    if (!session?.access_token) return;
    setDeploying(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/blockchain-log`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            action: 'deploy_robot',
            robotType: selectedRobotType,
            taskType: 'retail_demo',
            location: robotLocation
          })
        }
      );

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      toast.success(`${selectedRobotType} robot activated!`);
      fetchStats();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Robot deployment failed');
    } finally {
      setDeploying(false);
    }
  };

  const logProfitToBlockchain = async () => {
    if (!session?.access_token || !logAmount) return;
    setDeploying(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/blockchain-log`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            action: 'log_profit',
            amount: parseFloat(logAmount),
            txType: 'profit_log',
            metadata: { source: 'omega_ceo_brain', timestamp: new Date().toISOString() }
          })
        }
      );

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      toast.success('Profit logged to Polygon blockchain!');
      setLogAmount('');
      fetchStats();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Blockchain logging failed');
    } finally {
      setDeploying(false);
    }
  };

  const totalMetaverseRevenue = metaverseDeployments.reduce((s, d) => s + Number(d.revenue_generated || 0), 0);
  const totalRobotRevenue = robotDeployments.reduce((s, r) => s + Number(r.revenue_attributed || 0), 0);
  const totalBlockchainLogged = blockchainLogs.filter(l => l.tx_type === 'profit_log').reduce((s, l) => s + Number(l.amount || 0), 0);

  const platformIcons: Record<string, JSX.Element> = {
    decentraland: <Globe className="h-4 w-4" />,
    roblox: <Box className="h-4 w-4" />,
    sandbox: <Sparkles className="h-4 w-4" />,
    spatial: <Radio className="h-4 w-4" />
  };

  const robotIcons: Record<string, JSX.Element> = {
    figure_01: <Bot className="h-4 w-4" />,
    agility_digit: <Cpu className="h-4 w-4" />,
    boston_spot: <Activity className="h-4 w-4" />,
    custom: <Zap className="h-4 w-4" />
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Metaverse Reps</p>
                  <p className="text-2xl font-bold">{metaverseDeployments.filter(d => d.status === 'active').length}</p>
                </div>
                <Globe className="h-8 w-8 text-purple-400" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                ${totalMetaverseRevenue.toFixed(2)} revenue
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Robots</p>
                  <p className="text-2xl font-bold">{robotDeployments.filter(r => r.status === 'active').length}</p>
                </div>
                <Bot className="h-8 w-8 text-blue-400" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                ${totalRobotRevenue.toFixed(2)} attributed
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Blockchain Txs</p>
                  <p className="text-2xl font-bold">{blockchainLogs.length}</p>
                </div>
                <Link2 className="h-8 w-8 text-green-400" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                ${totalBlockchainLogged.toFixed(2)} logged
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Interactions</p>
                  <p className="text-2xl font-bold">
                    {metaverseDeployments.reduce((s, d) => s + (d.interactions_count || 0), 0)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-orange-400" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Across all platforms
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="metaverse" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="metaverse" className="flex items-center gap-2">
            <Globe className="h-4 w-4" /> Metaverse
          </TabsTrigger>
          <TabsTrigger value="robots" className="flex items-center gap-2">
            <Bot className="h-4 w-4" /> Robots
          </TabsTrigger>
          <TabsTrigger value="blockchain" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" /> Blockchain
          </TabsTrigger>
        </TabsList>

        <TabsContent value="metaverse" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-purple-400" />
                Deploy Virtual Sales Rep
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="decentraland">Decentraland</SelectItem>
                      <SelectItem value="roblox">Roblox</SelectItem>
                      <SelectItem value="sandbox">The Sandbox</SelectItem>
                      <SelectItem value="spatial">Spatial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={deployMetaverseRep} 
                    disabled={deploying}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Deploy Virtual Sales Rep
                  </Button>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium mb-3">Active Deployments</h4>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    <AnimatePresence>
                      {metaverseDeployments.map((deployment, idx) => (
                        <motion.div
                          key={deployment.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            {platformIcons[deployment.platform] || <Globe className="h-4 w-4" />}
                            <div>
                              <p className="font-medium capitalize">{deployment.platform}</p>
                              <p className="text-xs text-muted-foreground">
                                Location: {deployment.location?.parcel || 'Unknown'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={deployment.status === 'active' ? 'default' : 'secondary'}>
                              {deployment.status}
                            </Badge>
                            <div className="text-right">
                              <p className="text-sm font-medium">{deployment.interactions_count} chats</p>
                              <p className="text-xs text-muted-foreground">
                                ${Number(deployment.revenue_generated).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {metaverseDeployments.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No metaverse deployments yet. Deploy your first virtual sales rep!
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="robots" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-400" />
                Deploy Physical Robot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Robot Type</Label>
                  <Select value={selectedRobotType} onValueChange={setSelectedRobotType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="figure_01">Figure 01 Humanoid</SelectItem>
                      <SelectItem value="agility_digit">Agility Digit</SelectItem>
                      <SelectItem value="boston_spot">Boston Spot</SelectItem>
                      <SelectItem value="custom">Custom Robot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input 
                    value={robotLocation} 
                    onChange={(e) => setRobotLocation(e.target.value)}
                    placeholder="e.g., HQ Showroom"
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={deployRobot} 
                    disabled={deploying}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500"
                  >
                    <Cpu className="h-4 w-4 mr-2" />
                    Activate Robot
                  </Button>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium mb-3">Robot Fleet</h4>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    <AnimatePresence>
                      {robotDeployments.map((robot, idx) => (
                        <motion.div
                          key={robot.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            {robotIcons[robot.robot_type] || <Bot className="h-4 w-4" />}
                            <div>
                              <p className="font-medium capitalize">{robot.robot_type.replace('_', ' ')}</p>
                              <p className="text-xs text-muted-foreground">{robot.location}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16">
                                <Progress value={robot.telemetry?.battery || 100} className="h-2" />
                              </div>
                              <span className="text-xs">{robot.telemetry?.battery || 100}%</span>
                            </div>
                            <Badge variant={robot.status === 'active' ? 'default' : 'secondary'}>
                              {robot.status}
                            </Badge>
                            <div className="text-right">
                              <p className="text-sm font-medium">{robot.tasks_completed} tasks</p>
                              <p className="text-xs text-muted-foreground">
                                ${Number(robot.revenue_attributed).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {robotDeployments.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No robots deployed yet. Activate your first physical sales robot!
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blockchain" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-green-400" />
                Polygon Blockchain Logger
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Profit Amount (MATIC)</Label>
                  <Input 
                    type="number"
                    value={logAmount} 
                    onChange={(e) => setLogAmount(e.target.value)}
                    placeholder="e.g., 1000"
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={logProfitToBlockchain} 
                    disabled={deploying || !logAmount}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500"
                  >
                    <Link2 className="h-4 w-4 mr-2" />
                    Log Profit to Blockchain
                  </Button>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium mb-3">Transaction History</h4>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    <AnimatePresence>
                      {blockchainLogs.map((log, idx) => (
                        <motion.div
                          key={log.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <Link2 className="h-4 w-4 text-green-400" />
                            <div>
                              <p className="font-mono text-xs">
                                {log.tx_hash?.slice(0, 10)}...{log.tx_hash?.slice(-8)}
                              </p>
                              <p className="text-xs text-muted-foreground capitalize">
                                {log.tx_type?.replace('_', ' ')} • {log.chain}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={log.confirmed ? 'default' : 'secondary'}>
                              {log.confirmed ? 'Confirmed' : 'Pending'}
                            </Badge>
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                {Number(log.amount).toFixed(4)} {log.currency}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(log.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {blockchainLogs.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No blockchain transactions yet. Log your first profit!
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
