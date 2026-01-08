/**
 * Animated KPI Card with Sparkline
 * Real-time metrics with trend visualization
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';

interface AnimatedKPICardProps {
  title: string;
  value: number;
  previousValue?: number;
  format?: 'currency' | 'number' | 'percent';
  icon: React.ElementType;
  color?: 'primary' | 'success' | 'accent' | 'warning';
  sparklineData?: number[];
  subtitle?: string;
  live?: boolean;
}

const colorMap = {
  primary: {
    bg: 'bg-primary/10',
    text: 'text-primary',
    stroke: 'hsl(var(--primary))',
    fill: 'hsl(var(--primary))',
    glow: 'shadow-[0_0_20px_hsl(var(--primary)/0.3)]',
  },
  success: {
    bg: 'bg-success/10',
    text: 'text-success',
    stroke: 'hsl(var(--success))',
    fill: 'hsl(var(--success))',
    glow: 'shadow-[0_0_20px_hsl(var(--success)/0.3)]',
  },
  accent: {
    bg: 'bg-accent/10',
    text: 'text-accent',
    stroke: 'hsl(var(--accent))',
    fill: 'hsl(var(--accent))',
    glow: 'shadow-[0_0_20px_hsl(var(--accent)/0.3)]',
  },
  warning: {
    bg: 'bg-warning/10',
    text: 'text-warning',
    stroke: 'hsl(var(--warning))',
    fill: 'hsl(var(--warning))',
    glow: 'shadow-[0_0_20px_hsl(var(--warning)/0.3)]',
  },
};

export function AnimatedKPICard({
  title,
  value,
  previousValue,
  format = 'number',
  icon: Icon,
  color = 'primary',
  sparklineData,
  subtitle,
  live = false,
}: AnimatedKPICardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const colors = colorMap[color];

  // Animate value counting
  useEffect(() => {
    setIsAnimating(true);
    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(value, Math.round(increment * step));
      setDisplayValue(current);

      if (step >= steps) {
        clearInterval(timer);
        setDisplayValue(value);
        setIsAnimating(false);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  // Format value
  const formattedValue = useMemo(() => {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(displayValue);
    }
    if (format === 'percent') {
      return `${displayValue.toFixed(1)}%`;
    }
    return displayValue.toLocaleString();
  }, [displayValue, format]);

  // Calculate change
  const change = previousValue ? ((value - previousValue) / previousValue) * 100 : 0;
  const isPositive = change > 0;
  const isNeutral = change === 0;

  // Generate sparkline data if not provided
  const chartData = useMemo(() => {
    if (sparklineData) {
      return sparklineData.map((v, i) => ({ value: v, index: i }));
    }
    return Array.from({ length: 12 }, (_, i) => ({
      value: Math.random() * value * 0.3 + value * 0.7,
      index: i,
    }));
  }, [sparklineData, value]);

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card className={`p-5 relative overflow-hidden group hover:${colors.glow} transition-shadow duration-300`}>
        {/* Live indicator */}
        {live && (
          <div className="absolute top-3 right-3">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colors.bg} opacity-75`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${colors.bg}`} />
            </span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${colors.text}`} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground/70">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Value */}
        <div className="flex items-end justify-between mb-4">
          <AnimatePresence mode="wait">
            <motion.span
              key={displayValue}
              className={`text-3xl font-bold font-mono ${colors.text}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {formattedValue}
            </motion.span>
          </AnimatePresence>

          {previousValue !== undefined && (
            <Badge
              variant="outline"
              className={`
                ${isPositive ? 'text-success border-success/30 bg-success/10' : ''}
                ${!isPositive && !isNeutral ? 'text-destructive border-destructive/30 bg-destructive/10' : ''}
                ${isNeutral ? 'text-muted-foreground border-border' : ''}
              `}
            >
              {isPositive ? (
                <ArrowUpRight className="w-3 h-3 mr-1" />
              ) : isNeutral ? (
                <Minus className="w-3 h-3 mr-1" />
              ) : (
                <ArrowDownRight className="w-3 h-3 mr-1" />
              )}
              {Math.abs(change).toFixed(1)}%
            </Badge>
          )}
        </div>

        {/* Sparkline */}
        <div className="h-12 -mx-2 -mb-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors.fill} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={colors.fill} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border rounded px-2 py-1 text-xs shadow-lg">
                        {format === 'currency' ? '$' : ''}
                        {Number(payload[0].value).toLocaleString()}
                        {format === 'percent' ? '%' : ''}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={colors.stroke}
                strokeWidth={2}
                fill={`url(#gradient-${color})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Animated glow effect on hover */}
        <div
          className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
          style={{
            background: `radial-gradient(circle at 50% 50%, ${colors.fill}10 0%, transparent 70%)`,
          }}
        />
      </Card>
    </motion.div>
  );
}
