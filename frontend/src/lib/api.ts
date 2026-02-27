// API client pour communiquer avec le backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper to make requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('jwt_token'); // Get token from localStorage

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && !options.headers?.Authorization && { Authorization: `Bearer ${token}` }), // Add token if present and not already set
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Auth API
export const authApi = {
  getMe: () =>
    apiRequest<{ user: User; organizations: OrganizationWithStats[] }>('/auth/me'),

  login: (credentials: { email: string; password: string }) =>
    apiRequest<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (userData: { email: string; password: string; name: string }) =>
    apiRequest<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
};

// Organizations API
export const organizationsApi = {
  list: () => apiRequest<{ organizations: OrganizationWithStats[] }>('/organizations'),

  get: (id: string) => apiRequest<OrganizationWithStats>(`/organizations/${id}`),

  create: (data: { name: string; description?: string; logoUrl?: string }) =>
    apiRequest<Organization>('/organizations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Organization>) =>
    apiRequest<Organization>(`/organizations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<{ success: boolean }>(`/organizations/${id}`, {
      method: 'DELETE',
    }),

  getMembers: (id: string) =>
    apiRequest<{ members: MembershipWithUser[] }>(`/organizations/${id}/members`),

  inviteMember: (id: string, data: { email: string; role: OrganizationRole }) =>
    apiRequest<Membership>(`/organizations/${id}/members/invite`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateMember: (orgId: string, memberId: string, data: { role: OrganizationRole }) =>
    apiRequest<Membership>(`/organizations/${orgId}/members/${memberId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  removeMember: (orgId: string, memberId: string) =>
    apiRequest<{ success: boolean }>(`/organizations/${orgId}/members/${memberId}`, {
      method: 'DELETE',
    }),
};

// Projects API
export const projectsApi = {
  listByOrganization: (
    orgId: string,
    filters?: {
      referentMoeId?: string;
      status?: string;
      year?: number;
      page?: number;
      limit?: number;
    }
  ) => {
    const params = new URLSearchParams();
    if (filters?.referentMoeId) params.append('referentMoeId', filters.referentMoeId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.year) params.append('year', filters.year.toString());
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const query = params.toString();
    return apiRequest<{ projects: ProjectWithAccess[]; pagination: Pagination }>(
      `/projects/organization/${orgId}${query ? `?${query}` : ''}`
    );
  },

  get: (id: string) => apiRequest<ProjectWithAccess>(`/projects/${id}`),

  create: (orgId: string, data: CreateProjectPayload) =>
    apiRequest<Project>(`/projects/organization/${orgId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Project>) =>
    apiRequest<Project>(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<{ success: boolean }>(`/projects/${id}`, {
      method: 'DELETE',
    }),

  getAccess: (id: string) =>
    apiRequest<{ accesses: ProjectAccess[] }>(`/projects/${id}/access`),

  addAccess: (id: string, data: { userId: string; role: ProjectRole }) =>
    apiRequest<ProjectAccess>(`/projects/${id}/access`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  removeAccess: (projectId: string, accessId: string) =>
    apiRequest<{ success: boolean }>(`/projects/${projectId}/access/${accessId}`, {
      method: 'DELETE',
    }),

  getActivities: (id: string) =>
    apiRequest<{ activities: ProjectActivity[] }>(`/projects/${id}/activities`),
};

// Dashboard API
export const dashboardApi = {
  getOrganizationDashboard: (orgId: string) =>
    apiRequest<DashboardData>(`/dashboard/organization/${orgId}`),
};

// Exports API
export const exportsApi = {
  exportProjects: (orgId: string, filters?: any) => {
    const params = new URLSearchParams();
    if (filters?.referentMoeId) params.append('referentMoeId', filters.referentMoeId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.year) params.append('year', filters.year.toString());
    params.append('format', 'csv');

    const query = params.toString();
    return fetch(`${API_BASE_URL}/exports/organization/${orgId}/projects?${query}`).then(res => res.blob());
  },

  exportCompanies: (orgId: string) => {
    return fetch(`${API_BASE_URL}/exports/organization/${orgId}/companies`).then(res => res.blob());
  },

  exportSnags: (orgId: string) => {
    return fetch(`${API_BASE_URL}/exports/organization/${orgId}/snags`).then(res => res.blob());
  },
};
