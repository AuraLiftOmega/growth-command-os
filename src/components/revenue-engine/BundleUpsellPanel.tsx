import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Package, Plus, Sparkles, DollarSign, ShoppingCart, Loader2, Trash2 } from 'lucide-react';

interface Bundle {
  id: string;
  name: string;
  products: Array<{ id: string; title: string; price: number; image?: string }>;
  discount_percentage: number;
  original_price: number;
  bundle_price: number;
  sales_count: number;
  revenue: number;
  is_active: boolean;
}

interface SuggestedBundle {
  name: string;
  products: Array<{ shopify_id: string; title: string; price: number }>;
  discount: number;
  reason: string;
}

export function BundleUpsellPanel() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestedBundle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isCreating, setIsCreating] = useState<string | null>(null);

  useEffect(() => {
    loadBundles();
  }, []);

  const loadBundles = async () => {
    try {
      const { data } = await supabase.functions.invoke('bundle-upsell', {
        body: { action: 'list' }
      });
      setBundles(data?.bundles || []);
    } catch (error) {
      console.error('Failed to load bundles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSuggestions = async () => {
    setIsSuggesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('bundle-upsell', {
        body: { action: 'suggest' }
      });

      if (error) throw error;

      if (data?.bundles?.length) {
        setSuggestions(data.bundles);
        toast.success(`✨ ${data.bundles.length} bundle ideas generated!`);
      } else {
        toast.info('No suggestions available. Add more products first.');
      }
    } catch (error) {
      console.error('Suggestion error:', error);
      toast.error('Failed to get suggestions');
    } finally {
      setIsSuggesting(false);
    }
  };

  const createBundle = async (suggestion: SuggestedBundle) => {
    setIsCreating(suggestion.name);
    try {
      const { data, error } = await supabase.functions.invoke('bundle-upsell', {
        body: {
          action: 'create',
          name: suggestion.name,
          products: suggestion.products.map(p => ({
            id: p.shopify_id,
            title: p.title,
            price: p.price
          })),
          discount_percentage: suggestion.discount
        }
      });

      if (error) throw error;

      toast.success(data.message || 'Bundle created!');
      setSuggestions(prev => prev.filter(s => s.name !== suggestion.name));
      loadBundles();
    } catch (error) {
      console.error('Create error:', error);
      toast.error('Failed to create bundle');
    } finally {
      setIsCreating(null);
    }
  };

  const totalRevenue = bundles.reduce((sum, b) => sum + (b.revenue || 0), 0);
  const totalSales = bundles.reduce((sum, b) => sum + (b.sales_count || 0), 0);

  return (
    <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-900/20 to-teal-900/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-emerald-400" />
          Bundle Upsell Engine
          <Badge variant="outline" className="ml-auto text-emerald-400 border-emerald-400">
            +40% AOV
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-black/30">
            <p className="text-2xl font-bold text-emerald-400">{bundles.length}</p>
            <p className="text-xs text-muted-foreground">Active Bundles</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-black/30">
            <p className="text-2xl font-bold text-emerald-400">{totalSales}</p>
            <p className="text-xs text-muted-foreground">Bundle Sales</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-black/30">
            <p className="text-2xl font-bold text-emerald-400">${totalRevenue.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">Bundle Revenue</p>
          </div>
        </div>

        {/* Get Suggestions Button */}
        <Button 
          onClick={getSuggestions} 
          disabled={isSuggesting}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
        >
          {isSuggesting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing Products...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Get AI Bundle Suggestions
            </>
          )}
        </Button>

        {/* AI Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">AI Suggestions</h4>
            {suggestions.map((s) => (
              <div 
                key={s.name} 
                className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-900/10"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{s.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.reason}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {s.products.map((p) => (
                        <Badge key={p.shopify_id} variant="secondary" className="text-xs">
                          {p.title.slice(0, 20)}... ${p.price}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-emerald-600 text-white">
                      {s.discount}% OFF
                    </Badge>
                    <Button
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => createBundle(s)}
                      disabled={isCreating === s.name}
                    >
                      {isCreating === s.name ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <Plus className="h-3 w-3 mr-1" />
                          Create
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Active Bundles */}
        {bundles.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Active Bundles</h4>
            {bundles.map((bundle) => (
              <div 
                key={bundle.id} 
                className="p-3 rounded-lg border border-muted bg-black/20"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{bundle.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {bundle.products?.length || 0} products • {bundle.discount_percentage}% off
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-400">
                      ${bundle.bundle_price?.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground line-through">
                      ${bundle.original_price?.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ShoppingCart className="h-3 w-3" />
                    {bundle.sales_count} sales
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    ${bundle.revenue?.toFixed(0)} revenue
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && bundles.length === 0 && suggestions.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No bundles yet</p>
            <p className="text-xs">Click "Get AI Bundle Suggestions" to start</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
