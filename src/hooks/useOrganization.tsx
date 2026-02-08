import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type OrgRole = 'owner' | 'admin' | 'operator' | 'client';

export interface Organization {
  id: string;
  name: string;
  slug: string | null;
  logo_url: string | null;
  plan: string;
  owner_id: string;
  settings: Record<string, any>;
  created_at: string;
}

export interface OrgMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrgRole;
  accepted_at: string | null;
  email?: string;
}

interface OrganizationContextType {
  organizations: Organization[];
  currentOrg: Organization | null;
  currentRole: OrgRole | null;
  members: OrgMember[];
  isLoading: boolean;
  switchOrg: (orgId: string) => void;
  createOrg: (name: string) => Promise<Organization | null>;
  refetch: () => Promise<void>;
  canManage: boolean;
  canOperate: boolean;
  isOwner: boolean;
}

const OrganizationContext = createContext<OrganizationContextType>({
  organizations: [],
  currentOrg: null,
  currentRole: null,
  members: [],
  isLoading: true,
  switchOrg: () => {},
  createOrg: async () => null,
  refetch: async () => {},
  canManage: false,
  canOperate: false,
  isOwner: false,
});

export const useOrganization = () => useContext(OrganizationContext);

const ROLE_LEVEL: Record<OrgRole, number> = { owner: 4, admin: 3, operator: 2, client: 1 };
const ORG_STORAGE_KEY = 'master_os_current_org';

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [currentRole, setCurrentRole] = useState<OrgRole | null>(null);
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrgs = useCallback(async () => {
    if (!user) {
      setOrganizations([]);
      setCurrentOrg(null);
      setCurrentRole(null);
      setMembers([]);
      setIsLoading(false);
      return;
    }

    try {
      // Get all orgs user belongs to via membership
      const { data: membershipData } = await supabase
        .from('organization_members')
        .select('organization_id, role')
        .eq('user_id', user.id);

      if (!membershipData?.length) {
        setIsLoading(false);
        return;
      }

      const orgIds = membershipData.map(m => m.organization_id);
      const roleMap = new Map(membershipData.map(m => [m.organization_id, m.role as OrgRole]));

      const { data: orgsData } = await supabase
        .from('organizations')
        .select('*')
        .in('id', orgIds);

      if (orgsData) {
        setOrganizations(orgsData as Organization[]);

        // Restore last selected org or pick first
        const savedOrgId = localStorage.getItem(ORG_STORAGE_KEY);
        const savedOrg = orgsData.find(o => o.id === savedOrgId);
        const activeOrg = savedOrg || orgsData[0];

        if (activeOrg) {
          setCurrentOrg(activeOrg as Organization);
          setCurrentRole(roleMap.get(activeOrg.id) || 'client');
          await fetchMembers(activeOrg.id);
        }
      }
    } catch (err) {
      console.error('Error fetching organizations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const fetchMembers = async (orgId: string) => {
    const { data } = await supabase
      .from('organization_members')
      .select('*')
      .eq('organization_id', orgId);

    if (data) {
      // Enrich with emails from profiles
      const userIds = data.map(m => m.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, email')
        .in('user_id', userIds);

      const emailMap = new Map(profiles?.map(p => [p.user_id, p.email]) || []);
      setMembers(data.map(m => ({ ...m, role: m.role as OrgRole, email: emailMap.get(m.user_id) || '' })));
    }
  };

  const switchOrg = useCallback((orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    if (org) {
      setCurrentOrg(org);
      localStorage.setItem(ORG_STORAGE_KEY, orgId);
      // Re-fetch role for this org
      supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', orgId)
        .eq('user_id', user?.id || '')
        .single()
        .then(({ data }) => {
          if (data) setCurrentRole(data.role as OrgRole);
        });
      fetchMembers(orgId);
    }
  }, [organizations, user]);

  const createOrg = useCallback(async (name: string) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('organizations')
      .insert({ name, owner_id: user.id, slug: crypto.randomUUID().slice(0, 8) })
      .select()
      .single();

    if (error || !data) return null;

    // Add self as owner
    await supabase.from('organization_members').insert({
      organization_id: data.id,
      user_id: user.id,
      role: 'owner',
      accepted_at: new Date().toISOString(),
    });

    await fetchOrgs();
    return data as Organization;
  }, [user, fetchOrgs]);

  useEffect(() => { fetchOrgs(); }, [fetchOrgs]);

  const canManage = currentRole ? ROLE_LEVEL[currentRole] >= ROLE_LEVEL.admin : false;
  const canOperate = currentRole ? ROLE_LEVEL[currentRole] >= ROLE_LEVEL.operator : false;
  const isOwner = currentRole === 'owner';

  return (
    <OrganizationContext.Provider value={{
      organizations, currentOrg, currentRole, members, isLoading,
      switchOrg, createOrg, refetch: fetchOrgs,
      canManage, canOperate, isOwner,
    }}>
      {children}
    </OrganizationContext.Provider>
  );
}
