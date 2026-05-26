// src/services/team-service.ts
import { Team } from '../types/models';
import { apiClient } from './api-client';

export const TeamService = {
  async getAll(seasonId?: string): Promise<Team[]> {
    const queryString = seasonId ? `?season_id=${seasonId}` : '';
    return apiClient.get<Team[]>(`/teams${queryString}`);
  },
  async create(team: { name: string; formation?: string; season_id?: string }): Promise<Team> {
    return apiClient.post<Team>('/teams', team);
  },
  async update(id: string, team: Team): Promise<Team> {
    return apiClient.put<Team>(`/teams/${id}`, team);
  },
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/teams/${id}`);
  },
  async clone(id: string, targetSeasonId: string): Promise<Team> {
    return apiClient.post<Team>(`/teams/${id}/clone?target_season_id=${targetSeasonId}`, {});
  }
};
