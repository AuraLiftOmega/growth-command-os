import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface NotificationPayload {
  user_id?: string;
  user_ids?: string[];
  organization_id?: string;
  title: string;
  body: string;
  icon?: string;
  image_url?: string;
  action_url?: string;
  action_label?: string;
  category?: string;
  priority?: "low" | "normal" | "high" | "critical";
  channel?: "in_app" | "push" | "email" | "discord" | "all";
  group_key?: string;
  dedup_key?: string;
  source_type?: string;
  source_id?: string;
  metadata?: Record<string, unknown>;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const payload: NotificationPayload = await req.json();
    console.log("[OMEGA-NOTIFY] Incoming:", JSON.stringify({ title: payload.title, channel: payload.channel, priority: payload.priority }));

    // Resolve target users
    const targetUsers: string[] = [];
    if (payload.user_id) targetUsers.push(payload.user_id);
    if (payload.user_ids) targetUsers.push(...payload.user_ids);

    // If organization_id provided and no users, notify all org members
    if (payload.organization_id && targetUsers.length === 0) {
      const { data: members } = await supabase
        .from("organization_members")
        .select("user_id")
        .eq("organization_id", payload.organization_id);
      if (members) targetUsers.push(...members.map((m: { user_id: string }) => m.user_id));
    }

    if (targetUsers.length === 0) {
      throw new Error("No target users specified");
    }

    const channel = payload.channel || "in_app";
    const priority = payload.priority || "normal";
    const results: Record<string, unknown>[] = [];

    for (const userId of targetUsers) {
      // Check dedup
      if (payload.dedup_key) {
        const { data: existing } = await supabase
          .from("notifications")
          .select("id")
          .eq("dedup_key", payload.dedup_key)
          .eq("user_id", userId)
          .maybeSingle();
        if (existing) {
          console.log(`[OMEGA-NOTIFY] Dedup hit for ${payload.dedup_key}, skipping user ${userId}`);
          continue;
        }
      }

      // Fetch user preferences
      const { data: prefs } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      // Smart channel routing
      const channels = resolveChannels(channel, priority, prefs);
      console.log(`[OMEGA-NOTIFY] User ${userId} → channels: ${channels.join(", ")}`);

      // Insert notification record
      const { data: notification, error: insertErr } = await supabase
        .from("notifications")
        .insert({
          user_id: userId,
          organization_id: payload.organization_id,
          title: payload.title,
          body: payload.body,
          icon: payload.icon || "bell",
          image_url: payload.image_url,
          action_url: payload.action_url,
          action_label: payload.action_label,
          category: payload.category || "system",
          priority,
          channel,
          group_key: payload.group_key,
          dedup_key: payload.dedup_key,
          source_type: payload.source_type,
          source_id: payload.source_id,
          metadata: payload.metadata || {},
        })
        .select("id")
        .single();

      if (insertErr) {
        console.error(`[OMEGA-NOTIFY] Insert failed:`, insertErr);
        continue;
      }

      const deliveryResults: Record<string, string> = {};

      // Dispatch to each channel
      for (const ch of channels) {
        const chStart = Date.now();
        let status = "sent";
        let errorMsg: string | null = null;
        let provider: string | null = null;

        try {
          switch (ch) {
            case "in_app":
              // Already inserted — realtime subscription handles delivery
              provider = "supabase_realtime";
              break;

            case "push":
              provider = "web_push";
              await sendWebPush(supabase, userId, payload);
              break;

            case "email":
              provider = "resend";
              await sendEmail(userId, payload, supabase);
              break;

            case "discord":
              provider = "discord_webhook";
              await sendDiscord(payload);
              break;
          }
        } catch (err) {
          status = "failed";
          errorMsg = err instanceof Error ? err.message : String(err);
          console.error(`[OMEGA-NOTIFY] ${ch} delivery failed:`, errorMsg);
        }

        deliveryResults[ch] = status;

        // Log delivery
        await supabase.from("notification_delivery_log").insert({
          notification_id: notification.id,
          channel: ch,
          status,
          provider,
          error_message: errorMsg,
          latency_ms: Date.now() - chStart,
        });
      }

      // Update notification delivery_status
      await supabase
        .from("notifications")
        .update({ delivery_status: deliveryResults })
        .eq("id", notification.id);

      results.push({ user_id: userId, notification_id: notification.id, channels: deliveryResults });
    }

    const totalMs = Date.now() - startTime;
    console.log(`[OMEGA-NOTIFY] Complete in ${totalMs}ms — ${results.length} users notified`);

    return new Response(JSON.stringify({ success: true, results, latency_ms: totalMs }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[OMEGA-NOTIFY] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ─── Channel Resolution Engine ───────────────────────────────
function resolveChannels(
  requested: string,
  priority: string,
  prefs: Record<string, unknown> | null
): string[] {
  const channels: string[] = [];

  if (requested === "all") {
    if (!prefs || prefs.in_app_enabled !== false) channels.push("in_app");
    if (!prefs || prefs.push_enabled !== false) channels.push("push");
    if (!prefs || prefs.email_enabled !== false) channels.push("email");
    if (prefs?.discord_enabled) channels.push("discord");
  } else {
    channels.push(requested);
  }

  // Critical priority → force push + in_app regardless of prefs
  if (priority === "critical") {
    if (!channels.includes("in_app")) channels.push("in_app");
    if (!channels.includes("push")) channels.push("push");
    if (Deno.env.get("DISCORD_WEBHOOK_URL")) {
      if (!channels.includes("discord")) channels.push("discord");
    }
  }

  return [...new Set(channels)];
}

// ─── Web Push Delivery ───────────────────────────────────────
async function sendWebPush(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  payload: NotificationPayload
) {
  const { data: subscriptions } = await supabase
    .from("push_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true);

  if (!subscriptions?.length) {
    console.log(`[OMEGA-NOTIFY] No push subscriptions for user ${userId}`);
    return;
  }

  const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
  const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");

  if (!vapidPublicKey || !vapidPrivateKey) {
    console.log("[OMEGA-NOTIFY] VAPID keys not configured, skipping push");
    return;
  }

  // Send to all active subscriptions
  for (const sub of subscriptions) {
    try {
      const pushPayload = JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: payload.icon || "/icon-192.png",
        badge: "/badge-72.png",
        data: {
          action_url: payload.action_url,
          category: payload.category,
          priority: payload.priority,
        },
      });

      // Use Web Push protocol via fetch
      const response = await fetch(sub.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", TTL: "86400" },
        body: pushPayload,
      });

      if (!response.ok && response.status === 410) {
        // Subscription expired
        await supabase
          .from("push_subscriptions")
          .update({ is_active: false })
          .eq("id", sub.id);
        console.log(`[OMEGA-NOTIFY] Push sub ${sub.id} expired, deactivated`);
      }

      await supabase
        .from("push_subscriptions")
        .update({ last_used_at: new Date().toISOString() })
        .eq("id", sub.id);
    } catch (err) {
      const failCount = (sub.failed_count || 0) + 1;
      await supabase
        .from("push_subscriptions")
        .update({ failed_count: failCount, is_active: failCount < 5 })
        .eq("id", sub.id);
      console.error(`[OMEGA-NOTIFY] Push to ${sub.id} failed (count: ${failCount}):`, err);
    }
  }
}

// ─── Email Delivery (Resend) ─────────────────────────────────
async function sendEmail(
  userId: string,
  payload: NotificationPayload,
  supabase: ReturnType<typeof createClient>
) {
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) {
    console.log("[OMEGA-NOTIFY] RESEND_API_KEY not set, skipping email");
    return;
  }

  // Get user email
  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("user_id", userId)
    .maybeSingle();

  if (!profile?.email) {
    console.log(`[OMEGA-NOTIFY] No email for user ${userId}`);
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "OMEGA <notifications@omegaalpha.io>",
      to: [profile.email],
      subject: payload.title,
      html: buildEmailHtml(payload),
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Resend API error: ${response.status} — ${err}`);
  }

  console.log(`[OMEGA-NOTIFY] Email sent to ${profile.email}`);
}

function buildEmailHtml(payload: NotificationPayload): string {
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#0a0a0a;color:#fafafa;border-radius:12px;">
      <div style="border-bottom:1px solid #222;padding-bottom:16px;margin-bottom:24px;">
        <h1 style="margin:0;font-size:20px;color:#22d3ee;">⚡ ${payload.title}</h1>
      </div>
      <p style="font-size:15px;line-height:1.6;color:#d4d4d8;margin:0 0 24px;">${payload.body}</p>
      ${payload.action_url ? `<a href="${payload.action_url}" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#06b6d4,#8b5cf6);color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">${payload.action_label || "View Details"}</a>` : ""}
      <div style="margin-top:32px;padding-top:16px;border-top:1px solid #222;font-size:11px;color:#71717a;">
        OMEGA Notification Engine • Powered by MASTER_OS
      </div>
    </div>
  `;
}

// ─── Discord Delivery ────────────────────────────────────────
async function sendDiscord(payload: NotificationPayload) {
  const webhookUrl = Deno.env.get("DISCORD_WEBHOOK_URL");
  if (!webhookUrl) {
    console.log("[OMEGA-NOTIFY] DISCORD_WEBHOOK_URL not set, skipping discord");
    return;
  }

  const priorityColors: Record<string, number> = {
    low: 0x71717a,
    normal: 0x22d3ee,
    high: 0xf59e0b,
    critical: 0xef4444,
  };

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embeds: [
        {
          title: `⚡ ${payload.title}`,
          description: payload.body,
          color: priorityColors[payload.priority || "normal"],
          fields: [
            { name: "Category", value: payload.category || "system", inline: true },
            { name: "Priority", value: (payload.priority || "normal").toUpperCase(), inline: true },
            ...(payload.source_type ? [{ name: "Source", value: `${payload.source_type}/${payload.source_id || "—"}`, inline: true }] : []),
          ],
          timestamp: new Date().toISOString(),
          footer: { text: "OMEGA Notification Engine" },
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Discord webhook failed: ${response.status}`);
  }

  console.log("[OMEGA-NOTIFY] Discord webhook sent");
}
