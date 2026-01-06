const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'include',
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Auth
export const authApi = {
  getMe: () => request<{ id: string; email: string }>('/api/auth/me'),
  sync: () => request<void>('/api/auth/sync', { method: 'POST' }),
};

// Resume & Profile
export const resumeApi = {
  upload: (formData: FormData) =>
    fetch(`${API_BASE_URL}/api/resume/upload`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    }).then((r) => r.json()),
  getParsed: () => request<{ data: unknown }>('/api/resume/parsed'),
  verify: (data: unknown) => request<void>('/api/resume/verify', { method: 'PUT', body: data }),
};

export const profileApi = {
  list: () => request<{ success: boolean; data: unknown[] }>('/api/profiles'),
  get: (id: number) => request<{ success: boolean; data: unknown }>(`/api/profiles/${id}`),
  create: (data: unknown) => request<{ success: boolean; data: unknown }>('/api/profiles', { method: 'POST', body: data }),
  update: (id: number, data: unknown) =>
    request<{ success: boolean; data: unknown }>(`/api/profiles/${id}`, { method: 'PUT', body: data }),
  delete: (id: number) => request<void>(`/api/profiles/${id}`, { method: 'DELETE' }),
  export: (id: number) =>
    fetch(`${API_BASE_URL}/api/profiles/${id}/export`, {
      credentials: 'include',
    }),
};

// Jobs
export const jobsApi = {
  list: (params?: Record<string, unknown>) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.set(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return request<{ data: unknown[]; total: number }>(`/api/jobs${query ? `?${query}` : ''}`);
  },
  get: (id: number) => request<{ data: unknown }>(`/api/jobs/${id}`),
  updateStatus: (id: number, status: string) =>
    request<void>(`/api/jobs/${id}/status`, { method: 'PUT', body: { status } }),
  search: () => request<{ data: unknown }>('/api/jobs/search', { method: 'POST' }),
};

// OpenAI Key (Session Only)
export const openaiApi = {
  validate: (key: string) =>
    request<{ valid: boolean; message?: string }>('/api/openai/validate', { method: 'POST', body: { key } }),
  clear: () => request<void>('/api/openai/clear', { method: 'DELETE' }),
  status: () => request<{ active: boolean }>('/api/openai/status'),
};

// Metrics
export const metricsApi = {
  overview: () => request<{ data: unknown }>('/api/metrics/overview'),
  scoring: () => request<{ data: unknown }>('/api/metrics/scoring'),
  health: () => request<{ data: unknown }>('/api/metrics/health'),
};

// Settings
export const settingsApi = {
  get: () => request<{ data: unknown }>('/api/settings'),
  update: (data: unknown) => request<{ data: unknown }>('/api/settings', { method: 'PUT', body: data }),
  purge: () => request<void>('/api/settings/purge', { method: 'POST' }),
  export: (format: 'json' | 'csv') =>
    fetch(`${API_BASE_URL}/api/settings/export?format=${format}`, {
      credentials: 'include',
    }),
};
