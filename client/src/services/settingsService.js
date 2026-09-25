import { API_BASE } from './api';

/**
 * Fetch public organization settings.
 *
 * @returns {Promise<Object>} The settings object
 */
export async function getPublicSettings() {
  let response;
  try {
    response = await fetch(`${API_BASE}/settings`);
  } catch (networkErr) {
    throw new Error(
      `Cannot connect to backend API at ${API_BASE}. Using default fallback settings.`
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
    throw new Error(json.message || 'Failed to fetch settings');
  }

  return json.data;
}
