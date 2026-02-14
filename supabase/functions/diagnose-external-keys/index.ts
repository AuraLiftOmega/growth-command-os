import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Auth check
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    })
    const token = authHeader.replace('Bearer ', '')
    const { data: claims, error: authError } = await supabase.auth.getClaims(token)
    if (authError || !claims?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const results: Record<string, any> = {}
    const extUrl = Deno.env.get('EXT_SUPABASE_URL')

    if (!extUrl) {
      return new Response(JSON.stringify({ error: 'EXT_SUPABASE_URL not set' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Extract project ref from URL
    const projectRef = extUrl.replace('https://', '').split('.')[0]
    results.project_url = extUrl
    results.project_ref = projectRef

    // Test each key
    const keysToTest = [
      { name: 'publishable_key', env: 'EXT_SUPABASE_PUBLISHABLE_KEY' },
      { name: 'secret_key', env: 'EXT_SUPABASE_SECRET_KEY' },
      { name: 'legacy_anon_key', env: 'EXT_SUPABASE_LEGACY_ANON_KEY' },
      { name: 'legacy_service_role_key', env: 'EXT_SUPABASE_LEGACY_SERVICE_ROLE_KEY' },
    ]

    for (const key of keysToTest) {
      const value = Deno.env.get(key.env)
      if (!value) {
        results[key.name] = { status: 'not_set' }
        continue
      }

      try {
        // Decode JWT to check claims
        const parts = value.split('.')
        let decoded: any = null
        if (parts.length === 3) {
          try {
            decoded = JSON.parse(atob(parts[1]))
          } catch { decoded = null }
        }

        // Try connecting with this key
        const extClient = createClient(extUrl, value)
        
        // Test basic connectivity - list tables via a simple query
        const { data, error } = await extClient.from('_test_connectivity').select('*').limit(1)
        
        // Even if table doesn't exist, a valid key will return a specific error
        const isValidConnection = error?.code === '42P01' || // table doesn't exist = key works
          error?.code === 'PGRST116' || // not found = key works  
          error?.message?.includes('relation') || // relation error = key works
          !error // no error = key works

        // Try to get actual tables
        let tables: string[] = []
        const { data: schemaData, error: schemaError } = await extClient.rpc('get_tables_list').select('*')
        
        // Fallback: try querying known common tables
        const commonTables = ['profiles', 'products', 'orders', 'ads', 'creatives', 'subscriptions']
        const accessibleTables: string[] = []
        
        for (const table of commonTables) {
          const { error: tableError } = await extClient.from(table).select('count').limit(1)
          if (!tableError || tableError.code === 'PGRST116') {
            accessibleTables.push(table)
          }
        }

        results[key.name] = {
          status: 'set',
          jwt_role: decoded?.role || 'unknown',
          jwt_ref: decoded?.ref || 'unknown',
          jwt_exp: decoded?.exp ? new Date(decoded.exp * 1000).toISOString() : 'unknown',
          connection_valid: isValidConnection,
          connection_error: error?.message || null,
          accessible_tables: accessibleTables,
          is_expired: decoded?.exp ? (decoded.exp * 1000 < Date.now()) : 'unknown',
        }
      } catch (e) {
        results[key.name] = {
          status: 'set',
          error: e.message,
        }
      }
    }

    return new Response(JSON.stringify({ success: true, diagnostics: results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
