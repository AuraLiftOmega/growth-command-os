import { useEffect, useState } from 'react';
import { MasterOSLayout } from '@/components/master-os/MasterOSLayout';
import { useOrganization } from '@/hooks/useOrganization';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, CheckCircle, TrendingUp, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

export default function BrainPage() {
  const { currentOrg } = useOrganization();
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    if (!currentOrg) return;
    supabase
      .from('brain_suggestions')
      .select('*')
      .eq('organization_id', currentOrg.id)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => setSuggestions(data || []));
  }, [currentOrg]);

  const applySuggestion = async (id: string) => {
    await supabase
      .from('brain_suggestions')
      .update({ status: 'applied', applied_at: new Date().toISOString() })
      .eq('id', id);
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status: 'applied' } : s));
    toast.success('Suggestion marked as applied');
  };

  const impactColor = (impact: string) => {
    if (impact === 'high') return 'destructive';
    if (impact === 'medium') return 'default';
    return 'secondary';
  };

  return (
    <MasterOSLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary" />
              Performance Brain
            </h1>
            <p className="text-sm text-muted-foreground">AI-driven optimization suggestions for your business</p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{suggestions.filter(s => s.status === 'pending').length}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{suggestions.filter(s => s.status === 'applied').length}</p>
              <p className="text-xs text-muted-foreground">Applied</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{suggestions.filter(s => s.impact === 'high').length}</p>
              <p className="text-xs text-muted-foreground">High Impact</p>
            </CardContent>
          </Card>
        </div>

        {/* Suggestions list */}
        <div className="space-y-3">
          {suggestions.map(s => (
            <Card key={s.id}>
              <CardContent className="p-4 flex items-start gap-4">
                <TrendingUp className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm">{s.title}</p>
                    <Badge variant={impactColor(s.impact)} className="text-[9px]">{s.impact}</Badge>
                    <Badge variant="outline" className="text-[9px]">{s.category}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{s.description}</p>
                </div>
                {s.status === 'pending' ? (
                  <Button size="sm" variant="outline" onClick={() => applySuggestion(s.id)} className="gap-1">
                    <CheckCircle className="w-3 h-3" /> Apply
                  </Button>
                ) : (
                  <Badge variant="secondary" className="text-[9px]">Applied</Badge>
                )}
              </CardContent>
            </Card>
          ))}
          {suggestions.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Brain className="w-12 h-12 mx-auto text-muted-foreground/40" />
                <p className="mt-3 text-muted-foreground">No suggestions yet. The brain learns as you use the system.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MasterOSLayout>
  );
}
