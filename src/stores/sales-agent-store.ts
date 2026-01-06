import { create } from 'zustand';

export type FunnelStage = 
  | 'unaware'
  | 'aware'
  | 'problem_aware'
  | 'solution_aware'
  | 'evaluating'
  | 'ready_to_act'
  | 'converted'
  | 'dormant';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    intent_level?: number;
    action_type?: 'question' | 'value_delivery' | 'booking_offer' | 'close_attempt' | 'objection_handle';
    suggestBooking?: boolean;
  };
}

export interface ConversationContext {
  prospect_name?: string;
  prospect_email?: string;
  prospect_company?: string;
  prospect_phone?: string;
  pain_points?: string[];
  desired_outcomes?: string[];
  constraints?: {
    timeline?: string;
    budget?: string;
    urgency?: 'low' | 'medium' | 'high';
  };
  qualification_score: number;
  value_delivered: boolean;
  deal_size_estimate?: number;
}

export interface SalesAgentState {
  // Conversation state
  conversationId: string | null;
  messages: Message[];
  funnelStage: FunnelStage;
  context: ConversationContext;
  isTyping: boolean;
  
  // Booking state
  showBookingModal: boolean;
  selectedSlot: Date | null;
  bookingConfirmed: boolean;
  
  // Payment state
  showPaymentFlow: boolean;
  paymentIntentId: string | null;
  
  // Actions
  setConversationId: (id: string | null) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  setFunnelStage: (stage: FunnelStage) => void;
  updateContext: (updates: Partial<ConversationContext>) => void;
  setIsTyping: (typing: boolean) => void;
  setShowBookingModal: (show: boolean) => void;
  setSelectedSlot: (slot: Date | null) => void;
  setBookingConfirmed: (confirmed: boolean) => void;
  setShowPaymentFlow: (show: boolean) => void;
  setPaymentIntentId: (id: string | null) => void;
  resetConversation: () => void;
  loadConversation: (data: {
    id: string;
    messages: Message[];
    funnelStage: FunnelStage;
    context: ConversationContext;
  }) => void;
}

const initialContext: ConversationContext = {
  qualification_score: 0,
  value_delivered: false,
};

export const useSalesAgentStore = create<SalesAgentState>((set) => ({
  // Initial state
  conversationId: null,
  messages: [],
  funnelStage: 'unaware',
  context: initialContext,
  isTyping: false,
  showBookingModal: false,
  selectedSlot: null,
  bookingConfirmed: false,
  showPaymentFlow: false,
  paymentIntentId: null,

  // Actions
  setConversationId: (id) => set({ conversationId: id }),
  
  addMessage: (message) => set((state) => ({
    messages: [
      ...state.messages,
      {
        ...message,
        id: crypto.randomUUID(),
        timestamp: new Date(),
      },
    ],
  })),
  
  setFunnelStage: (stage) => set({ funnelStage: stage }),
  
  updateContext: (updates) => set((state) => ({
    context: { ...state.context, ...updates },
  })),
  
  setIsTyping: (typing) => set({ isTyping: typing }),
  
  setShowBookingModal: (show) => set({ showBookingModal: show }),
  
  setSelectedSlot: (slot) => set({ selectedSlot: slot }),
  
  setBookingConfirmed: (confirmed) => set({ bookingConfirmed: confirmed }),
  
  setShowPaymentFlow: (show) => set({ showPaymentFlow: show }),
  
  setPaymentIntentId: (id) => set({ paymentIntentId: id }),
  
  resetConversation: () => set({
    conversationId: null,
    messages: [],
    funnelStage: 'unaware',
    context: initialContext,
    isTyping: false,
    showBookingModal: false,
    selectedSlot: null,
    bookingConfirmed: false,
    showPaymentFlow: false,
    paymentIntentId: null,
  }),
  
  loadConversation: (data) => set({
    conversationId: data.id,
    messages: data.messages,
    funnelStage: data.funnelStage,
    context: data.context,
  }),
}));
