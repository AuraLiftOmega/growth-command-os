import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import { toast } from 'sonner';

export interface InternalProduct {
  id: string;
  organization_id: string;
  title: string;
  slug: string;
  description: string | null;
  description_html: string | null;
  product_type: string;
  status: string;
  tags: string[];
  vendor: string | null;
  sku: string | null;
  base_price: number;
  compare_at_price: number | null;
  cost_price: number | null;
  currency: string;
  margin_percentage: number | null;
  track_inventory: boolean;
  inventory_quantity: number;
  images: any[];
  thumbnail_url: string | null;
  shopify_product_id: string | null;
  cj_product_id: string | null;
  external_source: string | null;
  fulfillment_type: string;
  total_sold: number;
  total_revenue: number;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export function useInternalProducts() {
  const { currentOrg } = useOrganization();
  const orgId = currentOrg?.id;

  return useQuery({
    queryKey: ['internal-products', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from('internal_products')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as InternalProduct[];
    },
    enabled: !!orgId,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { currentOrg } = useOrganization();

  return useMutation({
    mutationFn: async (product: Partial<InternalProduct>) => {
      if (!currentOrg?.id) throw new Error('No organization selected');
      const slug = product.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'product';
      
      const insertData: Record<string, any> = {
          ...product,
          organization_id: currentOrg.id,
          slug: slug + '-' + Date.now().toString(36),
        };
      const { data, error } = await (supabase
        .from('internal_products')
        .insert(insertData as any))
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal-products'] });
      toast.success('Product created');
    },
    onError: (err: any) => toast.error(err.message),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<InternalProduct> & { id: string }) => {
      const { data, error } = await supabase
        .from('internal_products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal-products'] });
      toast.success('Product updated');
    },
    onError: (err: any) => toast.error(err.message),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('internal_products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal-products'] });
      toast.success('Product deleted');
    },
    onError: (err: any) => toast.error(err.message),
  });
}

export function useInternalOrders() {
  const { currentOrg } = useOrganization();
  const orgId = currentOrg?.id;

  return useQuery({
    queryKey: ['internal-orders', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from('internal_orders')
        .select('*, internal_order_items(*)')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: !!orgId,
  });
}

export function usePaymentProcessors() {
  const { currentOrg } = useOrganization();
  const orgId = currentOrg?.id;

  return useQuery({
    queryKey: ['payment-processors', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from('payment_processors')
        .select('*')
        .eq('organization_id', orgId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!orgId,
  });
}
