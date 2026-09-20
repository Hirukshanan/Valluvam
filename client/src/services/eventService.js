import { API_BASE } from './api';

/**
 * Fetch all events from the backend.
 *
 * The API responds with: { success: boolean, count: number, data: Event[] }
 * This function returns the `data` array on success and throws on failure.
 */
export async function fetchEvents() {
  const response = await fetch(`${API_BASE}/events`);

  if (!response.ok) {
    throw new Error(`Failed to fetch events (HTTP ${response.status})`);
  }

  const json = await response.json();

  if (!json.success) {
    throw new Error(json.message || 'Failed to fetch events');
  }

  return json.data;
}

