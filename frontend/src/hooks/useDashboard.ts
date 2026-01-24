import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api';

export function useDashboard(orgId: string | null) {
  return useQuery({
    queryKey: ['dashboard', orgId],
    queryFn: async () => {
      if (!orgId) return null;
      return await dashboardApi.getOrganizationDashboard(orgId);
    },
    enabled: !!orgId,
  });
}
