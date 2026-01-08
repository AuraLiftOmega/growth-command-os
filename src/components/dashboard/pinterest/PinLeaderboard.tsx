/**
 * Pin Performance Leaderboard
 * Top Pins ranked by ROI
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  TrendingUp,
  DollarSign,
  Eye,
  Heart,
  MousePointerClick,
  ArrowUpRight,
  Crown,
  Medal,
  Award,
  ChevronDown,
  ChevronUp,
  Download,
} from 'lucide-react';

interface LeaderboardPin {
  rank: number;
  title: string;
  thumbnail: string;
  revenue: number;
  roi: number;
  views: number;
  saves: number;
  clicks: number;
  conversionRate: number;
  trend: number;
}

const leaderboardData: LeaderboardPin[] = [
  {
    rank: 1,
    title: 'Summer Skincare Essentials',
    thumbnail: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=100',
    revenue: 4850,
    roi: 8.4,
    views: 45000,
    saves: 2340,
    clicks: 890,
    conversionRate: 5.4,
    trend: 24,
  },
  {
    rank: 2,
    title: 'Morning Glow Routine',
    thumbnail: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100',
    revenue: 3200,
    roi: 6.2,
    views: 32000,
    saves: 1890,
    clicks: 654,
    conversionRate: 4.8,
    trend: 18,
  },
  {
    rank: 3,
    title: 'Night Repair Secrets',
    thumbnail: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=100',
    revenue: 2890,
    roi: 5.8,
    views: 28000,
    saves: 1456,
    clicks: 523,
    conversionRate: 4.2,
    trend: 12,
  },
  {
    rank: 4,
    title: 'Vitamin C Benefits',
    thumbnail: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=100',
    revenue: 2100,
    roi: 4.5,
    views: 21000,
    saves: 987,
    clicks: 345,
    conversionRate: 3.8,
    trend: 8,
  },
  {
    rank: 5,
    title: 'Hydration Tips',
    thumbnail: 'https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=100',
    revenue: 1650,
    roi: 3.9,
    views: 18000,
    saves: 654,
    clicks: 234,
    conversionRate: 3.2,
    trend: -2,
  },
];

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="w-5 h-5 text-yellow-500" />;
    case 2:
      return <Medal className="w-5 h-5 text-gray-400" />;
    case 3:
      return <Award className="w-5 h-5 text-amber-600" />;
    default:
      return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
  }
};

export function PinLeaderboard() {
  const [expandedPin, setExpandedPin] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'roi' | 'revenue' | 'views'>('roi');

  const sortedData = [...leaderboardData].sort((a, b) => {
    if (sortBy === 'roi') return b.roi - a.roi;
    if (sortBy === 'revenue') return b.revenue - a.revenue;
    return b.views - a.views;
  });

  const totalRevenue = leaderboardData.reduce((sum, p) => sum + p.revenue, 0);
  const avgROI = leaderboardData.reduce((sum, p) => sum + p.roi, 0) / leaderboardData.length;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-warning" />
          </div>
          <div>
            <h3 className="font-semibold">Pin Leaderboard</h3>
            <p className="text-sm text-muted-foreground">
              Top performers by ROI
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden">
            {['roi', 'revenue', 'views'].map((option) => (
              <button
                key={option}
                onClick={() => setSortBy(option as typeof sortBy)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  sortBy === option
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                {option.toUpperCase()}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-3 rounded-lg bg-success/10 border border-success/20">
          <p className="text-xs text-muted-foreground mb-1">Total Revenue</p>
          <p className="text-xl font-bold font-mono text-success">
            ${totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
          <p className="text-xs text-muted-foreground mb-1">Avg ROI</p>
          <p className="text-xl font-bold font-mono text-primary">{avgROI.toFixed(1)}x</p>
        </div>
        <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
          <p className="text-xs text-muted-foreground mb-1">Top Pins</p>
          <p className="text-xl font-bold font-mono text-accent">{leaderboardData.length}</p>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="space-y-2">
        {sortedData.map((pin, index) => (
          <motion.div
            key={pin.rank}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div
              className={`rounded-xl border transition-all cursor-pointer ${
                index === 0
                  ? 'bg-gradient-to-r from-yellow-500/10 via-transparent to-transparent border-yellow-500/30'
                  : 'border-border/50 hover:border-primary/30'
              } ${expandedPin === pin.rank ? 'bg-muted/30' : ''}`}
              onClick={() => setExpandedPin(expandedPin === pin.rank ? null : pin.rank)}
            >
              {/* Main Row */}
              <div className="p-4 flex items-center gap-4">
                {/* Rank */}
                <div className="w-8 flex justify-center">{getRankIcon(pin.rank)}</div>

                {/* Thumbnail */}
                <img
                  src={pin.thumbnail}
                  alt={pin.title}
                  className="w-12 h-12 rounded-lg object-cover"
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{pin.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {(pin.views / 1000).toFixed(1)}K
                    </span>
                    <span className="text-xs text-primary flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {pin.saves}
                    </span>
                    <span className="text-xs text-success flex items-center gap-1">
                      <MousePointerClick className="w-3 h-3" />
                      {pin.clicks}
                    </span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="text-right">
                  <p className="font-bold font-mono text-success">
                    ${pin.revenue.toLocaleString()}
                  </p>
                  <Badge
                    variant="outline"
                    className={pin.trend >= 0 ? 'text-success border-success/30' : 'text-destructive border-destructive/30'}
                  >
                    {pin.trend >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : null}
                    {pin.trend}%
                  </Badge>
                </div>

                {/* ROI */}
                <div className="w-20 text-center">
                  <Badge className="bg-primary/20 text-primary border-primary/30">
                    {pin.roi}x ROI
                  </Badge>
                </div>

                {/* Expand */}
                <Button variant="ghost" size="icon" className="shrink-0">
                  {expandedPin === pin.rank ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Expanded Details */}
              {expandedPin === pin.rank && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 pb-4 border-t border-border/50"
                >
                  <div className="grid grid-cols-4 gap-4 pt-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Conversion Rate</p>
                      <div className="flex items-center gap-2">
                        <Progress value={pin.conversionRate * 10} className="h-2 flex-1" />
                        <span className="text-sm font-mono">{pin.conversionRate}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Click-Through</p>
                      <div className="flex items-center gap-2">
                        <Progress value={(pin.clicks / pin.views) * 100 * 50} className="h-2 flex-1" />
                        <span className="text-sm font-mono">{((pin.clicks / pin.views) * 100).toFixed(2)}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Save Rate</p>
                      <div className="flex items-center gap-2">
                        <Progress value={(pin.saves / pin.views) * 100 * 10} className="h-2 flex-1" />
                        <span className="text-sm font-mono">{((pin.saves / pin.views) * 100).toFixed(2)}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Revenue/View</p>
                      <p className="text-lg font-bold font-mono text-success">
                        ${(pin.revenue / pin.views).toFixed(3)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
