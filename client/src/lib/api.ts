// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const apiConfig = {
  baseURL: API_BASE_URL,
  endpoints: {
    auth: {
      login: '/api/mongo/auth/login',
      register: '/api/mongo/auth/register',
      completeSetup: '/api/mongo/auth/complete-setup',
      logout: '/api/mongo/auth/logout',
      verify: '/api/mongo/auth/verify',
    },
    users: {
      profile: '/api/mongo/users/profile',
      update: '/api/mongo/users/update',
      all: '/api/users',
      byId: (id: string) => `/api/users/${id}`,
      stats: (id: string) => `/api/users/${id}/stats`,
      activities: (id: string) => `/api/users/${id}/activities`,
    },
    courses: {
      all: '/api/courses',
      byId: (id: string) => `/api/courses/${id}`,
      byCategory: (category: string) => `/api/courses?category=${category}`,
      enroll: (id: string) => `/api/courses/${id}/enroll`,
      progress: (id: string) => `/api/courses/${id}/progress`,
    },
    admin: {
      stats: '/api/admin/stats',
      users: '/api/admin/users',
      courses: '/api/admin/courses',
    },
    health: '/health',
  },
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${apiConfig.baseURL}${endpoint}`;
};

// Helper function for API requests
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const url = buildApiUrl(endpoint);
  
  const defaultOptions: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, {
    ...defaultOptions,
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${response.status}: ${errorText}`);
  }

  return response;
};

// Helper function for JSON API requests
export const apiJsonRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await apiRequest(endpoint, options);
  return response.json();
}; 