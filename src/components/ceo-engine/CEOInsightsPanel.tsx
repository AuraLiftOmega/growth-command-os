import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  ChevronRight,
  Zap,
  Target,
  DollarSign
} from 'lucide-react';

interface Insight {
  id: string;
  type: 'opportunity' | 'warning' | 'recommendation';
  title: string;
  description: string;
  impact: string;
  priority: 'high' | 'medium' | 'low';
  action?: string;
}

export function CEOInsightsPanel() {
  const [insights, setInsights] = useState<Insight[]>([
    {
      id: '1',
      type: 'opportunity',
      title: 'Untapped Revenue: Abandoned Carts',
      description: '47 high-value carts abandoned in last 24h. Average value $234.',
      impact: '+$11,000 recoverable',
      priority: 'high',
      action: 'Deploy recovery sequence'
    },
    {
      id: '2',
      type: 'recommendation',
      title: 'Pricing Optimization Detected',
      description: 'Competitor X just raised prices 15%. You can capture market share or increase margins.',
      impact: '+8% margin possible',
      priority: 'high',
      action: 'Analyze pricing'
    },
    {
      id: '3',
      type: 'warning',
      title: 'Ad Fatigue Detected',
      description: 'Creative "Summer Sale v3" showing CTR decline. Replace within 48h.',
      impact: '-$2,400/week if ignored',
      priority: 'medium',
      action: 'Generate new creative'
    },
    {
      id: '4',
      type: 'opportunity',
      title: 'Viral Potential Identified',
      description: 'Product X getting unusual social mentions. Strike while hot.',
      impact: '10x impression potential',
      priority: 'high',
      action: 'Amplify now'
    },
    {
      id: '5',
      type: 'recommendation',
      title: 'Upsell Opportunity',
      description: '23% of customers buy Product A alone. Bundle with B increases AOV 40%.',
      impact: '+$5,200/month',
      priority: 'medium',
      action: 'Create bundle'
    }
  ]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <DollarSign className="w-4 h-4 text-success" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'recommendation':
        return <Lightbulb className="w-4 h-4 text-blue-400" />;
      default:
        return <Brain className="w-4 h-4" />;
    }
  };

  const getInsightStyle = (type: string) => {
    switch (type) {
      case 'opportunity':
        return 'border-success/30 bg-success/5';
      case 'warning':
        return 'border-amber-500/30 bg-amber-500/5';
      case 'recommendation':
        return 'border-blue-500/30 bg-blue-500/5';
      default:
        return '';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/30">Urgent</Badge>;
      case 'medium':
        return <Badge variant="outline">Medium</Badge>;
      case 'low':
        return <Badge variant="secondary">Low</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20">
              <Brain className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <CardTitle className="text-base">CEO Insights</CardTitle>
              <CardDescription>AI-detected opportunities & risks</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            <Zap className="w-2.5 h-2.5 mr-1" />
            {insights.filter(i => i.priority === 'high').length} urgent
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-3 rounded-lg border ${getInsightStyle(insight.type)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getInsightIcon(insight.type)}
                    <span className="font-medium text-sm">{insight.title}</span>
                  </div>
                  {getPriorityBadge(insight.priority)}
                </div>
                
                <p className="text-xs text-muted-foreground mb-2">
                  {insight.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs font-medium text-success">
                    <TrendingUp className="w-3 h-3" />
                    {insight.impact}
                  </div>
                  {insight.action && (
                    <Button size="sm" variant="ghost" className="h-6 text-xs gap-1">
                      {insight.action}
                      <ChevronRight className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
