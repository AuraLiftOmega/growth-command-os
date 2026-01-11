import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { BotCard } from "./BotCard";
import { BotTeam } from "./BotTeamData";
import { 
  ChevronDown, ChevronUp, Power, Zap, 
  TrendingUp, Activity, DollarSign 
} from "lucide-react";

interface BotTeamSectionProps {
  teamKey: string;
  team: BotTeam;
  activeBots: Set<string>;
  botStats: Record<string, { tasks: number; revenue: number; successRate: number }>;
  onToggleBot: (botId: string) => void;
  onBotAction: (botId: string, action: string) => void;
  onActivateTeam: (teamKey: string) => void;
}

export function BotTeamSection({
  teamKey,
  team,
  activeBots,
  botStats,
  onToggleBot,
  onBotAction,
  onActivateTeam,
}: BotTeamSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const activeCount = team.bots.filter(bot => activeBots.has(bot.id)).length;
  const teamRevenue = team.bots.reduce((sum, bot) => sum + (botStats[bot.id]?.revenue || 0), 0);
  const teamTasks = team.bots.reduce((sum, bot) => sum + (botStats[bot.id]?.tasks || 0), 0);

  return (
    <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader 
        className="cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: team.color }}
            />
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {team.name}
                <Badge variant="outline" className="text-xs">
                  {activeCount}/{team.bots.length} active
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">{team.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Team stats */}
            <div className="hidden md:flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span>{teamTasks} tasks</span>
              </div>
              <div className="flex items-center gap-1 text-green-500">
                <DollarSign className="h-4 w-4" />
                <span>${teamRevenue.toFixed(2)}</span>
              </div>
            </div>
            
            {/* Activate all button */}
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onActivateTeam(teamKey);
              }}
              style={{ borderColor: team.color, color: team.color }}
            >
              <Power className="h-4 w-4 mr-1" />
              Activate All
            </Button>
            
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
          >
            {team.bots.map((bot, index) => (
              <motion.div
                key={bot.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <BotCard
                  bot={bot}
                  teamColor={team.color}
                  isActive={activeBots.has(bot.id)}
                  stats={botStats[bot.id]}
                  onToggle={onToggleBot}
                  onAction={onBotAction}
                />
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
      )}
    </Card>
  );
}
