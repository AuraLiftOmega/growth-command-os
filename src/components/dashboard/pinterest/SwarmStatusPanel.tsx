/**
 * Swarm Status Panel
 * Real-time generation/publishing queue
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Zap,
  Video,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Pause,
  Play,
  Settings,
  ChevronRight,
} from 'lucide-react';

type JobStatus = 'queued' | 'generating' | 'rendering' | 'uploading' | 'complete' | 'failed';

interface SwarmJob {
  id: string;
  title: string;
  status: JobStatus;
  progress: number;
  startedAt: string;
  estimatedTime?: string;
  error?: string;
}

const demoJobs: SwarmJob[] = [
  { id: '1', title: 'Hydration Secrets #48', status: 'complete', progress: 100, startedAt: '2m ago' },
  { id: '2', title: 'Glow Up Tips #47', status: 'uploading', progress: 85, startedAt: '5m ago', estimatedTime: '30s' },
  { id: '3', title: 'Night Routine #46', status: 'rendering', progress: 62, startedAt: '8m ago', estimatedTime: '2m' },
  { id: '4', title: 'Vitamin C Guide #45', status: 'generating', progress: 34, startedAt: '12m ago', estimatedTime: '4m' },
  { id: '5', title: 'Summer Skincare #44', status: 'queued', progress: 0, startedAt: '-', estimatedTime: '6m' },
  { id: '6', title: 'Morning Glow #43', status: 'queued', progress: 0, startedAt: '-', estimatedTime: '8m' },
  { id: '7', title: 'Retinol Tips #42', status: 'failed', progress: 45, startedAt: '15m ago', error: 'API timeout' },
];

const statusConfig: Record<JobStatus, { icon: typeof Zap; color: string; label: string }> = {
  queued: { icon: Clock, color: 'text-muted-foreground', label: 'Queued' },
  generating: { icon: Zap, color: 'text-accent', label: 'Generating' },
  rendering: { icon: Video, color: 'text-primary', label: 'Rendering' },
  uploading: { icon: Upload, color: 'text-warning', label: 'Uploading' },
  complete: { icon: CheckCircle2, color: 'text-success', label: 'Complete' },
  failed: { icon: AlertCircle, color: 'text-destructive', label: 'Failed' },
};

export function SwarmStatusPanel() {
  const [jobs, setJobs] = useState(demoJobs);
  const [isPaused, setIsPaused] = useState(false);
  const [activeJobs, setActiveJobs] = useState(0);

  // Simulate progress updates
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setJobs((prev) =>
        prev.map((job) => {
          if (job.status === 'generating' && job.progress < 50) {
            return { ...job, progress: Math.min(50, job.progress + Math.random() * 5) };
          }
          if (job.status === 'rendering' && job.progress < 80) {
            return { ...job, progress: Math.min(80, job.progress + Math.random() * 3) };
          }
          if (job.status === 'uploading' && job.progress < 100) {
            return { ...job, progress: Math.min(100, job.progress + Math.random() * 8) };
          }
          return job;
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused]);

  useEffect(() => {
    setActiveJobs(
      jobs.filter((j) => ['generating', 'rendering', 'uploading'].includes(j.status)).length
    );
  }, [jobs]);

  const queuedCount = jobs.filter((j) => j.status === 'queued').length;
  const completedCount = jobs.filter((j) => j.status === 'complete').length;
  const failedCount = jobs.filter((j) => j.status === 'failed').length;

  const handleRetry = (jobId: string) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId ? { ...job, status: 'queued', progress: 0, error: undefined } : job
      )
    );
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center relative">
            <Zap className="w-5 h-5 text-accent" />
            {activeJobs > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-success text-[10px] font-bold flex items-center justify-center text-background">
                {activeJobs}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-semibold">Swarm Status</h3>
            <p className="text-sm text-muted-foreground">
              Real-time generation queue
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={isPaused ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsPaused(!isPaused)}
          >
            {isPaused ? (
              <>
                <Play className="w-4 h-4 mr-2" />
                Resume
              </>
            ) : (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            )}
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="p-3 rounded-lg bg-muted/30 text-center">
          <p className="text-2xl font-bold font-mono">{activeJobs}</p>
          <p className="text-xs text-muted-foreground">Active</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/30 text-center">
          <p className="text-2xl font-bold font-mono text-muted-foreground">{queuedCount}</p>
          <p className="text-xs text-muted-foreground">Queued</p>
        </div>
        <div className="p-3 rounded-lg bg-success/10 text-center">
          <p className="text-2xl font-bold font-mono text-success">{completedCount}</p>
          <p className="text-xs text-muted-foreground">Complete</p>
        </div>
        <div className="p-3 rounded-lg bg-destructive/10 text-center">
          <p className="text-2xl font-bold font-mono text-destructive">{failedCount}</p>
          <p className="text-xs text-muted-foreground">Failed</p>
        </div>
      </div>

      {/* Job Queue */}
      <ScrollArea className="h-[280px]">
        <div className="space-y-2">
          <AnimatePresence>
            {jobs.map((job, index) => {
              const config = statusConfig[job.status];
              const Icon = config.icon;

              return (
                <motion.div
                  key={job.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-3 rounded-lg border transition-all ${
                    job.status === 'failed'
                      ? 'border-destructive/30 bg-destructive/5'
                      : job.status === 'complete'
                      ? 'border-success/30 bg-success/5'
                      : 'border-border/50 hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Status Icon */}
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        job.status === 'generating' || job.status === 'rendering' || job.status === 'uploading'
                          ? 'animate-pulse'
                          : ''
                      } ${
                        job.status === 'complete'
                          ? 'bg-success/20'
                          : job.status === 'failed'
                          ? 'bg-destructive/20'
                          : 'bg-muted'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium truncate">{job.title}</p>
                        <Badge variant="outline" className={`text-xs ${config.color}`}>
                          {config.label}
                        </Badge>
                      </div>

                      {/* Progress bar for active jobs */}
                      {['generating', 'rendering', 'uploading'].includes(job.status) && (
                        <div className="flex items-center gap-2">
                          <Progress value={job.progress} className="h-1.5 flex-1" />
                          <span className="text-xs text-muted-foreground font-mono w-10">
                            {job.progress.toFixed(0)}%
                          </span>
                        </div>
                      )}

                      {/* Error message */}
                      {job.error && (
                        <p className="text-xs text-destructive mt-1">{job.error}</p>
                      )}

                      {/* Time info */}
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {job.startedAt !== '-' && <span>Started {job.startedAt}</span>}
                        {job.estimatedTime && <span>• ETA: {job.estimatedTime}</span>}
                      </div>
                    </div>

                    {/* Actions */}
                    {job.status === 'failed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRetry(job.id)}
                        className="shrink-0"
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Retry
                      </Button>
                    )}
                    {job.status === 'complete' && (
                      <Button variant="ghost" size="icon" className="shrink-0">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </Card>
  );
}
