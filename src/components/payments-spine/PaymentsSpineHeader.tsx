import { RefreshCw, Shield, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PaymentsSpineHeaderProps {
  selectedEnv: 'dev' | 'staging' | 'prod';
  onEnvChange: (env: 'dev' | 'staging' | 'prod') => void;
  dateRange: '24h' | '7d' | '30d' | 'custom';
  onDateRangeChange: (range: '24h' | '7d' | '30d' | 'custom') => void;
  stripeStatus: 'OK' | 'WARN' | 'FAIL' | 'UNKNOWN';
  onRefresh: () => void;
}

export function PaymentsSpineHeader({
  selectedEnv,
  onEnvChange,
  dateRange,
  onDateRangeChange,
  stripeStatus,
  onRefresh,
}: PaymentsSpineHeaderProps) {
  const statusColors = {
    OK: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    WARN: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    FAIL: 'bg-red-500/10 text-red-500 border-red-500/20',
    UNKNOWN: 'bg-muted text-muted-foreground border-border',
  };

  const statusDot = {
    OK: 'bg-emerald-500',
    WARN: 'bg-amber-500',
    FAIL: 'bg-red-500',
    UNKNOWN: 'bg-muted-foreground',
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">Payments Spine</h1>
          </div>
          
          <Badge 
            variant="outline" 
            className={cn('gap-1.5 px-2.5 py-1', statusColors[stripeStatus])}
          >
            <span className={cn('h-2 w-2 rounded-full animate-pulse', statusDot[stripeStatus])} />
            Stripe Canonical: {stripeStatus}
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedEnv} onValueChange={onEnvChange}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Environment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="prod">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Production
                </span>
              </SelectItem>
              <SelectItem value="staging">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Staging
                </span>
              </SelectItem>
              <SelectItem value="dev">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  Development
                </span>
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateRange} onValueChange={onDateRangeChange}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 Hours</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
