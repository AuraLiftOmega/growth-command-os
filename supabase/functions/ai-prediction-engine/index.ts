/**
 * AI PREDICTION ENGINE
 * 
 * Predictive ML for:
 * - Churn risk scoring
 * - Lead scoring
 * - Upsell probability
 * - Revenue forecasting
 * 
 * Uses Lovable AI for intelligent predictions
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PredictionRequest {
  type: 'churn_risk' | 'lead_score' | 'upsell_probability' | 'revenue_forecast' | 'batch_scoring';
  contact_id?: string;
  deal_id?: string;
  user_id: string;
}

interface ContactData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  lifecycle_stage: string;
  total_revenue: number;
  total_orders: number;
  last_interaction_at: string;
  last_order_at: string;
  created_at: string;
  tags: string[];
}

interface DealData {
  id: string;
  title: string;
  stage: string;
  amount: number;
  probability: number;
  expected_close_date: string;
  created_at: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const body: PredictionRequest = await req.json();
    console.log('🧠 AI Prediction Engine request:', body.type);

    let result: Record<string, unknown> = {};

    switch (body.type) {
      case 'churn_risk': {
        if (!body.contact_id) throw new Error('contact_id required');
        
        const { data: contact } = await supabase
          .from('crm_contacts')
          .select('*')
          .eq('id', body.contact_id)
          .single();

        if (!contact) throw new Error('Contact not found');

        // Get interaction history
        const { data: interactions } = await supabase
          .from('crm_interactions')
          .select('*')
          .eq('contact_id', body.contact_id)
          .order('created_at', { ascending: false })
          .limit(20);

        const prompt = `Analyze this customer for churn risk. Return a JSON object with:
- churn_risk: number between 0 and 1
- risk_factors: array of strings explaining risk factors
- recommended_actions: array of action strings
- urgency: "low", "medium", "high", "critical"

Customer Data:
- Lifecycle Stage: ${contact.lifecycle_stage}
- Total Revenue: $${contact.total_revenue || 0}
- Total Orders: ${contact.total_orders || 0}
- Last Interaction: ${contact.last_interaction_at || 'never'}
- Last Order: ${contact.last_order_at || 'never'}
- Days Since Signup: ${Math.floor((Date.now() - new Date(contact.created_at).getTime()) / (1000 * 60 * 60 * 24))}
- Recent Interactions: ${interactions?.length || 0}
- Sentiment in Recent Interactions: ${interactions?.map(i => i.sentiment).filter(Boolean).join(', ') || 'unknown'}`;

        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: 'You are a predictive analytics AI. Always respond with valid JSON only, no markdown.' },
              { role: 'user', content: prompt }
            ],
            tools: [{
              type: 'function',
              function: {
                name: 'analyze_churn_risk',
                description: 'Analyze customer churn risk',
                parameters: {
                  type: 'object',
                  properties: {
                    churn_risk: { type: 'number', minimum: 0, maximum: 1 },
                    risk_factors: { type: 'array', items: { type: 'string' } },
                    recommended_actions: { type: 'array', items: { type: 'string' } },
                    urgency: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] }
                  },
                  required: ['churn_risk', 'risk_factors', 'recommended_actions', 'urgency']
                }
              }
            }],
            tool_choice: { type: 'function', function: { name: 'analyze_churn_risk' } }
          }),
        });

        const aiData = await aiResponse.json();
        const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
        const prediction = toolCall ? JSON.parse(toolCall.function.arguments) : { churn_risk: 0.5, risk_factors: [], recommended_actions: [], urgency: 'medium' };

        // Update contact with churn risk
        await supabase
          .from('crm_contacts')
          .update({ churn_risk: prediction.churn_risk })
          .eq('id', body.contact_id);

        // Log AI decision
        await supabase.from('ai_decision_log').insert({
          user_id: body.user_id,
          decision_type: 'churn_prediction',
          action_taken: `Churn risk: ${(prediction.churn_risk * 100).toFixed(0)}% (${prediction.urgency})`,
          reasoning: prediction.risk_factors.join('; '),
          confidence: 1 - prediction.churn_risk,
          entity_type: 'contact',
          entity_id: body.contact_id,
          execution_status: 'completed',
          impact_metrics: prediction
        });

        result = { contact_id: body.contact_id, prediction };
        break;
      }

      case 'lead_score': {
        if (!body.contact_id) throw new Error('contact_id required');
        
        const { data: contact } = await supabase
          .from('crm_contacts')
          .select('*')
          .eq('id', body.contact_id)
          .single();

        if (!contact) throw new Error('Contact not found');

        const { data: deals } = await supabase
          .from('crm_deals')
          .select('*')
          .eq('contact_id', body.contact_id);

        const prompt = `Score this lead for sales potential. Return JSON with:
- lead_score: number 0-100
- score_breakdown: object with category scores
- next_best_action: string
- ideal_products: array of product types to pitch

Lead Data:
- Source: ${contact.source || 'unknown'}
- Company: ${contact.company || 'unknown'}
- Title: ${contact.title || 'unknown'}
- Lifecycle Stage: ${contact.lifecycle_stage}
- Existing Deals: ${deals?.length || 0}
- Total Deal Value: $${deals?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0}
- Tags: ${contact.tags?.join(', ') || 'none'}`;

        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: 'You are a sales intelligence AI. Always respond with valid JSON only.' },
              { role: 'user', content: prompt }
            ],
            tools: [{
              type: 'function',
              function: {
                name: 'score_lead',
                description: 'Score a sales lead',
                parameters: {
                  type: 'object',
                  properties: {
                    lead_score: { type: 'number', minimum: 0, maximum: 100 },
                    score_breakdown: { 
                      type: 'object',
                      properties: {
                        engagement: { type: 'number' },
                        fit: { type: 'number' },
                        intent: { type: 'number' },
                        timing: { type: 'number' }
                      }
                    },
                    next_best_action: { type: 'string' },
                    ideal_products: { type: 'array', items: { type: 'string' } }
                  },
                  required: ['lead_score', 'score_breakdown', 'next_best_action', 'ideal_products']
                }
              }
            }],
            tool_choice: { type: 'function', function: { name: 'score_lead' } }
          }),
        });

        const aiData = await aiResponse.json();
        const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
        const prediction = toolCall ? JSON.parse(toolCall.function.arguments) : { lead_score: 50, score_breakdown: {}, next_best_action: 'Follow up', ideal_products: [] };

        await supabase
          .from('crm_contacts')
          .update({ lead_score: prediction.lead_score })
          .eq('id', body.contact_id);

        await supabase.from('ai_decision_log').insert({
          user_id: body.user_id,
          decision_type: 'lead_scoring',
          action_taken: `Lead score: ${prediction.lead_score}/100`,
          reasoning: prediction.next_best_action,
          confidence: prediction.lead_score / 100,
          entity_type: 'contact',
          entity_id: body.contact_id,
          execution_status: 'completed',
          impact_metrics: prediction
        });

        result = { contact_id: body.contact_id, prediction };
        break;
      }

      case 'upsell_probability': {
        if (!body.contact_id) throw new Error('contact_id required');
        
        const { data: contact } = await supabase
          .from('crm_contacts')
          .select('*')
          .eq('id', body.contact_id)
          .single();

        if (!contact) throw new Error('Contact not found');

        const prompt = `Analyze upsell/cross-sell opportunity. Return JSON with:
- upsell_probability: number 0-1
- recommended_offers: array of offer objects with { name, discount_percentage, reasoning }
- best_timing: string describing optimal timing
- expected_value: estimated additional revenue

Customer:
- Total Revenue: $${contact.total_revenue || 0}
- Total Orders: ${contact.total_orders || 0}
- Lifecycle Stage: ${contact.lifecycle_stage}
- LTV: $${contact.ltv || 0}`;

        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: 'You are a revenue optimization AI. Always respond with valid JSON only.' },
              { role: 'user', content: prompt }
            ],
            tools: [{
              type: 'function',
              function: {
                name: 'analyze_upsell',
                description: 'Analyze upsell opportunity',
                parameters: {
                  type: 'object',
                  properties: {
                    upsell_probability: { type: 'number', minimum: 0, maximum: 1 },
                    recommended_offers: { 
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          name: { type: 'string' },
                          discount_percentage: { type: 'number' },
                          reasoning: { type: 'string' }
                        }
                      }
                    },
                    best_timing: { type: 'string' },
                    expected_value: { type: 'number' }
                  },
                  required: ['upsell_probability', 'recommended_offers', 'best_timing', 'expected_value']
                }
              }
            }],
            tool_choice: { type: 'function', function: { name: 'analyze_upsell' } }
          }),
        });

        const aiData = await aiResponse.json();
        const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
        const prediction = toolCall ? JSON.parse(toolCall.function.arguments) : { upsell_probability: 0.3, recommended_offers: [], best_timing: 'Now', expected_value: 0 };

        await supabase.from('ai_decision_log').insert({
          user_id: body.user_id,
          decision_type: 'upsell_analysis',
          action_taken: `Upsell probability: ${(prediction.upsell_probability * 100).toFixed(0)}%`,
          reasoning: prediction.best_timing,
          confidence: prediction.upsell_probability,
          entity_type: 'contact',
          entity_id: body.contact_id,
          execution_status: 'completed',
          impact_metrics: prediction
        });

        result = { contact_id: body.contact_id, prediction };
        break;
      }

      case 'batch_scoring': {
        // Score all contacts that haven't been scored recently
        const { data: contacts } = await supabase
          .from('crm_contacts')
          .select('id')
          .eq('user_id', body.user_id)
          .or('lead_score.is.null,churn_risk.is.null')
          .limit(50);

        const results = [];
        for (const contact of contacts || []) {
          // Queue scoring jobs
          await supabase.from('automation_jobs').insert({
            user_id: body.user_id,
            job_type: 'SCORE_CONTACT',
            target_id: contact.id,
            input_data: { score_types: ['lead_score', 'churn_risk', 'upsell_probability'] },
            status: 'pending',
            priority: 3
          });
          results.push(contact.id);
        }

        result = { queued_contacts: results.length, contact_ids: results };
        break;
      }

      default:
        throw new Error(`Unknown prediction type: ${body.type}`);
    }

    console.log('✅ Prediction complete:', body.type);

    return new Response(JSON.stringify({ success: true, ...result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Prediction error:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
