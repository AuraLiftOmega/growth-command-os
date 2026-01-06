import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ABTestNotificationRequest {
  recipientEmail: string;
  recipientName?: string;
  notificationType: 'significance_reached' | 'winner_declared' | 'sample_milestone' | 'test_complete';
  testName: string;
  winnerName?: string;
  winnerVariant?: string;
  improvement?: number;
  confidence?: number;
  controlConversionRate?: number;
  winnerConversionRate?: number;
  totalViews?: number;
  totalConversions?: number;
  revenueAttributed?: number;
  testDuration?: string;
  recommendedActions?: string[];
  dashboardUrl?: string;
}

const getNotificationSubject = (type: string, testName: string, confidence?: number): string => {
  switch (type) {
    case 'significance_reached':
      return `🎯 A/B Test "${testName}" reached ${confidence}% confidence!`;
    case 'winner_declared':
      return `🏆 Winner declared for A/B Test "${testName}"!`;
    case 'sample_milestone':
      return `📊 A/B Test "${testName}" - Sample milestone reached`;
    case 'test_complete':
      return `✅ A/B Test "${testName}" completed`;
    default:
      return `A/B Test Update: ${testName}`;
  }
};

const generateEmailHtml = (data: ABTestNotificationRequest): string => {
  const {
    notificationType,
    testName,
    winnerName,
    winnerVariant,
    improvement,
    confidence,
    controlConversionRate,
    winnerConversionRate,
    totalViews,
    totalConversions,
    revenueAttributed,
    testDuration,
    recommendedActions,
    dashboardUrl,
    recipientName,
  } = data;

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatNumber = (num: number) => 
    new Intl.NumberFormat('en-US').format(num);

  const getHeaderContent = () => {
    switch (notificationType) {
      case 'significance_reached':
        return {
          emoji: '🎯',
          title: 'Statistical Significance Reached!',
          subtitle: `Your A/B test has reached ${confidence}% confidence`,
          color: '#8B5CF6',
        };
      case 'winner_declared':
        return {
          emoji: '🏆',
          title: 'Winner Declared!',
          subtitle: `${winnerName} is the winning variant`,
          color: '#F59E0B',
        };
      case 'sample_milestone':
        return {
          emoji: '📊',
          title: 'Sample Milestone Reached',
          subtitle: `Your test has collected ${formatNumber(totalViews || 0)} views`,
          color: '#3B82F6',
        };
      case 'test_complete':
        return {
          emoji: '✅',
          title: 'Test Completed',
          subtitle: 'Your A/B test has finished running',
          color: '#10B981',
        };
      default:
        return {
          emoji: '📈',
          title: 'Test Update',
          subtitle: 'Your A/B test has an update',
          color: '#6B7280',
        };
    }
  };

  const header = getHeaderContent();
  const defaultActions = [
    'Review the full test results in your dashboard',
    'Apply the winning variant to 100% of traffic',
    'Document learnings for future tests',
    'Plan your next optimization experiment',
  ];
  const actions = recommendedActions || defaultActions;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${header.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${header.color}, ${header.color}dd); padding: 40px 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 16px;">${header.emoji}</div>
              <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0 0 8px;">${header.title}</h1>
              <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; margin: 0;">${header.subtitle}</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 30px 40px 20px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0;">
                Hi${recipientName ? ` ${recipientName}` : ''},
              </p>
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 16px 0 0;">
                Great news! Your A/B test <strong>"${testName}"</strong> has an important update.
              </p>
            </td>
          </tr>

          <!-- Stats Cards -->
          <tr>
            <td style="padding: 0 40px 20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  ${confidence ? `
                  <td width="50%" style="padding: 8px;">
                    <div style="background-color: #F3F4F6; border-radius: 8px; padding: 16px; text-align: center;">
                      <p style="color: #6B7280; font-size: 12px; margin: 0 0 4px; text-transform: uppercase;">Confidence</p>
                      <p style="color: ${confidence >= 95 ? '#10B981' : '#374151'}; font-size: 24px; font-weight: 700; margin: 0;">${confidence.toFixed(1)}%</p>
                    </div>
                  </td>
                  ` : ''}
                  ${improvement !== undefined ? `
                  <td width="50%" style="padding: 8px;">
                    <div style="background-color: #ECFDF5; border-radius: 8px; padding: 16px; text-align: center;">
                      <p style="color: #6B7280; font-size: 12px; margin: 0 0 4px; text-transform: uppercase;">Improvement</p>
                      <p style="color: #10B981; font-size: 24px; font-weight: 700; margin: 0;">+${improvement.toFixed(1)}%</p>
                    </div>
                  </td>
                  ` : ''}
                </tr>
              </table>
            </td>
          </tr>

          <!-- Winner Info -->
          ${winnerName ? `
          <tr>
            <td style="padding: 0 40px 20px;">
              <div style="background: linear-gradient(135deg, #FEF3C7, #FDE68A); border-radius: 8px; padding: 20px; border-left: 4px solid #F59E0B;">
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                  <span style="font-size: 24px; margin-right: 12px;">🏆</span>
                  <span style="color: #92400E; font-weight: 700; font-size: 18px;">Winning Variant</span>
                </div>
                <p style="color: #78350F; font-size: 20px; font-weight: 600; margin: 0 0 8px;">${winnerName}</p>
                ${winnerConversionRate !== undefined ? `
                <p style="color: #92400E; font-size: 14px; margin: 0;">
                  Conversion Rate: <strong>${winnerConversionRate.toFixed(2)}%</strong>
                  ${controlConversionRate !== undefined ? ` (vs ${controlConversionRate.toFixed(2)}% control)` : ''}
                </p>
                ` : ''}
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- Performance Summary -->
          <tr>
            <td style="padding: 0 40px 20px;">
              <h3 style="color: #374151; font-size: 16px; font-weight: 600; margin: 0 0 16px;">Performance Summary</h3>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F9FAFB; border-radius: 8px;">
                ${totalViews !== undefined ? `
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #E5E7EB;">
                    <span style="color: #6B7280; font-size: 14px;">Total Views</span>
                  </td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #E5E7EB; text-align: right;">
                    <span style="color: #374151; font-size: 14px; font-weight: 600;">${formatNumber(totalViews)}</span>
                  </td>
                </tr>
                ` : ''}
                ${totalConversions !== undefined ? `
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #E5E7EB;">
                    <span style="color: #6B7280; font-size: 14px;">Total Conversions</span>
                  </td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #E5E7EB; text-align: right;">
                    <span style="color: #374151; font-size: 14px; font-weight: 600;">${formatNumber(totalConversions)}</span>
                  </td>
                </tr>
                ` : ''}
                ${revenueAttributed !== undefined ? `
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #E5E7EB;">
                    <span style="color: #6B7280; font-size: 14px;">Revenue Attributed</span>
                  </td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #E5E7EB; text-align: right;">
                    <span style="color: #10B981; font-size: 14px; font-weight: 600;">${formatCurrency(revenueAttributed)}</span>
                  </td>
                </tr>
                ` : ''}
                ${testDuration ? `
                <tr>
                  <td style="padding: 12px 16px;">
                    <span style="color: #6B7280; font-size: 14px;">Test Duration</span>
                  </td>
                  <td style="padding: 12px 16px; text-align: right;">
                    <span style="color: #374151; font-size: 14px; font-weight: 600;">${testDuration}</span>
                  </td>
                </tr>
                ` : ''}
              </table>
            </td>
          </tr>

          <!-- Recommended Actions -->
          <tr>
            <td style="padding: 0 40px 20px;">
              <h3 style="color: #374151; font-size: 16px; font-weight: 600; margin: 0 0 16px;">Recommended Actions</h3>
              <div style="background-color: #EFF6FF; border-radius: 8px; padding: 16px;">
                ${actions.map((action, index) => `
                <div style="display: flex; align-items: flex-start; margin-bottom: ${index < actions.length - 1 ? '12px' : '0'};">
                  <span style="color: #3B82F6; font-weight: 700; margin-right: 12px;">${index + 1}.</span>
                  <span style="color: #1E40AF; font-size: 14px;">${action}</span>
                </div>
                `).join('')}
              </div>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 40px 30px; text-align: center;">
              <a href="${dashboardUrl || '#'}" style="display: inline-block; background: linear-gradient(135deg, ${header.color}, ${header.color}dd); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; padding: 14px 32px; border-radius: 8px;">
                View Full Results →
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
                You're receiving this because you enabled email notifications for A/B tests.
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

const handler = async (req: Request): Promise<Response> => {
  console.log("A/B Test notification request received");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: ABTestNotificationRequest = await req.json();
    console.log("Notification data:", JSON.stringify(data, null, 2));

    const { recipientEmail, notificationType, testName, confidence } = data;

    if (!recipientEmail || !notificationType || !testName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: recipientEmail, notificationType, testName" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const subject = getNotificationSubject(notificationType, testName, confidence);
    const html = generateEmailHtml(data);

    console.log(`Sending ${notificationType} notification to ${recipientEmail}`);

    const emailResponse = await resend.emails.send({
      from: "DOMINION <onboarding@resend.dev>",
      to: [recipientEmail],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Notification email sent successfully",
        data: emailResponse.data
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending A/B test notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
