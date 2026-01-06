import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface DemoDeployment {
  id: string;
  user_id: string;
  demo_id: string;
  deployment_type: 'email_sequence' | 'sales_page' | 'landing_page' | 'crm_trigger' | 'ad_creative' | 'webinar' | 'proposal';
  deployment_name: string;
  deployment_config: Record<string, any>;
  embed_code: string | null;
  public_url: string | null;
  status: 'draft' | 'active' | 'paused' | 'completed';
  views: number;
  clicks: number;
  conversions: number;
  revenue_attributed: number;
  created_at: string;
  updated_at: string;
}

export interface EmailSequence {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  trigger_type: 'signup' | 'demo_view' | 'cart_abandon' | 'purchase' | 'sales_stage' | 'manual';
  trigger_config: Record<string, any>;
  status: 'draft' | 'active' | 'paused';
  emails: EmailStep[];
  total_sent: number;
  total_opens: number;
  total_clicks: number;
  total_conversions: number;
  revenue_attributed: number;
  created_at: string;
  updated_at: string;
}

export interface EmailStep {
  id: string;
  subject: string;
  previewText?: string;
  delayDays: number;
  delayHours: number;
  demoId?: string;
  customMessage?: string;
  includeDemo: boolean;
}

export interface SalesPageEmbed {
  id: string;
  demo_id: string;
  page_name: string;
  page_url: string | null;
  embed_type: 'inline' | 'modal' | 'sidebar' | 'fullscreen';
  embed_config: Record<string, any>;
  embed_code: string;
  views: number;
  engagement_time_seconds: number;
  conversions: number;
  created_at: string;
}

export interface CrmDemoTrigger {
  id: string;
  demo_id: string;
  trigger_name: string;
  sales_stage: string;
  deal_size_min: number | null;
  deal_size_max: number | null;
  industry_match: string[];
  auto_send: boolean;
  send_delay_minutes: number;
  webhook_url: string | null;
  status: 'active' | 'paused' | 'disabled';
  triggers_fired: number;
  demos_sent: number;
  conversions: number;
  created_at: string;
}

export function useSalesAutomation() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [deployments, setDeployments] = useState<DemoDeployment[]>([]);
  const [sequences, setSequences] = useState<EmailSequence[]>([]);
  const [embeds, setEmbeds] = useState<SalesPageEmbed[]>([]);
  const [crmTriggers, setCrmTriggers] = useState<CrmDemoTrigger[]>([]);

  // Fetch all data
  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const [deploymentsRes, sequencesRes, embedsRes, triggersRes] = await Promise.all([
        supabase.from('demo_deployments').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('email_sequences').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('sales_page_embeds').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('crm_demo_triggers').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      ]);

      if (deploymentsRes.data) setDeployments(deploymentsRes.data as unknown as DemoDeployment[]);
      if (sequencesRes.data) setSequences(sequencesRes.data.map((s: any) => ({
        ...s,
        emails: Array.isArray(s.emails) ? s.emails : []
      })) as EmailSequence[]);
      if (embedsRes.data) setEmbeds(embedsRes.data as unknown as SalesPageEmbed[]);
      if (triggersRes.data) setCrmTriggers(triggersRes.data as unknown as CrmDemoTrigger[]);

    } catch (error) {
      console.error('Error fetching sales automation data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Create email sequence
  const createSequence = useCallback(async (sequence: Partial<EmailSequence>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('email_sequences')
        .insert({
          user_id: user.id,
          name: sequence.name || 'New Sequence',
          description: sequence.description || null,
          trigger_type: sequence.trigger_type || 'manual',
          trigger_config: sequence.trigger_config || {},
          status: 'draft',
          emails: JSON.parse(JSON.stringify(sequence.emails || []))
        })
        .select()
        .single();

      if (error) throw error;

      const newSequence: EmailSequence = {
        ...data,
        emails: Array.isArray(data.emails) ? data.emails as unknown as EmailStep[] : []
      } as EmailSequence;

      setSequences(prev => [newSequence, ...prev]);
      toast.success('Email sequence created');
      return data;
    } catch (error) {
      console.error('Error creating sequence:', error);
      toast.error('Failed to create sequence');
      return null;
    }
  }, [user]);

  // Update email sequence
  const updateSequence = useCallback(async (id: string, updates: Partial<EmailSequence>) => {
    if (!user) return;

    try {
      const updateData: Record<string, any> = {
        updated_at: new Date().toISOString()
      };
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.trigger_type !== undefined) updateData.trigger_type = updates.trigger_type;
      if (updates.trigger_config !== undefined) updateData.trigger_config = updates.trigger_config;
      if (updates.emails !== undefined) updateData.emails = JSON.parse(JSON.stringify(updates.emails));

      const { error } = await supabase
        .from('email_sequences')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setSequences(prev => prev.map(s => 
        s.id === id ? { ...s, ...updates } : s
      ));
      toast.success('Sequence updated');
    } catch (error) {
      console.error('Error updating sequence:', error);
      toast.error('Failed to update sequence');
    }
  }, [user]);

  // Activate/pause sequence
  const toggleSequenceStatus = useCallback(async (id: string) => {
    const sequence = sequences.find(s => s.id === id);
    if (!sequence) return;

    const newStatus = sequence.status === 'active' ? 'paused' : 'active';
    await updateSequence(id, { status: newStatus });
  }, [sequences, updateSequence]);

  // Delete sequence
  const deleteSequence = useCallback(async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('email_sequences')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSequences(prev => prev.filter(s => s.id !== id));
      toast.success('Sequence deleted');
    } catch (error) {
      console.error('Error deleting sequence:', error);
      toast.error('Failed to delete sequence');
    }
  }, [user]);

  // Create sales page embed
  const createEmbed = useCallback(async (demoId: string, config: {
    pageName: string;
    pageUrl?: string;
    embedType: 'inline' | 'modal' | 'sidebar' | 'fullscreen';
    embedConfig?: Record<string, any>;
  }) => {
    if (!user) return null;

    const embedCode = generateEmbedCode(demoId, config.embedType, config.embedConfig);

    try {
      const { data, error } = await supabase
        .from('sales_page_embeds')
        .insert({
          user_id: user.id,
          demo_id: demoId,
          page_name: config.pageName,
          page_url: config.pageUrl,
          embed_type: config.embedType,
          embed_config: config.embedConfig || {},
          embed_code: embedCode
        })
        .select()
        .single();

      if (error) throw error;

      setEmbeds(prev => [data as unknown as SalesPageEmbed, ...prev]);
      toast.success('Embed created');
      return data;
    } catch (error) {
      console.error('Error creating embed:', error);
      toast.error('Failed to create embed');
      return null;
    }
  }, [user]);

  // Create CRM trigger
  const createCrmTrigger = useCallback(async (demoId: string, config: {
    triggerName: string;
    salesStage: string;
    dealSizeMin?: number;
    dealSizeMax?: number;
    industryMatch?: string[];
    autoSend?: boolean;
    sendDelayMinutes?: number;
    webhookUrl?: string;
  }) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('crm_demo_triggers')
        .insert({
          user_id: user.id,
          demo_id: demoId,
          trigger_name: config.triggerName,
          sales_stage: config.salesStage,
          deal_size_min: config.dealSizeMin,
          deal_size_max: config.dealSizeMax,
          industry_match: config.industryMatch || [],
          auto_send: config.autoSend || false,
          send_delay_minutes: config.sendDelayMinutes || 0,
          webhook_url: config.webhookUrl,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      setCrmTriggers(prev => [data as unknown as CrmDemoTrigger, ...prev]);
      toast.success('CRM trigger created');
      return data;
    } catch (error) {
      console.error('Error creating CRM trigger:', error);
      toast.error('Failed to create CRM trigger');
      return null;
    }
  }, [user]);

  // Send demo email
  const sendDemoEmail = useCallback(async (config: {
    to: string;
    recipientName?: string;
    demoId: string;
    sequenceId?: string;
    customSubject?: string;
    customMessage?: string;
  }) => {
    if (!user) return false;

    try {
      const response = await supabase.functions.invoke('send-demo-email', {
        body: config
      });

      if (response.error) throw response.error;

      toast.success('Demo email sent', {
        description: `Sent to ${config.to}`
      });
      return true;
    } catch (error) {
      console.error('Error sending demo email:', error);
      toast.error('Failed to send demo email');
      return false;
    }
  }, [user]);

  // Create deployment
  const createDeployment = useCallback(async (config: {
    demoId: string;
    deploymentType: DemoDeployment['deployment_type'];
    deploymentName: string;
    deploymentConfig?: Record<string, any>;
  }) => {
    if (!user) return null;

    try {
      const embedCode = config.deploymentType === 'sales_page' || config.deploymentType === 'landing_page'
        ? generateEmbedCode(config.demoId, 'inline')
        : null;

      const { data, error } = await supabase
        .from('demo_deployments')
        .insert({
          user_id: user.id,
          demo_id: config.demoId,
          deployment_type: config.deploymentType,
          deployment_name: config.deploymentName,
          deployment_config: config.deploymentConfig || {},
          embed_code: embedCode,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;

      setDeployments(prev => [data as unknown as DemoDeployment, ...prev]);
      toast.success('Deployment created');
      return data;
    } catch (error) {
      console.error('Error creating deployment:', error);
      toast.error('Failed to create deployment');
      return null;
    }
  }, [user]);

  // Activate deployment
  const activateDeployment = useCallback(async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('demo_deployments')
        .update({ status: 'active' })
        .eq('id', id);

      if (error) throw error;

      setDeployments(prev => prev.map(d =>
        d.id === id ? { ...d, status: 'active' } : d
      ));
      toast.success('Deployment activated');
    } catch (error) {
      console.error('Error activating deployment:', error);
      toast.error('Failed to activate deployment');
    }
  }, [user]);

  // Load data on mount
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  return {
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
    refreshData: fetchData
  };
}

function generateEmbedCode(
  demoId: string, 
  embedType: string,
  config?: Record<string, any>
): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const width = config?.width || '100%';
  const height = config?.height || '500';
  
  switch (embedType) {
    case 'inline':
      return `<iframe src="${baseUrl}/embed/demo/${demoId}" width="${width}" height="${height}" frameborder="0" allow="autoplay; fullscreen" style="border-radius: 12px;"></iframe>`;
    
    case 'modal':
      return `<script src="${baseUrl}/embed/demo-modal.js" data-demo-id="${demoId}" data-trigger="button" data-button-text="Watch Demo"></script>`;
    
    case 'sidebar':
      return `<script src="${baseUrl}/embed/demo-sidebar.js" data-demo-id="${demoId}" data-position="right" data-width="400"></script>`;
    
    case 'fullscreen':
      return `<script src="${baseUrl}/embed/demo-fullscreen.js" data-demo-id="${demoId}" data-auto-play="false"></script>`;
    
    default:
      return `<iframe src="${baseUrl}/embed/demo/${demoId}" width="${width}" height="${height}" frameborder="0"></iframe>`;
  }
}
