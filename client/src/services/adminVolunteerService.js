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
 * Fetch all volunteer submissions (admin view).
 * @param {string} [statusFilter] - Optional status filter ('new', 'reviewed', 'contacted', 'archived')
 */
export async function fetchAdminVolunteers(statusFilter) {
  const url = statusFilter
    ? `${API_BASE}/volunteers?status=${encodeURIComponent(statusFilter)}`
    : `${API_BASE}/volunteers`;

  let response;
  try {
    response = await fetch(url, {
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
    throw new Error(json.message || 'Failed to fetch volunteer submissions');
  }

  return json.data;
}

/**
 * Fetch a single volunteer submission by ID.
 * @param {string} id - Volunteer document ID
 */
export async function fetchAdminVolunteerById(id) {
  let response;
  try {
    response = await fetch(`${API_BASE}/volunteers/${id}`, {
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
    throw new Error(json.message || 'Failed to fetch volunteer submission');
  }

  return json.data;
}

/**
 * Update the status of a volunteer submission.
 * @param {string} id - Volunteer document ID
 * @param {string} status - New status ('new' | 'reviewed' | 'contacted' | 'archived')
 */
export async function updateVolunteerStatus(id, status) {
  let response;
  try {
    response = await fetch(`${API_BASE}/volunteers/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ status }),
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
      json.message || json.errors?.join(', ') || 'Failed to update volunteer status'
    );
  }

  return json.data;
}

/**
 * Delete a volunteer submission.
 * @param {string} id - Volunteer document ID
 */
export async function deleteVolunteerSubmission(id) {
  let response;
  try {
    response = await fetch(`${API_BASE}/volunteers/${id}`, {
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
    throw new Error(json.message || 'Failed to delete volunteer submission');
  }

  return json;
}
