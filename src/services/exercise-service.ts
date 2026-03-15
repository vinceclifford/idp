// src/services/exercise-service.ts
import { Exercise } from '../types/models';
import { mapExerciseFromApi, mapExerciseToApi } from '../lib/data-mappers';
import { apiClient } from './api-client';

/**
 * Service for interacting with exercise-related API endpoints.
 */
export const ExerciseService = {
  /**
   * Fetches all exercises.
   */
  async getAll(): Promise<Exercise[]> {
    const data = await apiClient.get<any[]>('/exercises');
    return data.map(mapExerciseFromApi);
  },

  /**
   * Creates a new exercise.
   */
  async create(exercise: Exercise): Promise<Exercise> {
    const payload = mapExerciseToApi(exercise);
    const data = await apiClient.post<any>('/exercises', payload);
    return mapExerciseFromApi(data);
  },

  /**
   * Updates an existing exercise by ID.
   */
  async update(id: string, exercise: Exercise): Promise<Exercise> {
    const payload = mapExerciseToApi(exercise);
    const data = await apiClient.put<any>(`/exercises/${id}`, payload);
    return mapExerciseFromApi(data);
  },

  /**
   * Deletes an exercise by ID.
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/exercises/${id}`);
  }
};
