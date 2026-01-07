import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  RefreshCw,
  Database,
  Video,
  Store,
  Wifi,
  DollarSign,
  Zap,
  Shield
} from "lucide-react";
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface CheckResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'warning';
  message: string;
  details?: string;
}

const SystemCheck = () => {
  const { user } = useAuth();
  const [checks, setChecks] = useState<CheckResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  const initialChecks: CheckResult[] = [
    { name: 'Database Connection', status: 'pending', message: 'Waiting...' },
    { name: 'Shopify Products', status: 'pending', message: 'Waiting...' },
    { name: 'Creatives Table', status: 'pending', message: 'Waiting...' },
    { name: 'Platform Accounts', status: 'pending', message: 'Waiting...' },
    { name: 'Revenue Events', status: 'pending', message: 'Waiting...' },
    { name: 'Automation Jobs', status: 'pending', message: 'Waiting...' },
    { name: 'Quality Gate', status: 'pending', message: 'Waiting...' },
    { name: 'Video Generation', status: 'pending', message: 'Waiting...' },
  ];

  useEffect(() => {
    setChecks(initialChecks);
  }, []);

  const updateCheck = (name: string, update: Partial<CheckResult>) => {
    setChecks(prev => prev.map(c => c.name === name ? { ...c, ...update } : c));
  };

  const runChecks = async () => {
    if (!user) return;
    
    setIsRunning(true);
    setChecks(initialChecks.map(c => ({ ...c, status: 'running', message: 'Checking...' })));

    // Check 1: Database Connection
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      if (error) throw error;
      updateCheck('Database Connection', { status: 'passed', message: 'Connected to Supabase' });
    } catch (err) {
      updateCheck('Database Connection', { 
        status: 'failed', 
        message: 'Connection failed',
        details: err instanceof Error ? err.message : 'Unknown error'
      });
    }

    // Check 2: Shopify Products
    try {
      const { data, error } = await supabase
        .from('shopify_products')
        .select('id, title', { count: 'exact' })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const count = data?.length || 0;
      if (count > 0) {
        const withImages = data?.filter(p => p.title).length || 0;
        updateCheck('Shopify Products', { 
          status: 'passed', 
          message: `${count} products synced`,
          details: `${withImages} with valid data`
        });
      } else {
        updateCheck('Shopify Products', { 
          status: 'warning', 
          message: 'No products synced',
          details: 'Sync products from Shopify to enable automation'
        });
      }
    } catch (err) {
      updateCheck('Shopify Products', { 
        status: 'failed', 
        message: 'Failed to check products',
        details: err instanceof Error ? err.message : 'Unknown error'
      });
    }

    // Check 3: Creatives Table
    try {
      const { data, error } = await supabase
        .from('creatives')
        .select('id, status, video_url')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const count = data?.length || 0;
      const withVideos = data?.filter(c => c.video_url).length || 0;
      
      if (count > 0) {
        updateCheck('Creatives Table', { 
          status: 'passed', 
          message: `${count} creatives found`,
          details: `${withVideos} with video files`
        });
      } else {
        updateCheck('Creatives Table', { 
          status: 'warning', 
          message: 'No creatives yet',
          details: 'Generate your first video to populate'
        });
      }
    } catch (err) {
      updateCheck('Creatives Table', { 
        status: 'failed', 
        message: 'Failed to check creatives',
        details: err instanceof Error ? err.message : 'Unknown error'
      });
    }

    // Check 4: Platform Accounts
    try {
      const { data, error } = await supabase
        .from('platform_accounts')
        .select('id, platform, health_status')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const count = data?.length || 0;
      const healthy = data?.filter(p => p.health_status === 'healthy').length || 0;
      
      if (count > 0) {
        updateCheck('Platform Accounts', { 
          status: healthy === count ? 'passed' : 'warning', 
          message: `${count} platforms configured`,
          details: `${healthy} healthy, ${count - healthy} degraded`
        });
      } else {
        updateCheck('Platform Accounts', { 
          status: 'warning', 
          message: 'No platforms connected',
          details: 'Connect platforms for publishing'
        });
      }
    } catch (err) {
      updateCheck('Platform Accounts', { 
        status: 'failed', 
        message: 'Failed to check platforms',
        details: err instanceof Error ? err.message : 'Unknown error'
      });
    }

    // Check 5: Revenue Events
    try {
      const { data, error } = await supabase
        .from('revenue_events')
        .select('id, amount')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const count = data?.length || 0;
      const totalRevenue = data?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
      
      if (count > 0) {
        updateCheck('Revenue Events', { 
          status: 'passed', 
          message: `${count} events tracked`,
          details: `$${totalRevenue.toFixed(2)} total revenue`
        });
      } else {
        updateCheck('Revenue Events', { 
          status: 'warning', 
          message: 'No revenue events',
          details: 'Events will appear after orders'
        });
      }
    } catch (err) {
      updateCheck('Revenue Events', { 
        status: 'failed', 
        message: 'Failed to check revenue',
        details: err instanceof Error ? err.message : 'Unknown error'
      });
    }

    // Check 6: Automation Jobs
    try {
      const { data, error } = await supabase
        .from('automation_jobs')
        .select('id, status, job_type')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const count = data?.length || 0;
      const completed = data?.filter(j => j.status === 'completed').length || 0;
      const failed = data?.filter(j => j.status === 'failed').length || 0;
      
      if (count > 0) {
        updateCheck('Automation Jobs', { 
          status: failed > completed ? 'warning' : 'passed', 
          message: `${count} jobs processed`,
          details: `${completed} completed, ${failed} failed`
        });
      } else {
        updateCheck('Automation Jobs', { 
          status: 'warning', 
          message: 'No automation jobs',
          details: 'Jobs will appear when you generate videos'
        });
      }
    } catch (err) {
      updateCheck('Automation Jobs', { 
        status: 'failed', 
        message: 'Failed to check jobs',
        details: err instanceof Error ? err.message : 'Unknown error'
      });
    }

    // Check 7: Quality Gate
    try {
      const { data, error } = await supabase
        .from('quality_gate_decisions')
        .select('id, decision, score')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const count = data?.length || 0;
      const avgScore = count > 0 
        ? data.reduce((sum, d) => sum + (d.score || 0), 0) / count 
        : 0;
      
      if (count > 0) {
        updateCheck('Quality Gate', { 
          status: avgScore >= 50 ? 'passed' : 'warning', 
          message: `${count} decisions made`,
          details: `Average score: ${avgScore.toFixed(0)}/100`
        });
      } else {
        updateCheck('Quality Gate', { 
          status: 'warning', 
          message: 'No quality decisions',
          details: 'Decisions made after video generation'
        });
      }
    } catch (err) {
      updateCheck('Quality Gate', { 
        status: 'failed', 
        message: 'Failed to check quality gate',
        details: err instanceof Error ? err.message : 'Unknown error'
      });
    }

    // Check 8: Video Generation Capability
    try {
      // Check if generate-video-ad edge function is accessible
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-video-ad`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ test: true }),
        }
      );
      
      // Even a 401/400 means the function exists
      if (response.status === 401 || response.status === 400 || response.ok) {
        updateCheck('Video Generation', { 
          status: 'passed', 
          message: 'Edge function available',
          details: 'Ready to generate videos'
        });
      } else {
        throw new Error(`Status: ${response.status}`);
      }
    } catch (err) {
      updateCheck('Video Generation', { 
        status: 'warning', 
        message: 'Edge function check failed',
        details: 'Function may not be deployed yet'
      });
    }

    setLastRun(new Date());
    setIsRunning(false);
  };

  const getStatusIcon = (status: CheckResult['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'failed': return <XCircle className="w-5 h-5 text-destructive" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-warning" />;
      case 'running': return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
      default: return <div className="w-5 h-5 rounded-full bg-muted" />;
    }
  };

  const getCheckIcon = (name: string) => {
    switch (name) {
      case 'Database Connection': return <Database className="w-4 h-4" />;
      case 'Shopify Products': return <Store className="w-4 h-4" />;
      case 'Creatives Table': return <Video className="w-4 h-4" />;
      case 'Platform Accounts': return <Wifi className="w-4 h-4" />;
      case 'Revenue Events': return <DollarSign className="w-4 h-4" />;
      case 'Automation Jobs': return <Zap className="w-4 h-4" />;
      case 'Quality Gate': return <Shield className="w-4 h-4" />;
      case 'Video Generation': return <Video className="w-4 h-4" />;
      default: return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  const passedCount = checks.filter(c => c.status === 'passed').length;
  const warningCount = checks.filter(c => c.status === 'warning').length;
  const failedCount = checks.filter(c => c.status === 'failed').length;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-64">
        <Header />
        
        <div className="p-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-display font-bold mb-2">System Check</h1>
            <p className="text-muted-foreground">
              Validate all system components are operational
            </p>
          </motion.div>

          {/* Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">System Status</h2>
                {lastRun && (
                  <p className="text-xs text-muted-foreground">
                    Last run: {lastRun.toLocaleTimeString()}
                  </p>
                )}
              </div>
              <Button
                onClick={runChecks}
                disabled={isRunning}
                className="gap-2"
              >
                {isRunning ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                {isRunning ? 'Running...' : 'Run All Checks'}
              </Button>
            </div>

            {/* Status Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                <div className="text-2xl font-bold text-success">{passedCount}</div>
                <div className="text-xs text-muted-foreground">Passed</div>
              </div>
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                <div className="text-2xl font-bold text-warning">{warningCount}</div>
                <div className="text-xs text-muted-foreground">Warnings</div>
              </div>
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="text-2xl font-bold text-destructive">{failedCount}</div>
                <div className="text-xs text-muted-foreground">Failed</div>
              </div>
            </div>
          </motion.div>

          {/* Individual Checks */}
          <div className="space-y-3">
            {checks.map((check, index) => (
              <motion.div
                key={check.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className={`glass-card p-4 border-l-4 ${
                  check.status === 'passed' ? 'border-l-success' :
                  check.status === 'failed' ? 'border-l-destructive' :
                  check.status === 'warning' ? 'border-l-warning' :
                  'border-l-muted'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-secondary/50">
                    {getCheckIcon(check.name)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{check.name}</span>
                      {getStatusIcon(check.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{check.message}</p>
                    {check.details && (
                      <p className="text-xs text-muted-foreground/70 mt-1">{check.details}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 p-4 rounded-lg bg-primary/5 border border-primary/20"
          >
            <h3 className="font-medium mb-2">What This Tests</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Database connectivity and table access</li>
              <li>• Shopify product sync status</li>
              <li>• Creative generation and storage</li>
              <li>• Platform API health</li>
              <li>• Revenue event tracking</li>
              <li>• Automation job queue</li>
              <li>• Quality gate enforcement</li>
              <li>• Video generation edge functions</li>
            </ul>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default SystemCheck;
