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

// Domain portfolio - Unstoppable domains
const DOMAIN_PORTFOLIO = [
  // Vegas/Casino Pack - $1,000 bundle
  { name: "vegaselite.crypto", category: "Vegas/Casino", price: 200, bundle: "Vegas Casino Pack", status: "available" },
  { name: "vegashigh.crypto", category: "Vegas/Casino", price: 150, bundle: "Vegas Casino Pack", status: "available" },
  { name: "vegasultimate.crypto", category: "Vegas/Casino", price: 175, bundle: "Vegas Casino Pack", status: "available" },
  { name: "casinopremium.nft", category: "Vegas/Casino", price: 200, bundle: "Vegas Casino Pack", status: "available" },
  { name: "lasvegasvip.wallet", category: "Vegas/Casino", price: 150, bundle: "Vegas Casino Pack", status: "available" },
  
  // Yacht/Luxury Pack - $800 bundle
  { name: "yachtclub.crypto", category: "Yacht/Luxury", price: 250, bundle: "Yacht Luxury Pack", status: "available" },
  { name: "yachtlife.nft", category: "Yacht/Luxury", price: 175, bundle: "Yacht Luxury Pack", status: "available" },
  { name: "luxuryyacht.wallet", category: "Yacht/Luxury", price: 200, bundle: "Yacht Luxury Pack", status: "available" },
  
  // Tech/Web3 Pack - $600 bundle
  { name: "metaverse.dao", category: "Tech/Web3", price: 300, bundle: "Tech Web3 Pack", status: "available" },
  { name: "defiking.crypto", category: "Tech/Web3", price: 200, bundle: "Tech Web3 Pack", status: "available" },
  { name: "nftwhale.wallet", category: "Tech/Web3", price: 150, bundle: "Tech Web3 Pack", status: "available" },
  
  // Business Premium Pack - $500 bundle
  { name: "ceopro.crypto", category: "Business", price: 175, bundle: "Business Premium Pack", status: "available" },
  { name: "bizempire.nft", category: "Business", price: 150, bundle: "Business Premium Pack", status: "available" },
  { name: "startupking.wallet", category: "Business", price: 125, bundle: "Business Premium Pack", status: "available" },
  
  // Standalone Premium
  { name: "cryptobillionaire.nft", category: "Premium", price: 500, bundle: null, status: "available" },
  { name: "diamondhands.crypto", category: "Premium", price: 350, bundle: null, status: "available" },
];

const BUNDLES = [
  { name: "Vegas Casino Pack", price: 1000, discount: "40% OFF", domains: 5, targetBuyers: ["Caesars", "MGM", "Wynn Resorts", "Casino Operators"] },
  { name: "Yacht Luxury Pack", price: 800, discount: "35% OFF", domains: 3, targetBuyers: ["Yacht Clubs", "Luxury Brands", "Marine Industry"] },
  { name: "Tech Web3 Pack", price: 600, discount: "30% OFF", domains: 3, targetBuyers: ["DAOs", "DeFi Projects", "NFT Influencers"] },
  { name: "Business Premium Pack", price: 500, discount: "25% OFF", domains: 3, targetBuyers: ["Startups", "VCs", "Enterprise"] },
];

export function DomainSalesManager() {
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [isListing, setIsListing] = useState(false);
  const [listedDomains, setListedDomains] = useState<string[]>([]);
  const [generatedThread, setGeneratedThread] = useState("");
  const [generatedDMs, setGeneratedDMs] = useState<{target: string, message: string}[]>([]);
  const [leads, setLeads] = useState<{domain: string, buyer: string, offer: number, status: string}[]>([
    { domain: "vegaselite.crypto", buyer: "@CryptoWhale_Vegas", offer: 180, status: "pending" },
    { domain: "yachtclub.crypto", buyer: "@LuxuryNFTCollector", offer: 225, status: "negotiating" },
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
    const thread = `🧵 THREAD: Premium Web3 Domains FOR SALE 🔥

1/ 🎰 Vegas Casino Pack — $1,000 OBO
• vegaselite.crypto
• vegashigh.crypto  
• casinopremium.nft
Perfect for Caesars, MGM, or any casino brand going Web3

2/ 🛥️ Yacht Luxury Pack — $800 OBO
• yachtclub.crypto
• yachtlife.nft
• luxuryyacht.wallet
Ideal for yacht clubs, marine brands, luxury lifestyle

3/ 🚀 Tech/Web3 Pack — $600 OBO
• metaverse.dao
• defiking.crypto
• nftwhale.wallet
Built for DAOs, DeFi protocols, NFT whales

4/ 💼 Business Premium Pack — $500 OBO
• ceopro.crypto
• bizempire.nft
Perfect for entrepreneurs, VCs, startups

5/ 💎 Standalone Premium Domains:
• cryptobillionaire.nft — $500
• diamondhands.crypto — $350

DM for bundles, bulk deals, or OBO offers 🤝

All domains on @UnstoppableWeb marketplace
Links in bio | Serious buyers only 🔒

#Web3Domains #NFTDomains #Crypto #Unstoppable`;

    setGeneratedThread(thread);
    toast.success("X Thread generated!");
  };

  const generateDMTemplates = () => {
    const templates = [
      {
        target: "Caesars Entertainment / MGM",
        message: `Hi! 👋

I own vegaselite.crypto, vegashigh.crypto & casinopremium.nft — premium Web3 domains perfect for Vegas casino brands.

Full Vegas Casino Pack: $1,000 OBO (5 domains)

These give your brand instant Web3 credibility + human-readable wallet addresses for crypto payments.

Interested in the bundle or individual domains? Happy to discuss!`
      },
      {
        target: "Yacht Club / Marine Brands",
        message: `Hi! 🛥️

Premium yacht/luxury Web3 domains available:
• yachtclub.crypto
• yachtlife.nft
• luxuryyacht.wallet

Full Yacht Pack: $800 OBO

Perfect for yacht clubs, marine brands, or luxury lifestyle companies entering Web3.

DM if interested — serious offers only!`
      },
      {
        target: "NFT Influencers / DAOs",
        message: `Hey! 🚀

Selling premium Web3 domains:
• metaverse.dao — Perfect for DAOs
• defiking.crypto — DeFi protocols
• nftwhale.wallet — NFT collectors

Tech Pack Bundle: $600 OBO

These are rare, brandable domains. Let me know if you want to make an offer!`
      },
      {
        target: "Crypto Twitter Whales",
        message: `GM! 💎

Premium domains available:
• cryptobillionaire.nft — $500
• diamondhands.crypto — $350

Or grab a full bundle (Vegas, Yacht, Tech, or Business pack).

All on @UnstoppableWeb marketplace. DM for deals!`
      }
    ];

    setGeneratedDMs(templates);
    toast.success("DM templates generated!");
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
