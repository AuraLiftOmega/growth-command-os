import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Bot, 
  Zap, 
  DollarSign, 
  MessageSquare, 
  Video,
  ShoppingCart,
  BarChart3,
  Shield,
  Play,
  Pause
} from 'lucide-react';
import { toast } from 'sonner';

interface AutonomousCapability {
  id: string;
  name: string;
  description: string;
  icon: any;
  enabled: boolean;
  stats?: string;
}

export function CEOAutonomousActions() {
  const [autonomyLevel, setAutonomyLevel] = useState([75]);
  const [isRunning, setIsRunning] = useState(true);
  const [capabilities, setCapabilities] = useState<AutonomousCapability[]>([
    {
      id: 'chat_selling',
      name: 'Chat Auto-Selling',
      description: 'AI closes deals in conversations',
      icon: MessageSquare,
      enabled: true,
      stats: '23 deals/week'
    },
    {
      id: 'ad_optimization',
      name: 'Ad Budget Optimizer',
      description: 'Auto-scale winners, kill losers',
      icon: BarChart3,
      enabled: true,
      stats: '+340% ROAS'
    },
    {
      id: 'pricing_engine',
      name: 'Dynamic Pricing',
      description: 'Maximize margins automatically',
      icon: DollarSign,
      enabled: true,
      stats: '+12% margin'
    },
    {
      id: 'video_generation',
      name: 'Video Ad Generation',
      description: 'Create viral content 24/7',
      icon: Video,
      enabled: false,
      stats: '8 videos/day'
    },
    {
      id: 'inventory_management',
      name: 'Smart Inventory',
      description: 'Prevent stockouts & overstock',
      icon: ShoppingCart,
      enabled: true,
      stats: '0 stockouts'
    },
    {
      id: 'risk_protection',
      name: 'Risk Shield',
      description: 'Detect fraud & threats',
      icon: Shield,
      enabled: true,
      stats: '$2.4K saved'
    },
  ]);

  const toggleCapability = (id: string) => {
    setCapabilities(prev => 
      prev.map(cap => 
        cap.id === id ? { ...cap, enabled: !cap.enabled } : cap
      )
    );
    
    const cap = capabilities.find(c => c.id === id);
    if (cap) {
      toast.success(cap.enabled ? `${cap.name} disabled` : `${cap.name} enabled`);
    }
  };

  const toggleAutonomy = () => {
    setIsRunning(!isRunning);
    toast.success(isRunning ? 'CEO Brain paused' : 'CEO Brain activated');
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20">
              <Bot className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <CardTitle className="text-base">Autonomy Control</CardTitle>
              <CardDescription>CEO Brain capabilities</CardDescription>
            </div>
          </div>
          <Button
            size="sm"
            variant={isRunning ? 'default' : 'outline'}
            className={isRunning ? 'bg-success hover:bg-success/90 gap-1' : 'gap-1'}
            onClick={toggleAutonomy}
          >
            {isRunning ? (
              <>
                <Pause className="w-3 h-3" />
                Running
              </>
            ) : (
              <>
                <Play className="w-3 h-3" />
                Start
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Autonomy Level Slider */}
        <div className="p-3 rounded-lg bg-muted/50 border">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm">Autonomy Level</Label>
            <Badge 
              variant="outline" 
              className={
                autonomyLevel[0] >= 80 
                  ? 'bg-amber-500/10 text-amber-500' 
                  : autonomyLevel[0] >= 50
                  ? 'bg-blue-500/10 text-blue-400'
                  : 'bg-muted'
              }
            >
              {autonomyLevel[0]}%
            </Badge>
          </div>
          <Slider
            value={autonomyLevel}
            onValueChange={setAutonomyLevel}
            max={100}
            step={5}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {autonomyLevel[0] >= 80 
              ? 'Full autonomy – CEO Brain makes all decisions' 
              : autonomyLevel[0] >= 50
              ? 'Balanced – Major decisions need approval'
              : 'Conservative – Most decisions need approval'}
          </p>
        </div>

        {/* Capabilities Grid */}
        <div className="space-y-2">
          {capabilities.map((cap) => (
            <motion.div
              key={cap.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-lg border transition-colors ${
                cap.enabled ? 'bg-muted/50' : 'bg-background opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${
                    cap.enabled ? 'bg-primary/20' : 'bg-muted'
                  }`}>
                    <cap.icon className={`w-3.5 h-3.5 ${
                      cap.enabled ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{cap.name}</p>
                    <p className="text-xs text-muted-foreground">{cap.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {cap.stats && cap.enabled && (
                    <Badge variant="secondary" className="text-xs">
                      {cap.stats}
                    </Badge>
                  )}
                  <Switch
                    checked={cap.enabled}
                    onCheckedChange={() => toggleCapability(cap.id)}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="pt-2 border-t">
          <Button className="w-full gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
            <Zap className="w-4 h-4" />
            Execute All Pending Actions
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
