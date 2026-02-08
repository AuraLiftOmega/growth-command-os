import { useState } from 'react';
import { useOrganization } from '@/hooks/useOrganization';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Building2, ChevronDown, Plus, Check } from 'lucide-react';

export function OrgSwitcher() {
  const { organizations, currentOrg, currentRole, switchOrg, createOrg } = useOrganization();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    const org = await createOrg(newName.trim());
    if (org) {
      switchOrg(org.id);
      setShowCreate(false);
      setNewName('');
    }
    setCreating(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2 max-w-[220px]">
            <Building2 className="w-4 h-4 shrink-0 text-primary" />
            <span className="truncate text-sm font-medium">
              {currentOrg?.name || 'Select Organization'}
            </span>
            {currentRole && (
              <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4 shrink-0">
                {currentRole}
              </Badge>
            )}
            <ChevronDown className="w-3 h-3 shrink-0 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[240px]">
          {organizations.map(org => (
            <DropdownMenuItem
              key={org.id}
              onClick={() => switchOrg(org.id)}
              className="flex items-center gap-2"
            >
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <span className="flex-1 truncate">{org.name}</span>
              {org.id === currentOrg?.id && <Check className="w-4 h-4 text-primary" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Organization
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Organization</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Organization name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={creating || !newName.trim()}>
              {creating ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
