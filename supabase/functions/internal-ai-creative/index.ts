import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");

    const body = await req.json();
    const { action, job_id, organization_id, product_id, prompt, platform, style } = body;

    switch (action) {
      case "generate_script": {
        // Use Lovable AI (Gemini) to generate ad scripts internally
        if (!LOVABLE_API_KEY) throw new Error("AI not configured");

        // Fetch product data if product_id provided
        let productContext = "";
        if (product_id) {
          const { data: product } = await supabase
            .from("internal_products")
            .select("*")
            .eq("id", product_id)
            .single();
          if (product) {
            productContext = `Product: ${product.title}\nDescription: ${product.description}\nPrice: $${product.base_price}\nType: ${product.product_type}`;
          }
        }

        const systemPrompt = `You are OMEGA Creative Director — the world's best direct-response ad scriptwriter.
Generate a viral ${platform || "TikTok"} ad script that:
- Opens with an irresistible hook in the first 3 seconds
- Uses emotional triggers (fear of missing out, social proof, transformation)
- Includes a clear CTA
- Matches the ${style || "energetic"} style
- Is optimized for ${platform || "TikTok"} format

Return JSON: { "hook": "...", "script": "...", "emotional_trigger": "...", "cta": "...", "estimated_duration_seconds": N, "hook_score": N (1-10) }`;

        const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: prompt || productContext || "Create a viral ad script for a premium product" },
            ],
            tools: [{
              type: "function",
              function: {
                name: "generate_ad_script",
                description: "Generate a viral ad script",
                parameters: {
                  type: "object",
                  properties: {
                    hook: { type: "string" },
                    script: { type: "string" },
                    emotional_trigger: { type: "string" },
                    cta: { type: "string" },
                    estimated_duration_seconds: { type: "number" },
                    hook_score: { type: "number" },
                  },
                  required: ["hook", "script", "emotional_trigger", "cta"],
                  additionalProperties: false,
                },
              },
            }],
            tool_choice: { type: "function", function: { name: "generate_ad_script" } },
          }),
        });

        if (!aiResp.ok) {
          const errText = await aiResp.text();
          console.error("AI error:", aiResp.status, errText);
          if (aiResp.status === 429) {
            return new Response(JSON.stringify({ error: "Rate limited, try again shortly" }), {
              status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          throw new Error("AI generation failed");
        }

        const aiData = await aiResp.json();
        const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
        let scriptData: any = {};
        
        if (toolCall?.function?.arguments) {
          try {
            scriptData = JSON.parse(toolCall.function.arguments);
          } catch {
            scriptData = { script: aiData.choices?.[0]?.message?.content || "", hook: "Generated", emotional_trigger: "curiosity" };
          }
        }

        // Save to creative job if job_id provided
        if (job_id) {
          await supabase.from("internal_creative_jobs").update({
            script_text: scriptData.script,
            script_model: "gemini-2.5-flash",
            quality_score: (scriptData.hook_score || 7) / 10,
            hook_score: (scriptData.hook_score || 7) / 10,
            emotional_trigger: scriptData.emotional_trigger,
            status: "processing",
          }).eq("id", job_id);
        }

        return new Response(JSON.stringify({ success: true, script: scriptData }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "generate_voiceover": {
        // Use ElevenLabs for voiceover — internal, no HeyGen/D-ID needed
        if (!ELEVENLABS_API_KEY) throw new Error("ElevenLabs not configured");

        const { text, voice_id } = body;
        const voiceResp = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voice_id || "21m00Tcm4TlvDq8ikWAM"}`,
          {
            method: "POST",
            headers: {
              "xi-api-key": ELEVENLABS_API_KEY,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text,
              model_id: "eleven_multilingual_v2",
              voice_settings: { stability: 0.5, similarity_boost: 0.75 },
            }),
          }
        );

        if (!voiceResp.ok) throw new Error("Voiceover generation failed");

        // Store in Supabase storage
        const audioBuffer = await voiceResp.arrayBuffer();
        const fileName = `voiceovers/${job_id || crypto.randomUUID()}.mp3`;
        
        const { error: uploadErr } = await supabase.storage
          .from("creatives")
          .upload(fileName, audioBuffer, { contentType: "audio/mpeg", upsert: true });

        if (uploadErr) throw uploadErr;

        const { data: urlData } = supabase.storage.from("creatives").getPublicUrl(fileName);
        const voiceoverUrl = urlData.publicUrl;

        if (job_id) {
          await supabase.from("internal_creative_jobs").update({
            voiceover_url: voiceoverUrl,
            voiceover_model: "eleven_multilingual_v2",
            status: "processing",
          }).eq("id", job_id);
        }

        return new Response(JSON.stringify({ success: true, voiceover_url: voiceoverUrl }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "full_pipeline": {
        // Create a creative job and kick off the pipeline
        const { data: job, error: jobErr } = await supabase
          .from("internal_creative_jobs")
          .insert({
            organization_id,
            job_type: "full_pipeline",
            product_id,
            prompt,
            style: style || "energetic",
            target_platform: platform || "tiktok",
            status: "processing",
            started_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (jobErr) throw jobErr;

        // Step 1: Generate script
        const scriptResp = await fetch(Deno.env.get("SUPABASE_URL")! + "/functions/v1/internal-ai-creative", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({
            action: "generate_script",
            job_id: job.id,
            product_id,
            prompt,
            platform,
            style,
          }),
        });

        const scriptResult = await scriptResp.json();

        // Step 2: Generate voiceover from script
        if (scriptResult.script?.script && ELEVENLABS_API_KEY) {
          await fetch(Deno.env.get("SUPABASE_URL")! + "/functions/v1/internal-ai-creative", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            },
            body: JSON.stringify({
              action: "generate_voiceover",
              job_id: job.id,
              text: scriptResult.script.script,
            }),
          });
        }

        // Mark completed
        await supabase.from("internal_creative_jobs").update({
          status: "completed",
          completed_at: new Date().toISOString(),
          result: scriptResult,
        }).eq("id", job.id);

        return new Response(JSON.stringify({ success: true, job_id: job.id, script: scriptResult.script }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (err: any) {
    console.error("internal-ai-creative error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
