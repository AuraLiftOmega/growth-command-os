import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type WorkspaceRole = 'owner' | 'admin' | 'editor' | 'viewer';

// Map database roles to workspace roles
const DB_ROLE_MAP: Record<string, WorkspaceRole> = {
  admin: 'owner',
  moderator: 'admin', 
  user: 'editor',
};

export interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
}

export interface WorkspaceMember {
  id: string;
  user_id: string;
  workspace_id: string;
  role: WorkspaceRole;
  invited_by: string | null;
  invited_at: string | null;
  accepted_at: string | null;
  email?: string;
}

export interface WorkspaceInvite {
  id: string;
  workspace_id: string;
  email: string;
  role: string;
  token: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}

const ROLE_HIERARCHY: Record<WorkspaceRole, number> = {
  owner: 4,
  admin: 3,
  editor: 2,
  viewer: 1,
};

export function useWorkspace() {
  const { user } = useAuth();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [userRole, setUserRole] = useState<WorkspaceRole | null>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [invites, setInvites] = useState<WorkspaceInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWorkspaceData = useCallback(async () => {
    if (!user) {
      setWorkspace(null);
      setUserRole(null);
      setMembers([]);
      setInvites([]);
      setIsLoading(false);
      return;
    }

    try {
      // Get user's workspace from user_roles
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('workspace_id, role')
        .eq('user_id', user.id)
        .not('workspace_id', 'is', null)
        .single();

      if (!roleData?.workspace_id) {
        // No workspace yet - create one
        await createDefaultWorkspace();
        return;
      }

      // Map DB role to workspace role
      const mappedRole = DB_ROLE_MAP[roleData.role] || 'viewer';
      setUserRole(mappedRole);

      // Get workspace details
      const { data: workspaceData } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', roleData.workspace_id)
        .single();

      if (workspaceData) {
        setWorkspace(workspaceData as Workspace);
      }

      // Get all members
      const { data: membersData } = await supabase
        .from('user_roles')
        .select('*')
        .eq('workspace_id', roleData.workspace_id);

      if (membersData) {
        // Fetch profile emails for members
        const memberIds = membersData.map(m => m.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, email')
          .in('user_id', memberIds);

        const emailMap = new Map(profiles?.map(p => [p.user_id, p.email]) || []);
        
        setMembers(membersData.map(m => ({
          ...m,
          role: m.role as WorkspaceRole,
          email: emailMap.get(m.user_id) || 'Unknown',
        })) as WorkspaceMember[]);
      }

      // Get pending invites (only for admin+)
      if (ROLE_HIERARCHY[roleData.role as WorkspaceRole] >= ROLE_HIERARCHY.admin) {
        const { data: invitesData } = await supabase
          .from('workspace_invites')
          .select('*')
          .eq('workspace_id', roleData.workspace_id)
          .eq('used', false)
          .gt('expires_at', new Date().toISOString());

        if (invitesData) {
          setInvites(invitesData as WorkspaceInvite[]);
        }
      }
    } catch (error) {
      console.error('Error fetching workspace:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const createDefaultWorkspace = useCallback(async () => {
    if (!user) return;

    try {
      // Create workspace
      const { data: newWorkspace, error: wsError } = await supabase
        .from('workspaces')
        .insert({ name: 'My Workspace', owner_id: user.id })
        .select()
        .single();

      if (wsError) throw wsError;

      // Update user_roles with workspace_id
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ 
          workspace_id: newWorkspace.id,
          accepted_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (roleError) {
        // If no existing role, create one with admin role (maps to owner)
        await supabase.from('user_roles').insert({
          user_id: user.id,
          workspace_id: newWorkspace.id,
          role: 'admin' as const,
          accepted_at: new Date().toISOString(),
        } as any);
      }

      setWorkspace(newWorkspace as Workspace);
      setUserRole('owner');
      setMembers([{
        id: 'self',
        user_id: user.id,
        workspace_id: newWorkspace.id,
        role: 'owner',
        invited_by: null,
        invited_at: null,
        accepted_at: new Date().toISOString(),
        email: user.email,
      }]);
    } catch (error) {
      console.error('Error creating workspace:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchWorkspaceData();
  }, [fetchWorkspaceData]);

  // Permission checks
  const canInvite = userRole ? ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY.admin : false;
  const canEdit = userRole ? ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY.editor : false;
  const canManageUsers = userRole ? ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY.admin : false;
  const isOwner = userRole === 'owner';

  const hasMinRole = useCallback((minRole: WorkspaceRole) => {
    if (!userRole) return false;
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minRole];
  }, [userRole]);

  const inviteUser = useCallback(async (email: string, role: WorkspaceRole) => {
    if (!workspace || !user || !canInvite) return { success: false, error: 'No permission' };

    // Generate random token
    const token = crypto.randomUUID().replace(/-/g, '');

    try {
      const { error } = await supabase.from('workspace_invites').insert({
        workspace_id: workspace.id,
        email,
        role,
        token,
        invited_by: user.id,
      });

      if (error) throw error;

      // Send invite email via edge function
      await supabase.functions.invoke('send-workspace-invite', {
        body: { email, token, role, workspaceName: workspace.name },
      });

      await fetchWorkspaceData();
      return { success: true, token };
    } catch (error) {
      console.error('Error inviting user:', error);
      return { success: false, error: (error as Error).message };
    }
  }, [workspace, user, canInvite, fetchWorkspaceData]);

  const updateMemberRole = useCallback(async (memberId: string, newRole: WorkspaceRole) => {
    if (!canManageUsers) return { success: false, error: 'No permission' };

    // Map workspace role back to DB role
    const dbRoleMap: Record<WorkspaceRole, string> = {
      owner: 'admin',
      admin: 'moderator',
      editor: 'user',
      viewer: 'user',
    };

    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: dbRoleMap[newRole] } as any)
        .eq('id', memberId);

      if (error) throw error;
      await fetchWorkspaceData();
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }, [canManageUsers, fetchWorkspaceData]);

  const removeMember = useCallback(async (memberId: string) => {
    if (!canManageUsers) return { success: false, error: 'No permission' };

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      await fetchWorkspaceData();
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }, [canManageUsers, fetchWorkspaceData]);

  const cancelInvite = useCallback(async (inviteId: string) => {
    if (!canInvite) return { success: false, error: 'No permission' };

    try {
      const { error } = await supabase
        .from('workspace_invites')
        .delete()
        .eq('id', inviteId);

      if (error) throw error;
      await fetchWorkspaceData();
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }, [canInvite, fetchWorkspaceData]);

  return {
    workspace,
    userRole,
    members,
    invites,
    isLoading,
    canInvite,
    canEdit,
    canManageUsers,
    isOwner,
    hasMinRole,
    inviteUser,
    updateMemberRole,
    removeMember,
    cancelInvite,
    refetch: fetchWorkspaceData,
  };
}
