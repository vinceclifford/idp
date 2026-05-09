import { apiClient } from './api-client';

export const SeasonService = {
  getAll: async (): Promise<{id: string; name: string}[]> => {
    return apiClient.get<any[]>('/seasons');
  },
  
  create: async (data: { name: string }): Promise<{id: string; name: string}> => {
    return apiClient.post<any>('/seasons', data);
  },

  delete: async (id: string) => {
    return apiClient.delete(`/seasons/${id}`);
  }
};
