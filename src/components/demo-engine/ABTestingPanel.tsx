/**
 * A/B TESTING PANEL
 * 
 * Automatic A/B testing for demo variants:
 * - Create test variants
 * - Track performance per variant
 * - Auto-identify winners
 * - Industry-specific optimization
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical,
  TrendingUp,
  TrendingDown,
  Award,
  Plus,
  Play,
  Pause,
  BarChart3,
  Users,
  Clock,
  Target,
  Sparkles,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Grid3X3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ABTestNotifications } from './ABTestNotifications';
import { MultivariateTestingPanel } from './MultivariateTestingPanel';

interface ABTestVariant {
  id: string;
  name: string;
  type: 'control' | 'variant';
  variant: string;
  views: number;
  completions: number;
  conversions: number;
  revenue: number;
  avgWatchTime: number;
  isWinner: boolean;
  confidence: number;
  createdAt: string;
}

interface ABTest {
  id: string;
  name: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  industry: string;
  startedAt: string | null;
  endedAt: string | null;
  trafficSplit: number;
  minimumSampleSize: number;
  confidenceThreshold: number;
  variants: ABTestVariant[];
  winner: string | null;
  improvementPercentage: number | null;
}

interface ABTestingPanelProps {
  demoId?: string;
  industry?: string;
}

// Demo A/B test data
const DEMO_AB_TESTS: ABTest[] = [
  {
    id: 'test-1',
    name: 'Enterprise vs Aries Variant',
    status: 'running',
    industry: 'ecommerce',
    startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    endedAt: null,
    trafficSplit: 50,
    minimumSampleSize: 100,
    confidenceThreshold: 95,
    variants: [
      {
        id: 'var-1a',
        name: 'Enterprise (Control)',
        type: 'control',
        variant: 'enterprise',
        views: 847,
        completions: 678,
        conversions: 89,
        revenue: 234500,
        avgWatchTime: 142,
        isWinner: false,
        confidence: 0,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'var-1b',
        name: 'Aries (Challenger)',
        type: 'variant',
        variant: 'aries',
        views: 823,
        completions: 741,
        conversions: 127,
        revenue: 389200,
        avgWatchTime: 156,
        isWinner: true,
        confidence: 94.2,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    winner: null,
    improvementPercentage: null,
  },
  {
    id: 'test-2',
    name: 'Short vs Long Demo Length',
    status: 'completed',
    industry: 'saas',
    startedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    endedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    trafficSplit: 50,
    minimumSampleSize: 200,
    confidenceThreshold: 95,
    variants: [
      {
        id: 'var-2a',
        name: 'Short Demo (90s)',
        type: 'control',
        variant: 'short',
        views: 1234,
        completions: 1112,
        conversions: 145,
        revenue: 456000,
        avgWatchTime: 82,
        isWinner: true,
        confidence: 98.7,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'var-2b',
        name: 'Long Demo (180s)',
        type: 'variant',
        variant: 'long',
        views: 1189,
        completions: 892,
        conversions: 98,
        revenue: 312400,
        avgWatchTime: 134,
        isWinner: false,
        confidence: 0,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    winner: 'var-2a',
    improvementPercentage: 48,
  },
];

export const ABTestingPanel = ({
  demoId,
  industry = 'ecommerce',
}: ABTestingPanelProps) => {
  const [tests, setTests] = useState<ABTest[]>(DEMO_AB_TESTS);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [isCreatingTest, setIsCreatingTest] = useState(false);
  const [autoOptimize, setAutoOptimize] = useState(true);

  // Calculate stats
  const activeTests = tests.filter(t => t.status === 'running').length;
  const completedTests = tests.filter(t => t.status === 'completed').length;
  const totalImprovement = tests
    .filter(t => t.improvementPercentage)
    .reduce((sum, t) => sum + (t.improvementPercentage || 0), 0);

  // Toggle test status
  const toggleTestStatus = useCallback((testId: string) => {
    setTests(prev => prev.map(test => {
      if (test.id !== testId) return test;
      const newStatus = test.status === 'running' ? 'paused' : 'running';
      return {
        ...test,
        status: newStatus,
        startedAt: newStatus === 'running' && !test.startedAt 
          ? new Date().toISOString() 
          : test.startedAt,
      };
    }));
    toast.success('Test status updated');
  }, []);

  // Declare winner
  const declareWinner = useCallback((testId: string, variantId: string) => {
    setTests(prev => prev.map(test => {
      if (test.id !== testId) return test;
      
      const winningVariant = test.variants.find(v => v.id === variantId);
      const losingVariant = test.variants.find(v => v.id !== variantId);
      
      if (!winningVariant || !losingVariant) return test;
      
      const improvement = Math.round(
        ((winningVariant.conversions / winningVariant.views) - 
         (losingVariant.conversions / losingVariant.views)) / 
        (losingVariant.conversions / losingVariant.views) * 100
      );

      return {
        ...test,
        status: 'completed',
        endedAt: new Date().toISOString(),
        winner: variantId,
        improvementPercentage: improvement,
        variants: test.variants.map(v => ({
          ...v,
          isWinner: v.id === variantId,
        })),
      };
    }));
    
    toast.success('Winner declared!', {
      description: 'The winning variant will now receive 100% of traffic'
    });
  }, []);

  // Create new test
  const createNewTest = useCallback(() => {
    const newTest: ABTest = {
      id: `test-${Date.now()}`,
      name: 'New A/B Test',
      status: 'draft',
      industry,
      startedAt: null,
      endedAt: null,
      trafficSplit: 50,
      minimumSampleSize: 100,
      confidenceThreshold: 95,
      variants: [
        {
          id: `var-${Date.now()}-a`,
          name: 'Control',
          type: 'control',
          variant: 'enterprise',
          views: 0,
          completions: 0,
          conversions: 0,
          revenue: 0,
          avgWatchTime: 0,
          isWinner: false,
          confidence: 0,
          createdAt: new Date().toISOString(),
        },
        {
          id: `var-${Date.now()}-b`,
          name: 'Challenger',
          type: 'variant',
          variant: 'aries',
          views: 0,
          completions: 0,
          conversions: 0,
          revenue: 0,
          avgWatchTime: 0,
          isWinner: false,
          confidence: 0,
          createdAt: new Date().toISOString(),
        },
      ],
      winner: null,
      improvementPercentage: null,
    };
    
    setTests(prev => [newTest, ...prev]);
    setSelectedTest(newTest);
    toast.success('New A/B test created');
  }, [industry]);

  return (
    <Tabs defaultValue="ab" className="space-y-6">
      {/* Tab Navigation with Notifications */}
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="ab" className="gap-2">
            <FlaskConical className="w-4 h-4" />
            A/B Testing
          </TabsTrigger>
          <TabsTrigger value="multivariate" className="gap-2">
            <Grid3X3 className="w-4 h-4" />
            Multivariate
          </TabsTrigger>
        </TabsList>
        <ABTestNotifications onViewTest={(testId) => setSelectedTest(tests.find(t => t.id === testId) || null)} />
      </div>

      <TabsContent value="ab" className="space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FlaskConical className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeTests}</p>
                  <p className="text-sm text-muted-foreground">Active Tests</p>
                </div>
              </div>
            </CardContent>
          </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedTests}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <TrendingUp className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">+{totalImprovement}%</p>
                <p className="text-sm text-muted-foreground">Total Improvement</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto-Optimize</p>
                <p className="text-xs text-muted-foreground">
                  Auto-declare winners at 95% confidence
                </p>
              </div>
              <Switch
                checked={autoOptimize}
                onCheckedChange={setAutoOptimize}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Test List */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">A/B Tests</CardTitle>
            <Button size="sm" onClick={createNewTest}>
              <Plus className="w-4 h-4 mr-1" />
              New Test
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {tests.map((test) => (
              <motion.div
                key={test.id}
                whileHover={{ scale: 1.01 }}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-colors",
                  selectedTest?.id === test.id
                    ? "border-primary bg-primary/5"
                    : "hover:border-muted-foreground/30"
                )}
                onClick={() => setSelectedTest(test)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm truncate">{test.name}</span>
                  <Badge 
                    variant={
                      test.status === 'running' ? 'default' :
                      test.status === 'completed' ? 'secondary' :
                      test.status === 'paused' ? 'outline' :
                      'outline'
                    }
                    className="text-xs"
                  >
                    {test.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {test.variants.reduce((sum, v) => sum + v.views, 0)} views
                  </span>
                  {test.improvementPercentage && (
                    <span className="flex items-center gap-1 text-success">
                      <TrendingUp className="w-3 h-3" />
                      +{test.improvementPercentage}%
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Test Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  {selectedTest?.name || 'Select a test'}
                </CardTitle>
                {selectedTest && (
                  <CardDescription>
                    {selectedTest.industry} • Started {selectedTest.startedAt 
                      ? new Date(selectedTest.startedAt).toLocaleDateString() 
                      : 'Not started'}
                  </CardDescription>
                )}
              </div>
              {selectedTest && selectedTest.status !== 'completed' && (
                <Button
                  variant={selectedTest.status === 'running' ? 'outline' : 'default'}
                  size="sm"
                  onClick={() => toggleTestStatus(selectedTest.id)}
                >
                  {selectedTest.status === 'running' ? (
                    <>
                      <Pause className="w-4 h-4 mr-1" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-1" />
                      Start
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedTest ? (
              <Tabs defaultValue="variants">
                <TabsList>
                  <TabsTrigger value="variants">Variants</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="variants" className="space-y-4 mt-4">
                  {selectedTest.variants.map((variant, index) => (
                    <motion.div
                      key={variant.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        "p-4 rounded-lg border",
                        variant.isWinner && "border-success bg-success/5"
                      )}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            variant.type === 'control' 
                              ? "bg-muted"
                              : "bg-primary/10"
                          )}>
                            {variant.type === 'control' ? 'A' : 'B'}
                          </div>
                          <div>
                            <p className="font-medium flex items-center gap-2">
                              {variant.name}
                              {variant.isWinner && (
                                <Badge className="gap-1 bg-success">
                                  <Award className="w-3 h-3" />
                                  Winner
                                </Badge>
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {variant.variant} variant
                            </p>
                          </div>
                        </div>
                        
                        {!selectedTest.winner && variant.confidence >= 95 && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            onClick={() => declareWinner(selectedTest.id, variant.id)}
                          >
                            <Award className="w-4 h-4" />
                            Declare Winner
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Views</p>
                          <p className="text-lg font-mono">{variant.views.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Completions</p>
                          <p className="text-lg font-mono">
                            {variant.completions.toLocaleString()}
                            <span className="text-xs text-muted-foreground ml-1">
                              ({Math.round(variant.completions / variant.views * 100)}%)
                            </span>
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Conversions</p>
                          <p className="text-lg font-mono">
                            {variant.conversions.toLocaleString()}
                            <span className="text-xs text-muted-foreground ml-1">
                              ({(variant.conversions / variant.views * 100).toFixed(1)}%)
                            </span>
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Revenue</p>
                          <p className="text-lg font-mono">${(variant.revenue / 1000).toFixed(0)}K</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Confidence</p>
                          <div className="flex items-center gap-2">
                            <p className={cn(
                              "text-lg font-mono",
                              variant.confidence >= 95 ? "text-success" : "text-muted-foreground"
                            )}>
                              {variant.confidence.toFixed(1)}%
                            </p>
                            {variant.confidence >= 95 && (
                              <CheckCircle2 className="w-4 h-4 text-success" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Conversion Rate Comparison Bar */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>Conversion Rate</span>
                          <span>{(variant.conversions / variant.views * 100).toFixed(2)}%</span>
                        </div>
                        <Progress 
                          value={Math.min(100, variant.conversions / variant.views * 100 * 5)} 
                          className={cn(
                            "h-2",
                            variant.isWinner && "[&>div]:bg-success"
                          )}
                        />
                      </div>
                    </motion.div>
                  ))}

                  {/* Statistical Significance Note */}
                  {selectedTest.status === 'running' && (
                    <div className="p-4 rounded-lg bg-muted/50 flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Reaching Statistical Significance</p>
                        <p className="text-sm text-muted-foreground">
                          {Math.round(
                            (selectedTest.variants.reduce((sum, v) => sum + v.views, 0) / 
                            selectedTest.minimumSampleSize) * 100
                          )}% of minimum sample size reached. 
                          {selectedTest.variants.some(v => v.confidence >= 95) 
                            ? ' Ready to declare winner!'
                            : ' Continue running for reliable results.'}
                        </p>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="analytics" className="mt-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {selectedTest.variants.map((variant, index) => (
                        <div key={variant.id} className="p-4 rounded-lg bg-muted/30 border border-border">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium">{variant.name}</span>
                            <Badge variant={variant.type === 'control' ? 'secondary' : 'outline'}>
                              {variant.type}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Conversion Rate</span>
                              <span className="font-medium">
                                {variant.views > 0 ? ((variant.conversions / variant.views) * 100).toFixed(2) : 0}%
                              </span>
                            </div>
                            <Progress 
                              value={variant.views > 0 ? (variant.conversions / variant.views) * 100 : 0} 
                              className="h-2"
                            />
                            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                              <div>
                                <span className="text-muted-foreground">Views</span>
                                <p className="font-medium">{variant.views.toLocaleString()}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Conversions</span>
                                <p className="font-medium">{variant.conversions.toLocaleString()}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Revenue</span>
                                <p className="font-medium text-success">${variant.revenue.toLocaleString()}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Confidence</span>
                                <p className={cn("font-medium", variant.confidence >= 95 ? "text-success" : "text-warning")}>
                                  {variant.confidence.toFixed(1)}%
                                </p>
                              </div>
                            </div>
                          </div>
                          {variant.isWinner && (
                            <div className="mt-3 flex items-center gap-2 text-xs text-success">
                              <Award className="w-3 h-3" />
                              <span>Leading variant</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Performance Summary</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold">{selectedTest.variants.reduce((a, v) => a + v.views, 0).toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Total Views</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-success">${selectedTest.variants.reduce((a, v) => a + v.revenue, 0).toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Total Revenue</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-primary">
                            {selectedTest.improvementPercentage ? `+${selectedTest.improvementPercentage.toFixed(1)}%` : 'TBD'}
                          </p>
                          <p className="text-xs text-muted-foreground">Improvement</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Traffic Split</Label>
                      <Select defaultValue={String(selectedTest.trafficSplit)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="50">50/50</SelectItem>
                          <SelectItem value="70">70/30</SelectItem>
                          <SelectItem value="90">90/10</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Confidence Threshold</Label>
                      <Select defaultValue={String(selectedTest.confidenceThreshold)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="90">90%</SelectItem>
                          <SelectItem value="95">95%</SelectItem>
                          <SelectItem value="99">99%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Minimum Sample Size</Label>
                      <Select defaultValue={String(selectedTest.minimumSampleSize)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="100">100 views</SelectItem>
                          <SelectItem value="200">200 views</SelectItem>
                          <SelectItem value="500">500 views</SelectItem>
                          <SelectItem value="1000">1000 views</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Primary Metric</Label>
                      <Select defaultValue="conversions">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="conversions">Conversion Rate</SelectItem>
                          <SelectItem value="completion">Completion Rate</SelectItem>
                          <SelectItem value="revenue">Revenue per View</SelectItem>
                          <SelectItem value="watchTime">Avg Watch Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <FlaskConical className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    Select a test or create a new one
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </TabsContent>

      <TabsContent value="multivariate">
        <MultivariateTestingPanel />
      </TabsContent>
    </Tabs>
  );
};

export default ABTestingPanel;
