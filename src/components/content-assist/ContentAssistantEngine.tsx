/**
 * CONTENT ASSISTANT ENGINE
 * 
 * AI-powered content generation for products:
 * - Product descriptions & highlights
 * - SEO metadata (titles, descriptions, keywords)
 * - Promotional content
 * - Campaign-ready assets
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  FileText,
  Search,
  Megaphone,
  Image,
  RefreshCw,
  Copy,
  Check,
  Wand2,
  Loader2,
  Tag,
  Target,
  TrendingUp,
  Zap,
  ChevronDown,
  Eye
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface GeneratedContent {
  type: 'description' | 'seo' | 'promotional' | 'social';
  title: string;
  content: string;
  metadata?: Record<string, string>;
}

interface ContentAssistantEngineProps {
  productTitle?: string;
  productDescription?: string;
  productCategory?: string;
  onContentGenerated?: (content: GeneratedContent) => void;
  className?: string;
}

const CONTENT_TYPES = [
  {
    id: 'description',
    title: 'Product Description',
    description: 'Compelling product copy',
    icon: FileText,
    color: 'text-blue-500'
  },
  {
    id: 'seo',
    title: 'SEO Metadata',
    description: 'Titles, meta, keywords',
    icon: Search,
    color: 'text-green-500'
  },
  {
    id: 'promotional',
    title: 'Promotional Copy',
    description: 'Ads, email, campaigns',
    icon: Megaphone,
    color: 'text-orange-500'
  },
  {
    id: 'social',
    title: 'Social Media',
    description: 'Posts, captions, hashtags',
    icon: Image,
    color: 'text-pink-500'
  }
];

// AI content generation templates
const generateDescription = (title: string, category: string): string => {
  const descriptions = [
    `Discover the ${title} - engineered for excellence and designed for those who demand the best. This premium ${category.toLowerCase()} combines cutting-edge technology with refined aesthetics, delivering an unmatched experience every time.`,
    `Introducing the ${title}: where innovation meets sophistication. Crafted with meticulous attention to detail, this ${category.toLowerCase()} represents the pinnacle of quality and performance.`,
    `Elevate your experience with the ${title}. Thoughtfully designed and expertly crafted, this exceptional ${category.toLowerCase()} delivers outstanding results that exceed expectations.`
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
};

const generateSEO = (title: string, category: string) => ({
  metaTitle: `${title} - Premium ${category} | Fast Shipping`,
  metaDescription: `Shop the ${title}. High-quality ${category.toLowerCase()} with exceptional performance. Free shipping on orders over $50. Satisfaction guaranteed.`,
  keywords: `${title.toLowerCase()}, ${category.toLowerCase()}, premium ${category.toLowerCase()}, best ${category.toLowerCase()}, buy ${title.toLowerCase()}`
});

const generatePromo = (title: string, category: string): string => {
  return `🔥 LIMITED TIME OFFER 🔥\n\nGet the ${title} at an exclusive price!\n\n✓ Premium quality ${category.toLowerCase()}\n✓ Fast, free shipping\n✓ 30-day money-back guarantee\n\nDon't miss out - Shop now and save!`;
};

const generateSocial = (title: string, category: string) => ({
  caption: `Just dropped: ${title} 🚀\n\nThe ${category.toLowerCase()} you've been waiting for. Link in bio to shop!`,
  hashtags: `#${title.replace(/\s+/g, '')} #${category} #NewArrival #ShopNow #Premium${category} #Trending`
});

export function ContentAssistantEngine({
  productTitle = '',
  productDescription = '',
  productCategory = 'Product',
  onContentGenerated,
  className
}: ContentAssistantEngineProps) {
  const [activeTab, setActiveTab] = useState('description');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<Record<string, GeneratedContent | null>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [title, setTitle] = useState(productTitle);
  const [category, setCategory] = useState(productCategory);
  const [expandedSections, setExpandedSections] = useState<string[]>(['all']);

  const handleGenerate = useCallback(async (type: string) => {
    if (!title.trim()) {
      toast.error('Please enter a product title');
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI processing
    await new Promise(r => setTimeout(r, 1500));

    let content: GeneratedContent;

    switch (type) {
      case 'description':
        content = {
          type: 'description',
          title: 'Product Description',
          content: generateDescription(title, category)
        };
        break;
      case 'seo':
        const seo = generateSEO(title, category);
        content = {
          type: 'seo',
          title: 'SEO Metadata',
          content: seo.metaDescription,
          metadata: {
            'Meta Title': seo.metaTitle,
            'Meta Description': seo.metaDescription,
            'Keywords': seo.keywords
          }
        };
        break;
      case 'promotional':
        content = {
          type: 'promotional',
          title: 'Promotional Copy',
          content: generatePromo(title, category)
        };
        break;
      case 'social':
        const social = generateSocial(title, category);
        content = {
          type: 'social',
          title: 'Social Media',
          content: social.caption,
          metadata: {
            'Caption': social.caption,
            'Hashtags': social.hashtags
          }
        };
        break;
      default:
        content = {
          type: 'description',
          title: 'Content',
          content: ''
        };
    }

    setGeneratedContent(prev => ({ ...prev, [type]: content }));
    setIsGenerating(false);
    onContentGenerated?.(content);
    toast.success('Content generated!');
  }, [title, category, onContentGenerated]);

  const handleGenerateAll = useCallback(async () => {
    setIsGenerating(true);
    for (const type of CONTENT_TYPES) {
      await handleGenerate(type.id);
    }
    setIsGenerating(false);
    toast.success('All content generated!');
  }, [handleGenerate]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast.success('Copied to clipboard!');
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-chart-4 flex items-center justify-center">
            <Wand2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Content Assistant</h3>
            <p className="text-sm text-muted-foreground">AI-powered content generation</p>
          </div>
        </div>
        <Badge className="bg-primary/10 text-primary">
          <Sparkles className="w-3 h-3 mr-1" />
          AI Powered
        </Badge>
      </div>

      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <Label>Product Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter product name"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Category</Label>
          <Input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g., Electronics"
            className="mt-1"
          />
        </div>
      </div>

      {/* Quick Generate All */}
      <Button
        onClick={handleGenerateAll}
        disabled={isGenerating || !title.trim()}
        className="w-full mb-6 gap-2"
      >
        {isGenerating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Zap className="w-4 h-4" />
        )}
        Generate All Content
      </Button>

      {/* Content Type Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-4">
          {CONTENT_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <TabsTrigger key={type.id} value={type.id} className="gap-1.5">
                <Icon className={cn("w-4 h-4", type.color)} />
                <span className="hidden sm:inline text-xs">{type.title}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {CONTENT_TYPES.map((type) => {
          const Icon = type.icon;
          const content = generatedContent[type.id];

          return (
            <TabsContent key={type.id} value={type.id}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={cn("w-5 h-5", type.color)} />
                    <div>
                      <h4 className="font-medium">{type.title}</h4>
                      <p className="text-xs text-muted-foreground">{type.description}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleGenerate(type.id)}
                    disabled={isGenerating || !title.trim()}
                    className="gap-2"
                  >
                    {isGenerating && activeTab === type.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    {content ? 'Regenerate' : 'Generate'}
                  </Button>
                </div>

                {content ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    {/* Main Content */}
                    <div className="relative">
                      <Textarea
                        value={content.content}
                        readOnly
                        className="min-h-[120px] pr-12"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => copyToClipboard(content.content, 'main')}
                        className="absolute top-2 right-2"
                      >
                        {copiedField === 'main' ? (
                          <Check className="w-4 h-4 text-success" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>

                    {/* Metadata */}
                    {content.metadata && (
                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="gap-2 w-full justify-between">
                            <span className="text-sm">Additional Fields</span>
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-2 pt-2">
                          {Object.entries(content.metadata).map(([key, value]) => (
                            <div key={key} className="p-3 rounded-lg bg-secondary/50">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-muted-foreground">{key}</span>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(value, key)}
                                  className="h-6 w-6"
                                >
                                  {copiedField === key ? (
                                    <Check className="w-3 h-3 text-success" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </Button>
                              </div>
                              <p className="text-sm">{value}</p>
                            </div>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                  </motion.div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Icon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">Click "Generate" to create {type.title.toLowerCase()}</p>
                  </div>
                )}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Tips Section */}
      <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
        <div className="flex items-start gap-3">
          <Target className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm mb-1">Pro Tips</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• More specific product titles generate better content</li>
              <li>• Include category for industry-specific language</li>
              <li>• Regenerate to get different variations</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
}
