/**
 * Swarm Progress Rings
 * Shows videos generated/posted/optimized with animated rings
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video, Upload, Zap, TrendingUp, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProgressRingProps {
  value: number;
  max: number;
  label: string;
  icon: React.ElementType;
  color: string;
  glowColor: string;
  size?: number;
  strokeWidth?: number;
}

function ProgressRing({
  value,
  max,
  label,
  icon: Icon,
  color,
  glowColor,
  size = 120,
  strokeWidth = 8,
}: ProgressRingProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = animatedValue / max;
  const offset = circumference - progress * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 100 }}
    >
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background ring */}
        <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
          />
        </svg>

        {/* Progress ring */}
        <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{
              filter: `drop-shadow(0 0 8px ${glowColor})`,
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className="w-6 h-6 mb-1" style={{ color }} />
          <motion.span
            className="text-2xl font-bold font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {animatedValue}
          </motion.span>
          <span className="text-xs text-muted-foreground">/ {max}</span>
        </div>
      </div>
      <p className="text-sm font-medium mt-3">{label}</p>
    </motion.div>
  );
}

const swarmStats = [
  {
    label: 'Generated',
    value: 47,
    max: 50,
    icon: Video,
    color: 'hsl(var(--primary))',
    glowColor: 'hsl(0 90% 50% / 0.5)',
  },
  {
    label: 'Posted',
    value: 38,
    max: 50,
    icon: Upload,
    color: 'hsl(var(--accent))',
    glowColor: 'hsl(270 85% 58% / 0.5)',
  },
  {
    label: 'Optimized',
    value: 32,
    max: 50,
    icon: Zap,
    color: 'hsl(var(--success))',
    glowColor: 'hsl(155 85% 42% / 0.5)',
  },
];

const recentActivity = [
  { action: 'Generated', pin: 'Summer Skincare Routine #47', time: '2m ago' },
  { action: 'Posted', pin: 'Vitamin C Benefits #38', time: '5m ago' },
  { action: 'Optimized', pin: 'Morning Glow Tips #32', time: '8m ago' },
  { action: 'Generated', pin: 'Night Repair Secrets #46', time: '12m ago' },
];

export function SwarmProgressRings() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  const totalProgress = swarmStats.reduce((sum, s) => sum + s.value, 0);
  const totalMax = swarmStats.reduce((sum, s) => sum + s.max, 0);
  const overallPercent = Math.round((totalProgress / totalMax) * 100);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold">Video Swarm Progress</h3>
            <p className="text-sm text-muted-foreground">
              Today&apos;s Pinterest Pin generation
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-success/10 text-success border-success/30">
            {overallPercent}% Complete
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            className={isRefreshing ? 'animate-spin' : ''}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Progress Rings */}
      <div className="flex justify-around items-center py-6">
        {swarmStats.map((stat, index) => (
          <ProgressRing key={stat.label} {...stat} />
        ))}
      </div>

      {/* Overall Progress Bar */}
      <div className="mt-6 p-4 rounded-xl bg-muted/30 border border-border/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Overall Swarm Progress</span>
          <span className="text-sm font-mono text-primary">{totalProgress} / {totalMax}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-success"
            initial={{ width: 0 }}
            animate={{ width: `${overallPercent}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{
              boxShadow: '0 0 12px hsl(var(--primary) / 0.5)',
            }}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6 space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground mb-3">Recent Activity</h4>
        {recentActivity.map((activity, index) => (
          <motion.div
            key={index}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className={
                  activity.action === 'Generated'
                    ? 'text-primary border-primary/30'
                    : activity.action === 'Posted'
                    ? 'text-accent border-accent/30'
                    : 'text-success border-success/30'
                }
              >
                {activity.action}
              </Badge>
              <span className="text-sm">{activity.pin}</span>
            </div>
            <span className="text-xs text-muted-foreground">{activity.time}</span>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
