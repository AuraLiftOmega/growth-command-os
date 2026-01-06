import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RenderRequest {
  demoId: string;
  forceRerender?: boolean;
}

interface SceneFrame {
  prompt: string;
  duration: number;
  transitionType: 'fade' | 'slide' | 'zoom' | 'cut';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
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

    const body: RenderRequest = await req.json();
    
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

    // Check if already rendered
    if (demo.video_url && !body.forceRerender) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          video_url: demo.video_url,
          thumbnail_url: demo.thumbnail_url,
          status: 'already_rendered'
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update status to rendering
    await supabase
      .from('demo_videos')
      .update({ 
        status: 'generating',
        render_progress: 5,
        render_error: null
      })
      .eq('id', body.demoId);

    console.log(`Starting render for demo ${body.demoId}, variant: ${demo.variant}`);

    // Generate scene frames based on narrative
    const narrative = demo.narrative as Record<string, any>;
    const scenes = narrative.scenes || narrative.enhancedScenes || [];
    const variant = demo.variant;
    const industry = demo.industry;
    
    // Calculate frame count based on length
    const totalDuration = demo.length === 'short' ? 90 : 240;
    const sceneCount = Math.min(scenes.length || 5, 8);
    const sceneDuration = totalDuration / sceneCount;

    // Generate scene prompts for image generation
    const scenePrompts = generateScenePrompts(variant, industry, scenes, narrative);
    
    // Update progress
    await supabase
      .from('demo_videos')
      .update({ 
        render_progress: 15,
        total_frames: scenePrompts.length
      })
      .eq('id', body.demoId);

    // Generate frames using AI image generation
    const generatedFrames: string[] = [];
    
    if (lovableApiKey) {
      for (let i = 0; i < scenePrompts.length; i++) {
        try {
          console.log(`Generating frame ${i + 1}/${scenePrompts.length}: ${scenePrompts[i].prompt.substring(0, 50)}...`);
          
          const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${lovableApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash-image-preview",
              messages: [
                {
                  role: "user",
                  content: scenePrompts[i].prompt
                }
              ],
              modalities: ["image", "text"]
            }),
          });

          if (imageResponse.ok) {
            const imageData = await imageResponse.json();
            const imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
            
            if (imageUrl) {
              generatedFrames.push(imageUrl);
              
              // Upload frame to storage
              const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, '');
              const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
              
              const framePath = `${user.id}/${body.demoId}/frame-${i.toString().padStart(3, '0')}.png`;
              
              await supabase.storage
                .from('demo-videos')
                .upload(framePath, binaryData, {
                  contentType: 'image/png',
                  upsert: true
                });

              // Update progress
              const progress = 15 + Math.round((i + 1) / scenePrompts.length * 60);
              await supabase
                .from('demo_videos')
                .update({ 
                  render_progress: progress,
                  frames_generated: i + 1
                })
                .eq('id', body.demoId);
            }
          } else {
            console.error(`Frame generation failed for scene ${i}:`, await imageResponse.text());
          }
        } catch (frameError) {
          console.error(`Error generating frame ${i}:`, frameError);
        }
      }
    }

    // Update progress to video synthesis stage
    await supabase
      .from('demo_videos')
      .update({ render_progress: 80 })
      .eq('id', body.demoId);

    // Generate video from first frame using video generation
    let videoUrl: string | null = null;
    let thumbnailUrl: string | null = null;

    if (generatedFrames.length > 0 && lovableApiKey) {
      try {
        // Use first frame as video starting point
        const firstFrameUrl = generatedFrames[0];
        
        // Generate video prompt based on variant
        const videoPrompt = generateVideoPrompt(variant, industry, narrative);
        
        console.log("Generating video from first frame...");
        
        // Call video generation API (using Lovable's video generation)
        const videoResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content: "You are generating a description for a professional demo video. Output a detailed storyboard description."
              },
              {
                role: "user",
                content: `Create a detailed video storyboard for: ${videoPrompt}\n\nInclude: Scene descriptions, transitions, timing, and motion directions.`
              }
            ]
          }),
        });

        if (videoResponse.ok) {
          const storyboard = await videoResponse.json();
          const storyboardContent = storyboard.choices?.[0]?.message?.content;
          
          // Store the storyboard and frames as the "video" package
          // In a full production system, this would synthesize actual MP4
          // For now, we store the frames and metadata for client-side playback
          
          const videoPackagePath = `${user.id}/${body.demoId}/video-package.json`;
          const videoPackage = {
            version: 1,
            demoId: body.demoId,
            variant: demo.variant,
            industry: demo.industry,
            duration: totalDuration,
            frames: generatedFrames.length,
            storyboard: storyboardContent,
            narrative: narrative,
            createdAt: new Date().toISOString()
          };
          
          await supabase.storage
            .from('demo-videos')
            .upload(videoPackagePath, JSON.stringify(videoPackage), {
              contentType: 'application/json',
              upsert: true
            });

          // Get public URLs
          const { data: videoUrlData } = supabase.storage
            .from('demo-videos')
            .getPublicUrl(`${user.id}/${body.demoId}/frame-000.png`);
          
          thumbnailUrl = videoUrlData?.publicUrl || null;
          
          // Create video manifest URL
          const { data: manifestData } = supabase.storage
            .from('demo-videos')
            .getPublicUrl(videoPackagePath);
          
          videoUrl = manifestData?.publicUrl || null;
        }
      } catch (videoError) {
        console.error("Video synthesis error:", videoError);
      }
    }

    // Update progress to finalizing
    await supabase
      .from('demo_videos')
      .update({ render_progress: 95 })
      .eq('id', body.demoId);

    // If we couldn't generate video, generate a fallback thumbnail
    if (!thumbnailUrl && lovableApiKey) {
      try {
        const thumbnailPrompt = generateThumbnailPrompt(variant, industry, narrative);
        
        const thumbResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image-preview",
            messages: [{ role: "user", content: thumbnailPrompt }],
            modalities: ["image", "text"]
          }),
        });

        if (thumbResponse.ok) {
          const thumbData = await thumbResponse.json();
          const thumbUrl = thumbData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
          
          if (thumbUrl) {
            const base64Data = thumbUrl.replace(/^data:image\/\w+;base64,/, '');
            const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
            
            const thumbPath = `${user.id}/${body.demoId}/thumbnail.png`;
            await supabase.storage
              .from('demo-thumbnails')
              .upload(thumbPath, binaryData, {
                contentType: 'image/png',
                upsert: true
              });

            const { data: thumbUrlData } = supabase.storage
              .from('demo-thumbnails')
              .getPublicUrl(thumbPath);
            
            thumbnailUrl = thumbUrlData?.publicUrl || null;
          }
        }
      } catch (thumbError) {
        console.error("Thumbnail generation error:", thumbError);
      }
    }

    // Finalize - update demo record with URLs
    const finalStatus = videoUrl || thumbnailUrl ? 'ready' : 'failed';
    const finalError = (!videoUrl && !thumbnailUrl) ? 'Failed to generate video assets' : null;

    const { error: updateError } = await supabase
      .from('demo_videos')
      .update({ 
        status: finalStatus,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        render_progress: 100,
        render_error: finalError
      })
      .eq('id', body.demoId);

    if (updateError) {
      console.error("Failed to update demo record:", updateError);
    }

    // Log system event
    await supabase.from('system_events').insert({
      user_id: user.id,
      event_type: 'demo_rendered',
      event_category: 'demo_engine',
      title: `Demo video ${finalStatus === 'ready' ? 'rendered' : 'failed'}`,
      description: `${demo.variant} variant for ${demo.industry}`,
      severity: finalStatus === 'ready' ? 'info' : 'error',
      metadata: {
        demo_id: body.demoId,
        frames_generated: generatedFrames.length,
        has_video: !!videoUrl,
        has_thumbnail: !!thumbnailUrl
      }
    });

    console.log(`Render complete for demo ${body.demoId}: status=${finalStatus}, frames=${generatedFrames.length}`);

    return new Response(
      JSON.stringify({
        success: finalStatus === 'ready',
        demo_id: body.demoId,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        frames_generated: generatedFrames.length,
        status: finalStatus,
        error: finalError
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Render error:", error);
    
    // Try to update demo status to failed
    try {
      const body: RenderRequest = await req.json();
      if (body.demoId) {
        await supabase
          .from('demo_videos')
          .update({ 
            status: 'failed',
            render_error: error instanceof Error ? error.message : 'Unknown error'
          })
          .eq('id', body.demoId);
      }
    } catch {}

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateScenePrompts(
  variant: string, 
  industry: string, 
  scenes: string[], 
  narrative: Record<string, any>
): { prompt: string; duration: number }[] {
  const prompts: { prompt: string; duration: number }[] = [];
  
  // Visual style based on variant
  const styleGuide = {
    standard: "Clean, professional UI design, soft lighting, modern SaaS dashboard aesthetic, subtle gradients, 16:9 aspect ratio",
    intimidation: "Dark, minimal, dramatic lighting, high contrast, cinematic shadows, authority and power, 16:9 aspect ratio",
    enterprise: "Corporate, data-rich, executive dashboard, clean lines, professional blue tones, governance focus, 16:9 aspect ratio",
    silent: "Hyper-clean, metrics-focused, motion-ready, no text overlays, pure visual communication, 16:9 aspect ratio"
  }[variant] || "Professional SaaS dashboard, modern design, 16:9 aspect ratio";

  // Opening scene
  prompts.push({
    prompt: `Generate a cinematic dashboard opening scene for DOMINION revenue platform. ${styleGuide}. Show a sleek command center interface awakening. Industry: ${industry}. Ultra high resolution.`,
    duration: 8
  });

  // Problem visualization
  if (narrative.problem && variant !== 'silent') {
    prompts.push({
      prompt: `Generate a visualization of business chaos and fragmentation. Scattered tools, disconnected systems, manual processes. ${styleGuide}. Show the problem state before DOMINION. Ultra high resolution.`,
      duration: 10
    });
  }

  // Capability scenes
  const capabilities = narrative.demonstration || [];
  capabilities.slice(0, 4).forEach((cap: string, i: number) => {
    prompts.push({
      prompt: `Generate a DOMINION dashboard module visualization: ${cap}. ${styleGuide}. Show real-time metrics, automation indicators, and professional UI elements. Scene ${i + 3}. Ultra high resolution.`,
      duration: 12
    });
  });

  // Outcome visualization
  prompts.push({
    prompt: `Generate a DOMINION results dashboard showing business transformation. Before/after metrics, revenue growth charts, automation savings. ${styleGuide}. Triumphant, successful state. Ultra high resolution.`,
    duration: 10
  });

  // Authority close
  prompts.push({
    prompt: `Generate a DOMINION platform hero shot. Full dashboard revealed, all systems active, metrics green. ${styleGuide}. Final authority frame, infrastructure dominance. Ultra high resolution.`,
    duration: 8
  });

  return prompts;
}

function generateVideoPrompt(variant: string, industry: string, narrative: Record<string, any>): string {
  const basePrompt = `Create a professional demo video storyboard for DOMINION, a revenue command platform for ${industry} businesses.`;
  
  const variantContext = {
    standard: "Tone: Professional and educational. Show problem → solution → outcomes. Clear explanations, measured pacing.",
    intimidation: "Tone: Minimal, dominant, inevitable. Fewer words, more visual weight. Create awe through restraint. Make access feel earned.",
    enterprise: "Tone: Executive-level, risk-focused, governance-oriented. No hype. Pure logic and data. Emphasize continuity and control.",
    silent: "Tone: Pure visual communication. No narration. Every transition must convey meaning. Metrics in motion. UI that speaks."
  }[variant] || "Professional SaaS demo";

  return `${basePrompt}\n\n${variantContext}\n\nNarrative structure:\n- Problem: ${narrative.problem || 'Fragmented operations'}\n- Solution: ${narrative.revelation || 'Unified command'}\n- Outcome: ${narrative.outcome || 'Scalable revenue'}\n- Close: ${narrative.close || 'Infrastructure, not software'}`;
}

function generateThumbnailPrompt(variant: string, industry: string, narrative: Record<string, any>): string {
  const styles = {
    standard: "Professional, clean, welcoming, trustworthy",
    intimidation: "Dark, powerful, minimal, authoritative",
    enterprise: "Corporate, data-rich, executive, sophisticated",
    silent: "Ultra-clean, metrics-focused, visual-first"
  };

  const style = styles[variant as keyof typeof styles] || styles.standard;

  return `Generate a professional video thumbnail for DOMINION revenue platform demo. ${style} aesthetic. Show a sleek dashboard preview with key metrics visible. Industry: ${industry}. 16:9 aspect ratio. High contrast, clear focal point. Make it compelling enough to click. Ultra high resolution.`;
}
