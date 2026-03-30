// src/services/api-client.ts
import { API_BASE_URL, JSON_HEADERS } from '../lib/api-config';

/**
 * Generic API client for the application.
 * Uses 'credentials: include' to support HttpOnly cookies.
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    ...JSON_HEADERS,
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', 
  });

  if (response.status === 401) {
    const wasAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (wasAuthenticated) {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');
      window.location.reload(); 
      throw new Error('Session expired. Please log in again.');
    }
    // If we're not authenticated yet (e.g., in the middle of login),
    // just let the error bubble up to the login page without reloading.
  }
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Request failed: ${response.statusText}`);
  }

  return response.json();
}

export const apiClient = {
  get<T>(endpoint: string): Promise<T> {
    return request<T>(endpoint);
  },

  post<T>(endpoint: string, body: any): Promise<T> {
    return request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  put<T>(endpoint: string, body: any): Promise<T> {
    return request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  delete(endpoint: string): Promise<void> {
    return request<void>(endpoint, {
      method: 'DELETE',
    });
  }
};

