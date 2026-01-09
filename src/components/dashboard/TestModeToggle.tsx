/**
 * TEST MODE TOGGLE - Dry runs for ad generation to save credits
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FlaskConical, Zap, AlertTriangle, Info } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';

interface TestModeToggleProps {
  isTestMode: boolean;
  onToggle: (enabled: boolean) => void;
  creditsRemaining?: number;
  className?: string;
}

export function TestModeToggle({
  isTestMode,
  onToggle,
  creditsRemaining = 100,
  className,
}: TestModeToggleProps) {
  const handleToggle = (enabled: boolean) => {
    onToggle(enabled);
    if (enabled) {
      toast.info('🧪 Test Mode Enabled', {
        description: 'No credits will be used. Outputs are simulated.',
      });
    } else {
      toast.success('⚡ Live Mode Enabled', {
        description: 'Real API calls will be made. Credits will be consumed.',
      });
    }
  };

  return (
    <TooltipProvider>
      <div className={className}>
        <motion.div
          className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
            isTestMode
              ? 'bg-warning/10 border-warning/30'
              : 'bg-success/10 border-success/30'
          }`}
          animate={{
            boxShadow: isTestMode
              ? '0 0 20px rgba(251, 191, 36, 0.2)'
              : '0 0 20px rgba(34, 197, 94, 0.2)',
          }}
        >
          <div className={`p-2 rounded-lg ${isTestMode ? 'bg-warning/20' : 'bg-success/20'}`}>
            {isTestMode ? (
              <FlaskConical className="w-4 h-4 text-warning" />
            ) : (
              <Zap className="w-4 h-4 text-success" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {isTestMode ? 'Test Mode' : 'Live Mode'}
              </span>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="text-xs">
                    {isTestMode
                      ? 'Test mode simulates API responses without using credits. Perfect for testing workflows.'
                      : 'Live mode uses real APIs. Each generation consumes credits.'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-muted-foreground">
                {isTestMode ? 'No credits used' : `${creditsRemaining} credits left`}
              </span>
              {!isTestMode && creditsRemaining < 20 && (
                <Badge variant="outline" className="text-[8px] px-1 py-0 h-4 border-warning text-warning">
                  <AlertTriangle className="w-2 h-2 mr-0.5" />
                  Low
                </Badge>
              )}
            </div>
          </div>

          <Switch checked={!isTestMode} onCheckedChange={(checked) => handleToggle(!checked)} />
        </motion.div>

        {isTestMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-2 p-2 rounded-lg bg-muted/30 border border-dashed border-warning/30"
          >
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <FlaskConical className="w-3 h-3" />
              Outputs will be placeholder data. Turn off to generate real content.
            </p>
          </motion.div>
        )}
      </div>
    </TooltipProvider>
  );
}
