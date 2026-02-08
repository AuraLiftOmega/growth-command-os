import { useEffect, useState } from 'react';
import { MasterOSLayout } from '@/components/master-os/MasterOSLayout';
import { useOrganization } from '@/hooks/useOrganization';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, Plus, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ExperiencesPage() {
  const { currentOrg } = useOrganization();
  const navigate = useNavigate();
  const [experiences, setExperiences] = useState<any[]>([]);

  useEffect(() => {
    if (!currentOrg) return;
    supabase
      .from('experiences')
      .select('*')
      .eq('organization_id', currentOrg.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setExperiences(data || []));
  }, [currentOrg]);

  return (
    <MasterOSLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Experiences</h1>
          <Button onClick={() => navigate('/experiences/new')} className="gap-2">
            <Plus className="w-4 h-4" /> New Experience
          </Button>
        </div>

        {experiences.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Globe className="w-12 h-12 mx-auto text-muted-foreground/40" />
              <p className="mt-3 text-muted-foreground">No experiences yet. Create pages, funnels, and landing pages.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {experiences.map(exp => (
              <Card key={exp.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    {exp.name}
                    <Badge variant={exp.status === 'published' ? 'default' : 'secondary'} className="text-[10px]">
                      {exp.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline" className="text-[9px] mb-2">{exp.type}</Badge>
                  {exp.published_url && (
                    <a href={exp.published_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-primary hover:underline mt-2">
                      <ExternalLink className="w-3 h-3" /> View live
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MasterOSLayout>
  );
}
