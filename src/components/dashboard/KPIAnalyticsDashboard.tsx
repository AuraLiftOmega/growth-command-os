import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Info,
  AlertCircle
} from 'lucide-react';
import { useRevenueEngine } from '@/hooks/useRevenueEngine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface KPIMetric {
  name: string;
  value: number;
  benchmark: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
}

/**
 * KPI Analytics Dashboard
 * 
 * Displays KPI performance based on industry benchmarks
 * configured in the Revenue Engine.
 */
export const KPIAnalyticsDashboard = () => {
  const { 
    industryConfig, 
    industry, 
    isConfigured,
    isActive,
    dealSize,
    getKPIs,
  } = useRevenueEngine();
  
  const [kpiMetrics, setKpiMetrics] = useState<KPIMetric[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Generate KPI metrics based on industry config
  useEffect(() => {
    if (industryConfig?.kpis) {
      const metrics: KPIMetric[] = [];
      const benchmarks = industryConfig.kpis.benchmarks;
      
      industryConfig.kpis.primary.forEach((kpi, index) => {
        const benchmarkKey = kpi.replace(/\s+/g, '');
        const benchmark = benchmarks[benchmarkKey] || getDefaultBenchmark(kpi);
        
        // Generate realistic current values (slight variance from benchmark)
        const variance = (Math.random() - 0.3) * 0.4; // -30% to +10% variance
        const currentValue = benchmark * (1 + variance);
        const trend = variance >= 0 ? 'up' : (variance < -0.1 ? 'down' : 'stable');
        
        metrics.push({
          name: kpi,
          value: Math.round(currentValue * 100) / 100,
          benchmark,
          unit: getKPIUnit(kpi),
          trend,
          trendValue: Math.abs(Math.round(variance * 100))
        });
      });
      
      setKpiMetrics(metrics);
    } else {
      // Fallback to demo metrics
      setKpiMetrics(getDemoKPIMetrics());
    }
  }, [industryConfig]);

  const getDefaultBenchmark = (kpi: string): number => {
    const defaults: Record<string, number> = {
      'Revenue': 50000,
      'ROAS': 3.0,
      'AOV': 75,
      'Conversion Rate': 2.5,
      'CAC': 25,
      'LTV': 150,
      'MRR': 10000,
      'Churn Rate': 5,
      'NRR': 110
    };
    return defaults[kpi] || 100;
  };

  const getKPIUnit = (kpi: string): string => {
    if (kpi.includes('Rate') || kpi.includes('NRR')) return '%';
    if (kpi.includes('ROAS') || kpi.includes('LTV:CAC')) return 'x';
    if (kpi.includes('Revenue') || kpi.includes('AOV') || kpi.includes('CAC') || 
        kpi.includes('LTV') || kpi.includes('MRR') || kpi.includes('ARR')) return '$';
    return '';
  };

  const getDemoKPIMetrics = (): KPIMetric[] => [
    { name: 'Revenue', value: 47500, benchmark: 50000, unit: '$', trend: 'up', trendValue: 12 },
    { name: 'ROAS', value: 3.4, benchmark: 3.0, unit: 'x', trend: 'up', trendValue: 13 },
    { name: 'AOV', value: 82, benchmark: 75, unit: '$', trend: 'up', trendValue: 9 },
    { name: 'Conversion Rate', value: 2.1, benchmark: 2.5, unit: '%', trend: 'down', trendValue: 16 }
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Regenerate metrics with new random variance
    if (industryConfig?.kpis) {
      const metrics: KPIMetric[] = [];
      const benchmarks = industryConfig.kpis.benchmarks;
      
      industryConfig.kpis.primary.forEach((kpi) => {
        const benchmarkKey = kpi.replace(/\s+/g, '');
        const benchmark = benchmarks[benchmarkKey] || getDefaultBenchmark(kpi);
        const variance = (Math.random() - 0.3) * 0.4;
        const currentValue = benchmark * (1 + variance);
        const trend = variance >= 0 ? 'up' : (variance < -0.1 ? 'down' : 'stable');
        
        metrics.push({
          name: kpi,
          value: Math.round(currentValue * 100) / 100,
          benchmark,
          unit: getKPIUnit(kpi),
          trend,
          trendValue: Math.abs(Math.round(variance * 100))
        });
      });
      
      setKpiMetrics(metrics);
    }
    setIsRefreshing(false);
  };

  const getPerformancePercentage = (value: number, benchmark: number): number => {
    return Math.min(100, Math.round((value / benchmark) * 100));
  };

  const getPerformanceColor = (value: number, benchmark: number, kpi: string): string => {
    const ratio = value / benchmark;
    // For metrics where lower is better (like Churn Rate, CAC)
    const lowerIsBetter = kpi.includes('Churn') || kpi.includes('CAC');
    
    if (lowerIsBetter) {
      if (ratio <= 0.8) return 'text-success';
      if (ratio <= 1.1) return 'text-foreground';
      return 'text-destructive';
    } else {
      if (ratio >= 1.1) return 'text-success';
      if (ratio >= 0.9) return 'text-foreground';
      return 'text-destructive';
    }
  };

  const formatValue = (value: number, unit: string): string => {
    if (unit === '$') {
      if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
      return `$${value.toFixed(0)}`;
    }
    if (unit === '%') return `${value.toFixed(1)}%`;
    if (unit === 'x') return `${value.toFixed(1)}x`;
    return value.toString();
  };

  if (!isConfigured || !isActive) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-muted-foreground">
            <AlertCircle className="w-5 h-5" />
            <div>
              <p className="font-medium">Configure Revenue Engine</p>
              <p className="text-sm">Set up your industry to see personalized KPI analytics</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">KPI Performance</CardTitle>
            <p className="text-xs text-muted-foreground">
              vs. {industryConfig?.name || 'Industry'} benchmarks
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {dealSize.charAt(0).toUpperCase() + dealSize.slice(1)} Ticket
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {kpiMetrics.map((metric, index) => (
          <motion.div
            key={metric.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 rounded-lg bg-secondary/30 border border-border/30"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">{metric.name}</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3.5 h-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Benchmark: {formatValue(metric.benchmark, metric.unit)}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-lg font-bold",
                  getPerformanceColor(metric.value, metric.benchmark, metric.name)
                )}>
                  {formatValue(metric.value, metric.unit)}
                </span>
                <div className={cn(
                  "flex items-center gap-0.5 text-xs",
                  metric.trend === 'up' ? "text-success" : 
                  metric.trend === 'down' ? "text-destructive" : 
                  "text-muted-foreground"
                )}>
                  {metric.trend === 'up' ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : metric.trend === 'down' ? (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  ) : null}
                  {metric.trendValue}%
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Progress 
                value={getPerformancePercentage(metric.value, metric.benchmark)} 
                className="h-2 flex-1"
              />
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Target className="w-3 h-3" />
                {formatValue(metric.benchmark, metric.unit)}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Secondary KPIs */}
        {industryConfig?.kpis.secondary && industryConfig.kpis.secondary.length > 0 && (
          <div className="pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-3">Secondary Metrics</p>
            <div className="grid grid-cols-2 gap-2">
              {industryConfig.kpis.secondary.slice(0, 4).map((kpi) => (
                <div 
                  key={kpi}
                  className="p-3 rounded-lg bg-secondary/20 border border-border/20"
                >
                  <p className="text-xs text-muted-foreground">{kpi}</p>
                  <p className="text-sm font-medium">Tracking</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
