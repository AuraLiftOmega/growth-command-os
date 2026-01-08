/**
 * Revenue Waterfall Chart
 * Shows Pin traffic → Shopify sales → Stripe revenue flow
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, ArrowRight, TrendingUp, Eye, ShoppingCart, DollarSign, CreditCard } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
} from 'recharts';

const waterfallData = [
  { name: 'Pin Views', value: 48500, type: 'start', icon: Eye },
  { name: 'Clicks', value: -45620, type: 'decrease', icon: ArrowDown },
  { name: 'Store Visits', value: 2880, type: 'subtotal', icon: ShoppingCart },
  { name: 'Bounces', value: -1920, type: 'decrease', icon: ArrowDown },
  { name: 'Cart Adds', value: 960, type: 'subtotal', icon: ShoppingCart },
  { name: 'Abandoned', value: -672, type: 'decrease', icon: ArrowDown },
  { name: 'Orders', value: 288, type: 'subtotal', icon: CreditCard },
  { name: 'Revenue', value: 19584, type: 'final', icon: DollarSign },
];

// Calculate waterfall positions
const processedData = waterfallData.map((item, index) => {
  let start = 0;
  if (index > 0) {
    for (let i = 0; i < index; i++) {
      if (waterfallData[i].type !== 'decrease') {
        start = waterfallData[i].value;
      } else {
        start += waterfallData[i].value;
      }
    }
  }
  
  return {
    ...item,
    start: item.type === 'decrease' ? start + item.value : 0,
    displayValue: Math.abs(item.value),
  };
});

const conversionSteps = [
  { label: 'Click Rate', value: '5.94%', trend: 12 },
  { label: 'Visit to Cart', value: '33.3%', trend: 8 },
  { label: 'Cart to Order', value: '30.0%', trend: -2 },
  { label: 'Avg Order Value', value: '$68', trend: 15 },
];

export function RevenueWaterfall() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
          <div>
            <h3 className="font-semibold">Revenue Waterfall</h3>
            <p className="text-sm text-muted-foreground">
              Pinterest → Shopify → Revenue Flow
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-success border-success/30">
          $19,584 Revenue
        </Badge>
      </div>

      {/* Conversion Steps */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {conversionSteps.map((step, index) => (
          <motion.div
            key={step.label}
            className="p-3 rounded-lg bg-muted/30 border border-border/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">{step.label}</span>
              <span className={`text-xs ${step.trend >= 0 ? 'text-success' : 'text-destructive'}`}>
                {step.trend >= 0 ? '+' : ''}{step.trend}%
              </span>
            </div>
            <p className="text-lg font-bold font-mono">{step.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Visual Flow */}
      <div className="flex items-center justify-between gap-2 mb-6 p-4 rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-success/10 border border-border/50">
        {[
          { icon: Eye, label: 'Pin Views', value: '48.5K', color: 'text-primary' },
          { icon: ArrowRight, label: '', value: '', color: 'text-muted-foreground' },
          { icon: ShoppingCart, label: 'Store Visits', value: '2.9K', color: 'text-accent' },
          { icon: ArrowRight, label: '', value: '', color: 'text-muted-foreground' },
          { icon: CreditCard, label: 'Orders', value: '288', color: 'text-success' },
          { icon: ArrowRight, label: '', value: '', color: 'text-muted-foreground' },
          { icon: DollarSign, label: 'Revenue', value: '$19.6K', color: 'text-success' },
        ].map((step, index) => (
          <motion.div
            key={index}
            className={`flex flex-col items-center ${step.label ? 'flex-1' : ''}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <step.icon className={`w-6 h-6 ${step.color}`} />
            {step.label && (
              <>
                <span className="text-xs text-muted-foreground mt-1">{step.label}</span>
                <span className={`text-sm font-bold font-mono ${step.color}`}>{step.value}</span>
              </>
            )}
          </motion.div>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={processedData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} className="stroke-border/30" />
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={80}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-background border rounded-lg p-3 shadow-lg">
                      <p className="font-semibold">{data.name}</p>
                      <p className={data.type === 'decrease' ? 'text-destructive' : 'text-success'}>
                        {data.type === 'decrease' ? '-' : ''}
                        {data.displayValue.toLocaleString()}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="displayValue"
              radius={[0, 4, 4, 0]}
              onMouseEnter={(_, index) => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {processedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.type === 'decrease'
                      ? 'hsl(var(--destructive))'
                      : entry.type === 'final'
                      ? 'hsl(var(--success))'
                      : 'hsl(var(--primary))'
                  }
                  opacity={hoveredIndex === null || hoveredIndex === index ? 1 : 0.5}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
