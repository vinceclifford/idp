// src/services/auth-service.ts
import { apiClient } from './api-client';

export interface AuthResponse {
  message: string;
  user: {
    email: string;
    full_name: string;
  };
}

export const AuthService = {
  /**
   * Logs in a user.
   */
  async login(payload: any): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/login', payload);
  },

  /**
   * Registers a new user.
   */
  async register(payload: any): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/register', payload);
  },

  /**
   * Logs out the user (clears backend cookie).
   */
  async logout(): Promise<void> {
    return apiClient.post('/logout', {});
  },

  /**
   * Fetches the current user's profile from the /me endpoint.
   * This also serves as a session check.
   */
  async getCurrentUser(): Promise<any> {
    return apiClient.get('/me');
  }
};
