import { API_BASE } from './api';

/**
 * Fetch active support options for the public website.
 *
 * @returns {Promise<Array>} List of active support options sorted by displayOrder
 */
export async function fetchSupportOptions() {
  let response;
  try {
    response = await fetch(`${API_BASE}/support`);
  } catch (networkErr) {
    throw new Error(
      `Cannot connect to backend API at ${API_BASE}. Please ensure the server is running.`
    );
  }

  let json;
  try {
    json = await response.json();
  } catch (parseErr) {
    throw new Error(
      `Server returned status ${response.status} (${response.statusText || 'Unknown response'})`
    );
  }

  if (!response.ok || !json.success) {
    throw new Error(json.message || 'Failed to fetch support options');
  }

  return json.data || [];
}
