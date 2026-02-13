import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Store, Shield, Key, Eye, EyeOff, Save, RefreshCw, 
  CheckCircle, AlertTriangle, Settings2, Percent 
} from 'lucide-react';

interface StoreRow {
  id: string;
  store_name: string;
  store_domain: string;
  is_primary: boolean;
  is_active: boolean;
  storefront_access_token: string;
  admin_access_token: string | null;
  shopify_client_id?: string | null;
  shopify_client_secret?: string | null;
  profit_margin_target?: number | null;
  min_margin?: number | null;
  platform_fee?: number | null;
  products_count: number | null;
  total_revenue: number | null;
  last_synced_at: string | null;
}

interface StoreFormState {
  shopify_client_id: string;
  shopify_client_secret: string;
  storefront_access_token: string;
  admin_access_token: string;
  profit_margin_target: string;
  min_margin: string;
  platform_fee: string;
}

function StoreCredentialCard({ store }: { store: StoreRow }) {
  const queryClient = useQueryClient();
  const [showSecrets, setShowSecrets] = useState(false);
  const [form, setForm] = useState<StoreFormState>({
    shopify_client_id: (store as any).shopify_client_id || '',
    shopify_client_secret: (store as any).shopify_client_secret || '',
    storefront_access_token: store.storefront_access_token === '***ENCRYPTED***' ? '' : store.storefront_access_token,
    admin_access_token: store.admin_access_token === '***ENCRYPTED***' ? '' : (store.admin_access_token || ''),
    profit_margin_target: String(((store as any).profit_margin_target ?? 0.60) * 100),
    min_margin: String(((store as any).min_margin ?? 0.45) * 100),
    platform_fee: String(((store as any).platform_fee ?? 0.05) * 100),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<StoreFormState>) => {
      const updatePayload: Record<string, any> = {};
      
      if (data.shopify_client_id !== undefined) updatePayload.shopify_client_id = data.shopify_client_id || null;
      if (data.shopify_client_secret !== undefined) updatePayload.shopify_client_secret = data.shopify_client_secret || null;
      if (data.storefront_access_token && data.storefront_access_token !== '') {
        updatePayload.storefront_access_token = data.storefront_access_token;
      }
      if (data.admin_access_token !== undefined) {
        updatePayload.admin_access_token = data.admin_access_token || null;
      }
      if (data.profit_margin_target !== undefined) {
        updatePayload.profit_margin_target = parseFloat(data.profit_margin_target) / 100;
      }
      if (data.min_margin !== undefined) {
        updatePayload.min_margin = parseFloat(data.min_margin) / 100;
      }
      if (data.platform_fee !== undefined) {
        updatePayload.platform_fee = parseFloat(data.platform_fee) / 100;
      }

      const { error } = await supabase
        .from('user_store_connections')
        .update(updatePayload as any)
        .eq('id', store.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(`${store.store_name} credentials updated`);
      queryClient.invalidateQueries({ queryKey: ['store-connections'] });
    },
    onError: (err: any) => {
      toast.error('Failed to update', { description: err.message });
    },
  });

  const handleSave = () => {
    updateMutation.mutate(form);
  };

  const hasClientCreds = !!(form.shopify_client_id && form.shopify_client_secret);
  const handle = store.store_domain.replace('.myshopify.com', '');

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Store className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{store.store_name}</CardTitle>
              <CardDescription className="text-xs font-mono">{store.store_domain}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {store.is_primary && <Badge variant="default" className="text-[10px]">PRIMARY</Badge>}
            {store.is_active ? (
              <Badge variant="outline" className="text-[10px] border-green-500/30 text-green-400">
                <CheckCircle className="w-3 h-3 mr-1" /> Active
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] border-yellow-500/30 text-yellow-400">
                <AlertTriangle className="w-3 h-3 mr-1" /> Inactive
              </Badge>
            )}
            {hasClientCreds ? (
              <Badge variant="outline" className="text-[10px] border-green-500/30 text-green-400">
                <Shield className="w-3 h-3 mr-1" /> OAuth Ready
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] border-orange-500/30 text-orange-400">
                <Key className="w-3 h-3 mr-1" /> Needs Creds
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* OAuth App Credentials */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Shield className="w-4 h-4 text-muted-foreground" />
              Shopify App Credentials
            </h4>
            <Button variant="ghost" size="sm" onClick={() => setShowSecrets(!showSecrets)}>
              {showSecrets ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Client ID</Label>
              <Input 
                type={showSecrets ? 'text' : 'password'}
                placeholder={`Client ID for ${handle}`}
                value={form.shopify_client_id}
                onChange={(e) => setForm(prev => ({ ...prev, shopify_client_id: e.target.value }))}
                className="h-8 text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Client Secret</Label>
              <Input 
                type={showSecrets ? 'text' : 'password'}
                placeholder={`Client Secret for ${handle}`}
                value={form.shopify_client_secret}
                onChange={(e) => setForm(prev => ({ ...prev, shopify_client_secret: e.target.value }))}
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Access Tokens */}
        <div>
          <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
            <Key className="w-4 h-4 text-muted-foreground" />
            Access Tokens
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Storefront Token</Label>
              <Input 
                type={showSecrets ? 'text' : 'password'}
                placeholder={store.storefront_access_token === '***ENCRYPTED***' ? '••• encrypted •••' : 'Storefront token'}
                value={form.storefront_access_token}
                onChange={(e) => setForm(prev => ({ ...prev, storefront_access_token: e.target.value }))}
                className="h-8 text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Admin Token (optional)</Label>
              <Input 
                type={showSecrets ? 'text' : 'password'}
                placeholder={store.admin_access_token === '***ENCRYPTED***' ? '••• encrypted •••' : 'Admin token'}
                value={form.admin_access_token}
                onChange={(e) => setForm(prev => ({ ...prev, admin_access_token: e.target.value }))}
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Profit Engine Config */}
        <div>
          <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
            <Percent className="w-4 h-4 text-muted-foreground" />
            Profit Reaper Config
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Target Margin %</Label>
              <Input 
                type="number"
                min="10"
                max="90"
                value={form.profit_margin_target}
                onChange={(e) => setForm(prev => ({ ...prev, profit_margin_target: e.target.value }))}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Min Margin %</Label>
              <Input 
                type="number"
                min="5"
                max="80"
                value={form.min_margin}
                onChange={(e) => setForm(prev => ({ ...prev, min_margin: e.target.value }))}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Platform Fee %</Label>
              <Input 
                type="number"
                min="0"
                max="30"
                value={form.platform_fee}
                onChange={(e) => setForm(prev => ({ ...prev, platform_fee: e.target.value }))}
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
          <span>Products: {store.products_count ?? 0}</span>
          <span>Revenue: ${Number(store.total_revenue ?? 0).toFixed(2)}</span>
          <span>Last sync: {store.last_synced_at ? new Date(store.last_synced_at).toLocaleDateString() : 'Never'}</span>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 text-xs gap-1"
            onClick={() => window.open(`https://admin.shopify.com/store/${handle}`, '_blank')}
          >
            <Settings2 className="w-3 h-3" /> Admin
          </Button>
          <Button 
            size="sm" 
            className="h-8 text-xs gap-1"
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            Save Credentials
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function StoreCredentialsManager() {
  const { data: stores, isLoading } = useQuery({
    queryKey: ['store-connections'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_store_connections')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false });
      
      if (error) throw error;
      return (data ?? []) as StoreRow[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!stores?.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Store className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No stores connected yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Multi-Tenant Store Credentials
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Manage Shopify App credentials and Profit Reaper config per store
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          {stores.length} store{stores.length !== 1 ? 's' : ''} connected
        </Badge>
      </div>
      
      <div className="space-y-4">
        {stores.map(store => (
          <StoreCredentialCard key={store.id} store={store} />
        ))}
      </div>
    </div>
  );
}
