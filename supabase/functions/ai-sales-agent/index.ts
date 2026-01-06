const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AIRequest {
  conversationId: string;
  userMessage: string;
  currentStage: string;
  context: Record<string, any>;
  messageHistory: Message[];
}

interface AIResponse {
  message: string;
  suggestedAction?: string;
  nextStage?: string;
  contextUpdates?: Record<string, any>;
  intentLevel?: number;
}

const SYSTEM_PROMPT = `You are an elite AI Sales Agent. Guide prospects toward booking a 15-minute demo.

PRINCIPLES:
- Move one step at a time through funnel stages
- Deliver value before asking for commitments
- Be warm, confident, direct - never pushy
- Never say "as an AI"

STAGES: unaware → aware → problem_aware → solution_aware → evaluating → ready_to_act → converted

Respond with JSON: {"message": "response", "suggestedAction": "continue|offer_booking|show_slots", "nextStage": "stage_if_progressing", "intentLevel": 0-100}`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) throw new Error('LOVABLE_API_KEY not configured');

    const body: AIRequest = await req.json();
    const { userMessage, currentStage, context, messageHistory } = body;

    const messages = [
      ...messageHistory.slice(-8).map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
      { role: 'user', content: userMessage },
    ];

    const response = await fetch('https://api.lovable.dev/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'openai/gpt-5-mini',
        max_tokens: 1024,
        system: `${SYSTEM_PROMPT}\n\nCurrent Stage: ${currentStage}\nContext: ${JSON.stringify(context)}`,
        messages,
      }),
    });

    const data = await response.json();
    const aiText = data.content?.[0]?.text || '';

    let aiResponse: AIResponse;
    try {
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      aiResponse = jsonMatch ? JSON.parse(jsonMatch[0]) : { message: aiText, suggestedAction: 'continue', intentLevel: 50 };
    } catch {
      aiResponse = { message: aiText, suggestedAction: 'continue', intentLevel: 50 };
    }

    return new Response(JSON.stringify(aiResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('AI Sales Agent error:', error);
    return new Response(JSON.stringify({
      message: "I appreciate you sharing that! Tell me more about what you're hoping to achieve.",
      suggestedAction: 'continue',
      intentLevel: 30,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
