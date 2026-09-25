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
 * Fetch all support options for the admin panel (includes inactive options).
 */
export async function fetchAdminSupport() {
  let response;
  try {
    response = await fetch(`${API_BASE}/support?all=true`, {
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
    throw new Error(json.message || 'Failed to fetch support options');
  }

  return json.data || [];
}

/**
 * Create a new support option (admin only).
 */
export async function createSupportOption(optionData) {
  let response;
  try {
    response = await fetch(`${API_BASE}/support`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(optionData),
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
    throw new Error(
      json.message || json.errors?.join(', ') || 'Failed to create support option'
    );
  }

  return json.data;
}

/**
 * Update an existing support option (admin only).
 */
export async function updateSupportOption(id, optionData) {
  let response;
  try {
    response = await fetch(`${API_BASE}/support/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(optionData),
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
    throw new Error(
      json.message || json.errors?.join(', ') || 'Failed to update support option'
    );
  }

  return json.data;
}

/**
 * Delete a support option (admin only).
 */
export async function deleteSupportOption(id) {
  let response;
  try {
    response = await fetch(`${API_BASE}/support/${id}`, {
      method: 'DELETE',
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
    throw new Error(json.message || 'Failed to delete support option');
  }

  return json;
}
