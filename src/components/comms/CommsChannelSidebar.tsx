import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Hash, Lock, Volume2, Bell, Megaphone, Plus, Search, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type CommsChannel } from '@/hooks/useComms';

interface Props {
  channels: CommsChannel[];
  activeChannelId: string | null;
  onSelectChannel: (id: string) => void;
  onCreateChannel: (name: string, desc?: string, type?: string) => void;
  onlineCount: number;
}

const channelIcons: Record<string, typeof Hash> = {
  text: Hash,
  voice: Volume2,
  announcements: Megaphone,
  alerts: Bell,
  'thread-only': Hash,
};

export function CommsChannelSidebar({ channels, activeChannelId, onSelectChannel, onCreateChannel, onlineCount }: Props) {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState('text');

  const filtered = channels.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  const grouped = {
    text: filtered.filter(c => c.channel_type === 'text' || c.channel_type === 'thread-only'),
    announcements: filtered.filter(c => c.channel_type === 'announcements' || c.channel_type === 'alerts'),
    voice: filtered.filter(c => c.channel_type === 'voice'),
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    onCreateChannel(newName.trim().toLowerCase().replace(/\s+/g, '-'), newDesc, newType);
    setNewName('');
    setNewDesc('');
    setNewType('text');
    setDialogOpen(false);
  };

  return (
    <div className="w-64 border-r border-border flex flex-col bg-sidebar h-full">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-sm tracking-tight">OMEGA Comms</h2>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-[10px] gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              {onlineCount}
            </Badge>
          </div>
        </div>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search channels..."
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      {/* Channel List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {Object.entries(grouped).map(([group, items]) => (
          items.length > 0 && (
            <div key={group}>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground px-2 mb-1 font-semibold">
                {group === 'text' ? 'Channels' : group}
              </p>
              {items.map(ch => {
                const Icon = ch.is_private ? Lock : (channelIcons[ch.channel_type] || Hash);
                return (
                  <button
                    key={ch.id}
                    onClick={() => onSelectChannel(ch.id)}
                    className={cn(
                      'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors',
                      activeChannelId === ch.id
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{ch.name}</span>
                  </button>
                );
              })}
            </div>
          )
        ))}
      </div>

      {/* Create Channel */}
      <div className="p-3 border-t border-border">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full text-xs gap-2">
              <Plus className="w-3.5 h-3.5" /> New Channel
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Channel</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Name</Label>
                <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="general" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <Input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="What's this channel about?" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Type</Label>
                <Select value={newType} onValueChange={setNewType}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="announcements">Announcements</SelectItem>
                    <SelectItem value="alerts">Alerts</SelectItem>
                    <SelectItem value="voice">Voice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreate} className="w-full">Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
