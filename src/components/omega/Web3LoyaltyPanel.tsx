/**
 * WEB3 LOYALTY PANEL
 * 
 * Blockchain-powered loyalty and engagement:
 * - NFT loyalty programs
 * - Crypto payments integration
 * - Immutable audit trails
 * - Token-gated rewards
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  Coins, Wallet, Link2, Shield, Gift, 
  Sparkles, Award, Lock, Unlock, ExternalLink,
  QrCode, Key, Gem, Hexagon
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NFTTier {
  name: string;
  image: string;
  benefits: string[];
  holders: number;
  threshold: number;
}

export const Web3LoyaltyPanel = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [cryptoPayments, setCryptoPayments] = useState(true);
  const [nftMinting, setNftMinting] = useState(false);
  
  const [nftTiers] = useState<NFTTier[]>([
    { 
      name: 'Bronze Member', 
      image: '🥉', 
      benefits: ['5% discount on all orders', 'Early access to sales'],
      holders: 1247,
      threshold: 100
    },
    { 
      name: 'Silver Elite', 
      image: '🥈', 
      benefits: ['10% discount', 'Free shipping', 'Priority support'],
      holders: 428,
      threshold: 500
    },
    { 
      name: 'Gold VIP', 
      image: '🥇', 
      benefits: ['15% discount', 'Exclusive products', 'VIP events'],
      holders: 89,
      threshold: 1000
    },
    { 
      name: 'Diamond Founder', 
      image: '💎', 
      benefits: ['20% discount', 'All benefits', 'Revenue share'],
      holders: 12,
      threshold: 5000
    },
  ]);

  const [auditTrail] = useState([
    { action: 'NFT Minted', hash: '0x1a2b...3c4d', time: '2 hours ago', type: 'mint' },
    { action: 'Reward Claimed', hash: '0x5e6f...7g8h', time: '5 hours ago', type: 'claim' },
    { action: 'Loyalty Points Added', hash: '0x9i0j...1k2l', time: '1 day ago', type: 'points' },
    { action: 'Tier Upgrade', hash: '0x3m4n...5o6p', time: '2 days ago', type: 'upgrade' },
  ]);

  const connectWallet = async () => {
    toast.info('🔗 Connecting wallet...');
    // Simulate wallet connection
    await new Promise(resolve => setTimeout(resolve, 1500));
    setWalletConnected(true);
    setWalletAddress('0x742d...1a3b');
    toast.success('✨ Wallet connected successfully!');
  };

  const disconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress('');
    toast.info('Wallet disconnected');
  };

  const mintNFT = async (tier: string) => {
    setNftMinting(true);
    toast.info(`🎨 Minting ${tier} NFT...`);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setNftMinting(false);
    toast.success(`🎉 ${tier} NFT minted successfully!`);
  };

  return (
    <div className="space-y-6">
      {/* Wallet Connection */}
      <Card className="bg-gradient-to-br from-purple-500/10 via-violet-500/5 to-transparent border-purple-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg shadow-purple-500/30">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <div>
              <span>Web3 Wallet</span>
              <CardDescription className="mt-1">
                Connect your wallet for blockchain loyalty
              </CardDescription>
            </div>
            <Badge 
              variant="outline" 
              className={cn(
                "ml-auto",
                walletConnected 
                  ? "bg-green-500/10 text-green-500 border-green-500/30" 
                  : "bg-gray-500/10 text-gray-500 border-gray-500/30"
              )}
            >
              {walletConnected ? 'Connected' : 'Not Connected'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {walletConnected ? (
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-full">
                  <Key className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="font-mono text-sm">{walletAddress}</p>
                  <p className="text-xs text-muted-foreground">MetaMask</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={disconnectWallet}>
                <Unlock className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            </div>
          ) : (
            <Button 
              onClick={connectWallet}
              className="w-full bg-gradient-to-r from-purple-600 to-violet-600"
            >
              <Wallet className="h-4 w-4 mr-2" />
              Connect Wallet
            </Button>
          )}
          
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Switch checked={cryptoPayments} onCheckedChange={setCryptoPayments} />
              <span className="text-sm">Accept Crypto Payments</span>
            </div>
            <Badge variant="outline" className="text-xs">
              <Coins className="h-3 w-3 mr-1" />
              ETH, USDC, USDT
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* NFT Loyalty Tiers */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Gem className="h-5 w-5 text-pink-500" />
            NFT Loyalty Tiers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {nftTiers.map((tier) => (
              <motion.div
                key={tier.name}
                whileHover={{ scale: 1.02, y: -5 }}
                className="p-4 rounded-xl bg-gradient-to-br from-muted to-muted/50 border border-muted hover:border-purple-500/30 transition-all"
              >
                <div className="text-center mb-3">
                  <span className="text-4xl">{tier.image}</span>
                  <p className="font-semibold mt-2">{tier.name}</p>
                  <p className="text-xs text-muted-foreground">{tier.holders} holders</p>
                </div>
                
                <div className="space-y-2 mb-4">
                  {tier.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <Gift className="h-3 w-3 text-purple-500" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
                
                <div className="text-center mb-3">
                  <p className="text-xs text-muted-foreground">Threshold</p>
                  <p className="font-bold">${tier.threshold.toLocaleString()}</p>
                </div>
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => mintNFT(tier.name)}
                  disabled={!walletConnected || nftMinting}
                >
                  {nftMinting ? (
                    <Sparkles className="h-3 w-3 animate-pulse" />
                  ) : (
                    <>
                      <Award className="h-3 w-3 mr-1" />
                      Mint NFT
                    </>
                  )}
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Immutable Audit Trail */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            Blockchain Audit Trail
            <Badge variant="outline" className="ml-auto text-xs">
              <Lock className="h-3 w-3 mr-1" />
              Immutable
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {auditTrail.map((entry, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-full",
                    entry.type === 'mint' && "bg-purple-500/20",
                    entry.type === 'claim' && "bg-green-500/20",
                    entry.type === 'points' && "bg-blue-500/20",
                    entry.type === 'upgrade' && "bg-yellow-500/20"
                  )}>
                    <Hexagon className={cn(
                      "h-4 w-4",
                      entry.type === 'mint' && "text-purple-500",
                      entry.type === 'claim' && "text-green-500",
                      entry.type === 'points' && "text-blue-500",
                      entry.type === 'upgrade' && "text-yellow-500"
                    )} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{entry.action}</p>
                    <p className="font-mono text-xs text-muted-foreground">{entry.hash}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{entry.time}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Token Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
          <CardContent className="p-4 text-center">
            <Coins className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">12,450</p>
            <p className="text-sm text-muted-foreground">Loyalty Tokens</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-pink-500/10 to-transparent border-pink-500/20">
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 text-pink-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">1,776</p>
            <p className="text-sm text-muted-foreground">NFTs Minted</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
          <CardContent className="p-4 text-center">
            <Gift className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">$47.2K</p>
            <p className="text-sm text-muted-foreground">Rewards Claimed</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Web3LoyaltyPanel;
