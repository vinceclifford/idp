// src/lib/api-config.ts

/**
 * The base URL for the backend API. 
 * Reads from environment variables if deployed, falls back to localhost for dev.
 */
const getApiBaseUrl = () => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  return url.replace(/\/$/, ''); // Remove trailing slash
};

export const API_BASE_URL = getApiBaseUrl();

export const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};
