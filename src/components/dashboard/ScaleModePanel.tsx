import { motion } from "framer-motion";
import { Rocket, Zap, RefreshCw, Brain, Target, ToggleLeft, ToggleRight, Cloud } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { automationService } from "@/services/database-service";

interface ScaleSetting {
  id: string;
  dbKey: string;
  label: string;
  description: string;
  icon: typeof Rocket;
  enabled: boolean;
}

export const ScaleModePanel = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const [settings, setSettings] = useState<ScaleSetting[]>([
    {
      id: "aggressive-testing",
      dbKey: "aggressive_testing",
      label: "Aggressive Creative Testing",
      description: "Generate 10x variations, test faster",
      icon: Rocket,
      enabled: true,
    },
    {
      id: "auto-regeneration",
      dbKey: "auto_regeneration",
      label: "Auto-Regeneration",
      description: "Weak outputs regenerate silently",
      icon: RefreshCw,
      enabled: true,
    },
    {
      id: "multi-variation",
      dbKey: "multi_variation",
      label: "Multi-Variation Generation",
      description: "Every prompt creates 5-10 variants",
      icon: Target,
      enabled: true,
    },
    {
      id: "auto-posting",
      dbKey: "auto_posting",
      label: "Auto-Post & Repost Winners",
      description: "Scale winners 24/7 automatically",
      icon: Zap,
      enabled: true,
    },
    {
      id: "performance-scaling",
      dbKey: "performance_scaling",
      label: "Performance-Based Scaling",
      description: "Budget follows ROAS automatically",
      icon: Brain,
      enabled: true,
    },
  ]);

  const [humanApproval, setHumanApproval] = useState(false);
  const [stats, setStats] = useState({
    creativesToday: 847,
    autoKilled: 23,
    scalingNow: 12,
  });

  // Load settings from database
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      
      try {
        const data = await automationService.fetchSettings(user.id);
        if (data) {
          setSettings(prev => prev.map(s => ({
            ...s,
            enabled: data[s.dbKey as keyof typeof data] as boolean ?? s.enabled,
          })));
          setHumanApproval(data.human_approval_required ?? false);
          setStats({
            creativesToday: data.creatives_generated_today ?? 847,
            autoKilled: data.auto_killed_today ?? 23,
            scalingNow: data.scaling_now ?? 12,
          });
        }
      } catch (error) {
        console.error("Error loading automation settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  // Debounced save function
  const saveSettings = useCallback(async (updatedSettings: ScaleSetting[], updatedHumanApproval: boolean) => {
    if (!user) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setIsSaving(true);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const updateData: Record<string, boolean> = {
          human_approval_required: updatedHumanApproval,
        };
        updatedSettings.forEach(s => {
          updateData[s.dbKey] = s.enabled;
        });
        
        await automationService.updateSettings(user.id, updateData);
      } catch (error) {
        console.error("Error saving automation settings:", error);
      } finally {
        setIsSaving(false);
      }
    }, 500);
  }, [user]);

  const toggleSetting = (id: string) => {
    const updated = settings.map(s => (s.id === id ? { ...s, enabled: !s.enabled } : s));
    setSettings(updated);
    saveSettings(updated, humanApproval);
  };

  const toggleHumanApproval = () => {
    const updated = !humanApproval;
    setHumanApproval(updated);
    saveSettings(settings, updated);
  };

  const allEnabled = settings.every(s => s.enabled);

  if (isLoading) {
    return (
      <div className="glass-card-elevated p-6 flex items-center justify-center min-h-[300px]">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card-elevated p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-destructive/30 to-warning/30 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-warning" />
            </div>
            {allEnabled && (
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-success animate-pulse" />
            )}
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg">Aggressive Scale Mode</h3>
            <p className="text-muted-foreground text-sm">
              {allEnabled ? "Maximum velocity enabled" : "Partial automation"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isSaving && (
            <Cloud className="w-4 h-4 text-primary animate-pulse" />
          )}
          <div className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wider ${
            allEnabled 
              ? "bg-success/20 text-success border border-success/30" 
              : "bg-warning/20 text-warning border border-warning/30"
          }`}>
            {allEnabled ? "FULL AUTO" : "PARTIAL"}
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {settings.map((setting, index) => {
          const Icon = setting.icon;
          return (
            <motion.div
              key={setting.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: 0.15 + index * 0.05 }}
              onClick={() => toggleSetting(setting.id)}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                setting.enabled
                  ? "bg-success/5 border-success/20 hover:bg-success/10"
                  : "bg-secondary/30 border-border/50 hover:bg-secondary/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${setting.enabled ? "text-success" : "text-muted-foreground"}`} />
                  <div>
                    <p className={`text-sm font-medium ${setting.enabled ? "text-foreground" : "text-muted-foreground"}`}>
                      {setting.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{setting.description}</p>
                  </div>
                </div>
                {setting.enabled ? (
                  <ToggleRight className="w-6 h-6 text-success" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Human Approval Toggle */}
      <div
        onClick={toggleHumanApproval}
        className={`p-3 rounded-lg border cursor-pointer transition-all ${
          humanApproval
            ? "bg-warning/10 border-warning/30"
            : "bg-primary/5 border-primary/20"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Human Approval Required</p>
            <p className="text-xs text-muted-foreground">
              {humanApproval ? "Manual review before posting" : "Full automation enabled"}
            </p>
          </div>
          {humanApproval ? (
            <ToggleRight className="w-6 h-6 text-warning" />
          ) : (
            <ToggleLeft className="w-6 h-6 text-primary" />
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border/50">
        <div className="text-center">
          <p className="text-2xl font-display font-bold text-success">{stats.creativesToday}</p>
          <p className="text-xs text-muted-foreground">Creatives Today</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-display font-bold text-destructive">{stats.autoKilled}</p>
          <p className="text-xs text-muted-foreground">Auto-Killed</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-display font-bold text-primary">{stats.scalingNow}</p>
          <p className="text-xs text-muted-foreground">Scaling Now</p>
        </div>
      </div>
    </motion.div>
  );
};
