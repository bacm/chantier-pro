import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationsApi } from '@/lib/api';
import { toast } from 'sonner';
import { Organization, OrganizationWithStats } from '@/types';

export function useOrganizations() {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const response = await organizationsApi.list();
      return response.organizations as OrganizationWithStats[];
    },
  });
}

export function useOrganization(id: string | null) {
  return useQuery({
    queryKey: ['organizations', id],
    queryFn: async () => {
      if (!id) return null;
      return await organizationsApi.get(id) as OrganizationWithStats;
    },
    enabled: !!id,
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { name: string; description?: string; logoUrl?: string }) => {
      return await organizationsApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Organisation créée');
    },
    onError: (error: Error) => {
      toast.error('Erreur', { description: error.message });
    },
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Organization> }) => {
      return await organizationsApi.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['organizations', variables.id] });
      toast.success('Organisation mise à jour');
    },
    onError: (error: Error) => {
      toast.error('Erreur', { description: error.message });
    },
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return await organizationsApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Organisation supprimée');
    },
    onError: (error: Error) => {
      toast.error('Erreur', { description: error.message });
    },
  });
}

export function useOrganizationMembers(orgId: string | null) {
  return useQuery({
    queryKey: ['organizations', orgId, 'members'],
    queryFn: async () => {
      if (!orgId) return null;
      const response = await organizationsApi.getMembers(orgId);
      return response.members;
    },
    enabled: !!orgId,
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orgId, email, role }: { orgId: string; email: string; role: string }) => {
      return await organizationsApi.inviteMember(orgId, { email, role });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organizations', variables.orgId, 'members'] });
      toast.success('Invitation envoyée');
    },
    onError: (error: Error) => {
      toast.error('Erreur', { description: error.message });
    },
  });
}

export function useUpdateMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orgId, memberId, role }: { orgId: string; memberId: string; role: string }) => {
      return await organizationsApi.updateMember(orgId, memberId, { role });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organizations', variables.orgId, 'members'] });
      toast.success('Rôle mis à jour');
    },
    onError: (error: Error) => {
      toast.error('Erreur', { description: error.message });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orgId, memberId }: { orgId: string; memberId: string }) => {
      return await organizationsApi.removeMember(orgId, memberId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organizations', variables.orgId, 'members'] });
      toast.success('Membre retiré');
    },
    onError: (error: Error) => {
      toast.error('Erreur', { description: error.message });
    },
  });
}
