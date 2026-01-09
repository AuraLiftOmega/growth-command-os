/**
 * TIKTOK ADS PANEL
 * 
 * Full TikTok Ads management:
 * - Connect via OAuth
 * - Create campaigns from swarm videos
 * - Real-time metrics dashboard
 * - Auto-optimization controls
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Music,
  TrendingUp,
  DollarSign,
  Target,
  Play,
  Pause,
  Rocket,
  RefreshCw,
  Plus,
  Eye,
  MousePointer,
  ShoppingCart,
  Zap,
  Settings,
  AlertCircle,
  CheckCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface TikTokCampaign {
  campaign_id: string;
  campaign_name?: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  revenue: number;
  roas: number;
  performance: 'winner' | 'neutral' | 'underperformer';
}

interface TikTokMetrics {
  total_spend: number;
  total_conversions: number;
  total_revenue: number;
  avg_roas: number;
  winners: number;
  underperformers: number;
}

export function TikTokAdsPanel() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<TikTokCampaign[]>([]);
  const [metrics, setMetrics] = useState<TikTokMetrics | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [autoOptimize, setAutoOptimize] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // New campaign form
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    product: 'Radiance Vitamin C Serum',
    budget: 50,
    targetGender: 'GENDER_FEMALE',
    targetAges: ['AGE_25_34', 'AGE_35_44'],
  });

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Check if TikTok Ads is configured
      const { data, error } = await supabase.functions.invoke('tiktok-ads-optimize', {
        body: { action: 'get_metrics' }
      });

      if (error) {
        if (error.message?.includes('not configured')) {
          setIsConnected(false);
        } else {
          console.error('TikTok Ads check error:', error);
        }
      } else if (data?.success) {
        setIsConnected(true);
        setCampaigns(data.campaigns || []);
        setMetrics(data.summary || null);
      }
    } catch (err) {
      console.error('Connection check failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('tiktok-ads-optimize', {
        body: { action: 'get_metrics' }
      });

      if (data?.success) {
        setCampaigns(data.campaigns || []);
        setMetrics(data.summary || null);
        toast.success('Metrics refreshed');
      }
    } catch (err) {
      toast.error('Failed to fetch metrics');
    }
  };

  const runOptimization = async () => {
    setIsOptimizing(true);
    try {
      const { data, error } = await supabase.functions.invoke('tiktok-ads-optimize', {
        body: { 
          action: 'optimize_all',
          min_roas: 2.0,
          max_daily_budget: 500
        }
      });

      if (data?.success) {
        toast.success(data.message || 'Optimization complete');
        await fetchMetrics();
      } else {
        toast.error(error?.message || 'Optimization failed');
      }
    } catch (err) {
      toast.error('Optimization error');
    } finally {
      setIsOptimizing(false);
    }
  };

  const createCampaign = async () => {
    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('tiktok-ads-create', {
        body: {
          action: 'create_full_campaign',
          campaign_name: newCampaign.name || `${newCampaign.product} Campaign`,
          product_name: newCampaign.product,
          budget: newCampaign.budget,
          objective: 'TRAFFIC',
          target_url: 'https://auraliftessentials.com',
          targeting: {
            gender: newCampaign.targetGender,
            age_groups: newCampaign.targetAges,
          }
        }
      });

      if (data?.success) {
        toast.success(`Campaign created: ${data.campaign_name}`);
        setShowCreateDialog(false);
        await fetchMetrics();
      } else {
        toast.error(error?.message || data?.error || 'Campaign creation failed');
      }
    } catch (err) {
      toast.error('Failed to create campaign');
    } finally {
      setIsCreating(false);
    }
  };

  const scaleCampaign = async (campaignId: string, newBudget: number) => {
    try {
      const { data, error } = await supabase.functions.invoke('tiktok-ads-optimize', {
        body: {
          action: 'scale_campaign',
          campaign_id: campaignId,
          new_budget: newBudget
        }
      });

      if (data?.success) {
        toast.success(`Budget scaled to $${newBudget}/day`);
        await fetchMetrics();
      }
    } catch (err) {
      toast.error('Scale failed');
    }
  };

  const pauseCampaign = async (campaignId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('tiktok-ads-optimize', {
        body: {
          action: 'pause_campaign',
          campaign_id: campaignId
        }
      });

      if (data?.success) {
        toast.success('Campaign paused');
        await fetchMetrics();
      }
    } catch (err) {
      toast.error('Pause failed');
    }
  };

  if (isLoading) {
    return (
      <Card className="border-primary/30">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!isConnected) {
    return (
      <Card className="border-warning/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="w-5 h-5 text-[#00f2ea]" />
            TikTok Ads
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-warning/10 rounded-lg border border-warning/20">
            <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
            <div>
              <p className="font-medium">TikTok Ads Not Configured</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add these secrets to enable TikTok Ads:
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>• <code className="bg-muted px-1 rounded">TIKTOK_ADS_ACCESS_TOKEN</code></li>
                <li>• <code className="bg-muted px-1 rounded">TIKTOK_ADVERTISER_ID</code></li>
              </ul>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3 gap-2"
                onClick={() => window.open('https://business-api.tiktok.com/portal/docs', '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
                Get TikTok Marketing API Access
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#00f2ea]/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#00f2ea]/20 to-[#ff0050]/20">
              <Music className="w-5 h-5 text-[#00f2ea]" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                TikTok Ads
                <Badge className="bg-[#00f2ea]/20 text-[#00f2ea] border-[#00f2ea]/30">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  LIVE
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Real campaigns • Auto-optimization • {campaigns.length} active
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 mr-4">
              <Label className="text-sm">Auto-Optimize</Label>
              <Switch 
                checked={autoOptimize} 
                onCheckedChange={setAutoOptimize}
              />
            </div>
            <Button variant="outline" size="sm" onClick={fetchMetrics}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={runOptimization}
              disabled={isOptimizing}
              className="gap-2"
            >
              {isOptimizing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              Optimize
            </Button>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2 bg-gradient-to-r from-[#00f2ea] to-[#ff0050]">
                  <Plus className="w-4 h-4" />
                  New Campaign
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create TikTok Campaign</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Campaign Name</Label>
                    <Input 
                      placeholder="e.g., Vitamin C Serum - Beauty"
                      value={newCampaign.name}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Product</Label>
                    <Select 
                      value={newCampaign.product} 
                      onValueChange={(v) => setNewCampaign(prev => ({ ...prev, product: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Radiance Vitamin C Serum">Radiance Vitamin C Serum</SelectItem>
                        <SelectItem value="Retinol Night Cream">Retinol Night Cream</SelectItem>
                        <SelectItem value="Hyaluronic Serum">Hyaluronic Serum</SelectItem>
                        <SelectItem value="Collagen Moisturizer">Collagen Moisturizer</SelectItem>
                        <SelectItem value="Rose Quartz Roller">Rose Quartz Roller</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Daily Budget: ${newCampaign.budget}</Label>
                    <Slider 
                      value={[newCampaign.budget]}
                      onValueChange={([v]) => setNewCampaign(prev => ({ ...prev, budget: v }))}
                      min={10}
                      max={500}
                      step={10}
                    />
                    <p className="text-xs text-muted-foreground">
                      Recommended: $50-100/day for testing
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Target Gender</Label>
                    <Select 
                      value={newCampaign.targetGender} 
                      onValueChange={(v) => setNewCampaign(prev => ({ ...prev, targetGender: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GENDER_FEMALE">Women</SelectItem>
                        <SelectItem value="GENDER_MALE">Men</SelectItem>
                        <SelectItem value="GENDER_UNLIMITED">All</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    className="w-full gap-2" 
                    onClick={createCampaign}
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Rocket className="w-4 h-4" />
                    )}
                    Launch Campaign
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Metrics Summary */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-warning" />
                <span className="text-sm text-muted-foreground">Spend</span>
              </div>
              <p className="text-xl font-bold">${metrics.total_spend.toFixed(0)}</p>
            </div>
            <div className="p-3 rounded-lg bg-success/10 border border-success/20">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-success" />
                <span className="text-sm text-muted-foreground">Revenue</span>
              </div>
              <p className="text-xl font-bold text-success">${metrics.total_revenue.toFixed(0)}</p>
            </div>
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Avg ROAS</span>
              </div>
              <p className="text-xl font-bold">{metrics.avg_roas.toFixed(1)}x</p>
            </div>
            <div className="p-3 rounded-lg bg-chart-4/10 border border-chart-4/20">
              <div className="flex items-center gap-2 mb-1">
                <ShoppingCart className="w-4 h-4 text-chart-4" />
                <span className="text-sm text-muted-foreground">Conversions</span>
              </div>
              <p className="text-xl font-bold">{metrics.total_conversions}</p>
            </div>
          </div>
        )}

        {/* Campaigns List */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            Active Campaigns
            <Badge variant="outline">{campaigns.length}</Badge>
          </h4>
          
          <AnimatePresence>
            {campaigns.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Music className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No campaigns yet. Create your first TikTok campaign!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {campaigns.map((campaign) => (
                  <motion.div
                    key={campaign.campaign_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-3 rounded-lg border ${
                      campaign.performance === 'winner' 
                        ? 'bg-success/5 border-success/20' 
                        : campaign.performance === 'underperformer'
                        ? 'bg-destructive/5 border-destructive/20'
                        : 'bg-muted/30 border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">🎵</div>
                        <div>
                          <p className="font-medium text-sm">
                            {campaign.campaign_name || `Campaign ${campaign.campaign_id.slice(-6)}`}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {campaign.impressions.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <MousePointer className="w-3 h-3" />
                              {campaign.clicks.toLocaleString()}
                            </span>
                            <span>{campaign.ctr.toFixed(2)}% CTR</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            ${campaign.spend.toFixed(0)} → ${campaign.revenue.toFixed(0)}
                          </p>
                          <Badge className={
                            campaign.roas >= 3 ? 'bg-success/20 text-success' :
                            campaign.roas >= 1.5 ? 'bg-primary/20 text-primary' :
                            'bg-destructive/20 text-destructive'
                          }>
                            {campaign.roas.toFixed(1)}x ROAS
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          {campaign.performance === 'winner' && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-success"
                              onClick={() => scaleCampaign(campaign.campaign_id, campaign.spend * 2)}
                              title="Scale 2x"
                            >
                              <Rocket className="w-4 h-4" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => pauseCampaign(campaign.campaign_id)}
                            title="Pause"
                          >
                            <Pause className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Auto-Optimization Status */}
        {autoOptimize && (
          <div className="p-3 rounded-lg bg-gradient-to-r from-[#00f2ea]/10 to-[#ff0050]/10 border border-[#00f2ea]/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#00f2ea]" />
                <span className="text-sm font-medium">RuthlessOptimizer Active</span>
              </div>
              <Badge className="bg-[#00f2ea]/20 text-[#00f2ea] animate-pulse">
                Auto-scaling winners, killing losers
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
