import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  Store, 
  Palette, 
  Search, 
  ShoppingCart,
  Sparkles,
  ExternalLink,
  Mail,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface GeneratedConfig {
  theme?: { 
    primaryColor?: string; 
    secondaryColor?: string;
    style?: string;
    fontPrimary?: string;
  };
  layout?: string;
  features?: string[];
  hero?: {
    headline?: string;
    subheadline?: string;
    ctaText?: string;
  };
  seo?: { 
    title?: string; 
    description?: string;
    keywords?: string[];
  };
  collections?: Array<{ name: string; description: string; handle: string }>;
  sampleProducts?: Array<{ title: string; description: string; price: string; category: string }>;
}

interface StoreSetup {
  id: string;
  store_name: string;
  industry: string;
  email: string;
  description: string | null;
  target_audience: string | null;
  generated_config: GeneratedConfig | null;
  status: string;
}

export default function StoreGenerated() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setupId = searchParams.get("id");
  const [setup, setSetup] = useState<StoreSetup | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (setupId) {
      loadSetup(setupId);
    } else {
      // Load the most recent setup
      loadLatestSetup();
    }
  }, [setupId]);

  const loadSetup = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("store_setups")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      setSetup(data as unknown as StoreSetup);
    } catch (error) {
      console.error("Error loading setup:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLatestSetup = async () => {
    try {
      const { data, error } = await supabase
        .from("store_setups")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setSetup(data as unknown as StoreSetup);
    } catch (error) {
      console.error("Error loading setup:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const industryLabels: Record<string, string> = {
    fashion: "Fashion & Apparel",
    electronics: "Electronics & Tech",
    beauty: "Beauty & Skincare",
    home: "Home & Living",
    fitness: "Sports & Fitness",
    food: "Food & Beverage",
    pets: "Pets & Animals",
    other: "General Store"
  };

  const featureIcons: Record<string, typeof Store> = {
    cart: ShoppingCart,
    search: Search,
    "quick-view": Sparkles,
    wishlist: Store
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your store...</p>
        </div>
      </div>
    );
  }

  if (!setup) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No Store Found</h2>
            <p className="text-muted-foreground mb-6">
              We couldn't find your store setup. Would you like to create one?
            </p>
            <Button onClick={() => navigate("/setup")}>
              Create Your Store
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const config = setup.generated_config;

  return (
    <div className="min-h-screen bg-background">
      {/* Success Header */}
      <div className="bg-gradient-to-b from-chart-3/10 to-background py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 rounded-full bg-chart-3/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-chart-3" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              🎉 Your Store is Ready!
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We've generated <strong>{setup.store_name}</strong> with an optimized 
              {config?.theme?.style ? ` ${config.theme.style}` : ""} design for the {industryLabels[setup.industry] || setup.industry} industry.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Store Details */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Store Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="w-5 h-5 text-primary" />
                  Store Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Store Name</p>
                  <p className="font-semibold text-lg">{setup.store_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Industry</p>
                  <p className="font-medium">{industryLabels[setup.industry] || setup.industry}</p>
                </div>
                {setup.description && (
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="text-sm">{setup.description}</p>
                  </div>
                )}
                {setup.target_audience && (
                  <div>
                    <p className="text-sm text-muted-foreground">Target Audience</p>
                    <p className="text-sm">{setup.target_audience}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Generated Config Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  Generated Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {config && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Theme Style</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div 
                          className="w-6 h-6 rounded-full border"
                          style={{ backgroundColor: config.theme?.primaryColor || '#6366f1' }}
                        />
                        <span className="font-medium capitalize">{config.theme?.style || 'modern'}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Layout</p>
                      <p className="font-medium capitalize">{(config.layout || 'modern-grid').replace("-", " ")}</p>
                    </div>
                    {config.features && config.features.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground">Features Enabled</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {config.features.map((feature) => (
                            <span 
                              key={feature}
                              className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full capitalize"
                            >
                              {feature.replace("-", " ")}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {config.seo?.title && (
                      <div>
                        <p className="text-sm text-muted-foreground">SEO Title</p>
                        <p className="text-sm">{config.seo.title}</p>
                      </div>
                    )}
                    {config.hero?.headline && (
                      <div>
                        <p className="text-sm text-muted-foreground">Hero Headline</p>
                        <p className="text-sm font-medium">{config.hero.headline}</p>
                      </div>
                    )}
                  </>
                )}
                {!config && (
                  <p className="text-sm text-muted-foreground">Configuration pending...</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Sample Products Preview */}
        {config?.sampleProducts && config.sampleProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="max-w-4xl mx-auto mt-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  AI-Generated Product Ideas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-4">
                  {config.sampleProducts.map((product, index) => (
                    <div key={index} className="p-4 bg-muted/50 rounded-lg">
                      <p className="font-medium">{product.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                      <p className="text-sm font-semibold text-primary mt-2">{product.price}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-4xl mx-auto mt-8"
        >
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                What's Next?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We've sent setup instructions to <strong>{setup.email}</strong>. Here's what you can do now:
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 bg-background rounded-lg border">
                  <div className="text-2xl mb-2">1</div>
                  <p className="font-medium">Preview Your Store</p>
                  <p className="text-sm text-muted-foreground">See your generated storefront live</p>
                </div>
                <div className="p-4 bg-background rounded-lg border">
                  <div className="text-2xl mb-2">2</div>
                  <p className="font-medium">Add Products</p>
                  <p className="text-sm text-muted-foreground">Connect Shopify or add products manually</p>
                </div>
                <div className="p-4 bg-background rounded-lg border">
                  <div className="text-2xl mb-2">3</div>
                  <p className="font-medium">Go Live</p>
                  <p className="text-sm text-muted-foreground">Publish and start selling</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12"
        >
          <Button size="lg" onClick={() => navigate("/store")} className="min-w-[200px]">
            <ExternalLink className="w-4 h-4 mr-2" />
            Preview Store
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/settings")} className="min-w-[200px]">
            <Store className="w-4 h-4 mr-2" />
            Manage Store
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
