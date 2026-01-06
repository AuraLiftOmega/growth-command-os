import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-slack-signature, x-slack-request-timestamp',
};

const SLACK_SIGNING_SECRET = Deno.env.get('SLACK_SIGNING_SECRET');

// Slack API base URL
const SLACK_API_URL = 'https://slack.com/api';

// Verify Slack request signature
function verifySlackRequest(
  body: string,
  timestamp: string,
  signature: string
): boolean {
  if (!SLACK_SIGNING_SECRET) {
    console.error('SLACK_SIGNING_SECRET not configured');
    return false;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  if (Math.abs(currentTime - parseInt(timestamp)) > 300) {
    console.error('Slack request timestamp too old');
    return false;
  }

  const sigBaseString = `v0:${timestamp}:${body}`;
  const hmac = createHmac('sha256', SLACK_SIGNING_SECRET);
  hmac.update(sigBaseString);
  const expectedSignature = `v0=${hmac.digest('hex')}`;

  return signature === expectedSignature;
}

// Send a message to a Slack channel
async function sendSlackMessage(
  accessToken: string,
  channel: string,
  text: string,
  options: {
    blocks?: any[];
    thread_ts?: string;
    reply_broadcast?: boolean;
    unfurl_links?: boolean;
    unfurl_media?: boolean;
  } = {}
): Promise<{ ok: boolean; ts?: string; error?: string }> {
  try {
    const response = await fetch(`${SLACK_API_URL}/chat.postMessage`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel,
        text,
        ...options,
      }),
    });

    const result = await response.json();
    console.log('Slack message sent:', { ok: result.ok, channel, error: result.error });
    return result;
  } catch (error) {
    console.error('Error sending Slack message:', error);
    return { ok: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Send a reply in a thread
async function sendSlackReply(
  accessToken: string,
  channel: string,
  threadTs: string,
  text: string,
  blocks?: any[]
): Promise<{ ok: boolean; ts?: string; error?: string }> {
  return sendSlackMessage(accessToken, channel, text, {
    thread_ts: threadTs,
    blocks,
  });
}

// Send an ephemeral message (only visible to one user)
async function sendEphemeralMessage(
  accessToken: string,
  channel: string,
  user: string,
  text: string,
  blocks?: any[]
): Promise<{ ok: boolean; error?: string }> {
  try {
    const response = await fetch(`${SLACK_API_URL}/chat.postEphemeral`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel,
        user,
        text,
        blocks,
      }),
    });

    const result = await response.json();
    console.log('Ephemeral message sent:', { ok: result.ok, error: result.error });
    return result;
  } catch (error) {
    console.error('Error sending ephemeral message:', error);
    return { ok: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Update an existing message
async function updateSlackMessage(
  accessToken: string,
  channel: string,
  ts: string,
  text: string,
  blocks?: any[]
): Promise<{ ok: boolean; error?: string }> {
  try {
    const response = await fetch(`${SLACK_API_URL}/chat.update`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel,
        ts,
        text,
        blocks,
      }),
    });

    const result = await response.json();
    console.log('Message updated:', { ok: result.ok, error: result.error });
    return result;
  } catch (error) {
    console.error('Error updating message:', error);
    return { ok: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Add a reaction to a message
async function addReaction(
  accessToken: string,
  channel: string,
  timestamp: string,
  emoji: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const response = await fetch(`${SLACK_API_URL}/reactions.add`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel,
        timestamp,
        name: emoji,
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error adding reaction:', error);
    return { ok: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Get stored access token for a team
async function getTeamAccessToken(supabase: any, teamId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('platform_connections')
      .select('access_token_encrypted')
      .eq('platform', 'slack')
      .eq('platform_user_id', teamId)
      .single();

    if (error || !data) {
      console.error('Error fetching Slack token:', error);
      return null;
    }

    return data.access_token_encrypted;
  } catch (err) {
    console.error('Failed to get team access token:', err);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Handle API calls to send messages (from our app)
  if (req.method === 'POST' && url.pathname.endsWith('/send')) {
    try {
      const { channel, text, blocks, thread_ts, team_id, user_id } = await req.json();

      if (!channel || !text) {
        return new Response(JSON.stringify({ error: 'channel and text are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get access token for the team
      const accessToken = await getTeamAccessToken(supabase, team_id);
      if (!accessToken) {
        return new Response(JSON.stringify({ error: 'No Slack connection found for this team' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const result = await sendSlackMessage(accessToken, channel, text, {
        blocks,
        thread_ts,
      });

      return new Response(JSON.stringify(result), {
        status: result.ok ? 200 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error in /send endpoint:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  // Handle notification broadcasts
  if (req.method === 'POST' && url.pathname.endsWith('/notify')) {
    try {
      const { team_id, channel, notification_type, data } = await req.json();

      const accessToken = await getTeamAccessToken(supabase, team_id);
      if (!accessToken) {
        return new Response(JSON.stringify({ error: 'No Slack connection found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Build notification message based on type
      const message = buildNotificationMessage(notification_type, data);
      const result = await sendSlackMessage(accessToken, channel, message.text, {
        blocks: message.blocks,
      });

      return new Response(JSON.stringify(result), {
        status: result.ok ? 200 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error in /notify endpoint:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  // Original webhook handling for Slack events
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const timestamp = req.headers.get('x-slack-request-timestamp');
    const signature = req.headers.get('x-slack-signature');
    const body = await req.text();

    console.log('Received Slack webhook');

    // Verify request
    if (timestamp && signature) {
      if (!verifySlackRequest(body, timestamp, signature)) {
        console.error('Invalid Slack signature');
        return new Response(JSON.stringify({ error: 'Invalid signature' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Parse the body
    let payload;
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const params = new URLSearchParams(body);
      const payloadStr = params.get('payload');
      if (payloadStr) {
        payload = JSON.parse(payloadStr);
      } else {
        payload = Object.fromEntries(params);
      }
    } else {
      payload = JSON.parse(body);
    }

    console.log('Parsed payload type:', payload.type);

    // Handle URL verification challenge
    if (payload.type === 'url_verification') {
      console.log('Responding to URL verification challenge');
      return new Response(JSON.stringify({ challenge: payload.challenge }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle different event types
    if (payload.type === 'event_callback') {
      const event = payload.event;
      console.log('Processing event:', event.type);

      // Get access token for responding
      const accessToken = await getTeamAccessToken(supabase, payload.team_id);

      switch (event.type) {
        case 'message':
          await handleMessage(supabase, payload, event, accessToken);
          break;

        case 'app_mention':
          await handleAppMention(supabase, payload, event, accessToken);
          break;

        case 'reaction_added':
          await handleReaction(supabase, payload, event);
          break;

        case 'member_joined_channel':
          await handleMemberJoined(supabase, payload, event, accessToken);
          break;

        default:
          console.log('Unhandled event type:', event.type);
      }
    }

    // Handle interactive components
    if (payload.type === 'block_actions' || payload.type === 'interactive_message') {
      const accessToken = await getTeamAccessToken(supabase, payload.team?.id);
      await handleInteractiveAction(supabase, payload, accessToken);
    }

    // Handle slash commands
    if (payload.command) {
      const accessToken = await getTeamAccessToken(supabase, payload.team_id);
      return await handleSlashCommand(supabase, payload, accessToken);
    }

    // Handle view submissions
    if (payload.type === 'view_submission') {
      await handleViewSubmission(supabase, payload);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Slack webhook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Build notification messages based on type
function buildNotificationMessage(type: string, data: any): { text: string; blocks: any[] } {
  switch (type) {
    case 'ab_test_winner':
      return {
        text: `🏆 A/B Test Winner: ${data.test_name}`,
        blocks: [
          {
            type: 'header',
            text: { type: 'plain_text', text: '🏆 A/B Test Winner Declared!' },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*${data.test_name}*\nWinner: *${data.winner}* with ${data.improvement}% improvement`,
            },
          },
          {
            type: 'context',
            elements: [
              { type: 'mrkdwn', text: `Statistical significance: ${data.significance}%` },
            ],
          },
        ],
      };

    case 'new_lead':
      return {
        text: `🎯 New Lead: ${data.name}`,
        blocks: [
          {
            type: 'header',
            text: { type: 'plain_text', text: '🎯 New Lead Captured!' },
          },
          {
            type: 'section',
            fields: [
              { type: 'mrkdwn', text: `*Name:*\n${data.name}` },
              { type: 'mrkdwn', text: `*Email:*\n${data.email}` },
              { type: 'mrkdwn', text: `*Source:*\n${data.source}` },
              { type: 'mrkdwn', text: `*Score:*\n${data.score || 'N/A'}` },
            ],
          },
        ],
      };

    case 'revenue_milestone':
      return {
        text: `💰 Revenue Milestone: ${data.amount}`,
        blocks: [
          {
            type: 'header',
            text: { type: 'plain_text', text: '💰 Revenue Milestone Reached!' },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `You've hit *${data.amount}* in ${data.period}!\n${data.message || ''}`,
            },
          },
        ],
      };

    case 'creative_performance':
      return {
        text: `📊 Creative Performance Alert`,
        blocks: [
          {
            type: 'header',
            text: { type: 'plain_text', text: '📊 Creative Performance Alert' },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*${data.creative_name}*\n${data.alert_type}: ${data.message}`,
            },
          },
          {
            type: 'section',
            fields: [
              { type: 'mrkdwn', text: `*CTR:* ${data.ctr}%` },
              { type: 'mrkdwn', text: `*ROAS:* ${data.roas}x` },
            ],
          },
        ],
      };

    case 'system_alert':
      return {
        text: `⚠️ System Alert: ${data.title}`,
        blocks: [
          {
            type: 'header',
            text: { type: 'plain_text', text: `⚠️ ${data.title}` },
          },
          {
            type: 'section',
            text: { type: 'mrkdwn', text: data.message },
          },
          {
            type: 'context',
            elements: [
              { type: 'mrkdwn', text: `Severity: ${data.severity || 'info'}` },
            ],
          },
        ],
      };

    default:
      return {
        text: data.text || 'Notification from your app',
        blocks: data.blocks || [],
      };
  }
}

// Event Handlers
async function handleMessage(supabase: any, payload: any, event: any, accessToken: string | null) {
  if (event.bot_id || event.subtype === 'bot_message') {
    return;
  }

  console.log('Message received:', {
    channel: event.channel,
    user: event.user,
    text: event.text?.substring(0, 50),
  });

  await logSlackEvent(supabase, payload.team_id, 'message', {
    channel: event.channel,
    user: event.user,
    timestamp: event.ts,
  });
}

async function handleAppMention(supabase: any, payload: any, event: any, accessToken: string | null) {
  console.log('App mentioned:', {
    channel: event.channel,
    user: event.user,
    text: event.text,
  });

  // Auto-respond to mentions
  if (accessToken) {
    await sendSlackReply(
      accessToken,
      event.channel,
      event.ts,
      "👋 Thanks for mentioning me! I'm here to help with your marketing automation. Use `/help` to see available commands."
    );
  }

  await logSlackEvent(supabase, payload.team_id, 'app_mention', {
    channel: event.channel,
    user: event.user,
    text: event.text,
  });
}

async function handleReaction(supabase: any, payload: any, event: any) {
  console.log('Reaction added:', {
    reaction: event.reaction,
    user: event.user,
    item: event.item,
  });

  await logSlackEvent(supabase, payload.team_id, 'reaction_added', {
    reaction: event.reaction,
    user: event.user,
    item_type: event.item.type,
  });
}

async function handleMemberJoined(supabase: any, payload: any, event: any, accessToken: string | null) {
  console.log('Member joined channel:', {
    user: event.user,
    channel: event.channel,
  });

  // Welcome new members
  if (accessToken) {
    await sendSlackMessage(
      accessToken,
      event.channel,
      `👋 Welcome <@${event.user}>! Great to have you here.`
    );
  }

  await logSlackEvent(supabase, payload.team_id, 'member_joined', {
    user: event.user,
    channel: event.channel,
  });
}

async function handleInteractiveAction(supabase: any, payload: any, accessToken: string | null) {
  const actions = payload.actions || [];
  console.log('Interactive action:', {
    user: payload.user?.id,
    actions: actions.map((a: any) => a.action_id),
  });

  for (const action of actions) {
    // Handle specific button actions
    if (action.action_id === 'approve_creative' && accessToken) {
      await updateSlackMessage(
        accessToken,
        payload.channel?.id,
        payload.message?.ts,
        '✅ Creative approved!',
        []
      );
    }

    await logSlackEvent(supabase, payload.team?.id, 'interactive_action', {
      action_id: action.action_id,
      user: payload.user?.id,
      value: action.value,
    });
  }
}

async function handleSlashCommand(supabase: any, payload: any, accessToken: string | null) {
  console.log('Slash command:', {
    command: payload.command,
    user: payload.user_id,
    text: payload.text,
  });

  await logSlackEvent(supabase, payload.team_id, 'slash_command', {
    command: payload.command,
    user: payload.user_id,
    channel: payload.channel_id,
  });

  // Handle specific commands
  const command = payload.command?.toLowerCase();
  const args = payload.text?.trim() || '';

  let responseText = '';
  let responseBlocks: any[] = [];

  switch (command) {
    case '/stats':
      responseText = '📊 Fetching your stats...';
      responseBlocks = [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*📊 Quick Stats*\n• Active creatives: 12\n• Today\'s revenue: $4,523\n• ROAS: 3.2x',
          },
        },
      ];
      break;

    case '/help':
      responseText = 'Available commands';
      responseBlocks = [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Available Commands:*\n• `/stats` - View quick stats\n• `/pause [campaign]` - Pause a campaign\n• `/report` - Generate daily report\n• `/help` - Show this message',
          },
        },
      ];
      break;

    default:
      responseText = `Received command: ${payload.command} ${args}`;
  }

  return new Response(JSON.stringify({
    response_type: 'ephemeral',
    text: responseText,
    blocks: responseBlocks.length > 0 ? responseBlocks : undefined,
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleViewSubmission(supabase: any, payload: any) {
  console.log('View submission:', {
    callback_id: payload.view?.callback_id,
    user: payload.user?.id,
  });

  await logSlackEvent(supabase, payload.team?.id, 'view_submission', {
    callback_id: payload.view?.callback_id,
    user: payload.user?.id,
  });
}

// Helper function to log Slack events
async function logSlackEvent(
  supabase: any,
  teamId: string,
  eventType: string,
  metadata: Record<string, any>
) {
  try {
    const { error } = await supabase
      .from('system_events')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        event_type: 'slack_event',
        event_category: 'integration',
        title: `Slack: ${eventType}`,
        description: `Slack ${eventType} event from team ${teamId}`,
        metadata: {
          team_id: teamId,
          event_type: eventType,
          ...metadata,
        },
        severity: 'info',
      });

    if (error) {
      console.error('Error logging Slack event:', error);
    }
  } catch (err) {
    console.error('Failed to log Slack event:', err);
  }
}
