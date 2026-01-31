/**
 * useStoreEngine Hook - React integration for the Profit Engine
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getActiveStores, 
  fetchStoreProducts, 
  getStoreHealth,
  calculateSellingPrice,
  getRecommendedPrice,
  PROFIT_CONFIG,
  ENGINE_STATUS,
  type StoreConnection,
  type ProductPricing,
} from '@/lib/store-profit-engine';

export function useStoreEngine() {
  const queryClient = useQueryClient();

  // Fetch active stores
  const { 
    data: stores = [], 
    isLoading: storesLoading,
    refetch: refetchStores,
  } = useQuery({
    queryKey: ['store-connections'],
    queryFn: getActiveStores,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch store health
  const { 
    data: health,
    isLoading: healthLoading,
  } = useQuery({
    queryKey: ['store-health'],
    queryFn: getStoreHealth,
    staleTime: 60 * 1000, // 1 minute
  });

  // Fetch products from primary store
  const fetchProducts = useCallback(async (limit: number = 50, category?: string) => {
    return fetchStoreProducts(limit, category);
  }, []);

  // Calculate pricing for a product
  const calculatePricing = useCallback((cjCost: number, shippingCost: number = 5.99): ProductPricing => {
    return calculateSellingPrice(cjCost, shippingCost);
  }, []);

  // Get recommended price for 60% margin
  const getPrice60 = useCallback((cjCost: number, shippingCost: number = 5.99): number => {
    return getRecommendedPrice(cjCost, shippingCost);
  }, []);

  return {
    // Store data
    stores,
    storesLoading,
    refetchStores,
    
    // Health metrics
    health,
    healthLoading,
    
    // Product operations
    fetchProducts,
    
    // Pricing calculations
    calculatePricing,
    getPrice60,
    
    // Configuration
    config: PROFIT_CONFIG,
    status: ENGINE_STATUS,
    
    // Quick stats
    totalStores: stores.length,
    activeStores: stores.filter((s: StoreConnection) => s.isActive).length,
    targetMargin: PROFIT_CONFIG.targetMargin * 100,
  };
}

export function useProductPricing(cjCost: number, shippingCost: number = 5.99) {
  const pricing = calculateSellingPrice(cjCost, shippingCost);
  
  return {
    ...pricing,
    recommendedPrice: pricing.sellingPrice,
    profitPerSale: pricing.profit,
    marginPercent: pricing.profitMargin * 100,
  };
}
