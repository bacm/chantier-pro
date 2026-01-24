import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/lib/api';
import { toast } from 'sonner';
import { Project } from '@/types';

export function useProjects(orgId: string | null, filters?: {
  referentMoeId?: string;
  status?: string;
  year?: number;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['projects', orgId, filters],
    queryFn: async () => {
      if (!orgId) return { projects: [], pagination: { page: 1, limit: 20, total: 0 } };
      return await projectsApi.listByOrganization(orgId, filters);
    },
    enabled: !!orgId,
  });
}

export function useProject(id: string | null) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: async () => {
      if (!id) return null;
      return await projectsApi.get(id) as Project;
    },
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orgId, data }: { orgId: string; data: Partial<Project> }) => {
      return await projectsApi.create(orgId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects', variables.orgId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', variables.orgId] });
      toast.success('Projet créé');
    },
    onError: (error: Error) => {
      toast.error('Erreur', { description: error.message });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Project> }) => {
      return await projectsApi.update(id, data);
    },
    onSuccess: (project, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', project.organizationId] });
      toast.success('Projet mis à jour');
    },
    onError: (error: Error) => {
      toast.error('Erreur', { description: error.message });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return await projectsApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Projet supprimé');
    },
    onError: (error: Error) => {
      toast.error('Erreur', { description: error.message });
    },
  });
}

export function useProjectActivities(projectId: string | null) {
  return useQuery({
    queryKey: ['projects', projectId, 'activities'],
    queryFn: async () => {
      if (!projectId) return null;
      const response = await projectsApi.getActivities(projectId);
      return response.activities;
    },
    enabled: !!projectId,
  });
}
