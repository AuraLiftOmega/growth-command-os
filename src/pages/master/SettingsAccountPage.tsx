import { useState } from 'react';
import { MasterOSLayout } from '@/components/master-os/MasterOSLayout';
import { useOrganization } from '@/hooks/useOrganization';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Settings, Building2, Palette } from 'lucide-react';

export default function SettingsAccountPage() {
  const { currentOrg, refetch } = useOrganization();
  const [name, setName] = useState(currentOrg?.name || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!currentOrg) return;
    setSaving(true);
    const { error } = await supabase
      .from('organizations')
      .update({ name: name.trim() })
      .eq('id', currentOrg.id);
    if (!error) {
      toast.success('Organization updated');
      await refetch();
    } else {
      toast.error('Failed to update');
    }
    setSaving(false);
  };

  return (
    <MasterOSLayout>
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6" /> Account Settings
        </h1>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Organization Details
            </CardTitle>
            <CardDescription>Update your organization name and branding</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Organization Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="My Organization" />
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Palette className="w-4 h-4" /> Branding
            </CardTitle>
            <CardDescription>Logo, colors, and custom domain (coming soon)</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Branding customization will be available in a future update.</p>
          </CardContent>
        </Card>
      </div>
    </MasterOSLayout>
  );
}
