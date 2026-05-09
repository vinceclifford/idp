// src/services/match-service.ts
import { Match, MatchDetails } from '../types/models';
import { mapMatchFromApi, mapMatchDetailsFromApi, mapMatchDetailsToApi } from '../lib/data-mappers';
import { apiClient } from './api-client';

export interface SuggestedFormation {
  formation: string;
  source: string;
}

/**
 * Service for interacting with match-related API endpoints.
 */
export const MatchService = {
  /**
   * Fetches all matches.
   */
  async getAll(teamId?: string, seasonId?: string): Promise<MatchDetails[]> {
    const params = new URLSearchParams();
    if (teamId) params.append('team_id', teamId);
    if (seasonId) params.append('season_id', seasonId);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const data = await apiClient.get<any[]>(`/matches${queryString}`);
    return data.map(mapMatchDetailsFromApi);
  },

  /**
   * Fetches the latest (or upcoming) match.
   */
  async getLatest(teamId?: string, seasonId?: string): Promise<Match | null> {
    try {
      const params = new URLSearchParams();
      if (teamId) params.append('team_id', teamId);
      if (seasonId) params.append('season_id', seasonId);
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const data = await apiClient.get<any>(`/matches/latest${queryString}`);
      return data ? mapMatchFromApi(data) : null;
    } catch (e) {
      console.warn('Failed to fetch latest match', e);
      return null;
    }
  },

  /**
   * Creates a new match.
   */
  async create(match: MatchDetails, teamId?: string, seasonId?: string): Promise<MatchDetails> {
    const payload = mapMatchDetailsToApi(match) as any;
    if (teamId) payload.team_id = teamId;
    if (seasonId) payload.season_id = seasonId;
    const data = await apiClient.post<any>('/matches', payload);
    return mapMatchDetailsFromApi(data);
  },

  /**
   * Updates an existing match by ID.
   */
  async update(id: string, match: MatchDetails): Promise<MatchDetails> {
    const payload = mapMatchDetailsToApi(match);
    const data = await apiClient.put<any>(`/matches/${id}`, payload);
    return mapMatchDetailsFromApi(data);
  },

  /**
   * Fetches a suggested formation based on recent training data.
   */
  async getSuggestedFormation(teamId?: string): Promise<SuggestedFormation> {
    const params = teamId ? `?team_id=${teamId}` : '';
    return apiClient.get<SuggestedFormation>(`/match/suggested-formation${params}`);
  }
};
