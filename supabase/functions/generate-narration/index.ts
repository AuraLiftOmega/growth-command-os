import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NarrationRequest {
  demoId: string;
  voice?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const elevenlabsApiKey = Deno.env.get("ELEVENLABS_API_KEY");
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Validate authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!elevenlabsApiKey) {
      return new Response(
        JSON.stringify({ error: "ElevenLabs API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: NarrationRequest = await req.json();
    
    if (!body.demoId) {
      return new Response(
        JSON.stringify({ error: "Missing demoId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch the demo video record
    const { data: demo, error: fetchError } = await supabase
      .from('demo_videos')
      .select('*')
      .eq('id', body.demoId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !demo) {
      return new Response(
        JSON.stringify({ error: "Demo not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if already has narration
    if (demo.narration_url) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          narration_url: demo.narration_url,
          status: 'already_generated'
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build narration script from narrative
    const narrative = demo.narrative as Record<string, any>;
    const narrationScript = buildNarrationScript(demo.variant, narrative);

    console.log(`Generating narration for demo ${body.demoId}, variant: ${demo.variant}`);
    console.log(`Script length: ${narrationScript.length} characters`);

    // Select voice based on variant
    const voiceId = getVoiceForVariant(demo.variant, body.voice);

    // Generate speech using ElevenLabs
    const ttsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": elevenlabsApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: narrationScript,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: getStabilityForVariant(demo.variant),
            similarity_boost: 0.75,
            style: getStyleForVariant(demo.variant),
            use_speaker_boost: true,
            speed: getSpeedForVariant(demo.variant),
          },
        }),
      }
    );

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      console.error("ElevenLabs TTS error:", errorText);
      throw new Error(`TTS generation failed: ${ttsResponse.status}`);
    }

    // Get audio buffer
    const audioBuffer = await ttsResponse.arrayBuffer();
    const audioBytes = new Uint8Array(audioBuffer);

    // Upload to storage
    const narrationPath = `${user.id}/${body.demoId}/narration.mp3`;
    
    const { error: uploadError } = await supabase.storage
      .from('demo-videos')
      .upload(narrationPath, audioBytes, {
        contentType: 'audio/mpeg',
        upsert: true
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error("Failed to upload narration audio");
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('demo-videos')
      .getPublicUrl(narrationPath);

    const narrationUrl = urlData?.publicUrl || null;

    // Update demo record
    await supabase
      .from('demo_videos')
      .update({ narration_url: narrationUrl })
      .eq('id', body.demoId);

    // Log system event
    await supabase.from('system_events').insert({
      user_id: user.id,
      event_type: 'narration_generated',
      event_category: 'demo_engine',
      title: 'AI narration generated',
      description: `${demo.variant} variant narration for ${demo.industry} demo`,
      severity: 'info',
      metadata: {
        demo_id: body.demoId,
        voice_id: voiceId,
        script_length: narrationScript.length
      }
    });

    console.log(`Narration generated for demo ${body.demoId}: ${narrationUrl}`);

    return new Response(
      JSON.stringify({
        success: true,
        narration_url: narrationUrl,
        script: narrationScript
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Narration error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildNarrationScript(variant: string, narrative: Record<string, any>): string {
  const parts: string[] = [];
  
  if (variant === 'silent') {
    // Silent variant has no narration
    return '';
  }

  if (variant === 'intimidation') {
    // Minimal, impactful narration
    if (narrative.problem) {
      parts.push(narrative.problem);
    }
    parts.push('...');
    if (narrative.revelation) {
      parts.push(narrative.revelation);
    }
    parts.push('...');
    if (narrative.outcome) {
      parts.push(narrative.outcome);
    }
    if (narrative.close) {
      parts.push('...');
      parts.push(narrative.close);
    }
  } else {
    // Standard or Enterprise - full narration
    if (narrative.problem) {
      parts.push(narrative.problem);
    }
    
    if (narrative.revelation) {
      parts.push(narrative.revelation);
    }
    
    // Add demonstration points with pauses
    if (Array.isArray(narrative.demonstration)) {
      narrative.demonstration.forEach((point: string) => {
        parts.push(point);
      });
    }
    
    if (narrative.outcome) {
      parts.push(narrative.outcome);
    }
    
    if (narrative.close) {
      parts.push(narrative.close);
    }
  }

  // Use enhanced script if available
  if (narrative.enhancedScript) {
    return narrative.enhancedScript;
  }

  return parts.join(' ');
}

function getVoiceForVariant(variant: string, customVoice?: string): string {
  if (customVoice) return customVoice;
  
  // Voice IDs from ElevenLabs
  const voices: Record<string, string> = {
    standard: 'JBFqnCBsd6RMkjVDRZzb', // George - professional
    intimidation: 'onwK4e9ZLuTAKqWW03F9', // Daniel - deep, authoritative
    enterprise: 'nPczCjzI2devNBz1zQrb', // Brian - corporate
    silent: '' // No voice needed
  };
  
  return voices[variant] || voices.standard;
}

function getStabilityForVariant(variant: string): number {
  const stability: Record<string, number> = {
    standard: 0.5,
    intimidation: 0.8, // More stable, deliberate
    enterprise: 0.7,
    silent: 0.5
  };
  return stability[variant] || 0.5;
}

function getStyleForVariant(variant: string): number {
  const style: Record<string, number> = {
    standard: 0.3,
    intimidation: 0.6, // More stylized
    enterprise: 0.2, // Less stylized, more neutral
    silent: 0
  };
  return style[variant] || 0.3;
}

function getSpeedForVariant(variant: string): number {
  const speed: Record<string, number> = {
    standard: 1.0,
    intimidation: 0.85, // Slower, more deliberate
    enterprise: 0.95,
    silent: 1.0
  };
  return speed[variant] || 1.0;
}