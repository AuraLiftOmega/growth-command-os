import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Bot } from "./BotTeamData";
import { Play, Pause, Activity, Zap } from "lucide-react";

interface BotCardProps {
  bot: Bot;
  teamColor: string;
  isActive: boolean;
  stats?: {
    tasks: number;
    revenue: number;
    successRate: number;
  };
  onToggle: (botId: string) => void;
  onAction: (botId: string, action: string) => void;
}

export function BotCard({ bot, teamColor, isActive, stats, onToggle, onAction }: BotCardProps) {
  const [isWorking, setIsWorking] = useState(false);
  const Icon = bot.icon;

  const handleTrigger = async () => {
    setIsWorking(true);
    await onAction(bot.id, "manual_trigger");
    setTimeout(() => setIsWorking(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm ${isActive ? 'ring-1 ring-primary/30' : ''}`}>
        {/* Activity indicator */}
        {isWorking && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
        
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${teamColor}20` }}
              >
                <Icon className="h-5 w-5" style={{ color: teamColor }} />
              </div>
              <div>
                <h4 className="font-semibold text-sm">{bot.name}</h4>
                <p className="text-xs text-muted-foreground">{bot.description}</p>
              </div>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={() => onToggle(bot.id)}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-muted/30 rounded-md p-2">
              <p className="text-xs text-muted-foreground">Tasks</p>
              <p className="text-sm font-bold">{stats?.tasks || 0}</p>
            </div>
            <div className="bg-muted/30 rounded-md p-2">
              <p className="text-xs text-muted-foreground">Revenue</p>
              <p className="text-sm font-bold text-green-500">${(stats?.revenue || 0).toFixed(0)}</p>
            </div>
            <div className="bg-muted/30 rounded-md p-2">
              <p className="text-xs text-muted-foreground">Success</p>
              <p className="text-sm font-bold">{stats?.successRate || 98}%</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs"
              onClick={handleTrigger}
              disabled={isWorking || !isActive}
            >
              {isWorking ? (
                <>
                  <Activity className="h-3 w-3 mr-1 animate-pulse" />
                  Working...
                </>
              ) : (
                <>
                  <Zap className="h-3 w-3 mr-1" />
                  Trigger
                </>
              )}
            </Button>
          </div>

          {/* Status badge */}
          <div className="flex justify-between items-center">
            <Badge 
              variant={isActive ? "default" : "secondary"}
              className="text-xs"
              style={isActive ? { backgroundColor: teamColor } : {}}
            >
              {isActive ? "Active" : "Standby"}
            </Badge>
            <span className="text-xs text-muted-foreground">{bot.specialty}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
