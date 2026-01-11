import { 
  MessageSquare, Target, Globe, Users, DollarSign,
  ShoppingCart, Mail, Phone, Gift, Zap, 
  TrendingUp, BarChart3, Search, Eye, Shield,
  Twitter, Video, Megaphone, Heart, Star,
  Wallet, LineChart, PiggyBank, Calculator, Lock
} from "lucide-react";

export interface Bot {
  id: string;
  name: string;
  description: string;
  specialty: string;
  icon: any;
}

export interface BotTeam {
  name: string;
  description: string;
  color: string;
  bots: Bot[];
}

export const BOT_TEAMS: Record<string, BotTeam> = {
  sales: {
    name: "Sales Bots",
    description: "Grok-driven upsell and closing specialists",
    color: "hsl(142, 76%, 36%)",
    bots: [
      { id: "sales-1", name: "WhatsApp Closer", description: "Closes deals via WhatsApp DMs", specialty: "whatsapp", icon: Phone },
      { id: "sales-2", name: "Instagram DM Assassin", description: "Converts IG DM leads to sales", specialty: "instagram", icon: MessageSquare },
      { id: "sales-3", name: "Email Upseller", description: "Sends targeted upsell sequences", specialty: "email", icon: Mail },
      { id: "sales-4", name: "Cart Recovery Bot", description: "Recovers abandoned carts", specialty: "cart", icon: ShoppingCart },
      { id: "sales-5", name: "Checkout Optimizer", description: "Optimizes checkout flow", specialty: "checkout", icon: Zap },
      { id: "sales-6", name: "Bundle Creator", description: "Creates high-value bundles", specialty: "bundles", icon: Gift },
      { id: "sales-7", name: "Flash Sale Bot", description: "Triggers flash sales", specialty: "flash", icon: Zap },
      { id: "sales-8", name: "VIP Concierge", description: "High-value customer handler", specialty: "vip", icon: Star },
      { id: "sales-9", name: "Cross-Sell Engine", description: "Recommends complementary products", specialty: "cross-sell", icon: TrendingUp },
      { id: "sales-10", name: "Deal Finisher", description: "Closes hesitant buyers", specialty: "closing", icon: Target },
    ],
  },
  ads: {
    name: "Ad Optimization Bots",
    description: "ROAS maximizers and budget allocators",
    color: "hsl(217, 91%, 60%)",
    bots: [
      { id: "ads-1", name: "TikTok Ad Scaler", description: "Scales winning TikTok ads", specialty: "tiktok", icon: Video },
      { id: "ads-2", name: "Google Ads Bidder", description: "Optimizes Google Ads bids", specialty: "google", icon: Target },
      { id: "ads-3", name: "Facebook Budget Bot", description: "Allocates FB ad budget", specialty: "facebook", icon: DollarSign },
      { id: "ads-4", name: "Pinterest Promoter", description: "Promotes pins for max reach", specialty: "pinterest", icon: Eye },
      { id: "ads-5", name: "ROAS Executioner", description: "Kills underperforming ads", specialty: "roas", icon: BarChart3 },
      { id: "ads-6", name: "Creative Tester", description: "A/B tests ad creatives", specialty: "testing", icon: Zap },
      { id: "ads-7", name: "Audience Finder", description: "Discovers high-value audiences", specialty: "audience", icon: Search },
      { id: "ads-8", name: "Retargeting Master", description: "Optimizes retargeting", specialty: "retarget", icon: Users },
      { id: "ads-9", name: "CPA Optimizer", description: "Minimizes cost per acquisition", specialty: "cpa", icon: TrendingUp },
      { id: "ads-10", name: "Budget Guardian", description: "Prevents overspend", specialty: "budget", icon: Shield },
    ],
  },
  domains: {
    name: "Domain Sales Bots",
    description: "Unstoppable domain listing and negotiation",
    color: "hsl(271, 91%, 65%)",
    bots: [
      { id: "domain-1", name: "Vegas Pack Seller", description: "Lists Vegas domain pack", specialty: "vegas", icon: Star },
      { id: "domain-2", name: "NFT Bundle DM Bot", description: "DMs potential NFT buyers", specialty: "nft", icon: MessageSquare },
      { id: "domain-3", name: "OpenSea Lister", description: "Lists domains on OpenSea", specialty: "opensea", icon: Globe },
      { id: "domain-4", name: "Price Negotiator", description: "Negotiates domain prices", specialty: "negotiate", icon: DollarSign },
      { id: "domain-5", name: "Whale Finder", description: "Identifies whale buyers", specialty: "whales", icon: Search },
      { id: "domain-6", name: "X Thread Generator", description: "Creates viral X threads", specialty: "twitter", icon: Twitter },
      { id: "domain-7", name: "Bulk Lister", description: "Bulk lists domains", specialty: "bulk", icon: Zap },
      { id: "domain-8", name: "Portfolio Analyzer", description: "Values domain portfolio", specialty: "analysis", icon: BarChart3 },
      { id: "domain-9", name: "Trend Spotter", description: "Spots trending domains", specialty: "trends", icon: TrendingUp },
      { id: "domain-10", name: "Deal Closer", description: "Closes domain sales", specialty: "closing", icon: Target },
    ],
  },
  engagement: {
    name: "Customer Engagement Bots",
    description: "Real-time social engagement specialists",
    color: "hsl(24, 95%, 53%)",
    bots: [
      { id: "engage-1", name: "TikTok Responder", description: "Responds to TikTok comments", specialty: "tiktok", icon: Video },
      { id: "engage-2", name: "Instagram Engager", description: "Engages with IG stories", specialty: "instagram", icon: Heart },
      { id: "engage-3", name: "YouTube Commenter", description: "Engages YouTube audience", specialty: "youtube", icon: Megaphone },
      { id: "engage-4", name: "X Reply Bot", description: "Replies to X mentions", specialty: "twitter", icon: Twitter },
      { id: "engage-5", name: "LinkedIn Connector", description: "Connects with professionals", specialty: "linkedin", icon: Users },
      { id: "engage-6", name: "Review Responder", description: "Responds to reviews", specialty: "reviews", icon: Star },
      { id: "engage-7", name: "DM Welcome Bot", description: "Welcomes new followers", specialty: "welcome", icon: MessageSquare },
      { id: "engage-8", name: "FAQ Handler", description: "Answers common questions", specialty: "faq", icon: MessageSquare },
      { id: "engage-9", name: "Sentiment Monitor", description: "Monitors brand sentiment", specialty: "sentiment", icon: Eye },
      { id: "engage-10", name: "Viral Amplifier", description: "Amplifies viral content", specialty: "viral", icon: Zap },
    ],
  },
  revenue: {
    name: "Revenue Scaling Bots",
    description: "Revenue tracking and optimization",
    color: "hsl(48, 96%, 53%)",
    bots: [
      { id: "revenue-1", name: "Stripe Optimizer", description: "Optimizes Stripe payouts", specialty: "stripe", icon: Wallet },
      { id: "revenue-2", name: "Shopify Sync Bot", description: "Syncs Shopify data", specialty: "shopify", icon: ShoppingCart },
      { id: "revenue-3", name: "Revenue Forecaster", description: "Forecasts revenue", specialty: "forecast", icon: LineChart },
      { id: "revenue-4", name: "Margin Analyzer", description: "Analyzes profit margins", specialty: "margins", icon: BarChart3 },
      { id: "revenue-5", name: "Cash Flow Bot", description: "Monitors cash flow", specialty: "cashflow", icon: DollarSign },
      { id: "revenue-6", name: "Tax Optimizer", description: "Optimizes for taxes", specialty: "tax", icon: Calculator },
      { id: "revenue-7", name: "LTV Calculator", description: "Calculates customer LTV", specialty: "ltv", icon: TrendingUp },
      { id: "revenue-8", name: "Churn Predictor", description: "Predicts customer churn", specialty: "churn", icon: Eye },
      { id: "revenue-9", name: "Pricing Bot", description: "Dynamic pricing engine", specialty: "pricing", icon: PiggyBank },
      { id: "revenue-10", name: "Revenue Guardian", description: "Protects revenue streams", specialty: "protection", icon: Lock },
    ],
  },
};

export const TEAM_ORDER = ["sales", "ads", "domains", "engagement", "revenue"];

export function getAllBots(): Bot[] {
  return TEAM_ORDER.flatMap(team => BOT_TEAMS[team].bots);
}

export function getTotalBots(): number {
  return 50;
}
