// src/services/match-service.ts
import { Match, MatchDetails } from '../types/models';
import { mapMatchFromApi, mapMatchToApi, mapMatchDetailsFromApi, mapMatchDetailsToApi } from '../lib/data-mappers';
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
  async getAll(): Promise<MatchDetails[]> {
    const data = await apiClient.get<any[]>('/matches');
    return data.map(mapMatchDetailsFromApi);
  },

  /**
   * Fetches the latest (or upcoming) match.
   */
  async getLatest(): Promise<Match | null> {
    try {
      const data = await apiClient.get<any>('/matches/latest');
      return data ? mapMatchFromApi(data) : null;
    } catch (e) {
      console.warn('Failed to fetch latest match', e);
      return null;
    }
  },

  /**
   * Creates a new match.
   */
  async create(match: MatchDetails): Promise<MatchDetails> {
    const payload = mapMatchDetailsToApi(match);
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
  async getSuggestedFormation(): Promise<SuggestedFormation> {
    return apiClient.get<SuggestedFormation>('/match/suggested-formation');
  }
};
