import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import {
  Hexagon,
  Sparkles,
  Camera,
  QrCode,
  DollarSign,
  TrendingUp,
  Eye,
  ShoppingCart,
  Zap,
  Loader2,
  ExternalLink,
  Image as ImageIcon,
  Play,
  Wallet
} from 'lucide-react';

interface NFTMint {
  id: string;
  nft_name: string;
  nft_description: string;
  image_url: string;
  token_id: string;
  contract_address: string;
  marketplace_url: string;
  mint_status: string;
  mint_price: number;
  sale_price: number;
  nft_type: string;
  product_name: string;
  created_at: string;
  minted_at: string;
}

interface ARExperience {
  id: string;
  experience_name: string;
  experience_type: string;
  product_name: string;
  ar_effect: string;
  ar_url: string;
  qr_code_url: string;
  total_views: number;
  total_conversions: number;
  conversion_rate: number;
  revenue_attributed: number;
  status: string;
  created_at: string;
}

interface Web3Revenue {
  nft_sales: number;
  nft_revenue: number;
  nft_royalties: number;
  ar_conversions: number;
  ar_revenue: number;
  total: number;
}

const PRODUCT_TYPES = [
  { value: 'vitamin-c-serum', label: 'Vitamin C Serum' },
  { value: 'peptide-serum', label: 'Peptide Complex Serum' },
  { value: 'hyaluronic-acid', label: 'Hyaluronic Acid Serum' },
  { value: 'retinol-cream', label: 'Retinol Night Cream' },
  { value: 'glow-recipe', label: 'Glow Recipe Watermelon Set' }
];

const AR_EFFECTS = [
  { value: 'glass-skin', label: 'Glass Skin Preview' },
  { value: 'dewy-glow', label: 'Dewy Glow Filter' },
  { value: 'anti-aging', label: 'Age Rewind Preview' },
  { value: 'brightening', label: 'Vitamin C Glow' }
];

export function Web3RevenueDashboard() {
  const { user } = useAuth();
  const [nftMints, setNftMints] = useState<NFTMint[]>([]);
  const [arExperiences, setArExperiences] = useState<ARExperience[]>([]);
  const [revenue, setRevenue] = useState<Web3Revenue | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [minting, setMinting] = useState<string | null>(null);

  // Form states
  const [selectedProduct, setSelectedProduct] = useState('vitamin-c-serum');
  const [selectedEffect, setSelectedEffect] = useState('glass-skin');
  const [orderId, setOrderId] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load NFT mints
      const { data: mints } = await supabase
        .from('nft_mints')
        .select('*')
        .order('created_at', { ascending: false });
      
      setNftMints((mints || []) as NFTMint[]);

      // Load AR experiences
      const { data: experiences } = await supabase
        .from('ar_experiences')
        .select('*')
        .order('created_at', { ascending: false });
      
      setArExperiences((experiences || []) as ARExperience[]);

      // Load revenue via edge function
      const { data: revenueData } = await supabase.functions.invoke('web3-nft-ar', {
        body: { action: 'get_web3_revenue' }
      });
      
      if (revenueData?.totals) {
        setRevenue(revenueData.totals);
      }
    } catch (error) {
      console.error('Failed to load Web3 data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNFTArt = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('web3-nft-ar', {
        body: {
          action: 'generate_nft_art',
          product_type: selectedProduct,
          order_id: orderId || 'manual-' + Date.now(),
          customer_name: customerEmail || 'Aura Luxe VIP'
        }
      });

      if (error) throw error;
      toast.success(data.message);
      loadData();
    } catch (error) {
      toast.error('Failed to generate NFT art');
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const mintNFT = async (nftId: string) => {
    setMinting(nftId);
    try {
      const { data, error } = await supabase.functions.invoke('web3-nft-ar', {
        body: { action: 'mint_nft', nft_id: nftId }
      });

      if (error) throw error;
      toast.success(data.message);
      loadData();
    } catch (error) {
      toast.error('Failed to mint NFT');
      console.error(error);
    } finally {
      setMinting(null);
    }
  };

  const listNFT = async (nftId: string, price: number) => {
    try {
      const { data, error } = await supabase.functions.invoke('web3-nft-ar', {
        body: { action: 'list_on_marketplace', nft_id: nftId, price }
      });

      if (error) throw error;
      toast.success(data.message);
      loadData();
    } catch (error) {
      toast.error('Failed to list NFT');
      console.error(error);
    }
  };

  const createARExperience = async () => {
    setGenerating(true);
    try {
      const product = PRODUCT_TYPES.find(p => p.value === selectedProduct);
      const { data, error } = await supabase.functions.invoke('web3-nft-ar', {
        body: {
          action: 'create_ar_experience',
          product_name: product?.label || 'Skincare Product',
          effect_type: selectedEffect,
          product_id: selectedProduct
        }
      });

      if (error) throw error;
      toast.success(data.message);
      loadData();
    } catch (error) {
      toast.error('Failed to create AR experience');
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const mintForOrder = async () => {
    if (!orderId) {
      toast.error('Please enter an order ID');
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('web3-nft-ar', {
        body: {
          action: 'mint_for_order',
          order_id: orderId,
          customer_email: customerEmail,
          product_type: selectedProduct
        }
      });

      if (error) throw error;
      toast.success(data.message);
      setOrderId('');
      setCustomerEmail('');
      loadData();
    } catch (error) {
      toast.error('Failed to mint NFT for order');
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const generateARFilter = async () => {
    setGenerating(true);
    try {
      const product = PRODUCT_TYPES.find(p => p.value === selectedProduct);
      const { data, error } = await supabase.functions.invoke('web3-nft-ar', {
        body: {
          action: 'generate_ar_filter',
          product_name: product?.label || 'Skincare Product',
          effect_type: selectedEffect
        }
      });

      if (error) throw error;
      toast.success(data.message);
      loadData();
    } catch (error) {
      toast.error('Failed to generate AR filter');
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'minted': return 'bg-green-500/20 text-green-400';
      case 'listed': return 'bg-blue-500/20 text-blue-400';
      case 'sold': return 'bg-purple-500/20 text-purple-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'active': return 'bg-green-500/20 text-green-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-background to-muted border-primary/20">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-background to-muted border-primary/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <Hexagon className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Web3 Revenue Engine</CardTitle>
              <p className="text-sm text-muted-foreground">NFT Minting • AR Try-On • Blockchain Loyalty</p>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <Wallet className="h-3 w-3 mr-1" />
            Polygon Network
          </Badge>
        </div>

        {/* Revenue Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-purple-400">{revenue?.nft_sales || 0}</div>
            <div className="text-xs text-muted-foreground">NFTs Minted</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-400">${revenue?.nft_revenue?.toFixed(2) || '0.00'}</div>
            <div className="text-xs text-muted-foreground">NFT Revenue</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">${revenue?.nft_royalties?.toFixed(2) || '0.00'}</div>
            <div className="text-xs text-muted-foreground">Royalties</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-pink-400">{revenue?.ar_conversions || 0}</div>
            <div className="text-xs text-muted-foreground">AR Conversions</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-yellow-400">${revenue?.total?.toFixed(2) || '0.00'}</div>
            <div className="text-xs text-muted-foreground">Total Web3 Rev</div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="nft" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="nft">
              <Hexagon className="h-4 w-4 mr-2" />
              NFT Minting
            </TabsTrigger>
            <TabsTrigger value="ar">
              <Camera className="h-4 w-4 mr-2" />
              AR Try-On
            </TabsTrigger>
            <TabsTrigger value="commands">
              <Zap className="h-4 w-4 mr-2" />
              Bot Commands
            </TabsTrigger>
          </TabsList>

          {/* NFT Minting Tab */}
          <TabsContent value="nft" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* NFT Generator */}
              <Card className="bg-muted/30 border-purple-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-purple-400" />
                    Generate NFT Art
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_TYPES.map(product => (
                        <SelectItem key={product.value} value={product.value}>
                          {product.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={generateNFTArt} 
                    disabled={generating}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                    Generate NFT Art
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Mint for Order */}
              <Card className="bg-muted/30 border-green-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-green-400" />
                    Mint for Order
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input 
                    placeholder="Order ID" 
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                  />
                  <Input 
                    placeholder="Customer Email (optional)" 
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />
                  <Button 
                    onClick={mintForOrder} 
                    disabled={generating || !orderId}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  >
                    {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Hexagon className="h-4 w-4 mr-2" />}
                    Mint NFT for Order
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* NFT Gallery */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Minted NFTs ({nftMints.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
                {nftMints.map((nft) => (
                  <motion.div
                    key={nft.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-muted/50 rounded-lg p-3 border border-border/50"
                  >
                    <div className="aspect-square bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-lg mb-2 flex items-center justify-center">
                      <Hexagon className="h-12 w-12 text-purple-400" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">{nft.nft_name}</span>
                        <Badge className={getStatusColor(nft.mint_status)}>{nft.mint_status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{nft.product_name}</p>
                      <div className="flex gap-2 mt-2">
                        {nft.mint_status === 'pending' && (
                          <Button 
                            size="sm" 
                            onClick={() => mintNFT(nft.id)}
                            disabled={minting === nft.id}
                            className="flex-1"
                          >
                            {minting === nft.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Mint'}
                          </Button>
                        )}
                        {nft.mint_status === 'minted' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => listNFT(nft.id, 0.05)}
                            className="flex-1"
                          >
                            List 0.05 ETH
                          </Button>
                        )}
                        {nft.marketplace_url && (
                          <Button size="sm" variant="ghost" asChild>
                            <a href={nft.marketplace_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {nftMints.length === 0 && (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    No NFTs minted yet. Generate your first NFT art above!
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* AR Try-On Tab */}
          <TabsContent value="ar" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* AR Experience Creator */}
              <Card className="bg-muted/30 border-blue-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Camera className="h-4 w-4 text-blue-400" />
                    Create AR Try-On
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_TYPES.map(product => (
                        <SelectItem key={product.value} value={product.value}>
                          {product.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedEffect} onValueChange={setSelectedEffect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select AR effect" />
                    </SelectTrigger>
                    <SelectContent>
                      {AR_EFFECTS.map(effect => (
                        <SelectItem key={effect.value} value={effect.value}>
                          {effect.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={createARExperience} 
                    disabled={generating}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                  >
                    {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                    Create AR Experience
                  </Button>
                </CardContent>
              </Card>

              {/* AR Filter Generator */}
              <Card className="bg-muted/30 border-pink-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-pink-400" />
                    Generate AR Filter
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Create shareable AR filters for social media that showcase product effects.
                  </p>
                  <Button 
                    onClick={generateARFilter} 
                    disabled={generating}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                  >
                    {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <QrCode className="h-4 w-4 mr-2" />}
                    Generate AR Filter
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* AR Experiences List */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Active AR Experiences ({arExperiences.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
                {arExperiences.map((ar) => (
                  <motion.div
                    key={ar.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-muted/50 rounded-lg p-4 border border-border/50"
                  >
                    <div className="flex items-start gap-3">
                      {ar.qr_code_url && (
                        <img 
                          src={ar.qr_code_url} 
                          alt="AR QR Code" 
                          className="w-16 h-16 rounded-lg bg-white p-1"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium truncate">{ar.experience_name}</span>
                          <Badge className={getStatusColor(ar.status)}>{ar.status}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{ar.product_name}</p>
                        <div className="grid grid-cols-3 gap-2 mt-2 text-center">
                          <div>
                            <div className="text-sm font-bold text-blue-400">{ar.total_views}</div>
                            <div className="text-[10px] text-muted-foreground">Views</div>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-green-400">{ar.total_conversions}</div>
                            <div className="text-[10px] text-muted-foreground">Converts</div>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-yellow-400">{ar.conversion_rate?.toFixed(1)}%</div>
                            <div className="text-[10px] text-muted-foreground">CVR</div>
                          </div>
                        </div>
                        {ar.ar_url && (
                          <Button size="sm" variant="outline" className="w-full mt-2" asChild>
                            <a href={ar.ar_url} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-3 w-3 mr-1" />
                              Try AR
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {arExperiences.length === 0 && (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    No AR experiences created yet. Create your first one above!
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Bot Commands Tab */}
          <TabsContent value="commands" className="space-y-4">
            <Card className="bg-muted/30 border-yellow-500/30">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  Available Bot Commands
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <code className="text-green-400 text-sm">"Mint NFT for last order"</code>
                    <p className="text-xs text-muted-foreground mt-1">
                      Creates and mints an NFT for the most recent order, sends to customer wallet.
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <code className="text-blue-400 text-sm">"Generate AR filter for Peptide Serum"</code>
                    <p className="text-xs text-muted-foreground mt-1">
                      Creates an AR try-on filter for the specified product with glass skin effect.
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <code className="text-purple-400 text-sm">"Mint loyalty NFT for VIP customers"</code>
                    <p className="text-xs text-muted-foreground mt-1">
                      Batch mints exclusive loyalty NFTs for top customers.
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <code className="text-pink-400 text-sm">"Create transformation collection"</code>
                    <p className="text-xs text-muted-foreground mt-1">
                      Generates a collection of before/after transformation NFTs.
                    </p>
                  </div>
                </div>

                {/* Quick Test */}
                <div className="border-t border-border pt-3 mt-3">
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">Quick Test: Mint Vitamin C Glow-Up NFT</h4>
                  <Button 
                    onClick={() => {
                      setSelectedProduct('vitamin-c-serum');
                      setOrderId('TEST-' + Date.now());
                      mintForOrder();
                    }}
                    disabled={generating}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                  >
                    {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Hexagon className="h-4 w-4 mr-2" />}
                    Test Mint: Vitamin C Serum Glow-Up NFT
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
