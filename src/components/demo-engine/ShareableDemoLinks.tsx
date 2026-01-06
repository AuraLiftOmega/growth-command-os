import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Link2,
  Copy,
  Trash2,
  Eye,
  Clock,
  TrendingUp,
  Send,
  Plus,
  Loader2,
  ExternalLink,
  CheckCircle2,
  Users
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface ShareLink {
  id: string;
  demo_id: string;
  share_code: string;
  recipient_name: string | null;
  recipient_email: string | null;
  expires_at: string | null;
  views: number;
  unique_viewers: number;
  total_watch_time_seconds: number;
  conversions: number;
  revenue_attributed: number;
  created_at: string;
  last_viewed_at: string | null;
}

interface Demo {
  id: string;
  industry: string;
  variant: string;
}

interface ShareableDemoLinksProps {
  demos: Demo[];
  onRefresh?: () => void;
}

export const ShareableDemoLinks = ({ demos, onRefresh }: ShareableDemoLinksProps) => {
  const { user } = useAuth();
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state
  const [selectedDemoId, setSelectedDemoId] = useState<string>('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [expiresIn, setExpiresIn] = useState<string>('never');

  useEffect(() => {
    fetchShareLinks();
  }, [user]);

  const fetchShareLinks = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('demo_share_links')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setShareLinks((data || []) as ShareLink[]);
    } catch (error) {
      console.error('Error fetching share links:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateShareCode = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const createShareLink = async () => {
    if (!user || !selectedDemoId) {
      toast.error('Please select a demo');
      return;
    }

    setCreating(true);
    try {
      const shareCode = generateShareCode();
      
      let expiresAt: string | null = null;
      if (expiresIn !== 'never') {
        const now = new Date();
        switch (expiresIn) {
          case '24h':
            expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
            break;
          case '7d':
            expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
            break;
          case '30d':
            expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
            break;
        }
      }

      const { data, error } = await supabase
        .from('demo_share_links')
        .insert({
          demo_id: selectedDemoId,
          user_id: user.id,
          share_code: shareCode,
          recipient_name: recipientName || null,
          recipient_email: recipientEmail || null,
          expires_at: expiresAt,
        })
        .select()
        .single();

      if (error) throw error;

      setShareLinks(prev => [data as ShareLink, ...prev]);
      
      // Copy link to clipboard
      const shareUrl = `${window.location.origin}/demo/${shareCode}`;
      await navigator.clipboard.writeText(shareUrl);
      
      toast.success('Share link created and copied!', {
        description: recipientName ? `For ${recipientName}` : 'Link copied to clipboard'
      });

      // Reset form
      setSelectedDemoId('');
      setRecipientName('');
      setRecipientEmail('');
      setExpiresIn('never');
      setIsDialogOpen(false);

    } catch (error) {
      console.error('Error creating share link:', error);
      toast.error('Failed to create share link');
    } finally {
      setCreating(false);
    }
  };

  const copyLink = async (shareCode: string) => {
    const shareUrl = `${window.location.origin}/demo/${shareCode}`;
    await navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard');
  };

  const deleteLink = async (linkId: string) => {
    try {
      const { error } = await supabase
        .from('demo_share_links')
        .delete()
        .eq('id', linkId);

      if (error) throw error;

      setShareLinks(prev => prev.filter(l => l.id !== linkId));
      toast.success('Share link deleted');
    } catch (error) {
      console.error('Error deleting share link:', error);
      toast.error('Failed to delete share link');
    }
  };

  const formatWatchTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Shareable Demo Links</h3>
          <p className="text-sm text-muted-foreground">
            Create unique links to send demos to prospects with tracking
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Link
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Shareable Demo Link</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Select Demo</Label>
                <Select value={selectedDemoId} onValueChange={setSelectedDemoId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a demo to share" />
                  </SelectTrigger>
                  <SelectContent>
                    {demos.map(demo => (
                      <SelectItem key={demo.id} value={demo.id}>
                        {demo.industry} - {demo.variant}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Recipient Name (optional)</Label>
                <Input
                  placeholder="e.g., John Smith"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Recipient Email (optional)</Label>
                <Input
                  type="email"
                  placeholder="e.g., john@company.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Link Expiration</Label>
                <Select value={expiresIn} onValueChange={setExpiresIn}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never expires</SelectItem>
                    <SelectItem value="24h">24 hours</SelectItem>
                    <SelectItem value="7d">7 days</SelectItem>
                    <SelectItem value="30d">30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                className="w-full gap-2" 
                onClick={createShareLink}
                disabled={creating || !selectedDemoId}
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4" />
                    Create & Copy Link
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Summary */}
      {shareLinks.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-xs text-muted-foreground mb-1">Total Links</p>
            <p className="text-2xl font-mono font-bold">{shareLinks.length}</p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-xs text-muted-foreground mb-1">Total Views</p>
            <p className="text-2xl font-mono font-bold">
              {shareLinks.reduce((sum, l) => sum + l.views, 0)}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-xs text-muted-foreground mb-1">Unique Viewers</p>
            <p className="text-2xl font-mono font-bold">
              {shareLinks.reduce((sum, l) => sum + l.unique_viewers, 0)}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-xs text-muted-foreground mb-1">Conversions</p>
            <p className="text-2xl font-mono font-bold text-success">
              {shareLinks.reduce((sum, l) => sum + l.conversions, 0)}
            </p>
          </div>
        </div>
      )}

      {/* Links List */}
      {shareLinks.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-lg">
          <Link2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="font-semibold mb-2">No share links yet</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first shareable demo link to start tracking engagement
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {shareLinks.map((link, index) => {
            const demo = demos.find(d => d.id === link.demo_id);
            const isExpired = link.expires_at && new Date(link.expires_at) < new Date();

            return (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded">
                        {link.share_code}
                      </span>
                      {link.recipient_name && (
                        <span className="text-sm text-muted-foreground">
                          → {link.recipient_name}
                        </span>
                      )}
                      {isExpired && (
                        <Badge variant="destructive" className="text-xs">Expired</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {demo?.industry} • {demo?.variant} variant • 
                      Created {formatDistanceToNow(new Date(link.created_at), { addSuffix: true })}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Eye className="w-3 h-3" />
                        {link.views}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="w-3 h-3" />
                        {link.unique_viewers}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatWatchTime(link.total_watch_time_seconds)}
                      </div>
                    </div>
                    {link.conversions > 0 && (
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-success">
                          <CheckCircle2 className="w-3 h-3" />
                          {link.conversions}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => copyLink(link.share_code)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => window.open(`/demo/${link.share_code}`, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => deleteLink(link.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ShareableDemoLinks;