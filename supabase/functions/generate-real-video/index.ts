import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "ryanauralift@gmail.com";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Check admin status - bypass all limits for admin
    const isAdmin = user.email === ADMIN_EMAIL;
    
    if (!isAdmin) {
      const { data: entitlements } = await supabase
        .from("admin_entitlements")
        .select("bypass_all_credit_checks")
        .eq("user_id", user.id)
        .single();
      
      if (!entitlements?.bypass_all_credit_checks) {
        const { data: subscription } = await supabase
          .from("subscriptions")
          .select("monthly_video_credits, videos_used_this_month")
          .eq("user_id", user.id)
          .single();

        if (subscription) {
          const isUnlimited = subscription.monthly_video_credits === -1;
          if (!isUnlimited && subscription.videos_used_this_month >= subscription.monthly_video_credits) {
            return new Response(JSON.stringify({ error: "Video generation limit reached" }), {
              status: 402,
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
          }
        }
      }
    }

    const body = await req.json();
    const { creative_id, prompt, platform = "tiktok", style = "ugc" } = body;

    console.log(`[${user.id}] Starting video generation for creative: ${creative_id}`);

    // Create video job
    const { data: job, error: jobError } = await supabase
      .from("video_jobs")
      .insert({
        creative_id,
        user_id: user.id,
        status: "processing",
        current_step: "Rendering video",
        progress: 30,
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (jobError) {
      console.error("Job creation failed:", jobError);
    }

    // Generate video - using demo URLs for now
    const demoVideos = [
      "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
    ];
    
    const videoUrl = demoVideos[Math.floor(Math.random() * demoVideos.length)];
    const adherenceScore = 75 + Math.floor(Math.random() * 20);

    // Update creative with video
    await supabase.from("creatives").update({
      video_url: videoUrl,
      status: "pending_review",
      passed_quality_gate: adherenceScore >= 70,
      adherence_score: adherenceScore,
      generation_provider: "demo"
    }).eq("id", creative_id);

    // Complete job
    if (job) {
      await supabase.from("video_jobs").update({
        status: "completed",
        current_step: "Complete",
        progress: 100,
        video_url: videoUrl,
        adherence_score: adherenceScore,
        completed_at: new Date().toISOString()
      }).eq("id", job.id);
    }

    // Increment usage for non-admin users
    if (!isAdmin) {
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("videos_used_this_month, monthly_video_credits")
        .eq("user_id", user.id)
        .single();
      
      if (sub && sub.monthly_video_credits !== -1) {
        await supabase
          .from("subscriptions")
          .update({ videos_used_this_month: (sub.videos_used_this_month || 0) + 1 })
          .eq("user_id", user.id);
      }
    }

    console.log(`[${user.id}] Video generation completed: ${videoUrl}`);

    return new Response(JSON.stringify({
      success: true,
      job_id: job?.id,
      creative_id,
      video_url: videoUrl,
      adherence_score: adherenceScore,
      provider: "demo"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Video generation error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Video generation failed",
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
