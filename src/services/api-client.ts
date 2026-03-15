// src/services/api-client.ts
import { API_BASE_URL, JSON_HEADERS } from '../lib/api-config';

/**
 * Generic API client for the application.
 */
export const apiClient = {
  /**
   * Performs a GET request.
   */
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) throw new Error(`GET ${endpoint} failed: ${response.statusText}`);
    return response.json();
  },

  /**
   * Performs a POST request.
   */
  async post<T>(endpoint: string, body: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`POST ${endpoint} failed: ${response.statusText}`);
    return response.json();
  },

  /**
   * Performs a PUT request.
   */
  async put<T>(endpoint: string, body: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: JSON_HEADERS,
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`PUT ${endpoint} failed: ${response.statusText}`);
    return response.json();
  },

  /**
   * Performs a DELETE request.
   */
  async delete(endpoint: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`DELETE ${endpoint} failed: ${response.statusText}`);
  }
};
