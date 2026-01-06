import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useDominionStore } from '@/stores/dominion-core-store';

/**
 * Hook to display toast notifications when revenue engine config changes
 * Tracks changes to key configuration values and notifies user
 */
export const useConfigNotifications = () => {
  const { 
    industry, 
    offerType, 
    salesMotion, 
    dealSize, 
    buyingCycle,
    isConfigured,
    isActive,
    isSynced,
    connectedIntegrations
  } = useDominionStore();

  // Store previous values to detect changes
  const prevValues = useRef({
    industry: industry,
    offerType: offerType,
    salesMotion: salesMotion,
    dealSize: dealSize,
    buyingCycle: buyingCycle,
    isConfigured: isConfigured,
    isActive: isActive,
    integrationsCount: connectedIntegrations.length
  });

  useEffect(() => {
    const prev = prevValues.current;

    // Only notify after initial load (when synced)
    if (!isSynced) return;

    // Industry changed
    if (prev.industry !== null && industry !== prev.industry && industry !== null) {
      toast.success(`Industry changed to ${getIndustryName(industry)}`, {
        description: 'KPIs and benchmarks updated'
      });
    }

    // Offer type changed
    if (prev.offerType !== null && offerType !== prev.offerType && offerType !== null) {
      toast.info(`Offer type set to ${formatOfferType(offerType)}`, {
        description: 'Sales funnel adapted'
      });
    }

    // Sales motion changed
    if (prev.salesMotion !== null && salesMotion !== prev.salesMotion && salesMotion !== null) {
      toast.info(`Sales motion: ${formatSalesMotion(salesMotion)}`, {
        description: 'Automation timing adjusted'
      });
    }

    // Deal size changed
    if (prev.dealSize !== dealSize) {
      toast.info(`Deal size: ${dealSize.charAt(0).toUpperCase() + dealSize.slice(1)} ticket`, {
        description: 'Pricing and urgency adapted'
      });
    }

    // Buying cycle changed
    if (prev.buyingCycle !== buyingCycle) {
      toast.info(`Buying cycle: ${buyingCycle}`, {
        description: 'Funnel pacing updated'
      });
    }

    // Engine activated
    if (!prev.isActive && isActive) {
      toast.success('DOMINION Engine Activated!', {
        description: 'All systems online and ready for execution',
        duration: 5000
      });
    }

    // Engine configured
    if (!prev.isConfigured && isConfigured) {
      toast.success('Configuration complete', {
        description: 'Revenue engine is now personalized to your business'
      });
    }

    // Integration added
    if (connectedIntegrations.length > prev.integrationsCount) {
      const newIntegration = connectedIntegrations[connectedIntegrations.length - 1];
      toast.success(`${newIntegration} connected`, {
        description: 'Integration syncing data'
      });
    }

    // Integration removed
    if (connectedIntegrations.length < prev.integrationsCount) {
      toast.info('Integration disconnected', {
        description: 'Data sync paused'
      });
    }

    // Update previous values
    prevValues.current = {
      industry,
      offerType,
      salesMotion,
      dealSize,
      buyingCycle,
      isConfigured,
      isActive,
      integrationsCount: connectedIntegrations.length
    };
  }, [industry, offerType, salesMotion, dealSize, buyingCycle, isConfigured, isActive, connectedIntegrations, isSynced]);
};

function getIndustryName(industry: string): string {
  const names: Record<string, string> = {
    'ecommerce': 'E-Commerce / DTC',
    'saas': 'SaaS / Software',
    'agency': 'Agency / Services',
    'coaching': 'Coaching / Info',
    'enterprise': 'Enterprise / B2B',
    'local_services': 'Local Services',
    'high_ticket_consulting': 'High-Ticket Consulting'
  };
  return names[industry] || industry;
}

function formatOfferType(type: string): string {
  return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function formatSalesMotion(motion: string): string {
  return motion.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-');
}
