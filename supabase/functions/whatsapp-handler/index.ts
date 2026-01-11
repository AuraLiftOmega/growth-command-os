import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WhatsAppMessage {
  from: string;
  text?: { body: string };
  type: string;
  timestamp: string;
}

interface GrokResponse {
  reply: string;
  intent: string;
  product_recommendation?: string;
  checkout_link?: string;
  confidence: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { action, user_id, message, phone_number, webhook_data } = body;

    console.log(`WhatsApp Handler: action=${action}, user_id=${user_id}`);

    // Handle different actions
    switch (action) {
      case "sync": {
        // Sync WhatsApp data
        const { data: conversations } = await supabase
          .from("ai_sales_conversations")
          .select("*")
          .eq("user_id", user_id)
          .eq("channel", "whatsapp");

        return new Response(
          JSON.stringify({
            success: true,
            messages_count: conversations?.length || 0,
            synced_at: new Date().toISOString(),
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "send_test": {
        // Send test message via WhatsApp Business API
        const WHATSAPP_ACCESS_TOKEN = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
        const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");

        if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
          console.log("WhatsApp credentials not configured, running in demo mode");
          return new Response(
            JSON.stringify({
              success: true,
              mode: "demo",
              message: "Test message simulated (WhatsApp API not configured)",
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Real WhatsApp API call would go here
        const response = await fetch(
          `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: phone_number || "test",
              type: "text",
              text: { body: message },
            }),
          }
        );

        return new Response(
          JSON.stringify({
            success: response.ok,
            mode: "live",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "webhook": {
        // Handle incoming WhatsApp webhook
        const entry = webhook_data?.entry?.[0];
        const changes = entry?.changes?.[0];
        const messageData = changes?.value?.messages?.[0] as WhatsAppMessage;

        if (!messageData) {
          return new Response(
            JSON.stringify({ success: true, message: "No message to process" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const customerPhone = messageData.from;
        const customerMessage = messageData.text?.body || "";

        // Get or create conversation
        let { data: conversation } = await supabase
          .from("ai_sales_conversations")
          .select("*")
          .eq("user_id", user_id)
          .eq("prospect_phone", customerPhone)
          .eq("channel", "whatsapp")
          .maybeSingle();

        if (!conversation) {
          const { data: newConv } = await supabase
            .from("ai_sales_conversations")
            .insert({
              user_id,
              channel: "whatsapp",
              prospect_phone: customerPhone,
              prospect_name: "WhatsApp Customer",
              funnel_stage: "awareness",
              messages: [],
            })
            .select()
            .single();
          conversation = newConv;
        }

        // Generate AI response using Grok
        const grokResponse = await generateGrokResponse(
          customerMessage,
          conversation?.funnel_stage || "awareness",
          conversation?.context
        );

        // Update conversation with new messages
        const existingMessages = (conversation?.messages as any[]) || [];
        const updatedMessages = [
          ...existingMessages,
          {
            role: "user",
            content: customerMessage,
            timestamp: new Date().toISOString(),
          },
          {
            role: "assistant",
            content: grokResponse.reply,
            timestamp: new Date().toISOString(),
            metadata: {
              intent: grokResponse.intent,
              product: grokResponse.product_recommendation,
              confidence: grokResponse.confidence,
            },
          },
        ];

        await supabase
          .from("ai_sales_conversations")
          .update({
            messages: updatedMessages,
            last_message_at: new Date().toISOString(),
            funnel_stage: mapIntentToStage(grokResponse.intent),
            intent_level: Math.round(grokResponse.confidence * 100),
          })
          .eq("id", conversation?.id);

        // Send response via WhatsApp
        const WHATSAPP_ACCESS_TOKEN = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
        const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");

        if (WHATSAPP_ACCESS_TOKEN && WHATSAPP_PHONE_NUMBER_ID) {
          await fetch(
            `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                messaging_product: "whatsapp",
                to: customerPhone,
                type: "text",
                text: { body: grokResponse.reply },
              }),
            }
          );
        }

        // Log bot action
        await supabase.from("bot_logs").insert({
          user_id,
          bot_id: "whatsapp-sales-bot",
          bot_name: "WhatsApp Sales Bot",
          team: "sales",
          action_type: "message_sent",
          action: `Responded to: "${customerMessage.substring(0, 50)}..."`,
          status: "success",
          metadata: {
            customer_phone: customerPhone,
            intent: grokResponse.intent,
            confidence: grokResponse.confidence,
          },
        });

        return new Response(
          JSON.stringify({
            success: true,
            reply_sent: true,
            intent: grokResponse.intent,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "send_message": {
        // Send outbound message
        const WHATSAPP_ACCESS_TOKEN = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
        const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");

        if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
          return new Response(
            JSON.stringify({
              success: true,
              mode: "demo",
              message: "Message simulated (WhatsApp API not configured)",
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const response = await fetch(
          `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: phone_number,
              type: "text",
              text: { body: message },
            }),
          }
        );

        return new Response(
          JSON.stringify({
            success: response.ok,
            mode: "live",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Unknown action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("WhatsApp Handler Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function generateGrokResponse(
  customerMessage: string,
  currentStage: string,
  context: any
): Promise<GrokResponse> {
  const XAI_API_KEY = Deno.env.get("XAI_GROK_API_KEY") || Deno.env.get("XAI_API_KEY");
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  const apiKey = XAI_API_KEY || LOVABLE_API_KEY;
  const apiUrl = XAI_API_KEY 
    ? "https://api.x.ai/v1/chat/completions"
    : "https://ai.gateway.lovable.dev/v1/chat/completions";

  if (!apiKey) {
    // Fallback response if no AI configured
    return {
      reply: "Hi! 👋 Thanks for reaching out to AuraLift Essentials! I'd love to help you find the perfect skincare products. What are you looking for today?",
      intent: "greeting",
      confidence: 0.8,
    };
  }

  try {
    const systemPrompt = `You are an AI sales assistant for AuraLift Essentials, a premium skincare brand. Your goal is to engage customers, understand their needs, recommend products, and close sales.

Products available:
- Vitamin C Serum ($34.99) - Brightening, anti-aging
- Rose Gold Eye Cream ($29.99) - Dark circles, fine lines
- Hydrating Mist ($19.99) - Daily hydration
- Luxury Gift Set ($89.99) - All bestsellers bundled, 20% off

Store: www.auraliftessentials.com
Current promo: GIFT20 for 20% off

Respond naturally and conversationally. Be friendly, use emojis sparingly. Focus on understanding customer needs and guiding them to purchase.

Customer's current funnel stage: ${currentStage}
Previous context: ${JSON.stringify(context || {})}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: XAI_API_KEY ? "grok-3" : "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: customerMessage },
        ],
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Thanks for your message! How can I help you today?";

    // Analyze intent
    const lowerMessage = customerMessage.toLowerCase();
    let intent = "general";
    let confidence = 0.7;

    if (lowerMessage.includes("buy") || lowerMessage.includes("order") || lowerMessage.includes("checkout")) {
      intent = "purchase_intent";
      confidence = 0.95;
    } else if (lowerMessage.includes("price") || lowerMessage.includes("cost") || lowerMessage.includes("how much")) {
      intent = "price_inquiry";
      confidence = 0.9;
    } else if (lowerMessage.includes("gift") || lowerMessage.includes("present")) {
      intent = "gift_inquiry";
      confidence = 0.85;
    } else if (lowerMessage.includes("sensitive") || lowerMessage.includes("dry") || lowerMessage.includes("oily")) {
      intent = "skin_concern";
      confidence = 0.85;
    } else if (lowerMessage.includes("hi") || lowerMessage.includes("hello") || lowerMessage.includes("hey")) {
      intent = "greeting";
      confidence = 0.9;
    }

    return {
      reply,
      intent,
      confidence,
      product_recommendation: intent === "skin_concern" ? "Hydrating Mist" : undefined,
    };
  } catch (error) {
    console.error("Grok API error:", error);
    return {
      reply: "Thanks for your message! Our team will get back to you shortly. In the meantime, check out our bestsellers at www.auraliftessentials.com 💫",
      intent: "fallback",
      confidence: 0.5,
    };
  }
}

function mapIntentToStage(intent: string): string {
  switch (intent) {
    case "greeting":
      return "awareness";
    case "price_inquiry":
    case "skin_concern":
    case "gift_inquiry":
      return "consideration";
    case "purchase_intent":
      return "decision";
    default:
      return "awareness";
  }
}
