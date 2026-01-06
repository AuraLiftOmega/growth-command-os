import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GeekbotStandup {
  id: number
  name: string
  channel: string
  time: string
  timezone: string
  questions: { id: number; text: string }[]
  users: { id: number; username: string; email: string }[]
}

interface GeekbotReport {
  id: number
  standup_id: number
  standup_name: string
  member: {
    id: number
    username: string
    email: string
    realname: string
  }
  questions: {
    id: number
    text: string
    answer: string
  }[]
  created_at: string
  channel: string
}

// Fetch standups from Geekbot
async function fetchStandups(apiKey: string): Promise<GeekbotStandup[]> {
  const response = await fetch('https://api.geekbot.com/v1/standups', {
    headers: {
      'Authorization': apiKey,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Geekbot standups fetch error:', error)
    throw new Error(`Failed to fetch standups: ${response.status}`)
  }

  return response.json()
}

// Fetch reports from Geekbot
async function fetchReports(apiKey: string, standupId?: number, after?: string): Promise<GeekbotReport[]> {
  const params = new URLSearchParams()
  if (standupId) params.append('standup_id', standupId.toString())
  if (after) params.append('after', after)
  params.append('limit', '50')

  const url = `https://api.geekbot.com/v1/reports?${params.toString()}`
  
  const response = await fetch(url, {
    headers: {
      'Authorization': apiKey,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Geekbot reports fetch error:', error)
    throw new Error(`Failed to fetch reports: ${response.status}`)
  }

  return response.json()
}

// Fetch team members from Geekbot
async function fetchMembers(apiKey: string) {
  const response = await fetch('https://api.geekbot.com/v1/members', {
    headers: {
      'Authorization': apiKey,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Geekbot members fetch error:', error)
    throw new Error(`Failed to fetch members: ${response.status}`)
  }

  return response.json()
}

// Format report for display/notification
function formatReportSummary(report: GeekbotReport): string {
  const answers = report.questions
    .map(q => `*${q.text}*\n${q.answer || '_No response_'}`)
    .join('\n\n')

  return `📋 *Standup Report from ${report.member.realname || report.member.username}*\n` +
    `_${report.standup_name} - ${new Date(report.created_at).toLocaleDateString()}_\n\n` +
    answers
}

// Analyze reports for insights
function analyzeReports(reports: GeekbotReport[]) {
  const memberActivity: Record<string, number> = {}
  const blockerMentions: { member: string; text: string; date: string }[] = []
  const completionRate: Record<string, { total: number; answered: number }> = {}

  for (const report of reports) {
    const memberName = report.member.realname || report.member.username
    memberActivity[memberName] = (memberActivity[memberName] || 0) + 1

    // Track completion rates
    if (!completionRate[memberName]) {
      completionRate[memberName] = { total: 0, answered: 0 }
    }
    
    for (const q of report.questions) {
      completionRate[memberName].total++
      if (q.answer && q.answer.trim()) {
        completionRate[memberName].answered++
      }

      // Detect blockers (common patterns)
      const lowerAnswer = (q.answer || '').toLowerCase()
      const lowerQuestion = q.text.toLowerCase()
      if (
        lowerQuestion.includes('blocker') ||
        lowerQuestion.includes('blocked') ||
        lowerQuestion.includes('obstacle') ||
        lowerAnswer.includes('blocked by') ||
        lowerAnswer.includes('waiting on') ||
        lowerAnswer.includes('need help')
      ) {
        if (q.answer && q.answer.trim() && !['no', 'none', 'n/a', '-'].includes(q.answer.toLowerCase().trim())) {
          blockerMentions.push({
            member: memberName,
            text: q.answer,
            date: report.created_at,
          })
        }
      }
    }
  }

  return {
    memberActivity,
    blockerMentions,
    completionRates: Object.entries(completionRate).map(([member, stats]) => ({
      member,
      rate: stats.total > 0 ? Math.round((stats.answered / stats.total) * 100) : 0,
    })),
    totalReports: reports.length,
    uniqueMembers: Object.keys(memberActivity).length,
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const path = url.pathname.replace('/geekbot-sync', '')
    const apiKey = Deno.env.get('GEEKBOT_API_KEY')

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Geekbot API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // GET /standups - List all standups
    if (path === '/standups' && req.method === 'GET') {
      console.log('Fetching Geekbot standups...')
      const standups = await fetchStandups(apiKey)
      
      return new Response(
        JSON.stringify({ standups }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // GET /reports - Fetch reports with optional filters
    if (path === '/reports' && req.method === 'GET') {
      const standupId = url.searchParams.get('standup_id')
      const after = url.searchParams.get('after')
      
      console.log('Fetching Geekbot reports...', { standupId, after })
      const reports = await fetchReports(
        apiKey,
        standupId ? parseInt(standupId) : undefined,
        after || undefined
      )

      return new Response(
        JSON.stringify({ reports, count: reports.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // GET /members - Fetch team members
    if (path === '/members' && req.method === 'GET') {
      console.log('Fetching Geekbot members...')
      const members = await fetchMembers(apiKey)
      
      return new Response(
        JSON.stringify({ members }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // GET /insights - Get analyzed insights from recent reports
    if (path === '/insights' && req.method === 'GET') {
      const standupId = url.searchParams.get('standup_id')
      const days = parseInt(url.searchParams.get('days') || '7')
      
      // Calculate the date range
      const afterDate = new Date()
      afterDate.setDate(afterDate.getDate() - days)
      
      console.log('Fetching reports for insights...', { standupId, days })
      const reports = await fetchReports(
        apiKey,
        standupId ? parseInt(standupId) : undefined,
        afterDate.toISOString()
      )

      const insights = analyzeReports(reports)

      return new Response(
        JSON.stringify({ insights, period: `${days} days` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST /sync - Sync and store reports to database
    if (path === '/sync' && req.method === 'POST') {
      const authHeader = req.headers.get('Authorization')
      if (!authHeader?.startsWith('Bearer ')) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_ANON_KEY')!,
        { global: { headers: { Authorization: authHeader } } }
      )

      const { data: claims, error: authError } = await supabase.auth.getUser()
      if (authError || !claims.user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const body = await req.json()
      const { standup_id, days = 7 } = body

      // Fetch recent reports
      const afterDate = new Date()
      afterDate.setDate(afterDate.getDate() - days)
      
      const reports = await fetchReports(
        apiKey,
        standup_id,
        afterDate.toISOString()
      )

      // Store as system events for tracking
      for (const report of reports) {
        await supabase.from('system_events').upsert({
          user_id: claims.user.id,
          event_type: 'geekbot_report',
          event_category: 'integration',
          title: `Standup: ${report.standup_name}`,
          description: `Report from ${report.member.realname || report.member.username}`,
          metadata: {
            geekbot_report_id: report.id,
            standup_id: report.standup_id,
            member: report.member,
            questions: report.questions,
            created_at: report.created_at,
          },
        }, { onConflict: 'id' })
      }

      const insights = analyzeReports(reports)

      return new Response(
        JSON.stringify({ 
          success: true, 
          synced: reports.length,
          insights 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST /webhook - Handle Geekbot webhooks
    if (path === '/webhook' && req.method === 'POST') {
      const body = await req.json()
      console.log('Geekbot webhook received:', JSON.stringify(body, null, 2))

      // Process the incoming report
      if (body.type === 'report') {
        const report = body.data as GeekbotReport
        const summary = formatReportSummary(report)
        console.log('New standup report:', summary)

        // Could trigger notifications here
        // e.g., send to Slack via slack-webhook function
      }

      return new Response(
        JSON.stringify({ received: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Default: API info
    return new Response(
      JSON.stringify({
        api: 'Geekbot Integration',
        endpoints: [
          'GET /standups - List all standups',
          'GET /reports - Fetch standup reports',
          'GET /members - List team members',
          'GET /insights - Get analyzed insights',
          'POST /sync - Sync reports to database',
          'POST /webhook - Handle Geekbot webhooks',
        ],
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Geekbot sync error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
