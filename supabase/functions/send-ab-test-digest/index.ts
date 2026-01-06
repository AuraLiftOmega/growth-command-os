import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestSummary {
  id: string;
  name: string;
  status: 'running' | 'paused' | 'completed' | 'winner_declared';
  confidence: number;
  improvement?: number;
  totalViews: number;
  totalConversions: number;
  revenueAttributed: number;
  winnerName?: string;
  daysRunning: number;
}

interface DigestRequest {
  recipientEmail: string;
  recipientName?: string;
  digestType: 'daily' | 'weekly';
  tests: TestSummary[];
  totalActiveTests: number;
  totalRevenue: number;
  topPerformer?: TestSummary;
  dashboardUrl?: string;
}

const generateDigestHtml = (data: DigestRequest): string => {
  const {
    digestType,
    tests,
    totalActiveTests,
    totalRevenue,
    topPerformer,
    dashboardUrl,
    recipientName,
  } = data;

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatNumber = (num: number) => 
    new Intl.NumberFormat('en-US').format(num);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return '#3B82F6';
      case 'completed': return '#10B981';
      case 'winner_declared': return '#F59E0B';
      case 'paused': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'running': return '🔄 Running';
      case 'completed': return '✅ Completed';
      case 'winner_declared': return '🏆 Winner Declared';
      case 'paused': return '⏸️ Paused';
      default: return status;
    }
  };

  const periodLabel = digestType === 'daily' ? 'Today' : 'This Week';
  const headerColor = digestType === 'daily' ? '#8B5CF6' : '#3B82F6';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${digestType === 'daily' ? 'Daily' : 'Weekly'} A/B Test Digest</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${headerColor}, ${headerColor}dd); padding: 40px 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
              <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0 0 8px;">
                ${digestType === 'daily' ? 'Daily' : 'Weekly'} A/B Test Digest
              </h1>
              <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; margin: 0;">
                ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 30px 40px 20px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0;">
                Hi${recipientName ? ` ${recipientName}` : ''},
              </p>
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 16px 0 0;">
                Here's your ${digestType} summary of all A/B test activity.
              </p>
            </td>
          </tr>

          <!-- Overview Stats -->
          <tr>
            <td style="padding: 0 40px 20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="33%" style="padding: 8px;">
                    <div style="background-color: #F3F4F6; border-radius: 8px; padding: 16px; text-align: center;">
                      <p style="color: #6B7280; font-size: 12px; margin: 0 0 4px; text-transform: uppercase;">Active Tests</p>
                      <p style="color: #374151; font-size: 28px; font-weight: 700; margin: 0;">${totalActiveTests}</p>
                    </div>
                  </td>
                  <td width="33%" style="padding: 8px;">
                    <div style="background-color: #ECFDF5; border-radius: 8px; padding: 16px; text-align: center;">
                      <p style="color: #6B7280; font-size: 12px; margin: 0 0 4px; text-transform: uppercase;">Total Revenue</p>
                      <p style="color: #10B981; font-size: 28px; font-weight: 700; margin: 0;">${formatCurrency(totalRevenue)}</p>
                    </div>
                  </td>
                  <td width="33%" style="padding: 8px;">
                    <div style="background-color: #FEF3C7; border-radius: 8px; padding: 16px; text-align: center;">
                      <p style="color: #6B7280; font-size: 12px; margin: 0 0 4px; text-transform: uppercase;">Tests ${periodLabel}</p>
                      <p style="color: #F59E0B; font-size: 28px; font-weight: 700; margin: 0;">${tests.length}</p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${topPerformer ? `
          <!-- Top Performer -->
          <tr>
            <td style="padding: 0 40px 20px;">
              <div style="background: linear-gradient(135deg, #FEF3C7, #FDE68A); border-radius: 8px; padding: 20px; border-left: 4px solid #F59E0B;">
                <div style="margin-bottom: 12px;">
                  <span style="font-size: 20px; margin-right: 8px;">🏆</span>
                  <span style="color: #92400E; font-weight: 700; font-size: 16px;">Top Performer</span>
                </div>
                <p style="color: #78350F; font-size: 18px; font-weight: 600; margin: 0 0 8px;">${topPerformer.name}</p>
                <p style="color: #92400E; font-size: 14px; margin: 0;">
                  ${topPerformer.confidence.toFixed(1)}% confidence 
                  ${topPerformer.improvement ? `• +${topPerformer.improvement.toFixed(1)}% improvement` : ''}
                  • ${formatCurrency(topPerformer.revenueAttributed)} revenue
                </p>
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- Test List -->
          <tr>
            <td style="padding: 0 40px 20px;">
              <h3 style="color: #374151; font-size: 16px; font-weight: 600; margin: 0 0 16px;">All Tests</h3>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F9FAFB; border-radius: 8px; overflow: hidden;">
                ${tests.map((test, index) => `
                <tr style="background-color: ${index % 2 === 0 ? '#F9FAFB' : '#FFFFFF'};">
                  <td style="padding: 16px; border-bottom: 1px solid #E5E7EB;">
                    <div style="margin-bottom: 8px;">
                      <span style="display: inline-block; background-color: ${getStatusColor(test.status)}20; color: ${getStatusColor(test.status)}; font-size: 11px; font-weight: 600; padding: 4px 8px; border-radius: 4px;">
                        ${getStatusLabel(test.status)}
                      </span>
                    </div>
                    <p style="color: #374151; font-size: 15px; font-weight: 600; margin: 0 0 4px;">${test.name}</p>
                    <p style="color: #6B7280; font-size: 13px; margin: 0;">
                      ${test.confidence.toFixed(1)}% confidence • ${formatNumber(test.totalViews)} views • ${formatNumber(test.totalConversions)} conversions
                      ${test.winnerName ? ` • Winner: ${test.winnerName}` : ''}
                    </p>
                    ${test.improvement ? `
                    <p style="color: #10B981; font-size: 13px; font-weight: 600; margin: 4px 0 0;">
                      +${test.improvement.toFixed(1)}% improvement • ${formatCurrency(test.revenueAttributed)} attributed
                    </p>
                    ` : ''}
                  </td>
                </tr>
                `).join('')}
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 40px 30px; text-align: center;">
              <a href="${dashboardUrl || '#'}" style="display: inline-block; background: linear-gradient(135deg, ${headerColor}, ${headerColor}dd); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; padding: 14px 32px; border-radius: 8px;">
                View All Tests →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F9FAFB; padding: 24px 40px; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="color: #6B7280; font-size: 14px; margin: 0 0 8px;">
                Sent by <strong>DOMINION</strong> A/B Testing Engine
              </p>
              <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
                You're receiving this ${digestType} digest. Manage preferences in your dashboard.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

// Generate Slack message blocks
const generateSlackBlocks = (data: DigestRequest) => {
  const { digestType, tests, totalActiveTests, totalRevenue, topPerformer } = data;
  
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const blocks: any[] = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `📊 ${digestType === 'daily' ? 'Daily' : 'Weekly'} A/B Test Digest`,
        emoji: true
      }
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `*${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}*`
        }
      ]
    },
    {
      type: "divider"
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*Active Tests*\n${totalActiveTests}`
        },
        {
          type: "mrkdwn",
          text: `*Total Revenue*\n${formatCurrency(totalRevenue)}`
        }
      ]
    },
  ];

  if (topPerformer) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `🏆 *Top Performer: ${topPerformer.name}*\n${topPerformer.confidence.toFixed(1)}% confidence${topPerformer.improvement ? ` • +${topPerformer.improvement.toFixed(1)}% improvement` : ''}`
      }
    });
  }

  blocks.push({ type: "divider" });

  tests.slice(0, 5).forEach(test => {
    const statusEmoji = test.status === 'running' ? '🔄' : test.status === 'winner_declared' ? '🏆' : test.status === 'completed' ? '✅' : '⏸️';
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `${statusEmoji} *${test.name}*\n${test.confidence.toFixed(1)}% confidence • ${test.totalViews} views${test.improvement ? ` • +${test.improvement.toFixed(1)}%` : ''}`
      }
    });
  });

  if (tests.length > 5) {
    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `_And ${tests.length - 5} more tests..._`
        }
      ]
    });
  }

  return { blocks };
};

// Generate Discord embed
const generateDiscordEmbed = (data: DigestRequest) => {
  const { digestType, tests, totalActiveTests, totalRevenue, topPerformer, dashboardUrl } = data;
  
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const fields = [
    { name: '📈 Active Tests', value: String(totalActiveTests), inline: true },
    { name: '💰 Total Revenue', value: formatCurrency(totalRevenue), inline: true },
    { name: '📊 Tests in Period', value: String(tests.length), inline: true },
  ];

  if (topPerformer) {
    fields.push({
      name: '🏆 Top Performer',
      value: `**${topPerformer.name}**\n${topPerformer.confidence.toFixed(1)}% confidence${topPerformer.improvement ? ` • +${topPerformer.improvement.toFixed(1)}%` : ''}`,
      inline: false,
    });
  }

  tests.slice(0, 5).forEach(test => {
    const statusEmoji = test.status === 'running' ? '🔄' : test.status === 'winner_declared' ? '🏆' : test.status === 'completed' ? '✅' : '⏸️';
    fields.push({
      name: `${statusEmoji} ${test.name}`,
      value: `${test.confidence.toFixed(1)}% confidence • ${test.totalViews} views${test.improvement ? ` • +${test.improvement.toFixed(1)}%` : ''}`,
      inline: false,
    });
  });

  return {
    embeds: [{
      title: `📊 ${digestType === 'daily' ? 'Daily' : 'Weekly'} A/B Test Digest`,
      description: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
      color: digestType === 'daily' ? 0x8B5CF6 : 0x3B82F6,
      fields,
      footer: { text: 'DOMINION A/B Testing Engine' },
      timestamp: new Date().toISOString(),
      url: dashboardUrl,
    }]
  };
};

const handler = async (req: Request): Promise<Response> => {
  console.log("A/B Test digest request received");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { 
      type, // 'email', 'slack', 'discord'
      webhookUrl,
      ...data 
    } = body as DigestRequest & { type: string; webhookUrl?: string };

    console.log(`Processing ${type} digest notification`);

    if (type === 'slack' && webhookUrl) {
      const slackPayload = generateSlackBlocks(data);
      const slackResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slackPayload),
      });

      if (!slackResponse.ok) {
        throw new Error(`Slack webhook failed: ${slackResponse.statusText}`);
      }

      console.log("Slack notification sent successfully");
      return new Response(
        JSON.stringify({ success: true, message: "Slack notification sent" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (type === 'discord' && webhookUrl) {
      const discordPayload = generateDiscordEmbed(data);
      const discordResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discordPayload),
      });

      if (!discordResponse.ok) {
        throw new Error(`Discord webhook failed: ${discordResponse.statusText}`);
      }

      console.log("Discord notification sent successfully");
      return new Response(
        JSON.stringify({ success: true, message: "Discord notification sent" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Default: Email digest
    if (!data.recipientEmail) {
      return new Response(
        JSON.stringify({ error: "recipientEmail is required for email digest" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const html = generateDigestHtml(data);
    const subject = `📊 Your ${data.digestType === 'daily' ? 'Daily' : 'Weekly'} A/B Test Digest - ${data.tests.length} Tests`;

    const emailResponse = await resend.emails.send({
      from: "DOMINION <onboarding@resend.dev>",
      to: [data.recipientEmail],
      subject,
      html,
    });

    console.log("Email digest sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Email digest sent", data: emailResponse.data }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error sending digest:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
