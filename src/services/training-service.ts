// src/services/training-service.ts
import { TrainingSession } from '../types/models';
import { mapSessionFromApi, mapSessionToApi } from '../lib/data-mappers';
import { apiClient } from './api-client';

/**
 * Service for interacting with training session API endpoints.
 */
export const TrainingService = {
  /**
   * Fetches all training sessions.
   */
  async getAll(teamId?: string, seasonId?: string): Promise<TrainingSession[]> {
    const params = new URLSearchParams();
    if (teamId) params.append('team_id', teamId);
    if (seasonId) params.append('season_id', seasonId);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const data = await apiClient.get<any[]>(`/training_sessions${queryString}`);
    return data.map(mapSessionFromApi);
  },

  /**
   * Creates a new training session.
   */
  async create(session: Omit<TrainingSession, 'id'>, teamId?: string, seasonId?: string): Promise<TrainingSession> {
    const payload = mapSessionToApi(session as TrainingSession) as any;
    if (teamId) payload.team_id = teamId;
    if (seasonId) payload.season_id = seasonId;
    const data = await apiClient.post<any>('/training_sessions', payload);
    return mapSessionFromApi(data);
  },

  /**
   * Updates an existing training session.
   */
  async update(id: string, session: TrainingSession): Promise<TrainingSession> {
    const payload = mapSessionToApi(session);
    const data = await apiClient.put<any>(`/training_sessions/${id}`, payload);
    return mapSessionFromApi(data);
  },

  /**
   * Deletes a training session.
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/training_sessions/${id}`);
  }
};
