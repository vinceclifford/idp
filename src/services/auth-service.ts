// src/services/auth-service.ts
import { apiClient } from './api-client';

export interface AuthResponse {
  email: string;
  full_name?: string;
  detail?: string;
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
  }
};
