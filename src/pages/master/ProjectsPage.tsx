import { useEffect, useState } from 'react';
import { MasterOSLayout } from '@/components/master-os/MasterOSLayout';
import { useOrganization } from '@/hooks/useOrganization';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, FolderKanban, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProjectsPage() {
  const { currentOrg, canOperate } = useOrganization();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  useEffect(() => {
    if (!currentOrg) return;
    supabase
      .from('projects')
      .select('*')
      .eq('organization_id', currentOrg.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setProjects(data || []));
  }, [currentOrg]);

  const handleCreate = async () => {
    if (!currentOrg || !name.trim()) return;
    const { data } = await supabase
      .from('projects')
      .insert({ organization_id: currentOrg.id, name: name.trim(), description: desc })
      .select()
      .single();
    if (data) {
      setProjects(prev => [data, ...prev]);
      setShowCreate(false);
      setName('');
      setDesc('');
    }
  };

  return (
    <MasterOSLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Projects</h1>
          {canOperate && (
            <Button onClick={() => setShowCreate(true)} className="gap-2">
              <Plus className="w-4 h-4" /> New Project
            </Button>
          )}
        </div>

        {projects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FolderKanban className="w-12 h-12 mx-auto text-muted-foreground/40" />
              <p className="mt-3 text-muted-foreground">No projects yet. Create your first one!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(p => (
              <Card key={p.id} className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/projects/${p.id}/overview`)}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    {p.name}
                    <Badge variant={p.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">
                      {p.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">{p.description || 'No description'}</p>
                  <p className="text-[10px] text-muted-foreground mt-2">
                    Created {new Date(p.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Project</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Project name" value={name} onChange={e => setName(e.target.value)} />
              <Input placeholder="Description (optional)" value={desc} onChange={e => setDesc(e.target.value)} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={!name.trim()}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MasterOSLayout>
  );
}
