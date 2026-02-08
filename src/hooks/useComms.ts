import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { toast } from 'sonner';

export interface CommsChannel {
  id: string;
  name: string;
  description: string | null;
  channel_type: string;
  icon: string;
  is_private: boolean;
  topic: string | null;
  organization_id: string;
  created_by: string;
  created_at: string;
}

export interface CommsMessage {
  id: string;
  channel_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  message_type: string;
  metadata: Record<string, unknown>;
  is_pinned: boolean;
  is_edited: boolean;
  thread_count: number;
  created_at: string;
  deleted_at: string | null;
  // Joined
  user_email?: string;
}

export interface CommsReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
}

// ─── Channels ───
export function useCommsChannels() {
  const [channels, setChannels] = useState<CommsChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentOrg } = useOrganization();

  const fetchChannels = useCallback(async () => {
    if (!currentOrg?.id) return;
    const { data, error } = await supabase
      .from('comms_channels')
      .select('*')
      .eq('organization_id', currentOrg.id)
      .eq('is_archived', false)
      .order('created_at', { ascending: true });
    if (!error && data) setChannels(data as CommsChannel[]);
    setLoading(false);
  }, [currentOrg?.id]);

  useEffect(() => { fetchChannels(); }, [fetchChannels]);

  const createChannel = async (name: string, description?: string, channelType = 'text') => {
    const { user } = (await supabase.auth.getUser()).data;
    if (!user || !currentOrg?.id) return;
    const { error } = await supabase.from('comms_channels').insert({
      name,
      description: description || null,
      channel_type: channelType,
      organization_id: currentOrg.id,
      created_by: user.id,
    });
    if (error) { toast.error('Failed to create channel'); return; }
    toast.success(`#${name} created`);
    fetchChannels();
  };

  return { channels, loading, createChannel, refetch: fetchChannels };
}

// ─── Messages ───
export function useCommsMessages(channelId: string | null) {
  const [messages, setMessages] = useState<CommsMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const messagesRef = useRef<CommsMessage[]>([]);

  const fetchMessages = useCallback(async () => {
    if (!channelId) { setMessages([]); setLoading(false); return; }
    const { data, error } = await supabase
      .from('comms_messages')
      .select('*')
      .eq('channel_id', channelId)
      .is('parent_id', null)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })
      .limit(200);
    if (!error && data) {
      const msgs = data as CommsMessage[];
      setMessages(msgs);
      messagesRef.current = msgs;
    }
    setLoading(false);
  }, [channelId]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  // Realtime subscription
  useEffect(() => {
    if (!channelId) return;
    const channel = supabase
      .channel(`comms-messages-${channelId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'comms_messages',
        filter: `channel_id=eq.${channelId}`,
      }, (payload) => {
        const newMsg = payload.new as CommsMessage;
        if (newMsg.parent_id) return; // skip thread replies from main feed
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          const updated = [...prev, newMsg];
          messagesRef.current = updated;
          return updated;
        });
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'comms_messages',
        filter: `channel_id=eq.${channelId}`,
      }, (payload) => {
        const oldId = (payload.old as { id: string }).id;
        setMessages(prev => {
          const updated = prev.filter(m => m.id !== oldId);
          messagesRef.current = updated;
          return updated;
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [channelId]);

  const sendMessage = async (content: string, parentId?: string) => {
    if (!user || !channelId || !content.trim()) return;
    const { error } = await supabase.from('comms_messages').insert({
      channel_id: channelId,
      user_id: user.id,
      content: content.trim(),
      parent_id: parentId || null,
    });
    if (error) toast.error('Failed to send');
  };

  const deleteMessage = async (messageId: string) => {
    await supabase.from('comms_messages').update({ deleted_at: new Date().toISOString() }).eq('id', messageId);
    setMessages(prev => prev.filter(m => m.id !== messageId));
  };

  const editMessage = async (messageId: string, content: string) => {
    await supabase.from('comms_messages').update({ content, is_edited: true, edited_at: new Date().toISOString() }).eq('id', messageId);
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content, is_edited: true } : m));
  };

  const pinMessage = async (messageId: string, pinned: boolean) => {
    await supabase.from('comms_messages').update({ is_pinned: pinned }).eq('id', messageId);
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, is_pinned: pinned } : m));
  };

  return { messages, loading, sendMessage, deleteMessage, editMessage, pinMessage };
}

// ─── Reactions ───
export function useCommsReactions(messageIds: string[]) {
  const [reactions, setReactions] = useState<CommsReaction[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!messageIds.length) return;
    supabase
      .from('comms_reactions')
      .select('*')
      .in('message_id', messageIds)
      .then(({ data }) => { if (data) setReactions(data as CommsReaction[]); });
  }, [messageIds.join(',')]);

  const toggleReaction = async (messageId: string, emoji: string) => {
    if (!user) return;
    const existing = reactions.find(r => r.message_id === messageId && r.user_id === user.id && r.emoji === emoji);
    if (existing) {
      await supabase.from('comms_reactions').delete().eq('id', existing.id);
      setReactions(prev => prev.filter(r => r.id !== existing.id));
    } else {
      const { data } = await supabase.from('comms_reactions').insert({ message_id: messageId, user_id: user.id, emoji }).select().single();
      if (data) setReactions(prev => [...prev, data as CommsReaction]);
    }
  };

  return { reactions, toggleReaction };
}

// ─── Thread Messages ───
export function useCommsThread(parentId: string | null) {
  const [replies, setReplies] = useState<CommsMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!parentId) { setReplies([]); return; }
    setLoading(true);
    supabase
      .from('comms_messages')
      .select('*')
      .eq('parent_id', parentId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) setReplies(data as CommsMessage[]);
        setLoading(false);
      });
  }, [parentId]);

  // Realtime for thread
  useEffect(() => {
    if (!parentId) return;
    const channel = supabase
      .channel(`comms-thread-${parentId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'comms_messages',
        filter: `parent_id=eq.${parentId}`,
      }, (payload) => {
        const newMsg = payload.new as CommsMessage;
        setReplies(prev => prev.some(m => m.id === newMsg.id) ? prev : [...prev, newMsg]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [parentId]);

  const sendReply = async (content: string, channelId: string) => {
    if (!user || !parentId || !content.trim()) return;
    await supabase.from('comms_messages').insert({
      channel_id: channelId,
      user_id: user.id,
      content: content.trim(),
      parent_id: parentId,
    });
  };

  return { replies, loading, sendReply };
}

// ─── Presence / Typing ───
export function useCommsPresence(channelId: string | null) {
  const [onlineUsers, setOnlineUsers] = useState<Record<string, { email: string; online_at: string }>>({});
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const { user } = useAuth();
  const typingTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!channelId || !user) return;

    const channel = supabase.channel(`comms-presence-${channelId}`, {
      config: { presence: { key: user.id } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users: Record<string, { email: string; online_at: string }> = {};
        Object.entries(state).forEach(([key, presences]) => {
          const p = (presences as unknown as Array<{ email: string; online_at: string }>)[0];
          if (p) users[key] = p;
        });
        setOnlineUsers(users);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            email: user.email || 'unknown',
            online_at: new Date().toISOString(),
          });
        }
      });

    // Typing indicator channel
    const typingChannel = supabase
      .channel(`comms-typing-${channelId}`)
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.user_id !== user.id) {
          setTypingUsers(prev => prev.includes(payload.email) ? prev : [...prev, payload.email]);
          setTimeout(() => {
            setTypingUsers(prev => prev.filter(e => e !== payload.email));
          }, 3000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(typingChannel);
    };
  }, [channelId, user?.id]);

  const broadcastTyping = useCallback(() => {
    if (!channelId || !user) return;
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    supabase.channel(`comms-typing-${channelId}`).send({
      type: 'broadcast',
      event: 'typing',
      payload: { user_id: user.id, email: user.email },
    });
    typingTimeout.current = setTimeout(() => {}, 3000);
  }, [channelId, user?.id]);

  return { onlineUsers, typingUsers, broadcastTyping };
}
