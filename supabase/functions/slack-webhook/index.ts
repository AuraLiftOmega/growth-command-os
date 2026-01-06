import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-slack-signature, x-slack-request-timestamp',
};

const SLACK_SIGNING_SECRET = Deno.env.get('SLACK_SIGNING_SECRET');

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

  // Check timestamp is within 5 minutes
  const currentTime = Math.floor(Date.now() / 1000);
  if (Math.abs(currentTime - parseInt(timestamp)) > 300) {
    console.error('Slack request timestamp too old');
    return false;
  }

  // Create signature base string
  const sigBaseString = `v0:${timestamp}:${body}`;
  
  // Calculate expected signature
  const hmac = createHmac('sha256', SLACK_SIGNING_SECRET);
  hmac.update(sigBaseString);
  const expectedSignature = `v0=${hmac.digest('hex')}`;

  // Compare signatures
  return signature === expectedSignature;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

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

    // Verify request (skip in development if needed)
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
      // Handle URL-encoded form data (slash commands, interactive messages)
      const params = new URLSearchParams(body);
      const payloadStr = params.get('payload');
      if (payloadStr) {
        payload = JSON.parse(payloadStr);
      } else {
        // Convert form data to object
        payload = Object.fromEntries(params);
      }
    } else {
      // Handle JSON body (Events API)
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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle different event types
    if (payload.type === 'event_callback') {
      const event = payload.event;
      console.log('Processing event:', event.type);

      switch (event.type) {
        case 'message':
          // Handle incoming messages
          await handleMessage(supabase, payload, event);
          break;

        case 'app_mention':
          // Handle app mentions
          await handleAppMention(supabase, payload, event);
          break;

        case 'reaction_added':
          // Handle reactions
          await handleReaction(supabase, payload, event);
          break;

        case 'member_joined_channel':
          // Handle member joins
          await handleMemberJoined(supabase, payload, event);
          break;

        default:
          console.log('Unhandled event type:', event.type);
      }
    }

    // Handle interactive components (buttons, select menus, etc.)
    if (payload.type === 'block_actions' || payload.type === 'interactive_message') {
      await handleInteractiveAction(supabase, payload);
    }

    // Handle slash commands
    if (payload.command) {
      return await handleSlashCommand(supabase, payload);
    }

    // Handle view submissions (modals)
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

// Event Handlers
async function handleMessage(supabase: any, payload: any, event: any) {
  // Ignore bot messages to prevent loops
  if (event.bot_id || event.subtype === 'bot_message') {
    return;
  }

  console.log('Message received:', {
    channel: event.channel,
    user: event.user,
    text: event.text?.substring(0, 50),
  });

  // Log the event for analytics
  await logSlackEvent(supabase, payload.team_id, 'message', {
    channel: event.channel,
    user: event.user,
    timestamp: event.ts,
  });
}

async function handleAppMention(supabase: any, payload: any, event: any) {
  console.log('App mentioned:', {
    channel: event.channel,
    user: event.user,
    text: event.text,
  });

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

async function handleMemberJoined(supabase: any, payload: any, event: any) {
  console.log('Member joined channel:', {
    user: event.user,
    channel: event.channel,
  });

  await logSlackEvent(supabase, payload.team_id, 'member_joined', {
    user: event.user,
    channel: event.channel,
  });
}

async function handleInteractiveAction(supabase: any, payload: any) {
  const actions = payload.actions || [];
  console.log('Interactive action:', {
    user: payload.user?.id,
    actions: actions.map((a: any) => a.action_id),
  });

  for (const action of actions) {
    await logSlackEvent(supabase, payload.team?.id, 'interactive_action', {
      action_id: action.action_id,
      user: payload.user?.id,
      value: action.value,
    });
  }
}

async function handleSlashCommand(supabase: any, payload: any) {
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

  // Example response for slash commands
  const responseText = `Received command: ${payload.command} ${payload.text || ''}`;

  return new Response(JSON.stringify({
    response_type: 'ephemeral',
    text: responseText,
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
        user_id: '00000000-0000-0000-0000-000000000000', // System user placeholder
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
