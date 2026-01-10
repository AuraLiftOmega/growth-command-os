-- Create workspace_role enum if not exists (for new role values)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'workspace_role') THEN
    CREATE TYPE public.workspace_role AS ENUM ('owner', 'admin', 'editor', 'viewer');
  END IF;
END $$;

-- Create workspaces table
CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Default Workspace',
  owner_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add workspace_id to user_roles
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS workspace_id UUID,
ADD COLUMN IF NOT EXISTS invited_by UUID,
ADD COLUMN IF NOT EXISTS invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP WITH TIME ZONE;

-- Create workspace_invites table
CREATE TABLE public.workspace_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer',
  token TEXT NOT NULL UNIQUE,
  invited_by UUID NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_invites ENABLE ROW LEVEL SECURITY;

-- Create helper function to check workspace role
CREATE OR REPLACE FUNCTION public.has_workspace_access(check_user_id UUID, check_workspace_id UUID, min_role TEXT)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id 
      AND workspace_id = check_workspace_id
      AND (
        role::text = 'owner' OR
        (min_role = 'admin' AND role::text IN ('owner', 'admin')) OR
        (min_role = 'editor' AND role::text IN ('owner', 'admin', 'editor')) OR
        (min_role = 'viewer' AND role::text IN ('owner', 'admin', 'editor', 'viewer'))
      )
  );
$$;

-- Create function to get user's default workspace
CREATE OR REPLACE FUNCTION public.get_default_workspace(check_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT workspace_id FROM public.user_roles
  WHERE user_id = check_user_id AND workspace_id IS NOT NULL
  ORDER BY created_at ASC
  LIMIT 1;
$$;

-- RLS Policies for workspaces
CREATE POLICY "Users can view workspaces they belong to"
ON public.workspaces FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.workspace_id = workspaces.id
      AND user_roles.user_id = auth.uid()
  )
);

CREATE POLICY "Owners can update their workspaces"
ON public.workspaces FOR UPDATE
USING (owner_id = auth.uid());

CREATE POLICY "Users can insert workspaces"
ON public.workspaces FOR INSERT
WITH CHECK (owner_id = auth.uid());

-- RLS Policies for workspace_invites (public select for token validation)
CREATE POLICY "Anyone can view invites by token"
ON public.workspace_invites FOR SELECT
USING (true);

CREATE POLICY "Workspace admins can create invites"
ON public.workspace_invites FOR INSERT
WITH CHECK (
  public.has_workspace_access(auth.uid(), workspace_id, 'admin')
);

CREATE POLICY "Workspace admins can update invites"
ON public.workspace_invites FOR UPDATE
USING (
  public.has_workspace_access(auth.uid(), workspace_id, 'admin')
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_workspaces_owner ON public.workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_workspace ON public.user_roles(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_invites_token ON public.workspace_invites(token);
CREATE INDEX IF NOT EXISTS idx_workspace_invites_email ON public.workspace_invites(email);