import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Building2, 
  Quote, 
  FileText,
  Plus,
  Check,
  Eye,
  Megaphone,
  Swords,
  Loader2,
  Trash2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProofAsset {
  id: string;
  asset_type: string;
  title: string;
  description: string | null;
  metric_value: string | null;
  metric_unit: string | null;
  brand_name: string | null;
  approved_for: string[];
  is_anonymized: boolean;
  is_approved: boolean;
  created_at: string;
}

const assetTypeConfig: Record<string, { icon: typeof DollarSign; color: string; bgColor: string; label: string }> = {
  revenue_increase: { icon: DollarSign, color: "text-accent", bgColor: "bg-accent/20", label: "Revenue Increase" },
  time_saved: { icon: Clock, color: "text-primary", bgColor: "bg-primary/20", label: "Time Saved" },
  agency_replaced: { icon: Building2, color: "text-destructive", bgColor: "bg-destructive/20", label: "Agency Replaced" },
  quote: { icon: Quote, color: "text-warning", bgColor: "bg-warning/20", label: "Quote" },
  case_study: { icon: FileText, color: "text-primary", bgColor: "bg-primary/20", label: "Case Study" }
};

const feedTargets = [
  { id: "ads", label: "Ads", icon: Megaphone },
  { id: "sales", label: "Sales", icon: TrendingUp },
  { id: "pr", label: "PR / Narrative", icon: Swords }
];

export const ProofEngine = () => {
  const { user } = useAuth();
  const [assets, setAssets] = useState<ProofAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    asset_type: 'revenue_increase',
    title: '',
    description: '',
    metric_value: '',
    metric_unit: '',
    brand_name: '',
    approved_for: [] as string[],
    is_anonymized: true
  });

  useEffect(() => {
    if (user) {
      fetchAssets();
    }
  }, [user]);

  const fetchAssets = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('proof_assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      console.error("Error fetching proof assets:", error);
      toast.error("Failed to load proof assets");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user || !formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('proof_assets')
        .insert({
          user_id: user.id,
          asset_type: formData.asset_type,
          title: formData.title,
          description: formData.description || null,
          metric_value: formData.metric_value || null,
          metric_unit: formData.metric_unit || null,
          brand_name: formData.brand_name || null,
          approved_for: formData.approved_for,
          is_anonymized: formData.is_anonymized,
          is_approved: false
        });

      if (error) throw error;

      toast.success("Proof asset created");
      setIsDialogOpen(false);
      setFormData({
        asset_type: 'revenue_increase',
        title: '',
        description: '',
        metric_value: '',
        metric_unit: '',
        brand_name: '',
        approved_for: [],
        is_anonymized: true
      });
      fetchAssets();
    } catch (error) {
      console.error("Error creating proof asset:", error);
      toast.error("Failed to create proof asset");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleApprovedFor = (target: string) => {
    setFormData(prev => ({
      ...prev,
      approved_for: prev.approved_for.includes(target)
        ? prev.approved_for.filter(t => t !== target)
        : [...prev.approved_for, target]
    }));
  };

  const deleteAsset = async (id: string) => {
    try {
      const { error } = await supabase
        .from('proof_assets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setAssets(prev => prev.filter(a => a.id !== id));
      toast.success("Proof asset deleted");
    } catch (error) {
      console.error("Error deleting proof asset:", error);
      toast.error("Failed to delete proof asset");
    }
  };

  // Stats
  const stats = {
    revenueIncreases: assets.filter(a => a.asset_type === "revenue_increase").length,
    timeSaved: assets.filter(a => a.asset_type === "time_saved").length,
    agenciesReplaced: assets.filter(a => a.asset_type === "agency_replaced").length,
    quotes: assets.filter(a => a.asset_type === "quote").length,
    caseStudies: assets.filter(a => a.asset_type === "case_study").length
  };

  const totalAssets = assets.length;
  const caseStudyReady = assets.filter(a => a.approved_for && a.approved_for.length >= 2).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-elevated p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl">Proof & Leverage Engine</h2>
            <p className="text-sm text-muted-foreground">Track, collect, and deploy proof assets</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-4 rounded-lg bg-accent/10 border border-accent/30 text-center">
            <DollarSign className="w-6 h-6 text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold text-accent">{stats.revenueIncreases}</p>
            <p className="text-xs text-muted-foreground">Revenue Increases</p>
          </div>
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/30 text-center">
            <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-primary">{stats.timeSaved}</p>
            <p className="text-xs text-muted-foreground">Time Saved</p>
          </div>
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-center">
            <Building2 className="w-6 h-6 text-destructive mx-auto mb-2" />
            <p className="text-2xl font-bold text-destructive">{stats.agenciesReplaced}</p>
            <p className="text-xs text-muted-foreground">Agencies Replaced</p>
          </div>
          <div className="p-4 rounded-lg bg-warning/10 border border-warning/30 text-center">
            <Quote className="w-6 h-6 text-warning mx-auto mb-2" />
            <p className="text-2xl font-bold text-warning">{stats.quotes}</p>
            <p className="text-xs text-muted-foreground">Quotes</p>
          </div>
          <div className="p-4 rounded-lg bg-secondary border border-border text-center">
            <FileText className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-2xl font-bold">{caseStudyReady}</p>
            <p className="text-xs text-muted-foreground">Case Study Ready</p>
          </div>
        </div>
      </motion.div>

      {/* Feed Targets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <h3 className="font-display font-semibold text-lg mb-4">Feed Outputs Into</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {feedTargets.map((target) => {
            const count = assets.filter(a => a.approved_for?.includes(target.id)).length;
            return (
              <div key={target.id} className="p-4 rounded-lg bg-secondary/50 border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <target.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{target.label}</p>
                    <p className="text-xs text-muted-foreground">{count} assets ready</p>
                  </div>
                </div>
                <Progress value={totalAssets > 0 ? (count / totalAssets) * 100 : 0} className="h-2" />
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Asset List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-lg">Proof Assets</h3>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Asset
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Proof Asset</DialogTitle>
                <DialogDescription>
                  Document a win, result, or testimonial to use in sales and marketing.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Asset Type</label>
                  <Select value={formData.asset_type} onValueChange={(v) => setFormData(prev => ({ ...prev, asset_type: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revenue_increase">Revenue Increase</SelectItem>
                      <SelectItem value="time_saved">Time Saved</SelectItem>
                      <SelectItem value="agency_replaced">Agency Replaced</SelectItem>
                      <SelectItem value="quote">Quote / Testimonial</SelectItem>
                      <SelectItem value="case_study">Case Study</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Title</label>
                  <Input 
                    placeholder="e.g., 47% revenue increase in 30 days"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Description (optional)</label>
                  <Textarea 
                    placeholder="Additional context..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Metric Value</label>
                    <Input 
                      placeholder="e.g., +47%"
                      value={formData.metric_value}
                      onChange={(e) => setFormData(prev => ({ ...prev, metric_value: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Brand Name</label>
                    <Input 
                      placeholder="e.g., Fashion Brand"
                      value={formData.brand_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, brand_name: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Approve For</label>
                  <div className="flex gap-2">
                    {feedTargets.map(target => (
                      <Button
                        key={target.id}
                        type="button"
                        variant={formData.approved_for.includes(target.id) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleApprovedFor(target.id)}
                      >
                        {target.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting || !formData.title.trim()}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Asset'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {assets.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Proof Assets Yet</h3>
            <p className="text-muted-foreground mb-4">Start documenting your wins to build leverage.</p>
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Your First Asset
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {assets.map((asset, index) => {
              const config = assetTypeConfig[asset.asset_type] || assetTypeConfig.case_study;
              const Icon = config.icon;

              return (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + index * 0.05 }}
                  className="glass-card p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${config.bgColor} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-6 h-6 ${config.color}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {config.label}
                        </Badge>
                        {asset.is_anonymized && (
                          <Badge variant="outline" className="text-xs text-muted-foreground">
                            <Eye className="w-3 h-3 mr-1" />
                            Anonymized
                          </Badge>
                        )}
                        {asset.is_approved && (
                          <Badge className="bg-success/20 text-success border-success/30 text-xs">
                            Approved
                          </Badge>
                        )}
                      </div>

                      <p className="font-medium text-foreground mb-1">
                        {asset.asset_type === "quote" ? `"${asset.title}"` : asset.title}
                      </p>

                      {asset.brand_name && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {asset.asset_type === "quote" ? `— ${asset.brand_name}` : asset.brand_name}
                        </p>
                      )}

                      {asset.approved_for && asset.approved_for.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Approved for:</span>
                          {asset.approved_for.map((target) => (
                            <Badge key={target} className="bg-accent/20 text-accent border-accent/30 text-xs">
                              <Check className="w-3 h-3 mr-1" />
                              {target}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {asset.metric_value && (
                        <div className="text-right shrink-0">
                          <p className={`text-2xl font-bold ${config.color}`}>{asset.metric_value}</p>
                        </div>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => deleteAsset(asset.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
};
