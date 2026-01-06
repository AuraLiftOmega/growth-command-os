import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  Globe,
  Zap,
  Settings,
  Play,
  Pause,
  Plus,
  Send,
  Copy,
  ExternalLink,
  Loader2,
  Check,
  BarChart3,
  Users,
  DollarSign,
  Clock,
  Target,
  Webhook,
  TrendingUp
} from 'lucide-react';
import { useSalesAutomation, EmailSequence, EmailStep } from '@/hooks/useSalesAutomation';
import { useDemoEngine } from '@/hooks/useDemoEngine';
import { INDUSTRY_TEMPLATES } from '@/stores/dominion-core-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/**
 * DEMO SALES AUTOMATION
 * 
 * Deploy demos to:
 * - Email sequences
 * - Sales pages
 * - CRM triggers
 * - Automated workflows
 */

export const DemoSalesAutomation = () => {
  const { demos } = useDemoEngine();
  const {
    isLoading,
    deployments,
    sequences,
    embeds,
    crmTriggers,
    createSequence,
    updateSequence,
    toggleSequenceStatus,
    deleteSequence,
    createEmbed,
    createCrmTrigger,
    sendDemoEmail,
    createDeployment,
    activateDeployment,
    refreshData
  } = useSalesAutomation();

  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);
  const [showNewSequenceDialog, setShowNewSequenceDialog] = useState(false);
  const [showNewEmbedDialog, setShowNewEmbedDialog] = useState(false);
  const [showNewTriggerDialog, setShowNewTriggerDialog] = useState(false);
  const [showSendEmailDialog, setShowSendEmailDialog] = useState(false);

  // Calculate stats
  const totalViews = deployments.reduce((sum, d) => sum + (d.views || 0), 0);
  const totalConversions = deployments.reduce((sum, d) => sum + (d.conversions || 0), 0);
  const totalRevenue = deployments.reduce((sum, d) => sum + Number(d.revenue_attributed || 0), 0);
  const activeSequences = sequences.filter(s => s.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <BarChart3 className="w-4 h-4" />
              <span className="text-xs">Total Views</span>
            </div>
            <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Target className="w-4 h-4" />
              <span className="text-xs">Conversions</span>
            </div>
            <p className="text-2xl font-bold">{totalConversions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs">Revenue</span>
            </div>
            <p className="text-2xl font-bold text-success">${totalRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Mail className="w-4 h-4" />
              <span className="text-xs">Active Sequences</span>
            </div>
            <p className="text-2xl font-bold">{activeSequences}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="sequences" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="sequences" className="gap-1">
            <Mail className="w-4 h-4" />
            Sequences
          </TabsTrigger>
          <TabsTrigger value="embeds" className="gap-1">
            <Globe className="w-4 h-4" />
            Embeds
          </TabsTrigger>
          <TabsTrigger value="crm" className="gap-1">
            <Zap className="w-4 h-4" />
            CRM
          </TabsTrigger>
          <TabsTrigger value="quick-send" className="gap-1">
            <Send className="w-4 h-4" />
            Quick Send
          </TabsTrigger>
        </TabsList>

        {/* Email Sequences Tab */}
        <TabsContent value="sequences" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Email Sequences</h3>
              <p className="text-sm text-muted-foreground">
                Automated demo delivery in nurture campaigns
              </p>
            </div>
            <NewSequenceDialog 
              open={showNewSequenceDialog} 
              onOpenChange={setShowNewSequenceDialog}
              demos={demos}
              onSave={createSequence}
            />
          </div>

          {sequences.length === 0 ? (
            <EmptyState
              icon={Mail}
              title="No Email Sequences"
              description="Create automated email sequences that include your demo videos"
              action={
                <Button onClick={() => setShowNewSequenceDialog(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Sequence
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {sequences.map(sequence => (
                <SequenceCard
                  key={sequence.id}
                  sequence={sequence}
                  onToggle={() => toggleSequenceStatus(sequence.id)}
                  onDelete={() => deleteSequence(sequence.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Sales Page Embeds Tab */}
        <TabsContent value="embeds" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Sales Page Embeds</h3>
              <p className="text-sm text-muted-foreground">
                Embed demos on your website and landing pages
              </p>
            </div>
            <NewEmbedDialog
              open={showNewEmbedDialog}
              onOpenChange={setShowNewEmbedDialog}
              demos={demos}
              onSave={createEmbed}
            />
          </div>

          {embeds.length === 0 ? (
            <EmptyState
              icon={Globe}
              title="No Embeds Created"
              description="Generate embed codes to add demos to your sales pages"
              action={
                <Button onClick={() => setShowNewEmbedDialog(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Embed
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {embeds.map(embed => (
                <EmbedCard key={embed.id} embed={embed} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* CRM Triggers Tab */}
        <TabsContent value="crm" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">CRM Triggers</h3>
              <p className="text-sm text-muted-foreground">
                Auto-send demos based on sales stage and deal size
              </p>
            </div>
            <NewTriggerDialog
              open={showNewTriggerDialog}
              onOpenChange={setShowNewTriggerDialog}
              demos={demos}
              onSave={createCrmTrigger}
            />
          </div>

          {crmTriggers.length === 0 ? (
            <EmptyState
              icon={Webhook}
              title="No CRM Triggers"
              description="Set up automatic demo delivery based on CRM events"
              action={
                <Button onClick={() => setShowNewTriggerDialog(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Trigger
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {crmTriggers.map(trigger => (
                <TriggerCard key={trigger.id} trigger={trigger} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Quick Send Tab */}
        <TabsContent value="quick-send" className="space-y-4">
          <div>
            <h3 className="font-semibold">Quick Send</h3>
            <p className="text-sm text-muted-foreground">
              Send a demo directly to a prospect
            </p>
          </div>

          <QuickSendForm demos={demos} onSend={sendDemoEmail} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Empty State Component
function EmptyState({ icon: Icon, title, description, action }: {
  icon: any;
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-lg">
      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-muted-foreground" />
      </div>
      <h4 className="font-medium mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm">{description}</p>
      {action}
    </div>
  );
}

// Sequence Card Component
function SequenceCard({ sequence, onToggle, onDelete }: {
  sequence: EmailSequence;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const emailCount = sequence.emails?.length || 0;
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium">{sequence.name}</h4>
              <Badge variant={sequence.status === 'active' ? 'default' : 'secondary'}>
                {sequence.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {sequence.description || `${emailCount} emails • Trigger: ${sequence.trigger_type}`}
            </p>
            
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-muted-foreground">Sent: </span>
                <span className="font-medium">{sequence.total_sent}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Opens: </span>
                <span className="font-medium">{sequence.total_opens}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Clicks: </span>
                <span className="font-medium">{sequence.total_clicks}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Revenue: </span>
                <span className="font-medium text-success">${Number(sequence.revenue_attributed).toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onToggle}
              className="gap-1"
            >
              {sequence.status === 'active' ? (
                <><Pause className="w-3 h-3" /> Pause</>
              ) : (
                <><Play className="w-3 h-3" /> Activate</>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Embed Card Component
function EmbedCard({ embed }: { embed: any }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(embed.embed_code);
    setCopied(true);
    toast.success('Embed code copied');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-medium">{embed.page_name}</h4>
            <Badge variant="outline" className="mt-1">{embed.embed_type}</Badge>
          </div>
          <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1">
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy Code'}
          </Button>
        </div>
        
        <div className="bg-secondary/50 rounded p-2 text-xs font-mono overflow-hidden text-ellipsis">
          {embed.embed_code.substring(0, 80)}...
        </div>
        
        <div className="flex items-center gap-4 mt-3 text-sm">
          <div>
            <span className="text-muted-foreground">Views: </span>
            <span className="font-medium">{embed.views}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Conversions: </span>
            <span className="font-medium">{embed.conversions}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Trigger Card Component
function TriggerCard({ trigger }: { trigger: any }) {
  const [showWebhook, setShowWebhook] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Generate webhook URL for this trigger
  const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/crm-webhook`;
  const webhookPayload = JSON.stringify({
    trigger_id: trigger.id,
    event_type: 'deal_stage_changed',
    contact_email: '{{contact.email}}',
    contact_name: '{{contact.name}}',
    company_name: '{{company.name}}',
    deal_size: '{{deal.amount}}',
    sales_stage: trigger.sales_stage,
    crm_source: 'zapier'
  }, null, 2);

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    toast.success('Webhook URL copied');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium">{trigger.trigger_name}</h4>
              <Badge variant={trigger.status === 'active' ? 'default' : 'secondary'}>
                {trigger.status}
              </Badge>
              {trigger.webhook_url && (
                <Badge variant="outline" className="gap-1">
                  <Webhook className="w-3 h-3" />
                  Webhook
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Stage: {trigger.sales_stage} • 
              {trigger.auto_send ? ' Auto-send enabled' : ' Manual approval'}
            </p>
            
            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Triggers: </span>
                <span className="font-medium">{trigger.triggers_fired}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Sent: </span>
                <span className="font-medium">{trigger.demos_sent}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Conversions: </span>
                <span className="font-medium text-success">{trigger.conversions}</span>
              </div>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowWebhook(!showWebhook)}
            className="gap-1"
          >
            <Webhook className="w-3 h-3" />
            {showWebhook ? 'Hide' : 'Webhook'}
          </Button>
        </div>
        
        {showWebhook && (
          <div className="mt-4 pt-4 border-t space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-xs text-muted-foreground">Webhook URL (for Zapier, HubSpot, Salesforce)</Label>
                <Button variant="ghost" size="sm" onClick={handleCopyWebhook} className="h-6 gap-1">
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <div className="bg-secondary/50 rounded p-2 text-xs font-mono break-all">
                {webhookUrl}
              </div>
            </div>
            
            <div>
              <Label className="text-xs text-muted-foreground">Example Payload</Label>
              <pre className="bg-secondary/50 rounded p-2 text-xs font-mono overflow-x-auto mt-1">
                {webhookPayload}
              </pre>
            </div>

            <div className="bg-muted/50 rounded p-3 text-xs">
              <p className="font-medium mb-1">Integration Instructions:</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• <strong>Zapier:</strong> Create a Webhook action → POST to the URL above</li>
                <li>• <strong>HubSpot:</strong> Workflows → Custom webhook action</li>
                <li>• <strong>Salesforce:</strong> Process Builder → Outbound Message</li>
                <li>• Replace placeholders with your CRM's merge fields</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// New Sequence Dialog
function NewSequenceDialog({ open, onOpenChange, demos, onSave }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  demos: any[];
  onSave: (sequence: any) => Promise<any>;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerType, setTriggerType] = useState<string>('manual');
  const [selectedDemoId, setSelectedDemoId] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Please enter a sequence name');
      return;
    }

    setIsSaving(true);
    const emails: EmailStep[] = selectedDemoId ? [{
      id: crypto.randomUUID(),
      subject: 'Your exclusive demo is ready',
      delayDays: 0,
      delayHours: 0,
      demoId: selectedDemoId,
      includeDemo: true
    }] : [];

    await onSave({
      name,
      description,
      trigger_type: triggerType,
      emails
    });

    setIsSaving(false);
    setName('');
    setDescription('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create Sequence
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Email Sequence</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div>
            <Label>Sequence Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Demo Follow-up Sequence"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this sequence do?"
              rows={2}
            />
          </div>
          <div>
            <Label>Trigger</Label>
            <Select value={triggerType} onValueChange={setTriggerType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="signup">On Signup</SelectItem>
                <SelectItem value="demo_view">After Demo View</SelectItem>
                <SelectItem value="sales_stage">Sales Stage Change</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Include Demo</Label>
            <Select value={selectedDemoId} onValueChange={setSelectedDemoId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a demo" />
              </SelectTrigger>
              <SelectContent>
                {demos.map(demo => (
                  <SelectItem key={demo.id} value={demo.id}>
                    {INDUSTRY_TEMPLATES[demo.industry]?.name || demo.industry} - {demo.variant}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Sequence'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// New Embed Dialog
function NewEmbedDialog({ open, onOpenChange, demos, onSave }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  demos: any[];
  onSave: (demoId: string, config: any) => Promise<any>;
}) {
  const [selectedDemoId, setSelectedDemoId] = useState<string>('');
  const [pageName, setPageName] = useState('');
  const [embedType, setEmbedType] = useState<string>('inline');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!selectedDemoId || !pageName.trim()) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSaving(true);
    await onSave(selectedDemoId, {
      pageName,
      embedType: embedType as any
    });
    setIsSaving(false);
    setSelectedDemoId('');
    setPageName('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create Embed
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Sales Page Embed</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div>
            <Label>Select Demo</Label>
            <Select value={selectedDemoId} onValueChange={setSelectedDemoId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a demo" />
              </SelectTrigger>
              <SelectContent>
                {demos.map(demo => (
                  <SelectItem key={demo.id} value={demo.id}>
                    {INDUSTRY_TEMPLATES[demo.industry]?.name || demo.industry} - {demo.variant}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Page Name</Label>
            <Input
              value={pageName}
              onChange={(e) => setPageName(e.target.value)}
              placeholder="e.g., Homepage Hero, Pricing Page"
            />
          </div>
          <div>
            <Label>Embed Type</Label>
            <Select value={embedType} onValueChange={setEmbedType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inline">Inline (iframe)</SelectItem>
                <SelectItem value="modal">Modal (click to open)</SelectItem>
                <SelectItem value="sidebar">Sidebar Widget</SelectItem>
                <SelectItem value="fullscreen">Fullscreen Takeover</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Embed'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// New Trigger Dialog
function NewTriggerDialog({ open, onOpenChange, demos, onSave }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  demos: any[];
  onSave: (demoId: string, config: any) => Promise<any>;
}) {
  const [selectedDemoId, setSelectedDemoId] = useState<string>('');
  const [triggerName, setTriggerName] = useState('');
  const [salesStage, setSalesStage] = useState('warm');
  const [autoSend, setAutoSend] = useState(false);
  const [dealSizeMin, setDealSizeMin] = useState('');
  const [dealSizeMax, setDealSizeMax] = useState('');
  const [sendDelayMinutes, setSendDelayMinutes] = useState('0');
  const [externalWebhook, setExternalWebhook] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!selectedDemoId || !triggerName.trim()) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSaving(true);
    await onSave(selectedDemoId, {
      triggerName,
      salesStage,
      autoSend,
      dealSizeMin: dealSizeMin ? parseInt(dealSizeMin) : undefined,
      dealSizeMax: dealSizeMax ? parseInt(dealSizeMax) : undefined,
      sendDelayMinutes: parseInt(sendDelayMinutes) || 0,
      webhookUrl: externalWebhook || undefined
    });
    setIsSaving(false);
    setSelectedDemoId('');
    setTriggerName('');
    setDealSizeMin('');
    setDealSizeMax('');
    setExternalWebhook('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create Trigger
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create CRM Trigger</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto">
          <div>
            <Label>Select Demo *</Label>
            <Select value={selectedDemoId} onValueChange={setSelectedDemoId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a demo" />
              </SelectTrigger>
              <SelectContent>
                {demos.map(demo => (
                  <SelectItem key={demo.id} value={demo.id}>
                    {INDUSTRY_TEMPLATES[demo.industry]?.name || demo.industry} - {demo.variant}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Trigger Name *</Label>
            <Input
              value={triggerName}
              onChange={(e) => setTriggerName(e.target.value)}
              placeholder="e.g., Warm Lead Demo Send"
            />
          </div>
          <div>
            <Label>Sales Stage</Label>
            <Select value={salesStage} onValueChange={setSalesStage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cold">Cold</SelectItem>
                <SelectItem value="warm">Warm</SelectItem>
                <SelectItem value="hot">Hot</SelectItem>
                <SelectItem value="negotiation">Negotiation</SelectItem>
                <SelectItem value="close">Close</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Min Deal Size ($)</Label>
              <Input
                type="number"
                value={dealSizeMin}
                onChange={(e) => setDealSizeMin(e.target.value)}
                placeholder="e.g., 10000"
              />
            </div>
            <div>
              <Label>Max Deal Size ($)</Label>
              <Input
                type="number"
                value={dealSizeMax}
                onChange={(e) => setDealSizeMax(e.target.value)}
                placeholder="e.g., 100000"
              />
            </div>
          </div>

          <div>
            <Label>Send Delay (minutes)</Label>
            <Input
              type="number"
              value={sendDelayMinutes}
              onChange={(e) => setSendDelayMinutes(e.target.value)}
              placeholder="0"
            />
            <p className="text-xs text-muted-foreground mt-1">Delay before sending demo after trigger</p>
          </div>

          <div>
            <Label>External Webhook (optional)</Label>
            <Input
              value={externalWebhook}
              onChange={(e) => setExternalWebhook(e.target.value)}
              placeholder="https://hooks.zapier.com/..."
            />
            <p className="text-xs text-muted-foreground mt-1">Zapier/webhook to call when demo is sent</p>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <Label>Auto-Send</Label>
              <p className="text-xs text-muted-foreground">Automatically send demo email when triggered</p>
            </div>
            <Switch checked={autoSend} onCheckedChange={setAutoSend} />
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Trigger'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Quick Send Form
function QuickSendForm({ demos, onSend }: {
  demos: any[];
  onSend: (config: any) => Promise<boolean>;
}) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [selectedDemoId, setSelectedDemoId] = useState<string>('');
  const [customSubject, setCustomSubject] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!email.trim() || !selectedDemoId) {
      toast.error('Please enter email and select a demo');
      return;
    }

    setIsSending(true);
    const success = await onSend({
      to: email,
      recipientName: name,
      demoId: selectedDemoId,
      customSubject: customSubject || undefined,
      customMessage: customMessage || undefined
    });

    if (success) {
      setEmail('');
      setName('');
      setCustomSubject('');
      setCustomMessage('');
    }
    setIsSending(false);
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Recipient Email *</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="prospect@company.com"
            />
          </div>
          <div>
            <Label>Recipient Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Smith"
            />
          </div>
        </div>

        <div>
          <Label>Select Demo *</Label>
          <Select value={selectedDemoId} onValueChange={setSelectedDemoId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a demo to send" />
            </SelectTrigger>
            <SelectContent>
              {demos.map(demo => (
                <SelectItem key={demo.id} value={demo.id}>
                  {INDUSTRY_TEMPLATES[demo.industry]?.name || demo.industry} - {demo.variant}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Custom Subject (optional)</Label>
          <Input
            value={customSubject}
            onChange={(e) => setCustomSubject(e.target.value)}
            placeholder="Leave blank for default subject"
          />
        </div>

        <div>
          <Label>Custom Message (optional)</Label>
          <Textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Add a personalized message..."
            rows={3}
          />
        </div>

        <Button 
          onClick={handleSend} 
          disabled={isSending || !email || !selectedDemoId}
          className="w-full gap-2"
        >
          {isSending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
          ) : (
            <><Send className="w-4 h-4" /> Send Demo Email</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export default DemoSalesAutomation;
