// src/services/player-service.ts
import { Player } from '../types/models';
import { mapPlayerFromApi, mapPlayerToApi } from '../lib/data-mappers';
import { apiClient } from './api-client';

/**
 * Service for interacting with the /players API endpoint.
 */
export const PlayerService = {
  /**
   * Fetches all players.
   */
  async getAll(): Promise<Player[]> {
    const data = await apiClient.get<any[]>('/players');
    return data.map(mapPlayerFromApi);
  },

  /**
   * Creates a new player.
   */
  async create(player: Omit<Player, 'id'>): Promise<Player> {
    const payload = mapPlayerToApi(player as Player);
    const data = await apiClient.post<any>('/players', payload);
    return mapPlayerFromApi(data);
  },

  /**
   * Updates an existing player by ID.
   */
  async update(id: string, player: Player): Promise<Player> {
    const payload = mapPlayerToApi(player);
    const data = await apiClient.put<any>(`/players/${id}`, payload);
    return mapPlayerFromApi(data);
  },

  /**
   * Deletes a player by ID.
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/players/${id}`);
  }
};
