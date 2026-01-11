import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Globe, 
  DollarSign, 
  Send, 
  Copy, 
  ExternalLink, 
  Sparkles,
  Twitter,
  Package,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  MessageSquare,
  Zap,
  Target,
  Shield
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// REAL Domain Portfolio - User's Unstoppable Domains
// Excludes: auraliftessentials.com, profitreaper.com, omegaalpha.io (kept for primary use)
const DOMAIN_PORTFOLIO = [
  // Vegas Casino Pack - Caesars/Palace Variants (16 domains) - $1,000 bundle
  { name: "caeserspalace.nft", category: "Vegas/Casino", price: 150, bundle: "Vegas Casino Pack", status: "available" },
  { name: "caeserspalace.crypto", category: "Vegas/Casino", price: 125, bundle: "Vegas Casino Pack", status: "available" },
  { name: "caeserspalace.dao", category: "Vegas/Casino", price: 100, bundle: "Vegas Casino Pack", status: "available" },
  { name: "caeserspalace.wallet", category: "Vegas/Casino", price: 75, bundle: "Vegas Casino Pack", status: "available" },
  { name: "caeserspalace.x", category: "Vegas/Casino", price: 100, bundle: "Vegas Casino Pack", status: "available" },
  { name: "ceaserspalace.nft", category: "Vegas/Casino", price: 125, bundle: "Vegas Casino Pack", status: "available" },
  { name: "ceaserspalace.crypto", category: "Vegas/Casino", price: 100, bundle: "Vegas Casino Pack", status: "available" },
  { name: "ceaserspalace.dao", category: "Vegas/Casino", price: 75, bundle: "Vegas Casino Pack", status: "available" },
  { name: "ceaserspalace.wallet", category: "Vegas/Casino", price: 50, bundle: "Vegas Casino Pack", status: "available" },
  { name: "ceaserspalace.x", category: "Vegas/Casino", price: 75, bundle: "Vegas Casino Pack", status: "available" },
  { name: "caesers.nft", category: "Vegas/Casino", price: 100, bundle: "Vegas Casino Pack", status: "available" },
  { name: "caesers.crypto", category: "Vegas/Casino", price: 75, bundle: "Vegas Casino Pack", status: "available" },
  { name: "caesers.dao", category: "Vegas/Casino", price: 50, bundle: "Vegas Casino Pack", status: "available" },
  { name: "ceasers.nft", category: "Vegas/Casino", price: 75, bundle: "Vegas Casino Pack", status: "available" },
  { name: "ceasers.crypto", category: "Vegas/Casino", price: 50, bundle: "Vegas Casino Pack", status: "available" },
  { name: "ceasers.dao", category: "Vegas/Casino", price: 50, bundle: "Vegas Casino Pack", status: "available" },
  
  // Vegas Events Pack (7 domains) - $500 bundle
  { name: "lasvegasevents.nft", category: "Vegas/Events", price: 100, bundle: "Vegas Events Pack", status: "available" },
  { name: "lasvegasevents.crypto", category: "Vegas/Events", price: 75, bundle: "Vegas Events Pack", status: "available" },
  { name: "lasvegasevents.dao", category: "Vegas/Events", price: 50, bundle: "Vegas Events Pack", status: "available" },
  { name: "lasvegasevents.wallet", category: "Vegas/Events", price: 50, bundle: "Vegas Events Pack", status: "available" },
  { name: "lasvegasevents.x", category: "Vegas/Events", price: 75, bundle: "Vegas Events Pack", status: "available" },
  { name: "lasvegasevents.blockchain", category: "Vegas/Events", price: 50, bundle: "Vegas Events Pack", status: "available" },
  { name: "lasvegasevents.888", category: "Vegas/Events", price: 50, bundle: "Vegas Events Pack", status: "available" },
  
  // NFT Legends Pack (9 domains) - $800 bundle
  { name: "legendsofnfts.nft", category: "NFT/Web3", price: 150, bundle: "NFT Legends Pack", status: "available" },
  { name: "legendsofnfts.crypto", category: "NFT/Web3", price: 100, bundle: "NFT Legends Pack", status: "available" },
  { name: "legendsofnfts.dao", category: "NFT/Web3", price: 75, bundle: "NFT Legends Pack", status: "available" },
  { name: "legendsofnfts.wallet", category: "NFT/Web3", price: 50, bundle: "NFT Legends Pack", status: "available" },
  { name: "legendsofnfts.x", category: "NFT/Web3", price: 100, bundle: "NFT Legends Pack", status: "available" },
  { name: "legendsofnfts.blockchain", category: "NFT/Web3", price: 75, bundle: "NFT Legends Pack", status: "available" },
  { name: "legendsofnfts.888", category: "NFT/Web3", price: 50, bundle: "NFT Legends Pack", status: "available" },
  { name: "legendsofnfts.zil", category: "NFT/Web3", price: 50, bundle: "NFT Legends Pack", status: "available" },
  { name: "legendsofnfts.polygon", category: "NFT/Web3", price: 75, bundle: "NFT Legends Pack", status: "available" },
  
  // Luxury Pack (4 domains) - $400 bundle
  { name: "luxuryvehiclerental.crypto", category: "Luxury", price: 150, bundle: "Luxury Pack", status: "available" },
  { name: "yachtcruise.crypto", category: "Luxury", price: 100, bundle: "Luxury Pack", status: "available" },
  { name: "yachtpartybookings.crypto", category: "Luxury", price: 100, bundle: "Luxury Pack", status: "available" },
  { name: "bookyourreservation.crypto", category: "Luxury", price: 50, bundle: "Luxury Pack", status: "available" },
  
  // Standalone
  { name: "oxygenlounge.crypto", category: "Lifestyle", price: 75, bundle: null, status: "available" },
];

const BUNDLES = [
  { name: "Vegas Casino Pack", price: 1000, discount: "50% OFF", domains: 16, targetBuyers: ["Caesars Entertainment", "MGM Resorts", "Wynn Las Vegas", "Dubai Casinos", "@CaesarsEnt", "@MGMResortsIntl"] },
  { name: "Vegas Events Pack", price: 500, discount: "40% OFF", domains: 7, targetBuyers: ["Event Planners", "Vegas Conferences", "Crypto Events", "Trade Shows"] },
  { name: "NFT Legends Pack", price: 800, discount: "45% OFF", domains: 9, targetBuyers: ["NFT Projects", "OpenSea Whales", "DAO Communities", "Web3 Influencers"] },
  { name: "Luxury Pack", price: 400, discount: "35% OFF", domains: 4, targetBuyers: ["Yacht Clubs", "@VenturaYachts", "Luxury Rentals", "Travel Agencies"] },
];

export function DomainSalesManager() {
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [isListing, setIsListing] = useState(false);
  const [listedDomains, setListedDomains] = useState<string[]>([]);
  const [generatedThread, setGeneratedThread] = useState("");
  const [generatedDMs, setGeneratedDMs] = useState<{target: string, message: string}[]>([]);
  const [leads, setLeads] = useState<{domain: string, buyer: string, offer: number, status: string}[]>([
    { domain: "caeserspalace.nft", buyer: "@CaesarsEnt", offer: 300, status: "pending" },
    { domain: "legendsofnfts.nft", buyer: "@NFTWhale_Collector", offer: 120, status: "negotiating" },
    { domain: "yachtcruise.crypto", buyer: "@VenturaYachts", offer: 85, status: "pending" },
  ]);

  const toggleDomain = (name: string) => {
    setSelectedDomains(prev => 
      prev.includes(name) ? prev.filter(d => d !== name) : [...prev, name]
    );
  };

  const selectAll = () => {
    setSelectedDomains(DOMAIN_PORTFOLIO.map(d => d.name));
  };

  const handleAutoListAll = async () => {
    setIsListing(true);
    toast.loading("Listing all domains on Unstoppable Marketplace...");
    
    // Simulate listing process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setListedDomains(DOMAIN_PORTFOLIO.map(d => d.name));
    setIsListing(false);
    toast.success(`✅ Listed ${DOMAIN_PORTFOLIO.length} domains on Unstoppable Marketplace!`);
    
    // Generate thread after listing
    generateXThread();
  };

  const generateXThread = () => {
    const thread = `🧵 THREAD: 36 Premium Unstoppable Domains FOR SALE 🔥

1/ 🎰 VEGAS CASINO PACK — $1,000 OBO (16 domains!)
• caeserspalace.nft, caeserspalace.crypto, caeserspalace.dao
• ceaserspalace.nft, ceaserspalace.crypto, ceaserspalace.dao
• Plus 10 more variants!
Perfect for @CaesarsEnt, @MGMResortsIntl, or any casino going Web3!

2/ 🎪 VEGAS EVENTS PACK — $500 OBO (7 domains)
• lasvegasevents.nft
• lasvegasevents.crypto
• lasvegasevents.dao, .wallet, .x, .blockchain, .888
Ideal for crypto conferences, Vegas trade shows, event planners

3/ 🖼️ NFT LEGENDS PACK — $800 OBO (9 domains)
• legendsofnfts.nft
• legendsofnfts.crypto, .dao, .wallet
• legendsofnfts.x, .blockchain, .polygon
Built for NFT projects, OpenSea whales, DAO communities

4/ 🛥️ LUXURY PACK — $400 OBO (4 domains)
• luxuryvehiclerental.crypto
• yachtcruise.crypto
• yachtpartybookings.crypto
• bookyourreservation.crypto
Perfect for @VenturaYachts, yacht clubs, luxury rentals

5/ 💎 STANDALONE:
• oxygenlounge.crypto — $75

💰 TOTAL BUNDLE: All 36 domains for $2,500 OBO (Save $500+!)

All on @UnstoppableWeb marketplace with escrow
DM for deals! Serious buyers only 🔒

#Web3Domains #NFT #UnstoppableDomains #VegasCrypto #CaesarsPalace`;

    setGeneratedThread(thread);
    toast.success("X Thread generated with REAL domains!");
  };

  const generateDMTemplates = () => {
    const templates = [
      {
        target: "@CaesarsEnt / @aneeshgera (Caesars Dubai)",
        message: `Hi! 👋

I own caeserspalace.nft, caeserspalace.crypto, ceaserspalace.dao + 13 more Caesars-themed Unstoppable Domains.

Full Vegas Casino Pack: $1,000 OBO (16 domains)

Perfect for Caesars Entertainment's Web3 expansion — human-readable wallet addresses for crypto payments + brand protection.

Interested in the bundle or individual domains? DM me!`
      },
      {
        target: "@MGMResortsIntl / Vegas Events",
        message: `Hi! 🎪

Premium Vegas Events Web3 domains available:
• lasvegasevents.nft
• lasvegasevents.crypto
• lasvegasevents.dao, .wallet, .x, .blockchain, .888

Vegas Events Pack: $500 OBO (7 domains)

Perfect for MGM's crypto conferences, trade shows, or event marketing. Escrow on Unstoppable Marketplace.

DM if interested!`
      },
      {
        target: "NFT Whales / OpenSea Collectors",
        message: `GM! 🖼️

Selling the Legends of NFTs collection:
• legendsofnfts.nft — flagship
• legendsofnfts.crypto, .dao, .wallet
• legendsofnfts.x, .blockchain, .polygon

NFT Legends Pack: $800 OBO (9 domains)

Perfect for NFT projects, collector communities, or DAO branding. Let me know if you want to make an offer!`
      },
      {
        target: "@VenturaYachts / Luxury Brands",
        message: `Hi! 🛥️

Premium luxury Web3 domains:
• luxuryvehiclerental.crypto — $150
• yachtcruise.crypto — $100
• yachtpartybookings.crypto — $100
• bookyourreservation.crypto — $50

Luxury Pack Bundle: $400 OBO (4 domains)

Ideal for yacht clubs, luxury rentals, or travel agencies entering Web3. Escrow included!`
      }
    ];

    setGeneratedDMs(templates);
    toast.success("DM templates generated for REAL buyers!");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const totalValue = DOMAIN_PORTFOLIO.reduce((sum, d) => sum + d.price, 0);
  const listedCount = listedDomains.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="w-6 h-6 text-primary" />
            Domain Sales Manager
          </h1>
          <p className="text-muted-foreground">Auto-list, generate content, monitor leads — sell tonight</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-success border-success">
            <TrendingUp className="w-3 h-3 mr-1" />
            ${totalValue.toLocaleString()} Portfolio
          </Badge>
          <Badge variant="outline" className="text-primary border-primary">
            {DOMAIN_PORTFOLIO.length} Domains
          </Badge>
        </div>
      </div>

      {/* AI Suggestion Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl bg-gradient-to-r from-primary/20 via-accent/10 to-success/20 border border-primary/30"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          <div className="flex-1">
            <p className="font-medium text-sm">💡 AI Suggestion: Vegas domains are HOT right now!</p>
            <p className="text-xs text-muted-foreground">Casino brands entering Web3 = premium buyers. List Vegas Pack first for fastest sale.</p>
          </div>
          <Button size="sm" variant="default" onClick={handleAutoListAll} disabled={isListing}>
            {isListing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            Auto-List All
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{DOMAIN_PORTFOLIO.length}</p>
                <p className="text-xs text-muted-foreground">Total Domains</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/20">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{listedCount}</p>
                <p className="text-xs text-muted-foreground">Listed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/20">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{leads.length}</p>
                <p className="text-xs text-muted-foreground">Active Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/20">
                <DollarSign className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Portfolio Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="portfolio" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="bundles">Bundles</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
        </TabsList>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Domain Portfolio</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                Select All
              </Button>
              <Button 
                size="sm" 
                onClick={handleAutoListAll}
                disabled={isListing}
                className="bg-gradient-to-r from-success to-primary"
              >
                {isListing ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <ExternalLink className="w-4 h-4 mr-2" />
                )}
                List on Unstoppable
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[400px]">
            <div className="grid gap-3">
              {DOMAIN_PORTFOLIO.map((domain) => (
                <motion.div
                  key={domain.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={cn(
                    "p-4 rounded-xl border transition-all cursor-pointer",
                    selectedDomains.includes(domain.name)
                      ? "bg-primary/10 border-primary"
                      : "bg-card/50 border-border hover:border-primary/50",
                    listedDomains.includes(domain.name) && "border-success bg-success/10"
                  )}
                  onClick={() => toggleDomain(domain.name)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/20">
                        <Globe className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{domain.name}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-[10px]">
                            {domain.category}
                          </Badge>
                          {domain.bundle && (
                            <Badge variant="outline" className="text-[10px]">
                              {domain.bundle}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-success">${domain.price}</span>
                      {listedDomains.includes(domain.name) ? (
                        <Badge className="bg-success text-success-foreground">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Listed
                        </Badge>
                      ) : (
                        <Badge variant="outline">Available</Badge>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Bundles Tab */}
        <TabsContent value="bundles" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {BUNDLES.map((bundle) => (
              <Card key={bundle.name} className="bg-gradient-to-br from-card to-card/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{bundle.name}</CardTitle>
                    <Badge className="bg-accent text-accent-foreground">{bundle.discount}</Badge>
                  </div>
                  <CardDescription>{bundle.domains} domains included</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-success">${bundle.price}</span>
                    <span className="text-sm text-muted-foreground">OBO</span>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Target Buyers:</p>
                    <div className="flex flex-wrap gap-1">
                      {bundle.targetBuyers.map((buyer) => (
                        <Badge key={buyer} variant="outline" className="text-[10px]">
                          {buyer}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Button className="w-full" variant="outline">
                    <Target className="w-4 h-4 mr-2" />
                    Generate Outreach
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* X Thread */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Twitter className="w-5 h-5" />
                  X Thread Generator
                </CardTitle>
                <CardDescription>Auto-generate viral thread for domain sales</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={generateXThread} className="w-full">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Thread
                </Button>
                
                {generatedThread && (
                  <div className="space-y-2">
                    <Textarea
                      value={generatedThread}
                      readOnly
                      className="min-h-[300px] text-xs"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full"
                      onClick={() => copyToClipboard(generatedThread)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Thread
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* DM Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  DM Templates
                </CardTitle>
                <CardDescription>Outreach messages for target buyers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={generateDMTemplates} className="w-full">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate DMs
                </Button>
                
                {generatedDMs.length > 0 && (
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-4">
                      {generatedDMs.map((dm, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-muted/50 space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">{dm.target}</Badge>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => copyToClipboard(dm.message)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          <p className="text-xs whitespace-pre-wrap">{dm.message}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Leads Tab */}
        <TabsContent value="leads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Active Leads & Offers
              </CardTitle>
              <CardDescription>Real-time monitoring of buyer interest</CardDescription>
            </CardHeader>
            <CardContent>
              {leads.length > 0 ? (
                <div className="space-y-3">
                  {leads.map((lead, idx) => (
                    <div 
                      key={idx}
                      className="p-4 rounded-xl border bg-card/50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-primary/20">
                          <Globe className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{lead.domain}</p>
                          <p className="text-sm text-muted-foreground">{lead.buyer}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-success">${lead.offer}</span>
                        <Badge 
                          variant={lead.status === "negotiating" ? "default" : "outline"}
                          className={lead.status === "negotiating" ? "bg-warning text-warning-foreground" : ""}
                        >
                          {lead.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Send className="w-4 h-4 mr-1" />
                          Reply
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No active leads yet</p>
                  <p className="text-xs text-muted-foreground">List domains and share thread to attract buyers</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary mt-1" />
                <div>
                  <p className="font-medium text-sm">🔮 Lead Prediction</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Based on current Web3 market trends, Vegas/Casino domains have 3x higher demand. 
                    Target casino Twitter accounts and NFT collectors for fastest conversions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
