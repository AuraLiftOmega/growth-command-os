import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface UserStoreConnection {
  id: string;
  user_id: string;
  store_name: string;
  store_domain: string;
  storefront_access_token: string;
  admin_access_token: string | null;
  is_active: boolean;
  is_primary: boolean;
  last_synced_at: string | null;
  products_count: number;
  orders_count: number;
  total_revenue: number;
  connected_at: string;
  updated_at: string;
}

export function useUserStore() {
  const { user } = useAuth();
  const [stores, setStores] = useState<UserStoreConnection[]>([]);
  const [primaryStore, setPrimaryStore] = useState<UserStoreConnection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStores = useCallback(async () => {
    if (!user) {
      setStores([]);
      setPrimaryStore(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from("user_store_connections")
        .select("*")
        .eq("user_id", user.id)
        .order("is_primary", { ascending: false });

      if (fetchError) throw fetchError;

      const typedData = (data || []) as UserStoreConnection[];
      setStores(typedData);
      setPrimaryStore(typedData.find(s => s.is_primary) || typedData[0] || null);
    } catch (err) {
      console.error("Error fetching stores:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch stores");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const addStore = async (storeData: {
    store_name: string;
    store_domain: string;
    storefront_access_token: string;
    admin_access_token?: string;
  }) => {
    if (!user) throw new Error("Not authenticated");

    const isPrimary = stores.length === 0;
    
    const { data, error: insertError } = await supabase
      .from("user_store_connections")
      .insert({
        user_id: user.id,
        store_name: storeData.store_name,
        store_domain: storeData.store_domain.replace(/^https?:\/\//, "").replace(/\/$/, ""),
        storefront_access_token: storeData.storefront_access_token,
        admin_access_token: storeData.admin_access_token || null,
        is_primary: isPrimary,
      })
      .select()
      .single();

    if (insertError) throw insertError;
    
    await fetchStores();
    return data as UserStoreConnection;
  };

  const removeStore = async (storeId: string) => {
    if (!user) throw new Error("Not authenticated");

    const { error: deleteError } = await supabase
      .from("user_store_connections")
      .delete()
      .eq("id", storeId)
      .eq("user_id", user.id);

    if (deleteError) throw deleteError;
    await fetchStores();
  };

  const setPrimaryStoreById = async (storeId: string) => {
    if (!user) throw new Error("Not authenticated");

    // First, unset all primary flags
    await supabase
      .from("user_store_connections")
      .update({ is_primary: false })
      .eq("user_id", user.id);

    // Set the new primary
    const { error: updateError } = await supabase
      .from("user_store_connections")
      .update({ is_primary: true })
      .eq("id", storeId)
      .eq("user_id", user.id);

    if (updateError) throw updateError;
    await fetchStores();
  };

  const updateStoreStats = async (storeId: string, stats: {
    products_count?: number;
    orders_count?: number;
    total_revenue?: number;
  }) => {
    if (!user) throw new Error("Not authenticated");

    const { error: updateError } = await supabase
      .from("user_store_connections")
      .update({
        ...stats,
        last_synced_at: new Date().toISOString(),
      })
      .eq("id", storeId)
      .eq("user_id", user.id);

    if (updateError) throw updateError;
    await fetchStores();
  };

  return {
    stores,
    primaryStore,
    isLoading,
    error,
    addStore,
    removeStore,
    setPrimaryStoreById,
    updateStoreStats,
    refetch: fetchStores,
    hasConnectedStore: stores.length > 0,
  };
}
