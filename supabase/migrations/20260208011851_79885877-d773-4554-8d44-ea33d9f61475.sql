
-- ============================================
-- OMEGA COMMS: Real-time Communication Hub
-- ============================================

-- Channels table
CREATE TABLE public.comms_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  channel_type TEXT NOT NULL DEFAULT 'text' CHECK (channel_type IN ('text', 'voice', 'announcements', 'alerts', 'thread-only')),
  icon TEXT DEFAULT '#',
  is_private BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  pinned_message_id UUID,
  topic TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Messages table
CREATE TABLE public.comms_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.comms_channels(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  parent_id UUID REFERENCES public.comms_messages(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'embed', 'file', 'code', 'poll')),
  metadata JSONB DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT false,
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  thread_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reactions table
CREATE TABLE public.comms_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES public.comms_messages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (message_id, user_id, emoji)
);

-- Channel members (for private channels / read tracking)
CREATE TABLE public.comms_channel_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.comms_channels(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  last_read_at TIMESTAMPTZ DEFAULT now(),
  is_muted BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (channel_id, user_id)
);

-- Typing indicators (ephemeral, cleaned up periodically)
CREATE TABLE public.comms_typing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.comms_channels(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (channel_id, user_id)
);

-- File attachments
CREATE TABLE public.comms_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES public.comms_messages(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.comms_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comms_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comms_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comms_channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comms_typing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comms_attachments ENABLE ROW LEVEL SECURITY;

-- RLS: Channels - org members can see channels in their org
CREATE POLICY "Org members can view channels" ON public.comms_channels
  FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Org members can create channels" ON public.comms_channels
  FOR INSERT TO authenticated
  WITH CHECK (public.is_org_member(auth.uid(), organization_id) AND created_by = auth.uid());

CREATE POLICY "Channel creators can update" ON public.comms_channels
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR public.get_org_role(auth.uid(), organization_id) IN ('owner', 'admin'));

-- RLS: Messages - org members can CRUD messages in visible channels
CREATE POLICY "Members can view channel messages" ON public.comms_messages
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.comms_channels c WHERE c.id = channel_id AND public.is_org_member(auth.uid(), c.organization_id)));

CREATE POLICY "Members can send messages" ON public.comms_messages
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.comms_channels c WHERE c.id = channel_id AND public.is_org_member(auth.uid(), c.organization_id)));

CREATE POLICY "Users can edit own messages" ON public.comms_messages
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own messages" ON public.comms_messages
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- RLS: Reactions
CREATE POLICY "Members can view reactions" ON public.comms_reactions
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.comms_messages m JOIN public.comms_channels c ON c.id = m.channel_id WHERE m.id = message_id AND public.is_org_member(auth.uid(), c.organization_id)));

CREATE POLICY "Members can add reactions" ON public.comms_reactions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove own reactions" ON public.comms_reactions
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- RLS: Channel members
CREATE POLICY "Members can view channel members" ON public.comms_channel_members
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.comms_channels c WHERE c.id = channel_id AND public.is_org_member(auth.uid(), c.organization_id)));

CREATE POLICY "Members can join channels" ON public.comms_channel_members
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Members can update own membership" ON public.comms_channel_members
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- RLS: Typing
CREATE POLICY "Members can view typing" ON public.comms_typing
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can set typing" ON public.comms_typing
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can clear typing" ON public.comms_typing
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- RLS: Attachments
CREATE POLICY "Members can view attachments" ON public.comms_attachments
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.comms_messages m JOIN public.comms_channels c ON c.id = m.channel_id WHERE m.id = message_id AND public.is_org_member(auth.uid(), c.organization_id)));

CREATE POLICY "Members can add attachments" ON public.comms_attachments
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.comms_messages m WHERE m.id = message_id AND m.user_id = auth.uid()));

-- Enable realtime for messages, typing, and reactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.comms_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comms_typing;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comms_reactions;

-- Indexes for performance
CREATE INDEX idx_comms_messages_channel_id ON public.comms_messages(channel_id, created_at DESC);
CREATE INDEX idx_comms_messages_parent_id ON public.comms_messages(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_comms_reactions_message_id ON public.comms_reactions(message_id);
CREATE INDEX idx_comms_channel_members_user ON public.comms_channel_members(user_id);
CREATE INDEX idx_comms_channels_org ON public.comms_channels(organization_id);

-- Trigger to update thread_count
CREATE OR REPLACE FUNCTION public.update_thread_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public' AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.parent_id IS NOT NULL THEN
    UPDATE public.comms_messages SET thread_count = thread_count + 1 WHERE id = NEW.parent_id;
  ELSIF TG_OP = 'DELETE' AND OLD.parent_id IS NOT NULL THEN
    UPDATE public.comms_messages SET thread_count = GREATEST(thread_count - 1, 0) WHERE id = OLD.parent_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_update_thread_count
AFTER INSERT OR DELETE ON public.comms_messages
FOR EACH ROW EXECUTE FUNCTION public.update_thread_count();

-- Auto-update updated_at on channels
CREATE TRIGGER trg_comms_channels_updated
BEFORE UPDATE ON public.comms_channels
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for comms files
INSERT INTO storage.buckets (id, name, public) VALUES ('comms-files', 'comms-files', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload comms files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'comms-files');

CREATE POLICY "Anyone can view comms files" ON storage.objects
  FOR SELECT USING (bucket_id = 'comms-files');
