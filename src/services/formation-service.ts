import { apiClient } from './api-client';
import { CustomFormation, PositionSlot } from '../types/models';

export const FormationService = {
  getAll: async (): Promise<CustomFormation[]> => {
    return apiClient.get<CustomFormation[]>('/custom_formations');
  },

  create: async (name: string, positions: PositionSlot[]): Promise<CustomFormation> => {
    return apiClient.post<CustomFormation>('/custom_formations', {
      name,
      positions: JSON.stringify(positions)
    });
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/custom_formations/${id}`);
  }
};
