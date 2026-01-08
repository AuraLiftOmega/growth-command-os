/**
 * Pinterest Metrics Heatmap
 * Shows impressions/saves/clicks by hour and day
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Eye, Heart, MousePointerClick } from 'lucide-react';

type MetricType = 'impressions' | 'saves' | 'clicks';

const hours = Array.from({ length: 24 }, (_, i) => i);
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Generate demo heatmap data
const generateHeatmapData = () => {
  return days.map((day) => ({
    day,
    hours: hours.map((hour) => ({
      hour,
      impressions: Math.floor(Math.random() * 5000) + 500,
      saves: Math.floor(Math.random() * 200) + 10,
      clicks: Math.floor(Math.random() * 150) + 20,
    })),
  }));
};

const metricConfig: Record<MetricType, { label: string; icon: typeof Eye; max: number }> = {
  impressions: { label: 'Impressions', icon: Eye, max: 5500 },
  saves: { label: 'Saves', icon: Heart, max: 220 },
  clicks: { label: 'Clicks', icon: MousePointerClick, max: 170 },
};

export function PinterestHeatmap() {
  const [metric, setMetric] = useState<MetricType>('impressions');
  const data = useMemo(() => generateHeatmapData(), []);
  const config = metricConfig[metric];
  const Icon = config.icon;

  const getIntensity = (value: number) => {
    const normalized = value / config.max;
    if (normalized > 0.8) return 'bg-primary';
    if (normalized > 0.6) return 'bg-primary/70';
    if (normalized > 0.4) return 'bg-primary/50';
    if (normalized > 0.2) return 'bg-primary/30';
    return 'bg-primary/10';
  };

  const getGlow = (value: number) => {
    const normalized = value / config.max;
    if (normalized > 0.8) return 'shadow-[0_0_12px_hsl(var(--primary)/0.6)]';
    if (normalized > 0.6) return 'shadow-[0_0_8px_hsl(var(--primary)/0.4)]';
    return '';
  };

  const totalMetric = data.reduce(
    (sum, day) => sum + day.hours.reduce((s, h) => s + h[metric], 0),
    0
  );

  const peakHour = useMemo(() => {
    let max = 0;
    let peak = { day: '', hour: 0 };
    data.forEach((d) => {
      d.hours.forEach((h) => {
        if (h[metric] > max) {
          max = h[metric];
          peak = { day: d.day, hour: h.hour };
        }
      });
    });
    return peak;
  }, [data, metric]);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Pinterest Performance Heatmap</h3>
            <p className="text-sm text-muted-foreground">
              {config.label} by hour &amp; day • Total: {totalMetric.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-success border-success/30">
            Peak: {peakHour.day} {peakHour.hour}:00
          </Badge>
          <Select value={metric} onValueChange={(v) => setMetric(v as MetricType)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="impressions">Impressions</SelectItem>
              <SelectItem value="saves">Saves</SelectItem>
              <SelectItem value="clicks">Clicks</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1">
        {/* Hour labels */}
        <div className="flex gap-1 ml-12">
          {hours.filter((h) => h % 3 === 0).map((hour) => (
            <div
              key={hour}
              className="text-[10px] text-muted-foreground"
              style={{ width: '36px', marginLeft: hour === 0 ? 0 : `${(3 - 1) * 12}px` }}
            >
              {hour}:00
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <TooltipProvider>
          {data.map((dayData, dayIndex) => (
            <motion.div
              key={dayData.day}
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: dayIndex * 0.05 }}
            >
              <span className="w-10 text-xs text-muted-foreground text-right">
                {dayData.day}
              </span>
              <div className="flex gap-0.5">
                {dayData.hours.map((hourData) => (
                  <Tooltip key={hourData.hour}>
                    <TooltipTrigger>
                      <motion.div
                        className={`w-3 h-6 rounded-sm cursor-pointer transition-all hover:scale-125 ${getIntensity(hourData[metric])} ${getGlow(hourData[metric])}`}
                        whileHover={{ scale: 1.3 }}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="bg-background border">
                      <div className="text-sm">
                        <p className="font-semibold">{dayData.day} {hourData.hour}:00</p>
                        <p className="text-muted-foreground">
                          {config.label}: <span className="text-primary font-mono">{hourData[metric].toLocaleString()}</span>
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </motion.div>
          ))}
        </TooltipProvider>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-border/50">
          <span className="text-xs text-muted-foreground">Low</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 rounded-sm bg-primary/10" />
            <div className="w-4 h-4 rounded-sm bg-primary/30" />
            <div className="w-4 h-4 rounded-sm bg-primary/50" />
            <div className="w-4 h-4 rounded-sm bg-primary/70" />
            <div className="w-4 h-4 rounded-sm bg-primary" />
          </div>
          <span className="text-xs text-muted-foreground">High</span>
        </div>
      </div>
    </Card>
  );
}
