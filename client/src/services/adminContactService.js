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
 * Fetch all contact messages (admin view).
 * @param {string} [statusFilter] - Optional status filter ('new', 'read', 'replied', 'archived')
 */
export async function fetchAdminContacts(statusFilter) {
  const url =
    statusFilter && statusFilter !== 'all'
      ? `${API_BASE}/contact?status=${encodeURIComponent(statusFilter)}`
      : `${API_BASE}/contact`;

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
    throw new Error(json.message || 'Failed to fetch contact messages');
  }

  return json.data;
}

/**
 * Fetch a single contact message by ID.
 * @param {string} id - Contact document ID
 */
export async function fetchAdminContactById(id) {
  let response;
  try {
    response = await fetch(`${API_BASE}/contact/${id}`, {
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
    throw new Error(json.message || 'Failed to fetch contact message');
  }

  return json.data;
}

/**
 * Update the status of a contact message.
 * @param {string} id - Contact document ID
 * @param {string} status - New status ('new' | 'read' | 'replied' | 'archived')
 */
export async function updateContactStatus(id, status) {
  let response;
  try {
    response = await fetch(`${API_BASE}/contact/${id}`, {
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
      json.message || json.errors?.join(', ') || 'Failed to update contact message status'
    );
  }

  return json.data;
}

/**
 * Delete a contact message.
 * @param {string} id - Contact document ID
 */
export async function deleteContactMessage(id) {
  let response;
  try {
    response = await fetch(`${API_BASE}/contact/${id}`, {
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
    throw new Error(json.message || 'Failed to delete contact message');
  }

  return json;
}
