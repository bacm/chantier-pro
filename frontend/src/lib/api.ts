// API client pour communiquer avec le backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper to get auth token
function getAuthToken(): string | null {
  // Get token from cookie (set by Auth0)
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'auth_token') {
      return decodeURIComponent(value);
    }
  }
  return null;
}

// Helper to make authenticated requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
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
  getMe: () => apiRequest<{ user: any; organizations: any[] }>('/auth/me'),
};

// Organizations API
export const organizationsApi = {
  list: () => apiRequest<{ organizations: any[] }>('/organizations'),
  
  get: (id: string) => apiRequest<any>(`/organizations/${id}`),
  
  create: (data: { name: string; description?: string; logoUrl?: string }) =>
    apiRequest<any>('/organizations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: Partial<any>) =>
    apiRequest<any>(`/organizations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    apiRequest<{ success: boolean }>(`/organizations/${id}`, {
      method: 'DELETE',
    }),
  
  getMembers: (id: string) =>
    apiRequest<{ members: any[] }>(`/organizations/${id}/members`),
  
  inviteMember: (id: string, data: { email: string; role: string }) =>
    apiRequest<any>(`/organizations/${id}/members/invite`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateMember: (orgId: string, memberId: string, data: { role: string }) =>
    apiRequest<any>(`/organizations/${orgId}/members/${memberId}`, {
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
    return apiRequest<{ projects: any[]; pagination: any }>(
      `/projects/organization/${orgId}${query ? `?${query}` : ''}`
    );
  },
  
  get: (id: string) => apiRequest<any>(`/projects/${id}`),
  
  create: (orgId: string, data: any) =>
    apiRequest<any>(`/projects/organization/${orgId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: Partial<any>) =>
    apiRequest<any>(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    apiRequest<{ success: boolean }>(`/projects/${id}`, {
      method: 'DELETE',
    }),
  
  getAccess: (id: string) =>
    apiRequest<{ accesses: any[] }>(`/projects/${id}/access`),
  
  addAccess: (id: string, data: { userId: string; role: string }) =>
    apiRequest<any>(`/projects/${id}/access`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  removeAccess: (projectId: string, accessId: string) =>
    apiRequest<{ success: boolean }>(`/projects/${projectId}/access/${accessId}`, {
      method: 'DELETE',
    }),
  
  getActivities: (id: string) =>
    apiRequest<{ activities: any[] }>(`/projects/${id}/activities`),
};

// Dashboard API
export const dashboardApi = {
  getOrganizationDashboard: (orgId: string) =>
    apiRequest<any>(`/dashboard/organization/${orgId}`),
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
    return fetch(`${API_BASE_URL}/exports/organization/${orgId}/projects?${query}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    }).then(res => res.blob());
  },
  
  exportCompanies: (orgId: string) => {
    return fetch(`${API_BASE_URL}/exports/organization/${orgId}/companies`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    }).then(res => res.blob());
  },
  
  exportSnags: (orgId: string) => {
    return fetch(`${API_BASE_URL}/exports/organization/${orgId}/snags`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    }).then(res => res.blob());
  },
};
