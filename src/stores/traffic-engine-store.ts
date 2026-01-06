import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TrafficSource = 'paid' | 'organic' | 'outbound' | 'owned' | 'proof';

export interface TrafficStream {
  id: string;
  name: string;
  source: TrafficSource;
  status: 'active' | 'paused' | 'warning' | 'critical';
  dependencyPercent: number;
  leadsToday: number;
  leadsWeek: number;
  conversionRate: number;
  costPerLead: number;
  platforms: string[];
}

export interface PlatformShockEvent {
  id: string;
  platform: string;
  eventType: 'ban' | 'throttle' | 'suppression' | 'policy_violation';
  timestamp: Date;
  resolved: boolean;
  autoResponse: string;
}

export interface CreatorAffiliate {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'suspended';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  conversions: number;
  revenue: number;
  payoutRate: number;
  payoutPending: number;
  fraudScore: number;
  messagingCompliance: number;
}

export interface ReferralIncentive {
  id: string;
  type: 'access' | 'status' | 'priority' | 'feature' | 'credit' | 'cash';
  name: string;
  value: string;
  conditions: string[];
  usageCount: number;
  costToDate: number;
}

export interface AudienceMonetizationLayer {
  id: string;
  name: string;
  type: 'secondary_offer' | 'upgrade' | 'ecosystem' | 'education' | 'data';
  revenue: number;
  conversionRate: number;
  ltvImpact: number;
  status: 'active' | 'testing' | 'planned';
}

export interface MessageTemplate {
  id: string;
  content: string;
  riskLevel: 'safe' | 'moderate' | 'high';
  lastUsed: Date;
  rotationCount: number;
  performance: number;
}

interface TrafficEngineState {
  // Core State
  isActive: boolean;
  shockResponseMode: boolean;
  maxDependencyThreshold: number;
  
  // Traffic Streams
  trafficStreams: TrafficStream[];
  
  // Platform Health
  platformShockEvents: PlatformShockEvent[];
  
  // Creator/Affiliate Distribution
  creators: CreatorAffiliate[];
  affiliateEnabled: boolean;
  
  // Referral System
  referralIncentives: ReferralIncentive[];
  cashPayoutCap: number;
  cashPayoutDelay: number; // days
  
  // Audience Monetization
  monetizationLayers: AudienceMonetizationLayer[];
  
  // Message Insulation
  messageTemplates: MessageTemplate[];
  messageRotationEnabled: boolean;
  
  // Owned Audience
  ownedAudienceSize: number;
  emailCaptureRate: number;
  smsOptInRate: number;
  
  // Actions
  setActive: (active: boolean) => void;
  setShockResponseMode: (active: boolean) => void;
  updateTrafficStream: (id: string, updates: Partial<TrafficStream>) => void;
  addPlatformShockEvent: (event: Omit<PlatformShockEvent, 'id'>) => void;
  resolvePlatformShock: (id: string) => void;
  updateCreator: (id: string, updates: Partial<CreatorAffiliate>) => void;
  addReferralIncentive: (incentive: Omit<ReferralIncentive, 'id'>) => void;
  addMonetizationLayer: (layer: Omit<AudienceMonetizationLayer, 'id'>) => void;
  rotateMessage: (id: string) => void;
  rebalanceTraffic: () => void;
}

export const useTrafficEngineStore = create<TrafficEngineState>()(
  persist(
    (set, get) => ({
      isActive: true,
      shockResponseMode: false,
      maxDependencyThreshold: 40,
      
      trafficStreams: [
        {
          id: 'paid-meta',
          name: 'Meta Ads',
          source: 'paid',
          status: 'active',
          dependencyPercent: 28,
          leadsToday: 34,
          leadsWeek: 247,
          conversionRate: 3.2,
          costPerLead: 12.50,
          platforms: ['Facebook', 'Instagram']
        },
        {
          id: 'paid-google',
          name: 'Google Ads',
          source: 'paid',
          status: 'active',
          dependencyPercent: 12,
          leadsToday: 18,
          leadsWeek: 126,
          conversionRate: 4.1,
          costPerLead: 18.75,
          platforms: ['Search', 'YouTube']
        },
        {
          id: 'organic-short',
          name: 'Short-Form Content',
          source: 'organic',
          status: 'active',
          dependencyPercent: 22,
          leadsToday: 28,
          leadsWeek: 195,
          conversionRate: 2.8,
          costPerLead: 0,
          platforms: ['TikTok', 'IG Reels', 'Shorts', 'X']
        },
        {
          id: 'outbound-dm',
          name: 'Cold Outbound',
          source: 'outbound',
          status: 'active',
          dependencyPercent: 15,
          leadsToday: 12,
          leadsWeek: 84,
          conversionRate: 8.4,
          costPerLead: 2.30,
          platforms: ['DMs', 'Email', 'LinkedIn']
        },
        {
          id: 'owned-audience',
          name: 'Owned Audience',
          source: 'owned',
          status: 'active',
          dependencyPercent: 18,
          leadsToday: 22,
          leadsWeek: 156,
          conversionRate: 12.5,
          costPerLead: 0.15,
          platforms: ['Email', 'SMS', 'CRM']
        },
        {
          id: 'proof-viral',
          name: 'Proof Virality',
          source: 'proof',
          status: 'active',
          dependencyPercent: 5,
          leadsToday: 8,
          leadsWeek: 52,
          conversionRate: 18.2,
          costPerLead: 0,
          platforms: ['Case Studies', 'Demos', 'Results']
        }
      ],
      
      platformShockEvents: [],
      
      creators: [
        {
          id: 'creator-1',
          name: 'Alex Sterling',
          status: 'active',
          tier: 'gold',
          conversions: 47,
          revenue: 23500,
          payoutRate: 10,
          payoutPending: 2350,
          fraudScore: 2,
          messagingCompliance: 98
        },
        {
          id: 'creator-2',
          name: 'Jordan Blake',
          status: 'active',
          tier: 'silver',
          conversions: 23,
          revenue: 11500,
          payoutRate: 8,
          payoutPending: 920,
          fraudScore: 5,
          messagingCompliance: 94
        }
      ],
      affiliateEnabled: true,
      
      referralIncentives: [
        {
          id: 'incentive-1',
          type: 'access',
          name: 'Early Feature Access',
          value: 'Priority beta access to new modules',
          conditions: ['1 qualified referral'],
          usageCount: 156,
          costToDate: 0
        },
        {
          id: 'incentive-2',
          type: 'status',
          name: 'Insider Status',
          value: 'Exclusive badge + private channel',
          conditions: ['3 qualified referrals'],
          usageCount: 43,
          costToDate: 0
        },
        {
          id: 'incentive-3',
          type: 'credit',
          name: 'Platform Credits',
          value: '$500 credits per referral',
          conditions: ['Referral retained 60+ days', 'Revenue > $1000'],
          usageCount: 28,
          costToDate: 14000
        }
      ],
      cashPayoutCap: 500,
      cashPayoutDelay: 60,
      
      monetizationLayers: [
        {
          id: 'layer-1',
          name: 'Advanced Automation Pack',
          type: 'secondary_offer',
          revenue: 45000,
          conversionRate: 12,
          ltvImpact: 340,
          status: 'active'
        },
        {
          id: 'layer-2',
          name: 'Usage-Based Scaling',
          type: 'upgrade',
          revenue: 78000,
          conversionRate: 28,
          ltvImpact: 890,
          status: 'active'
        },
        {
          id: 'layer-3',
          name: 'Ecosystem Toolkit',
          type: 'ecosystem',
          revenue: 23000,
          conversionRate: 8,
          ltvImpact: 180,
          status: 'active'
        }
      ],
      
      messageTemplates: [
        {
          id: 'msg-1',
          content: 'Noticed your brand is scaling aggressively. We help operators like you systematize growth.',
          riskLevel: 'safe',
          lastUsed: new Date(),
          rotationCount: 47,
          performance: 8.2
        },
        {
          id: 'msg-2',
          content: 'Most founders hit a ceiling with agencies. We built infrastructure that replaces that entirely.',
          riskLevel: 'safe',
          lastUsed: new Date(),
          rotationCount: 34,
          performance: 7.8
        }
      ],
      messageRotationEnabled: true,
      
      ownedAudienceSize: 47850,
      emailCaptureRate: 34.2,
      smsOptInRate: 12.8,
      
      setActive: (active) => set({ isActive: active }),
      
      setShockResponseMode: (active) => set((state) => {
        if (active) {
          // Auto-adjust traffic when shock mode activates
          const updatedStreams = state.trafficStreams.map(stream => {
            if (stream.source === 'paid') {
              return { ...stream, status: 'paused' as const };
            }
            if (stream.source === 'outbound' || stream.source === 'organic') {
              return { ...stream, dependencyPercent: stream.dependencyPercent + 10 };
            }
            return stream;
          });
          return { shockResponseMode: active, trafficStreams: updatedStreams };
        }
        return { shockResponseMode: active };
      }),
      
      updateTrafficStream: (id, updates) => set((state) => ({
        trafficStreams: state.trafficStreams.map(s => 
          s.id === id ? { ...s, ...updates } : s
        )
      })),
      
      addPlatformShockEvent: (event) => set((state) => ({
        platformShockEvents: [
          ...state.platformShockEvents,
          { ...event, id: `shock-${Date.now()}` }
        ]
      })),
      
      resolvePlatformShock: (id) => set((state) => ({
        platformShockEvents: state.platformShockEvents.map(e =>
          e.id === id ? { ...e, resolved: true } : e
        )
      })),
      
      updateCreator: (id, updates) => set((state) => ({
        creators: state.creators.map(c =>
          c.id === id ? { ...c, ...updates } : c
        )
      })),
      
      addReferralIncentive: (incentive) => set((state) => ({
        referralIncentives: [
          ...state.referralIncentives,
          { ...incentive, id: `incentive-${Date.now()}` }
        ]
      })),
      
      addMonetizationLayer: (layer) => set((state) => ({
        monetizationLayers: [
          ...state.monetizationLayers,
          { ...layer, id: `layer-${Date.now()}` }
        ]
      })),
      
      rotateMessage: (id) => set((state) => ({
        messageTemplates: state.messageTemplates.map(m =>
          m.id === id ? { ...m, rotationCount: m.rotationCount + 1, lastUsed: new Date() } : m
        )
      })),
      
      rebalanceTraffic: () => set((state) => {
        const totalDependency = state.trafficStreams.reduce((sum, s) => sum + s.dependencyPercent, 0);
        const targetPercent = 100 / state.trafficStreams.length;
        
        const updatedStreams = state.trafficStreams.map(stream => ({
          ...stream,
          dependencyPercent: Math.round(targetPercent),
          status: stream.dependencyPercent > state.maxDependencyThreshold ? 'warning' as const : stream.status
        }));
        
        return { trafficStreams: updatedStreams };
      })
    }),
    {
      name: 'dominion-traffic-engine'
    }
  )
);
