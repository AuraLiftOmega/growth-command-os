/**
 * MULTIVARIATE TESTING PANEL
 * 
 * Test multiple variables simultaneously:
 * - Variant type (enterprise, intimidation, etc.)
 * - Demo length (short, long)
 * - Industry targeting
 * - CTA variations
 * - Narration style
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Grid3X3,
  Plus,
  Play,
  Pause,
  TrendingUp,
  Award,
  Users,
  Clock,
  Target,
  Sparkles,
  CheckCircle2,
  Settings2,
  BarChart3,
  Layers,
  Shuffle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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

interface TestVariable {
  id: string;
  name: string;
  type: 'variant' | 'length' | 'industry' | 'cta' | 'narration';
  values: string[];
  selectedValues: string[];
}

interface MultivariateCombo {
  id: string;
  variables: Record<string, string>;
  views: number;
  conversions: number;
  revenue: number;
  avgWatchTime: number;
  confidence: number;
  isWinner: boolean;
}

interface MultivariateTest {
  id: string;
  name: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  variables: TestVariable[];
  combinations: MultivariateCombo[];
  totalCombinations: number;
  trafficPerCombo: number;
  startedAt: string | null;
  endedAt: string | null;
  winner: string | null;
}

// Available test variables
const AVAILABLE_VARIABLES: TestVariable[] = [
  {
    id: 'variant',
    name: 'Demo Variant',
    type: 'variant',
    values: ['enterprise', 'intimidation', 'founder', 'silent'],
    selectedValues: ['enterprise', 'intimidation'],
  },
  {
    id: 'length',
    name: 'Demo Length',
    type: 'length',
    values: ['30s', '60s', '90s', '180s'],
    selectedValues: ['60s', '90s'],
  },
  {
    id: 'industry',
    name: 'Industry Focus',
    type: 'industry',
    values: ['ecommerce', 'saas', 'agency', 'coaching', 'enterprise'],
    selectedValues: ['ecommerce', 'saas'],
  },
  {
    id: 'cta',
    name: 'CTA Style',
    type: 'cta',
    values: ['book_demo', 'start_trial', 'contact_sales', 'learn_more'],
    selectedValues: ['book_demo', 'start_trial'],
  },
  {
    id: 'narration',
    name: 'Narration Style',
    type: 'narration',
    values: ['confident', 'friendly', 'urgent', 'silent'],
    selectedValues: ['confident', 'urgent'],
  },
];

// Demo multivariate test
const DEMO_MULTIVARIATE_TESTS: MultivariateTest[] = [
  {
    id: 'mvt-1',
    name: 'Full Funnel Optimization',
    status: 'running',
    variables: AVAILABLE_VARIABLES.slice(0, 3),
    combinations: [
      {
        id: 'combo-1',
        variables: { variant: 'enterprise', length: '60s', industry: 'ecommerce' },
        views: 234,
        conversions: 28,
        revenue: 89400,
        avgWatchTime: 52,
        confidence: 78.4,
        isWinner: false,
      },
      {
        id: 'combo-2',
        variables: { variant: 'enterprise', length: '60s', industry: 'saas' },
        views: 198,
        conversions: 31,
        revenue: 124500,
        avgWatchTime: 48,
        confidence: 82.1,
        isWinner: false,
      },
      {
        id: 'combo-3',
        variables: { variant: 'enterprise', length: '90s', industry: 'ecommerce' },
        views: 212,
        conversions: 25,
        revenue: 78200,
        avgWatchTime: 71,
        confidence: 65.3,
        isWinner: false,
      },
      {
        id: 'combo-4',
        variables: { variant: 'enterprise', length: '90s', industry: 'saas' },
        views: 189,
        conversions: 29,
        revenue: 112800,
        avgWatchTime: 68,
        confidence: 74.9,
        isWinner: false,
      },
      {
        id: 'combo-5',
        variables: { variant: 'intimidation', length: '60s', industry: 'ecommerce' },
        views: 256,
        conversions: 41,
        revenue: 134200,
        avgWatchTime: 55,
        confidence: 94.7,
        isWinner: true,
      },
      {
        id: 'combo-6',
        variables: { variant: 'intimidation', length: '60s', industry: 'saas' },
        views: 223,
        conversions: 38,
        revenue: 156800,
        avgWatchTime: 51,
        confidence: 91.2,
        isWinner: false,
      },
      {
        id: 'combo-7',
        variables: { variant: 'intimidation', length: '90s', industry: 'ecommerce' },
        views: 201,
        conversions: 32,
        revenue: 98500,
        avgWatchTime: 78,
        confidence: 81.4,
        isWinner: false,
      },
      {
        id: 'combo-8',
        variables: { variant: 'intimidation', length: '90s', industry: 'saas' },
        views: 187,
        conversions: 35,
        revenue: 142100,
        avgWatchTime: 74,
        confidence: 88.6,
        isWinner: false,
      },
    ],
    totalCombinations: 8,
    trafficPerCombo: 12.5,
    startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    endedAt: null,
    winner: null,
  },
];

export const MultivariateTestingPanel = () => {
  const [tests, setTests] = useState<MultivariateTest[]>(DEMO_MULTIVARIATE_TESTS);
  const [selectedTest, setSelectedTest] = useState<MultivariateTest | null>(DEMO_MULTIVARIATE_TESTS[0]);
  const [availableVars, setAvailableVars] = useState<TestVariable[]>(AVAILABLE_VARIABLES);
  const [isCreating, setIsCreating] = useState(false);

  // Calculate total combinations for selected variables
  const calculateCombinations = (variables: TestVariable[]): number => {
    return variables.reduce((acc, v) => acc * v.selectedValues.length, 1);
  };

  // Toggle variable selection
  const toggleVariableValue = useCallback((varId: string, value: string) => {
    setAvailableVars(prev => prev.map(v => {
      if (v.id !== varId) return v;
      const isSelected = v.selectedValues.includes(value);
      return {
        ...v,
        selectedValues: isSelected
          ? v.selectedValues.filter(sv => sv !== value)
          : [...v.selectedValues, value],
      };
    }));
  }, []);

  // Create new multivariate test
  const createTest = useCallback(() => {
    const selectedVars = availableVars.filter(v => v.selectedValues.length > 1);
    if (selectedVars.length < 2) {
      toast.error('Select at least 2 variables with 2+ values each');
      return;
    }

    const totalCombos = calculateCombinations(selectedVars);
    if (totalCombos > 16) {
      toast.error('Too many combinations. Reduce variable values to max 16 combos.');
      return;
    }

    // Generate all combinations
    const generateCombos = (vars: TestVariable[]): MultivariateCombo[] => {
      const combos: MultivariateCombo[] = [];
      const generate = (index: number, current: Record<string, string>) => {
        if (index === vars.length) {
          combos.push({
            id: `combo-${Date.now()}-${combos.length}`,
            variables: { ...current },
            views: 0,
            conversions: 0,
            revenue: 0,
            avgWatchTime: 0,
            confidence: 0,
            isWinner: false,
          });
          return;
        }
        for (const value of vars[index].selectedValues) {
          generate(index + 1, { ...current, [vars[index].id]: value });
        }
      };
      generate(0, {});
      return combos;
    };

    const newTest: MultivariateTest = {
      id: `mvt-${Date.now()}`,
      name: `Multivariate Test ${tests.length + 1}`,
      status: 'draft',
      variables: selectedVars,
      combinations: generateCombos(selectedVars),
      totalCombinations: totalCombos,
      trafficPerCombo: Math.round(100 / totalCombos * 10) / 10,
      startedAt: null,
      endedAt: null,
      winner: null,
    };

    setTests(prev => [newTest, ...prev]);
    setSelectedTest(newTest);
    setIsCreating(false);
    toast.success(`Created test with ${totalCombos} combinations`);
  }, [availableVars, tests.length]);

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
  const declareWinner = useCallback((testId: string, comboId: string) => {
    setTests(prev => prev.map(test => {
      if (test.id !== testId) return test;
      return {
        ...test,
        status: 'completed',
        endedAt: new Date().toISOString(),
        winner: comboId,
        combinations: test.combinations.map(c => ({
          ...c,
          isWinner: c.id === comboId,
        })),
      };
    }));
    toast.success('Winner declared!');
  }, []);

  // Get variable display
  const getVariableDisplay = (variables: Record<string, string>): string => {
    return Object.entries(variables)
      .map(([key, value]) => `${key}: ${value}`)
      .join(' • ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Grid3X3 className="w-5 h-5 text-primary" />
            Multivariate Testing
          </h2>
          <p className="text-sm text-muted-foreground">
            Test multiple variables simultaneously to find the optimal combination
          </p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)}>
          <Plus className="w-4 h-4 mr-2" />
          New MVT
        </Button>
      </div>

      {/* Create New Test Panel */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configure Multivariate Test</CardTitle>
                <CardDescription>
                  Select variables and values to test. Each combination will receive equal traffic.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Variable Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableVars.map((variable) => (
                    <div key={variable.id} className="p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-3">
                        <Label className="font-medium">{variable.name}</Label>
                        <Badge variant="secondary" className="text-xs">
                          {variable.selectedValues.length} selected
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {variable.values.map((value) => (
                          <div key={value} className="flex items-center gap-2">
                            <Checkbox
                              checked={variable.selectedValues.includes(value)}
                              onCheckedChange={() => toggleVariableValue(variable.id, value)}
                            />
                            <span className="text-sm">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Combination Preview */}
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Layers className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">
                          {calculateCombinations(availableVars.filter(v => v.selectedValues.length > 1))} Combinations
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Each will receive ~{Math.round(100 / calculateCombinations(availableVars.filter(v => v.selectedValues.length > 1)) * 10) / 10}% of traffic
                        </p>
                      </div>
                    </div>
                    <Button onClick={createTest}>
                      <Shuffle className="w-4 h-4 mr-2" />
                      Create Test
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Test List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Active Tests</CardTitle>
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
                      'outline'
                    }
                    className="text-xs"
                  >
                    {test.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Grid3X3 className="w-3 h-3" />
                    {test.totalCombinations} combos
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {test.combinations.reduce((sum, c) => sum + c.views, 0)} views
                  </span>
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
                    {selectedTest.totalCombinations} combinations • 
                    {selectedTest.variables.map(v => v.name).join(', ')}
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
              <div className="space-y-4">
                {/* Combination Performance Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2">Combination</th>
                        <th className="text-right py-2 px-2">Views</th>
                        <th className="text-right py-2 px-2">Conv %</th>
                        <th className="text-right py-2 px-2">Revenue</th>
                        <th className="text-right py-2 px-2">Conf %</th>
                        <th className="text-right py-2 px-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTest.combinations
                        .sort((a, b) => b.confidence - a.confidence)
                        .map((combo, index) => (
                          <motion.tr
                            key={combo.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className={cn(
                              "border-b hover:bg-muted/50",
                              combo.isWinner && "bg-green-500/10"
                            )}
                          >
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-2">
                                {combo.isWinner && (
                                  <Award className="w-4 h-4 text-amber-500" />
                                )}
                                <div>
                                  {Object.entries(combo.variables).map(([key, value], i) => (
                                    <Badge key={key} variant="outline" className="mr-1 text-xs">
                                      {value}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </td>
                            <td className="text-right py-3 px-2 font-mono">
                              {combo.views.toLocaleString()}
                            </td>
                            <td className="text-right py-3 px-2 font-mono">
                              {combo.views > 0 
                                ? (combo.conversions / combo.views * 100).toFixed(1) 
                                : '0.0'}%
                            </td>
                            <td className="text-right py-3 px-2 font-mono">
                              ${(combo.revenue / 1000).toFixed(1)}K
                            </td>
                            <td className="text-right py-3 px-2">
                              <span className={cn(
                                "font-mono",
                                combo.confidence >= 95 ? "text-green-600" : ""
                              )}>
                                {combo.confidence.toFixed(1)}%
                              </span>
                            </td>
                            <td className="text-right py-3 px-2">
                              {!selectedTest.winner && combo.confidence >= 95 && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => declareWinner(selectedTest.id, combo.id)}
                                >
                                  <Award className="w-4 h-4" />
                                </Button>
                              )}
                            </td>
                          </motion.tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Insights */}
                {selectedTest.status === 'running' && (
                  <div className="p-4 rounded-lg bg-muted/50 flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Optimization Insights</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedTest.combinations.filter(c => c.confidence >= 95).length > 0
                          ? `${selectedTest.combinations.filter(c => c.confidence >= 95).length} combination(s) have reached statistical significance!`
                          : 'Continue running to gather more data for reliable results.'}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-green-500" />
                          Best: {selectedTest.combinations.sort((a, b) => 
                            (b.conversions / (b.views || 1)) - (a.conversions / (a.views || 1))
                          )[0]?.variables.variant || 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {selectedTest.combinations.reduce((sum, c) => sum + c.views, 0)} total views
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <Grid3X3 className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    Select a test or create a new one
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MultivariateTestingPanel;
