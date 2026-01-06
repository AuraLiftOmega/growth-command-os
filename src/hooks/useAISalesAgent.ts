import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSalesAgentStore, FunnelStage, Message, ConversationContext } from '@/stores/sales-agent-store';
import { toast } from 'sonner';

interface AIResponse {
  message: string;
  suggestedAction?: 'continue' | 'offer_booking' | 'show_slots' | 'close_deal' | 'payment';
  nextStage?: FunnelStage;
  contextUpdates?: Partial<ConversationContext>;
  intentLevel?: number;
}

export function useAISalesAgent() {
  const { user } = useAuth();
  const store = useSalesAgentStore();

  // Initialize or continue a conversation
  const initializeConversation = useCallback(async (channel: string = 'chat') => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('ai_sales_conversations')
        .insert({
          user_id: user.id,
          channel,
          funnel_stage: 'unaware',
          messages: [],
          context: {},
        })
        .select()
        .single();

      if (error) throw error;

      store.setConversationId(data.id);
      store.resetConversation();
      store.setConversationId(data.id);
      
      // Generate welcome message
      const welcomeMessage = getWelcomeMessage();
      store.addMessage({
        role: 'assistant',
        content: welcomeMessage,
      });

      return data.id;
    } catch (error) {
      console.error('Error initializing conversation:', error);
      return null;
    }
  }, [user, store]);

  // Process user message and generate AI response
  const processMessage = useCallback(async (userMessage: string) => {
    if (!user || !store.conversationId) return;

    // Add user message to store
    store.addMessage({
      role: 'user',
      content: userMessage,
    });

    store.setIsTyping(true);

    try {
      // Call AI edge function
      const { data, error } = await supabase.functions.invoke('ai-sales-agent', {
        body: {
          conversationId: store.conversationId,
          userMessage,
          currentStage: store.funnelStage,
          context: store.context,
          messageHistory: store.messages.slice(-10), // Last 10 messages for context
        },
      });

      if (error) throw error;

      const response = data as AIResponse;

      // Update store with response
      store.addMessage({
        role: 'assistant',
        content: response.message,
        metadata: {
          intent_level: response.intentLevel,
          action_type: response.suggestedAction === 'offer_booking' ? 'booking_offer' 
            : response.suggestedAction === 'close_deal' ? 'close_attempt'
            : 'question',
        },
      });

      // Update funnel stage if suggested
      if (response.nextStage) {
        store.setFunnelStage(response.nextStage);
      }

      // Update context
      if (response.contextUpdates) {
        store.updateContext(response.contextUpdates);
      }

      // Handle suggested actions
      if (response.suggestedAction === 'show_slots') {
        store.setShowBookingModal(true);
      } else if (response.suggestedAction === 'payment') {
        store.setShowPaymentFlow(true);
      }

      // Persist to database
      await persistConversation();

    } catch (error) {
      console.error('Error processing message:', error);
      
      // Fallback response
      store.addMessage({
        role: 'assistant',
        content: getFallbackResponse(store.funnelStage),
      });
    } finally {
      store.setIsTyping(false);
    }
  }, [user, store]);

  // Persist conversation state to database
  const persistConversation = useCallback(async () => {
    if (!store.conversationId) return;

    try {
      await supabase
        .from('ai_sales_conversations')
        .update({
          funnel_stage: store.funnelStage,
          messages: store.messages.map(m => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp.toISOString(),
          })) as unknown as any,
          context: JSON.parse(JSON.stringify(store.context)),
          intent_level: store.context.qualification_score,
          prospect_name: store.context.prospect_name,
          prospect_email: store.context.prospect_email,
          prospect_company: store.context.prospect_company,
          last_message_at: new Date().toISOString(),
          qualification_score: store.context.qualification_score,
          deal_value: store.context.deal_size_estimate,
        })
        .eq('id', store.conversationId);
    } catch (error) {
      console.error('Error persisting conversation:', error);
    }
  }, [store]);

  // Load existing conversation
  const loadConversation = useCallback(async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('ai_sales_conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (error) throw error;

      const messages = (data.messages as any[] || []).map((m: any) => ({
        id: crypto.randomUUID(),
        role: m.role,
        content: m.content,
        timestamp: new Date(m.timestamp),
      }));

      store.loadConversation({
        id: data.id,
        messages,
        funnelStage: data.funnel_stage as FunnelStage,
        context: {
          prospect_name: data.prospect_name || undefined,
          prospect_email: data.prospect_email || undefined,
          prospect_company: data.prospect_company || undefined,
          qualification_score: data.qualification_score || 0,
          value_delivered: false,
          deal_size_estimate: data.deal_value || undefined,
        },
      });

      return true;
    } catch (error) {
      console.error('Error loading conversation:', error);
      return false;
    }
  }, [store]);

  // Get recent conversations
  const getRecentConversations = useCallback(async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('ai_sales_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('last_message_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  }, [user]);

  // Mark deal as closed
  const closeDeal = useCallback(async (dealValue: number) => {
    if (!store.conversationId) return false;

    try {
      await supabase
        .from('ai_sales_conversations')
        .update({
          deal_closed: true,
          deal_value: dealValue,
          funnel_stage: 'converted',
        })
        .eq('id', store.conversationId);

      store.setFunnelStage('converted');
      store.updateContext({ deal_size_estimate: dealValue });
      
      toast.success('Deal closed!', {
        description: `$${dealValue.toLocaleString()} revenue captured`,
      });

      return true;
    } catch (error) {
      console.error('Error closing deal:', error);
      return false;
    }
  }, [store]);

  return {
    // State from store
    conversationId: store.conversationId,
    messages: store.messages,
    funnelStage: store.funnelStage,
    context: store.context,
    isTyping: store.isTyping,
    showBookingModal: store.showBookingModal,
    selectedSlot: store.selectedSlot,
    bookingConfirmed: store.bookingConfirmed,
    showPaymentFlow: store.showPaymentFlow,
    
    // Actions
    initializeConversation,
    processMessage,
    loadConversation,
    getRecentConversations,
    closeDeal,
    setShowBookingModal: store.setShowBookingModal,
    setSelectedSlot: store.setSelectedSlot,
    setBookingConfirmed: store.setBookingConfirmed,
    resetConversation: store.resetConversation,
    addMessage: store.addMessage,
    updateContext: store.updateContext,
  };
}

function getWelcomeMessage(): string {
  const greetings = [
    "Hey! 👋 Great to connect. What brings you here today?",
    "Hi there! I'm here to help you figure out if this is the right fit. What's on your mind?",
    "Welcome! I'd love to understand what you're working on. What's the biggest challenge you're facing right now?",
  ];
  return greetings[Math.floor(Math.random() * greetings.length)];
}

function getFallbackResponse(stage: FunnelStage): string {
  const fallbacks: Record<FunnelStage, string> = {
    unaware: "I'd love to learn more about your situation. What's the main thing you're trying to accomplish?",
    aware: "That's interesting! Can you tell me more about what you've tried so far?",
    problem_aware: "I hear you. That's a common challenge. What would it mean for you to solve this?",
    solution_aware: "You're clearly thinking about this the right way. What's been holding you back from taking action?",
    evaluating: "Great questions! Let me address that. What else would help you make a confident decision?",
    ready_to_act: "Perfect! I think we're on the same page. Would you like to see how this would work for your specific situation?",
    converted: "Awesome! Welcome aboard. I'll make sure you're set up for success. Any questions as we get started?",
    dormant: "Hey! Just checking in. Has anything changed since we last talked? I'm here if you need anything.",
  };
  return fallbacks[stage];
}
