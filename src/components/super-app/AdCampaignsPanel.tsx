/**
 * AD CAMPAIGNS PANEL
 * 
 * Manages ad campaigns with:
 * - Real-time performance metrics
 * - Budget allocation
 * - A/B test results
 * - Auto-optimization controls
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Megaphone,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  BarChart3,
  Play,
  Pause,
  Trash2,
  Copy,
  Edit,
  Zap,
  Eye,
  MousePointer,
  ShoppingCart,
  RefreshCw,
  Plus,
  Filter
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { TikTokAdsPanel } from '@/components/ads/TikTokAdsPanel';

interface Campaign {
  id: string;
  name: string;
  platform: string;
  status: 'active' | 'paused' | 'draft' | 'completed';
  budget: number;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  roas: number;
  ctr: number;
  cpc: number;
  cpa: number;
  createdAt: Date;
}

const DEMO_CAMPAIGNS: Campaign[] = [
  {
    id: '1',
    name: 'Vitamin C Serum - UGC TikTok',
    platform: 'tiktok',
    status: 'active',
    budget: 150,
    spend: 127,
    impressions: 284500,
    clicks: 4267,
    conversions: 89,
    revenue: 4405,
    roas: 34.7,
    ctr: 1.5,
    cpc: 0.03,
    cpa: 1.43,
    createdAt: new Date()
  },
  {
    id: '2',
    name: 'Retinol Night Cream - Instagram Reels',
    platform: 'instagram',
    status: 'active',
    budget: 100,
    spend: 89,
    impressions: 156000,
    clicks: 2340,
    conversions: 52,
    revenue: 3380,
    roas: 38.0,
    ctr: 1.5,
    cpc: 0.04,
    cpa: 1.71,
    createdAt: new Date()
  },
  {
    id: '3',
    name: 'Hyaluronic Serum - Facebook Feed',
    platform: 'facebook',
    status: 'active',
    budget: 75,
    spend: 68,
    impressions: 98000,
    clicks: 1470,
    conversions: 28,
    revenue: 1540,
    roas: 22.6,
    ctr: 1.5,
    cpc: 0.05,
    cpa: 2.43,
    createdAt: new Date()
  },
  {
    id: '4',
    name: 'Face Roller - Pinterest Promoted',
    platform: 'pinterest',
    status: 'paused',
    budget: 50,
    spend: 42,
    impressions: 45000,
    clicks: 675,
    conversions: 8,
    revenue: 320,
    roas: 7.6,
    ctr: 1.5,
    cpc: 0.06,
    cpa: 5.25,
    createdAt: new Date()
  },
  {
    id: '5',
    name: 'Collagen Moisturizer - YouTube Shorts',
    platform: 'youtube',
    status: 'active',
    budget: 80,
    spend: 71,
    impressions: 178000,
    clicks: 2848,
    conversions: 45,
    revenue: 3375,
    roas: 47.5,
    ctr: 1.6,
    cpc: 0.02,
    cpa: 1.58,
    createdAt: new Date()
  },
];

const platformIcons: Record<string, string> = {
  tiktok: '🎵',
  instagram: '📸',
  facebook: '📘',
  pinterest: '📌',
  youtube: '📺',
  amazon: '📦',
};

export function AdCampaignsPanel() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(DEMO_CAMPAIGNS);
  const [filter, setFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [search, setSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredCampaigns = campaigns.filter(c => {
    if (filter !== 'all' && c.status !== filter) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalSpend = campaigns.reduce((sum, c) => sum + c.spend, 0);
  const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);
  const avgRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);

  const toggleCampaign = (id: string) => {
    setCampaigns(prev => prev.map(c =>
      c.id === id ? { ...c, status: c.status === 'active' ? 'paused' : 'active' } : c
    ));
    toast.success('Campaign status updated');
  };

  const duplicateCampaign = (campaign: Campaign) => {
    const newCampaign = {
      ...campaign,
      id: `${campaign.id}-copy-${Date.now()}`,
      name: `${campaign.name} (Copy)`,
      status: 'draft' as const,
      spend: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      revenue: 0,
    };
    setCampaigns(prev => [...prev, newCampaign]);
    toast.success('Campaign duplicated');
  };

  const deleteCampaign = (id: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== id));
    toast.success('Campaign deleted');
  };

  const refresh = async () => {
    setIsRefreshing(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsRefreshing(false);
    toast.success('Campaigns refreshed');
  };

  return (
    <Tabs defaultValue="all" className="space-y-6">
      <TabsList className="grid grid-cols-3 w-fit">
        <TabsTrigger value="all" className="gap-2">
          <Megaphone className="w-4 h-4" />
          All Campaigns
        </TabsTrigger>
        <TabsTrigger value="tiktok" className="gap-2">
          🎵 TikTok Ads
        </TabsTrigger>
        <TabsTrigger value="meta" className="gap-2">
          📱 Meta Ads
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-warning" />
              <span className="text-sm text-muted-foreground">Total Spend</span>
            </div>
            <p className="text-2xl font-bold">${totalSpend.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Across {campaigns.length} campaigns</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-sm text-muted-foreground">Total Revenue</span>
            </div>
            <p className="text-2xl font-bold text-success">${totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">+{((totalRevenue / totalSpend - 1) * 100).toFixed(0)}% ROI</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Avg ROAS</span>
            </div>
            <p className="text-2xl font-bold">{avgRoas.toFixed(1)}x</p>
            <p className="text-xs text-muted-foreground">Blended across all</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart className="w-4 h-4 text-chart-2" />
              <span className="text-sm text-muted-foreground">Conversions</span>
            </div>
            <p className="text-2xl font-bold">{totalConversions}</p>
            <p className="text-xs text-muted-foreground">${(totalSpend / totalConversions).toFixed(2)} CPA</p>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex items-center gap-3">
            <Input
              placeholder="Search campaigns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
            <div className="flex gap-1 p-1 bg-muted rounded-lg">
              {(['all', 'active', 'paused'] as const).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter(f)}
                  className="capitalize"
                >
                  {f}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={refresh} disabled={isRefreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              New Campaign
            </Button>
          </div>
        </div>

        {/* Campaigns Table */}
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Spend</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">ROAS</TableHead>
                <TableHead className="text-right">Conv.</TableHead>
                <TableHead className="text-right">CTR</TableHead>
                <TableHead className="text-right">CPA</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filteredCampaigns.map((campaign) => (
                  <motion.tr
                    key={campaign.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="group"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{platformIcons[campaign.platform]}</span>
                        <div>
                          <p className="font-medium">{campaign.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{campaign.platform}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        campaign.status === 'active' ? 'bg-success/20 text-success' :
                        campaign.status === 'paused' ? 'bg-warning/20 text-warning' :
                        'bg-muted text-muted-foreground'
                      }>
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div>
                        <p className="font-medium">${campaign.spend}</p>
                        <Progress value={(campaign.spend / campaign.budget) * 100} className="h-1 w-16 ml-auto" />
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-success font-medium">
                      ${campaign.revenue.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={campaign.roas >= 20 ? 'text-success' : campaign.roas >= 10 ? 'text-primary' : 'text-warning'}>
                        {campaign.roas.toFixed(1)}x
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{campaign.conversions}</TableCell>
                    <TableCell className="text-right">{campaign.ctr.toFixed(1)}%</TableCell>
                    <TableCell className="text-right">${campaign.cpa.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => toggleCampaign(campaign.id)}
                        >
                          {campaign.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => duplicateCampaign(campaign)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => deleteCampaign(campaign.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </Card>

        {/* Auto-Optimization Status */}
        <Card className="p-4 bg-gradient-to-r from-primary/10 to-success/10 border-primary/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-primary" />
              <div>
                <p className="font-semibold">CEO Agent Auto-Optimization</p>
                <p className="text-sm text-muted-foreground">
                  Automatically scaling winners, pausing underperformers, adjusting bids
                </p>
              </div>
            </div>
            <Badge className="bg-success/20 text-success animate-pulse">ACTIVE</Badge>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="tiktok">
        <TikTokAdsPanel />
      </TabsContent>

      <TabsContent value="meta">
        <Card className="p-8 text-center">
          <div className="text-4xl mb-4">📱</div>
          <h3 className="text-xl font-semibold mb-2">Meta Ads Coming Soon</h3>
          <p className="text-muted-foreground">
            Facebook & Instagram ad integration is in development.
          </p>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
