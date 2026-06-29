// src/services/event-service.ts
import { CalendarEvent } from '../types/models';
import { mapEventFromApi, mapEventToApi } from '../lib/data-mappers';
import { apiClient } from './api-client';

/**
 * Service for interacting with the /events API endpoint (generic team
 * calendar events — meetings, team-building, etc.). Training sessions and
 * matches keep their own services; the calendar layers all three together.
 */
export const EventService = {
  async getAll(teamId?: string, seasonId?: string): Promise<CalendarEvent[]> {
    const params = new URLSearchParams();
    if (teamId) params.append('team_id', teamId);
    if (seasonId) params.append('season_id', seasonId);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const data = await apiClient.get<any[]>(`/events${queryString}`);
    return data.map(mapEventFromApi);
  },

  async create(event: Omit<CalendarEvent, 'id'>, teamId?: string, seasonId?: string): Promise<CalendarEvent> {
    const payload = mapEventToApi(event as CalendarEvent) as any;
    if (teamId) payload.team_id = teamId;
    if (seasonId) payload.season_id = seasonId;
    const data = await apiClient.post<any>('/events', payload);
    return mapEventFromApi(data);
  },

  async update(id: string, event: CalendarEvent): Promise<CalendarEvent> {
    const data = await apiClient.put<any>(`/events/${id}`, mapEventToApi(event));
    return mapEventFromApi(data);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/events/${id}`);
  },
};
