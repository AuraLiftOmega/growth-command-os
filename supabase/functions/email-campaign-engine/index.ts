import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

async function sendViaResend(to: string, subject: string, html: string, fromName = "MASTER_OS", fromEmail = "onboarding@resend.dev") {
  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
    body: JSON.stringify({ from: `${fromName} <${fromEmail}>`, to: [to], subject, html }),
  });
  if (!resp.ok) throw new Error(`Resend error: ${await resp.text()}`);
  return resp.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;

    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
      userId = user?.id || null;
    }

    const body = await req.json();
    const { action } = body;
    console.log(`[EmailEngine] Action: ${action}, User: ${userId}`);

    switch (action) {
      // ========== SEND BROADCAST CAMPAIGN ==========
      case "send_campaign": {
        const { campaign_id } = body;
        if (!userId || !campaign_id) throw new Error("Missing campaign_id or auth");

        const { data: campaign } = await supabase
          .from("email_campaigns").select("*").eq("id", campaign_id).eq("user_id", userId).single();
        if (!campaign) throw new Error("Campaign not found");

        // Get subscribers from list
        let subscribers: any[] = [];
        if (campaign.list_id) {
          const { data: members } = await supabase
            .from("email_list_members").select("subscriber_id").eq("list_id", campaign.list_id);
          if (members?.length) {
            const ids = members.map(m => m.subscriber_id);
            const { data: subs } = await supabase
              .from("email_subscribers").select("*").in("id", ids).eq("status", "active").eq("user_id", userId);
            subscribers = subs || [];
          }
        } else {
          // Send to all active subscribers
          const { data: subs } = await supabase
            .from("email_subscribers").select("*").eq("user_id", userId).eq("status", "active").limit(500);
          subscribers = subs || [];
        }

        // Update campaign status
        await supabase.from("email_campaigns").update({ status: "sending", sent_at: new Date().toISOString() }).eq("id", campaign_id);

        let sent = 0, failed = 0;
        for (const sub of subscribers) {
          try {
            // Personalize content
            let html = campaign.html_content
              .replace(/{{first_name}}/g, sub.first_name || "there")
              .replace(/{{email}}/g, sub.email)
              .replace(/{{last_name}}/g, sub.last_name || "");

            const result = await sendViaResend(sub.email, campaign.subject, html, campaign.from_name);

            await supabase.from("email_send_log").insert({
              user_id: userId, subscriber_id: sub.id, campaign_id,
              resend_id: result.id, to_email: sub.email, subject: campaign.subject, status: "sent",
            });

            await supabase.from("email_subscribers").update({
              last_email_at: new Date().toISOString(),
              total_emails_sent: (sub.total_emails_sent || 0) + 1,
            }).eq("id", sub.id);

            sent++;
          } catch (e) {
            console.error(`Failed to send to ${sub.email}:`, e);
            failed++;
          }
        }

        await supabase.from("email_campaigns").update({
          status: "sent", total_sent: sent, total_delivered: sent,
        }).eq("id", campaign_id);

        return new Response(JSON.stringify({ success: true, sent, failed, total: subscribers.length }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ========== ENROLL IN SEQUENCE ==========
      case "enroll_sequence": {
        const { sequence_id, subscriber_email, subscriber_data } = body;
        if (!userId) throw new Error("Auth required");

        // Find or create subscriber
        let { data: subscriber } = await supabase
          .from("email_subscribers").select("*")
          .eq("user_id", userId).eq("email", subscriber_email).single();

        if (!subscriber) {
          const { data: newSub } = await supabase.from("email_subscribers").insert({
            user_id: userId, email: subscriber_email,
            first_name: subscriber_data?.first_name, last_name: subscriber_data?.last_name,
            source: subscriber_data?.source || "sequence",
          }).select().single();
          subscriber = newSub;
        }
        if (!subscriber) throw new Error("Failed to create subscriber");

        const { data: sequence } = await supabase
          .from("email_sequences").select("*").eq("id", sequence_id).eq("user_id", userId).single();
        if (!sequence) throw new Error("Sequence not found");

        const steps = (sequence.steps as any[]) || [];
        const firstDelay = steps[0]?.delay_hours || 0;

        const { data: enrollment } = await supabase.from("email_sequence_enrollments").insert({
          sequence_id, subscriber_id: subscriber.id, user_id: userId,
          current_step: 0, status: "active",
          next_email_at: new Date(Date.now() + firstDelay * 3600000).toISOString(),
        }).select().single();

        await supabase.from("email_sequences").update({
          total_enrolled: (sequence.total_enrolled || 0) + 1,
        }).eq("id", sequence_id);

        return new Response(JSON.stringify({ success: true, enrollment_id: enrollment?.id }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ========== PROCESS SEQUENCE QUEUE (cron-callable) ==========
      case "process_sequences": {
        const now = new Date().toISOString();
        const { data: dueEmails } = await supabase
          .from("email_sequence_enrollments").select("*, email_sequences(*), email_subscribers(*)")
          .eq("status", "active").lte("next_email_at", now).limit(100);

        let processed = 0;
        for (const enrollment of (dueEmails || [])) {
          const sequence = enrollment.email_sequences;
          const subscriber = enrollment.email_subscribers;
          if (!sequence || !subscriber) continue;

          const steps = (sequence.steps as any[]) || [];
          const currentStep = steps[enrollment.current_step];
          if (!currentStep) {
            await supabase.from("email_sequence_enrollments").update({
              status: "completed", completed_at: now,
            }).eq("id", enrollment.id);
            continue;
          }

          try {
            let html = (currentStep.html_content || "")
              .replace(/{{first_name}}/g, subscriber.first_name || "there")
              .replace(/{{email}}/g, subscriber.email);

            const result = await sendViaResend(subscriber.email, currentStep.subject || "Update", html);

            await supabase.from("email_send_log").insert({
              user_id: enrollment.user_id, subscriber_id: subscriber.id,
              sequence_id: sequence.id, resend_id: result.id,
              to_email: subscriber.email, subject: currentStep.subject, status: "sent",
            });

            const nextStepIdx = enrollment.current_step + 1;
            const nextStep = steps[nextStepIdx];
            await supabase.from("email_sequence_enrollments").update({
              current_step: nextStepIdx,
              status: nextStep ? "active" : "completed",
              next_email_at: nextStep ? new Date(Date.now() + (nextStep.delay_hours || 24) * 3600000).toISOString() : null,
              completed_at: nextStep ? null : now,
            }).eq("id", enrollment.id);

            processed++;
          } catch (e) {
            console.error(`Sequence send error:`, e);
          }
        }

        return new Response(JSON.stringify({ success: true, processed }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ========== ADD SUBSCRIBER ==========
      case "add_subscriber": {
        const { email, first_name, last_name, source, tags, list_id } = body;
        if (!userId) throw new Error("Auth required");

        const { data: sub, error } = await supabase.from("email_subscribers").upsert({
          user_id: userId, email, first_name, last_name, source: source || "manual", tags: tags || [],
        }, { onConflict: "user_id,email" }).select().single();

        if (error) throw error;

        if (list_id && sub) {
          await supabase.from("email_list_members").upsert({
            list_id, subscriber_id: sub.id,
          }, { onConflict: "list_id,subscriber_id" });
        }

        return new Response(JSON.stringify({ success: true, subscriber: sub }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (err: any) {
    console.error("[EmailEngine] Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
