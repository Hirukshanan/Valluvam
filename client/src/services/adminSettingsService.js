import { API_BASE } from './api';
import { getToken } from './authService';

/**
 * Build headers with the admin JWT for authenticated API requests.
 */
function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Fetch organization settings.
 *
 * @returns {Promise<Object>} The settings document
 */
export async function fetchSettings() {
  let response;
  try {
    response = await fetch(`${API_BASE}/settings`, {
      headers: authHeaders(),
    });
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
    throw new Error(json.message || 'Failed to fetch organization settings');
  }

  return json.data;
}

/**
 * Update organization settings (admin only).
 *
 * @param {Object} settingsData
 * @returns {Promise<Object>} The updated settings document
 */
export async function updateSettings(settingsData) {
  let response;
  try {
    response = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(settingsData),
    });
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
    const errorDetails = Array.isArray(json.errors) && json.errors.length > 0
      ? json.errors.join('. ')
      : json.message || 'Failed to update organization settings';
    throw new Error(errorDetails);
  }

  return json.data;
}
