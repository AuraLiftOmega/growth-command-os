import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  DollarSign, TrendingUp, Package, Mail, Zap, Bot, RefreshCw,
  ShoppingCart, BarChart3, ArrowUpRight, AlertTriangle, CheckCircle2
} from "lucide-react";

export default function RevenueCommandPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [botQueue, setBotQueue] = useState<any>({ stats: {}, jobs: [] });
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [sourcing, setSourcing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    await Promise.all([loadSuppliers(), loadBotQueue(), loadCampaigns(), loadSourcing()]);
    setLoading(false);
  }

  async function loadSuppliers() {
    const { data } = await supabase.from("supplier_connections").select("*").order("priority_rank");
    setSuppliers(data || []);
  }

  async function loadBotQueue() {
    const { data } = await supabase.from("bot_execution_queue").select("*").order("created_at", { ascending: false }).limit(20);
    const jobs = data || [];
    setBotQueue({
      stats: {
        total: jobs.length,
        queued: jobs.filter(j => j.status === "queued").length,
        executing: jobs.filter(j => j.status === "executing").length,
        completed: jobs.filter(j => j.status === "completed").length,
        failed: jobs.filter(j => j.status === "failed").length,
      },
      jobs,
    });
  }

  async function loadCampaigns() {
    const { data } = await supabase.from("email_campaigns").select("*").order("created_at", { ascending: false }).limit(10);
    setCampaigns(data || []);
  }

  async function loadSourcing() {
    const { data } = await supabase.from("product_sourcing").select("*").order("created_at", { ascending: false });
    setSourcing(data || []);
  }

  async function initSuppliers() {
    toast.info("Initializing suppliers...");
    const { data, error } = await supabase.functions.invoke("supplier-manager", {
      body: { action: "init_suppliers" },
    });
    if (error) { toast.error("Failed to init suppliers"); return; }
    toast.success(`Initialized ${data.initialized} suppliers`);
    loadSuppliers();
  }

  async function runMarginAudit() {
    toast.info("Running margin audit...");
    const { data, error } = await supabase.functions.invoke("supplier-manager", {
      body: { action: "margin_audit" },
    });
    if (error) { toast.error("Audit failed"); return; }
    if (data.margin_violations > 0) {
      toast.warning(`${data.margin_violations} products below 60% margin!`);
    } else {
      toast.success(`All ${data.total_products} products meet 60% margin ✅`);
    }
  }

  async function executeBot(command: string, botName: string) {
    toast.info(`Executing: ${botName}...`);
    const { data, error } = await supabase.functions.invoke("bot-executor", {
      body: { action: "execute_now", bot_id: command, bot_name: botName, command, payload: {} },
    });
    if (error) { toast.error(`${botName} failed`); return; }
    toast.success(`${botName} executed ✅`);
    loadBotQueue();
  }

  const marginViolations = sourcing.filter(s => s.profit_margin !== null && s.profit_margin < 60);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Revenue Command Center</h1>
          <p className="text-sm text-muted-foreground">Multi-supplier sourcing • Email campaigns • Bot execution • Real Stripe revenue</p>
        </div>
        <Button onClick={loadAll} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{suppliers.filter(s => s.is_active).length}</p>
                <p className="text-xs text-muted-foreground">Active Suppliers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{campaigns.length}</p>
                <p className="text-xs text-muted-foreground">Email Campaigns</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{botQueue.stats.completed || 0}</p>
                <p className="text-xs text-muted-foreground">Bot Executions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              {marginViolations.length > 0 ? (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
              <div>
                <p className="text-2xl font-bold">{sourcing.length}</p>
                <p className="text-xs text-muted-foreground">Sourced Products</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="suppliers">
        <TabsList>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="bots">Bot Executor</TabsTrigger>
          <TabsTrigger value="email">Email Engine</TabsTrigger>
          <TabsTrigger value="sourcing">Product Sourcing</TabsTrigger>
        </TabsList>

        {/* SUPPLIERS TAB */}
        <TabsContent value="suppliers" className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={initSuppliers} size="sm"><Zap className="h-4 w-4 mr-1" /> Init All Suppliers</Button>
            <Button onClick={runMarginAudit} variant="outline" size="sm"><BarChart3 className="h-4 w-4 mr-1" /> Margin Audit</Button>
          </div>
          <div className="grid gap-3">
            {suppliers.length === 0 ? (
              <Card><CardContent className="p-6 text-center text-muted-foreground">
                No suppliers configured yet. Click "Init All Suppliers" to set up CJ, Spocket, Zendrop & DSers.
              </CardContent></Card>
            ) : suppliers.map(s => (
              <Card key={s.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{s.supplier_name.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}</span>
                      <Badge variant={s.is_active ? "default" : "secondary"}>{s.is_active ? "Active" : "Inactive"}</Badge>
                      <Badge variant="outline">Priority #{s.priority_rank}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      ~{s.avg_shipping_days}d shipping • {s.total_orders_fulfilled || 0} orders • {s.success_rate}% success
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={async () => {
                      await supabase.from("supplier_connections").update({ is_active: !s.is_active }).eq("id", s.id);
                      loadSuppliers();
                      toast.success(`${s.supplier_name} ${s.is_active ? "deactivated" : "activated"}`);
                    }}>
                      {s.is_active ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* BOT EXECUTOR TAB */}
        <TabsContent value="bots" className="space-y-4">
          <p className="text-sm text-muted-foreground">Force execute bots instantly — no waiting, no approval needed. <Badge variant="destructive">force=true</Badge></p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { cmd: "hunt_products", name: "🔍 Hunt Products", desc: "Find winning products" },
              { cmd: "optimize_ads", name: "📈 Optimize Ads", desc: "ROAS optimization cycle" },
              { cmd: "recover_carts", name: "🛒 Recover Carts", desc: "Abandoned cart recovery" },
              { cmd: "scale_winners", name: "🚀 Scale Winners", desc: "5x spend on winners" },
              { cmd: "kill_losers", name: "💀 Kill Losers", desc: "Kill ROAS < 3.5x" },
              { cmd: "sync_suppliers", name: "🔄 Sync Suppliers", desc: "Inventory sync" },
            ].map(bot => (
              <Card key={bot.cmd} className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => executeBot(bot.cmd, bot.name)}>
                <CardContent className="p-4">
                  <p className="font-medium">{bot.name}</p>
                  <p className="text-xs text-muted-foreground">{bot.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {botQueue.jobs.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Recent Executions</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {botQueue.jobs.slice(0, 10).map((job: any) => (
                    <div key={job.id} className="flex items-center justify-between text-sm border-b pb-2">
                      <div>
                        <span className="font-medium">{job.bot_name}</span>
                        <span className="text-muted-foreground ml-2">{job.command}</span>
                      </div>
                      <Badge variant={
                        job.status === "completed" ? "default" :
                        job.status === "failed" ? "destructive" :
                        job.status === "executing" ? "secondary" : "outline"
                      }>{job.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* EMAIL ENGINE TAB */}
        <TabsContent value="email" className="space-y-4">
          <div className="flex gap-2">
            <Button size="sm"><Mail className="h-4 w-4 mr-1" /> Create Campaign</Button>
            <Button variant="outline" size="sm" onClick={async () => {
              const { data, error } = await supabase.functions.invoke("email-campaign-engine", {
                body: { action: "process_sequences" },
              });
              if (error) { toast.error("Failed to process sequences"); return; }
              toast.success(`Processed ${data.processed} sequence emails`);
            }}>
              <Zap className="h-4 w-4 mr-1" /> Process Sequences
            </Button>
          </div>

          {campaigns.length === 0 ? (
            <Card><CardContent className="p-6 text-center text-muted-foreground">
              No campaigns yet. Create your first email campaign to start monetizing your list.
            </CardContent></Card>
          ) : (
            <div className="grid gap-3">
              {campaigns.map(c => (
                <Card key={c.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.subject}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={c.status === "sent" ? "default" : "outline"}>{c.status}</Badge>
                        {c.total_sent > 0 && (
                          <span className="text-xs text-muted-foreground">{c.total_sent} sent</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* SOURCING TAB */}
        <TabsContent value="sourcing" className="space-y-4">
          {sourcing.length === 0 ? (
            <Card><CardContent className="p-6 text-center text-muted-foreground">
              No products sourced yet. Products will appear here as they're matched with suppliers.
            </CardContent></Card>
          ) : (
            <div className="space-y-3">
              {sourcing.map(p => (
                <Card key={p.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{p.product_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.supplier_name} • Cost: ${p.cost_price} + ${p.shipping_cost} ship • Sells: ${p.selling_price}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={p.meets_60pct_margin ? "default" : "destructive"}>
                        {p.profit_margin?.toFixed(1)}% margin
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
