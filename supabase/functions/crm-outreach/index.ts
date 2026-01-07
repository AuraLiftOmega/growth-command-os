/**
 * CRM OUTREACH ENGINE
 * 
 * Automated communication for CRM:
 * - Email campaigns via Resend
 * - SMS notifications via Twilio
 * - Slack alerts for sales team
 * 
 * Requires: RESEND_API_KEY, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OutreachRequest {
  type: 'email' | 'sms' | 'slack' | 'auto_followup';
  contact_id?: string;
  deal_id?: string;
  template?: string;
  message?: string;
  subject?: string;
  user_id: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body: OutreachRequest = await req.json();
    console.log('📧 CRM Outreach request:', body.type);

    let result: Record<string, unknown> = {};

    // Get contact info if contact_id provided
    let contact: Record<string, unknown> | null = null;
    if (body.contact_id) {
      const { data } = await supabase
        .from('crm_contacts')
        .select('*')
        .eq('id', body.contact_id)
        .single();
      contact = data;
    }

    switch (body.type) {
      case 'email': {
        const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
        if (!RESEND_API_KEY) {
          throw new Error('RESEND_API_KEY not configured. Please add it via Supabase secrets.');
        }

        if (!contact?.email) {
          throw new Error('Contact email required');
        }

        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'CEO Engine <ceo@dominion.ai>',
            to: [contact.email as string],
            subject: body.subject || 'Quick follow-up',
            html: body.message || `
              <h2>Hi ${contact.first_name || 'there'},</h2>
              <p>Just wanted to follow up on our recent conversation.</p>
              <p>Let me know if you have any questions!</p>
              <p>Best,<br>AI CEO Engine</p>
            `
          }),
        });

        const emailResult = await emailResponse.json();
        
        // Log interaction
        await supabase.from('crm_interactions').insert({
          user_id: body.user_id,
          contact_id: body.contact_id,
          type: 'email',
          direction: 'outbound',
          channel: 'email',
          content: body.message || body.subject,
          is_automated: true
        });

        result = { email_sent: true, resend_id: emailResult.id };
        break;
      }

      case 'sms': {
        const TWILIO_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
        const TWILIO_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
        const TWILIO_PHONE = Deno.env.get('TWILIO_PHONE_NUMBER');

        if (!TWILIO_SID || !TWILIO_TOKEN || !TWILIO_PHONE) {
          throw new Error('Twilio credentials not configured. Please add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER via Supabase secrets.');
        }

        if (!contact?.phone) {
          throw new Error('Contact phone required');
        }

        const twilioResponse = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
          {
            method: 'POST',
            headers: {
              'Authorization': 'Basic ' + btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`),
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              To: contact.phone as string,
              From: TWILIO_PHONE,
              Body: body.message || 'Hi! Just following up. Reply to connect.',
            }),
          }
        );

        const smsResult = await twilioResponse.json();

        await supabase.from('crm_interactions').insert({
          user_id: body.user_id,
          contact_id: body.contact_id,
          type: 'sms',
          direction: 'outbound',
          channel: 'sms',
          content: body.message,
          is_automated: true
        });

        result = { sms_sent: true, twilio_sid: smsResult.sid };
        break;
      }

      case 'auto_followup': {
        // Get contacts/deals needing follow-up
        const { data: tasks } = await supabase
          .from('crm_tasks')
          .select('*, crm_contacts(*), crm_deals(*)')
          .eq('user_id', body.user_id)
          .eq('status', 'pending')
          .eq('is_automated', true)
          .lte('due_date', new Date().toISOString())
          .limit(10);

        const followups = [];
        for (const task of tasks || []) {
          if (task.type === 'email' && task.crm_contacts?.email) {
            // Send automated follow-up email
            try {
              const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
              if (RESEND_API_KEY) {
                await fetch('https://api.resend.com/emails', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${RESEND_API_KEY}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    from: 'CEO Engine <ceo@dominion.ai>',
                    to: [task.crm_contacts.email],
                    subject: `Following up: ${task.title}`,
                    html: `<p>Hi ${task.crm_contacts.first_name || 'there'},</p>
                           <p>${task.description || 'Just checking in on our conversation.'}</p>
                           <p>Best regards</p>`
                  }),
                });

                await supabase
                  .from('crm_tasks')
                  .update({ status: 'completed', completed_at: new Date().toISOString() })
                  .eq('id', task.id);

                followups.push({ task_id: task.id, type: 'email', status: 'sent' });
              }
            } catch (e: unknown) {
              const errMsg = e instanceof Error ? e.message : 'Unknown error';
              followups.push({ task_id: task.id, type: 'email', status: 'failed', error: errMsg });
            }
          }
        }

        result = { followups_processed: followups.length, details: followups };
        break;
      }

      default:
        throw new Error(`Unknown outreach type: ${body.type}`);
    }

    // Log to AI decision log
    await supabase.from('ai_decision_log').insert({
      user_id: body.user_id,
      decision_type: `outreach_${body.type}`,
      action_taken: `Sent ${body.type} to ${contact?.email || contact?.phone || 'contact'}`,
      reasoning: 'Automated CRM outreach',
      confidence: 0.9,
      entity_type: body.contact_id ? 'contact' : 'deal',
      entity_id: body.contact_id || body.deal_id,
      execution_status: 'completed'
    });

    console.log('✅ Outreach complete:', body.type);

    return new Response(JSON.stringify({ success: true, ...result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Outreach error:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
