import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Target, 
  Zap, 
  TrendingUp, 
  Package, 
  DollarSign, 
  Sparkles,
  Play,
  CheckCircle,
  XCircle,
  RefreshCw,
  Rocket,
  ShoppingBag,
  Video,
  Clock,
  AlertTriangle,
  Crown,
  Trophy
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface HuntedProduct {
  id: string;
  product_name: string;
  source: string;
  category: string;
  suggested_price: number;
  cost_price: number;
  margin_percentage: number;
  viral_score: number;
  tiktok_potential: number;
  bundle_affinity_score: number;
  overall_score: number;
  ltv_potential: string;
  cac_estimate: string;
  trend_tags: string[];
  ai_description: string;
  ai_benefits: string[];
  ai_hooks: string[];
  status: string;
  performance_status: string;
  shopify_product_id?: string;
  shopify_handle?: string;
  ads_generated: number;
  roas?: number;
  revenue?: number;
  discovered_at: string;
}

export const WinningProductHunter: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<HuntedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHunting, setIsHunting] = useState(false);
  const [autoHuntMode, setAutoHuntMode] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all');
  const [huntProgress, setHuntProgress] = useState(0);
  const [nextHuntTime, setNextHuntTime] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState('');

  const fetchProducts = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('hunt-winning-products', {
        body: { action: 'list' }
      });

      if (error) throw error;
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Auto-hunt loop
  useEffect(() => {
    if (!autoHuntMode || !user) return;

    // Hunt immediately when enabled
    huntProducts(5);
    setNextHuntTime(new Date(Date.now() + 60 * 60 * 1000));

    const interval = setInterval(() => {
      huntProducts(5);
      setNextHuntTime(new Date(Date.now() + 60 * 60 * 1000));
    }, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [autoHuntMode, user]);

  // Countdown timer
  useEffect(() => {
    if (!nextHuntTime || !autoHuntMode) {
      setCountdown('');
      return;
    }

    const updateCountdown = () => {
      const diff = nextHuntTime.getTime() - Date.now();
      if (diff <= 0) {
        setCountdown('Hunting...');
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setCountdown(`${mins}m ${secs}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [nextHuntTime, autoHuntMode]);

  const huntProducts = async (count: number = 5) => {
    if (isHunting) return;
    
    setIsHunting(true);
    setHuntProgress(0);
    
    try {
      const progressInterval = setInterval(() => {
        setHuntProgress(prev => Math.min(prev + 15, 90));
      }, 500);

      const { data, error } = await supabase.functions.invoke('hunt-winning-products', {
        body: { action: 'hunt', count }
      });

      clearInterval(progressInterval);
      setHuntProgress(100);

      if (error) throw error;

      toast.success(`🎯 Discovered ${data.products_discovered} winning products!`, {
        description: data.top_picks?.map((p: any) => `${p.name}: ${p.score}/100`).join(' | ')
      });

      await fetchProducts();
    } catch (error: any) {
      console.error('Hunt error:', error);
      toast.error('Hunt failed', { description: error.message });
    } finally {
      setIsHunting(false);
      setTimeout(() => setHuntProgress(0), 1000);
    }
  };

  const approveProduct = async (productId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('hunt-winning-products', {
        body: { action: 'approve', product_id: productId }
      });

      if (error) throw error;
      toast.success('Product approved!', { description: data.message });
      await fetchProducts();
    } catch (error: any) {
      toast.error('Failed to approve', { description: error.message });
    }
  };

  const addToStore = async (productId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('hunt-winning-products', {
        body: { action: 'add_to_store', product_id: productId }
      });

      if (error) throw error;
      toast.success('Added to Shopify!', { 
        description: `View at: ${data.store_url}` 
      });
      await fetchProducts();
    } catch (error: any) {
      toast.error('Failed to add', { description: error.message });
    }
  };

  const generateAds = async (productId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('hunt-winning-products', {
        body: { action: 'generate_ads', product_id: productId }
      });

      if (error) throw error;
      toast.success(`Generated ${data.video_ideas?.length || 0} video ads!`);
      await fetchProducts();
    } catch (error: any) {
      toast.error('Failed to generate ads', { description: error.message });
    }
  };

  const killProduct = async (productId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('hunt-winning-products', {
        body: { action: 'kill_underperformer', product_id: productId }
      });

      if (error) throw error;
      toast.info('Product killed', { description: data.reason });
      await fetchProducts();
    } catch (error: any) {
      toast.error('Failed to kill product', { description: error.message });
    }
  };

  const scaleProduct = async (productId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('hunt-winning-products', {
        body: { action: 'scale_winner', product_id: productId }
      });

      if (error) throw error;
      toast.success('Scaling initiated!', { 
        description: `Expanding to: ${data.channels?.join(', ')}` 
      });
      await fetchProducts();
    } catch (error: any) {
      toast.error('Failed to scale', { description: error.message });
    }
  };

  const filteredProducts = products.filter(p => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'discovered') return p.status === 'discovered';
    if (selectedTab === 'added') return p.status === 'added';
    if (selectedTab === 'winners') return p.performance_status === 'winner' || p.performance_status === 'scaled';
    if (selectedTab === 'killed') return p.status === 'killed';
    return true;
  });

  const stats = {
    total: products.length,
    discovered: products.filter(p => p.status === 'discovered').length,
    added: products.filter(p => p.status === 'added').length,
    winners: products.filter(p => p.performance_status === 'winner' || p.performance_status === 'scaled').length,
    avgScore: products.length ? Math.round(products.reduce((acc, p) => acc + (p.overall_score || 0), 0) / products.length) : 0,
    totalRevenue: products.reduce((acc, p) => acc + (p.revenue || 0), 0),
  };

  const getStatusBadge = (product: HuntedProduct) => {
    const statusColors: Record<string, string> = {
      discovered: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      approved: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      adding: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      added: 'bg-green-500/20 text-green-300 border-green-500/30',
      killed: 'bg-red-500/20 text-red-300 border-red-500/30',
    };
    return statusColors[product.status] || 'bg-muted';
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-amber-900/30 to-orange-900/20 border-amber-500/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Target className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-xl text-amber-100">
                  Winning Product Hunter 🎯
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  AI-powered product discovery for maximum ROAS
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Button
                  variant={autoHuntMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAutoHuntMode(!autoHuntMode)}
                  className={autoHuntMode ? 'bg-amber-600 hover:bg-amber-700' : ''}
                >
                  <Zap className={`h-4 w-4 mr-1 ${autoHuntMode ? 'animate-pulse' : ''}`} />
                  {autoHuntMode ? '24/7 AUTO' : 'Auto Hunt'}
                </Button>
                {autoHuntMode && countdown && (
                  <Badge variant="outline" className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                    <Clock className="h-3 w-3 mr-1" />
                    {countdown}
                  </Badge>
                )}
              </div>
              <Button
                onClick={() => huntProducts(5)}
                disabled={isHunting}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
              >
                {isHunting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Hunting...
                  </>
                ) : (
                  <>
                    <Target className="h-4 w-4 mr-2" />
                    Hunt Winners
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        {huntProgress > 0 && (
          <CardContent className="pt-0">
            <Progress value={huntProgress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Scanning CJ, AliExpress, Spocket, and competitors...
            </p>
          </CardContent>
        )}
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <Package className="h-5 w-5 mx-auto text-blue-400 mb-1" />
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total Found</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <Sparkles className="h-5 w-5 mx-auto text-purple-400 mb-1" />
            <p className="text-2xl font-bold">{stats.discovered}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <ShoppingBag className="h-5 w-5 mx-auto text-green-400 mb-1" />
            <p className="text-2xl font-bold">{stats.added}</p>
            <p className="text-xs text-muted-foreground">In Store</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <Trophy className="h-5 w-5 mx-auto text-amber-400 mb-1" />
            <p className="text-2xl font-bold">{stats.winners}</p>
            <p className="text-xs text-muted-foreground">Winners</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto text-cyan-400 mb-1" />
            <p className="text-2xl font-bold">{stats.avgScore}</p>
            <p className="text-xs text-muted-foreground">Avg Score</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <DollarSign className="h-5 w-5 mx-auto text-emerald-400 mb-1" />
            <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">Revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Products List */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="bg-muted/30">
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="discovered">Discovered ({stats.discovered})</TabsTrigger>
              <TabsTrigger value="added">In Store ({stats.added})</TabsTrigger>
              <TabsTrigger value="winners">Winners ({stats.winners})</TabsTrigger>
              <TabsTrigger value="killed">Killed</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No products found</p>
                <Button onClick={() => huntProducts(5)} className="mt-4">
                  Start Hunting
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="bg-muted/20 border-border/30 hover:border-border/50 transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold truncate">{product.product_name}</h4>
                            <Badge variant="outline" className={getStatusBadge(product)}>
                              {product.status}
                            </Badge>
                            {product.performance_status === 'winner' && (
                              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                                <Crown className="h-3 w-3 mr-1" />
                                Winner
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {product.ai_description}
                          </p>

                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge variant="secondary" className="text-xs">
                              {product.category}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {product.source}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              ${product.suggested_price}
                            </Badge>
                            <Badge variant="outline" className="text-xs text-green-400">
                              {product.margin_percentage}% margin
                            </Badge>
                          </div>

                          <div className="flex flex-wrap gap-1 mb-3">
                            {product.trend_tags?.slice(0, 4).map((tag, idx) => (
                              <span key={idx} className="text-xs text-blue-400">
                                {tag}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className={getScoreColor(product.overall_score || 0)}>
                              Score: {product.overall_score}/100
                            </span>
                            <span>Viral: {product.viral_score}/10</span>
                            <span>TikTok: {product.tiktok_potential}/10</span>
                            <span>LTV: {product.ltv_potential}</span>
                            {product.ads_generated > 0 && (
                              <span className="text-purple-400">
                                <Video className="h-3 w-3 inline mr-1" />
                                {product.ads_generated} ads
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          {product.status === 'discovered' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => approveProduct(product.id)}
                                className="text-green-400 border-green-500/30 hover:bg-green-500/10"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => killProduct(product.id)}
                                className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          {product.status === 'approved' && (
                            <Button
                              size="sm"
                              onClick={() => addToStore(product.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <ShoppingBag className="h-4 w-4 mr-1" />
                              Add to Store
                            </Button>
                          )}
                          {product.status === 'added' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => generateAds(product.id)}
                                className="text-purple-400 border-purple-500/30"
                              >
                                <Video className="h-4 w-4 mr-1" />
                                Gen Ads
                              </Button>
                              {product.performance_status !== 'scaled' && (
                                <Button
                                  size="sm"
                                  onClick={() => scaleProduct(product.id)}
                                  className="bg-amber-600 hover:bg-amber-700"
                                >
                                  <Rocket className="h-4 w-4 mr-1" />
                                  Scale 5x
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default WinningProductHunter;
