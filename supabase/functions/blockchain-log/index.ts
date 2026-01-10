import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, ...params } = await req.json();

    switch (action) {
      case 'log_profit': {
        // Log profit to blockchain (Polygon)
        const { amount, txType = 'profit_log', metadata = {} } = params;
        
        // Generate a simulated tx hash (in production, this would call Polygon API)
        const txHash = `0x${Array.from({ length: 64 }, () => 
          Math.floor(Math.random() * 16).toString(16)).join('')}`;
        
        const blockNumber = Math.floor(Math.random() * 1000000) + 50000000;
        
        // In production with POLYGON_API_KEY:
        // const polygonResponse = await fetch('https://polygon-rpc.com/', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     jsonrpc: '2.0',
        //     method: 'eth_sendTransaction',
        //     params: [{ data: encodedData }]
        //   })
        // });

        const { data: logData, error: logError } = await supabaseClient
          .from('blockchain_logs')
          .insert({
            user_id: user.id,
            chain: 'polygon',
            tx_hash: txHash,
            tx_type: txType,
            amount: amount,
            currency: 'MATIC',
            metadata: metadata,
            block_number: blockNumber,
            confirmed: true
          })
          .select()
          .single();

        if (logError) throw logError;

        return new Response(JSON.stringify({
          success: true,
          transaction: logData,
          explorer_url: `https://polygonscan.com/tx/${txHash}`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'deploy_metaverse_rep': {
        const { platform, deploymentType = 'sales_rep', config = {} } = params;
        
        // Simulate metaverse deployment API call
        // In production with DECENTRALAND_API_KEY or ROBLOX_API_KEY:
        // const response = await fetch(`https://api.${platform}.com/deploy`, { ... });
        
        const location = {
          x: Math.floor(Math.random() * 150) - 75,
          y: Math.floor(Math.random() * 50),
          z: Math.floor(Math.random() * 150) - 75,
          parcel: `${Math.floor(Math.random() * 200) - 100},${Math.floor(Math.random() * 200) - 100}`
        };

        const { data: deployment, error: deployError } = await supabaseClient
          .from('metaverse_deployments')
          .insert({
            user_id: user.id,
            platform: platform,
            deployment_type: deploymentType,
            config: {
              ...config,
              avatar_style: config.avatar_style || 'professional',
              greeting: config.greeting || 'Welcome! I can help you discover our products.',
              personality: config.personality || 'friendly_sales'
            },
            status: 'active',
            location: location
          })
          .select()
          .single();

        if (deployError) throw deployError;

        return new Response(JSON.stringify({
          success: true,
          deployment: deployment,
          message: `Virtual sales rep deployed to ${platform} at location ${location.parcel}`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'deploy_robot': {
        const { robotType, taskType = 'retail_demo', location = 'HQ Showroom' } = params;
        
        // Simulate robot deployment API call
        // In production with FIGURE_API_KEY:
        // const response = await fetch('https://api.figure.ai/v1/robots/deploy', {
        //   headers: { 'Authorization': `Bearer ${Deno.env.get('FIGURE_API_KEY')}` },
        //   body: JSON.stringify({ task: taskType, location })
        // });

        const { data: robot, error: robotError } = await supabaseClient
          .from('robot_deployments')
          .insert({
            user_id: user.id,
            robot_type: robotType,
            location: location,
            task_type: taskType,
            status: 'active',
            telemetry: {
              battery: 100,
              temperature: 23,
              uptime_hours: 0,
              last_ping: new Date().toISOString()
            }
          })
          .select()
          .single();

        if (robotError) throw robotError;

        return new Response(JSON.stringify({
          success: true,
          robot: robot,
          message: `${robotType} robot activated for ${taskType} at ${location}`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get_stats': {
        // Get all emerging layer stats
        const [metaverse, robots, blockchain] = await Promise.all([
          supabaseClient
            .from('metaverse_deployments')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
          supabaseClient
            .from('robot_deployments')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
          supabaseClient
            .from('blockchain_logs')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50)
        ]);

        const totalMetaverseRevenue = (metaverse.data || [])
          .reduce((sum, d) => sum + Number(d.revenue_generated || 0), 0);
        const totalRobotRevenue = (robots.data || [])
          .reduce((sum, r) => sum + Number(r.revenue_attributed || 0), 0);
        const totalBlockchainLogged = (blockchain.data || [])
          .filter(l => l.tx_type === 'profit_log')
          .reduce((sum, l) => sum + Number(l.amount || 0), 0);

        return new Response(JSON.stringify({
          metaverse: {
            deployments: metaverse.data || [],
            active_count: (metaverse.data || []).filter(d => d.status === 'active').length,
            total_interactions: (metaverse.data || []).reduce((s, d) => s + (d.interactions_count || 0), 0),
            revenue: totalMetaverseRevenue
          },
          robots: {
            deployments: robots.data || [],
            active_count: (robots.data || []).filter(r => r.status === 'active').length,
            tasks_completed: (robots.data || []).reduce((s, r) => s + (r.tasks_completed || 0), 0),
            revenue: totalRobotRevenue
          },
          blockchain: {
            logs: blockchain.data || [],
            total_logged: totalBlockchainLogged,
            transaction_count: (blockchain.data || []).length
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('Blockchain log error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Internal error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
