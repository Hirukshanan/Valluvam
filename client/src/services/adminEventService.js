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
 * Fetch all events (admin view — includes drafts).
 */
export async function fetchAdminEvents() {
  const response = await fetch(`${API_BASE}/events/admin-list`, {
    headers: authHeaders(),
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || 'Failed to fetch events');
  }

  return json.data;
}

/**
 * Upload an event image to Cloudinary via the backend upload endpoint.
 * @param {File} file - File object selected from file input
 * @returns {Promise<{ url: string, publicId: string }>}
 */
export async function uploadEventImage(file) {
  const token = getToken();
  if (!token) {
    throw new Error('Not authenticated. Please log in as admin.');
  }

  const formData = new FormData();
  formData.append('image', file);

  let response;
  try {
    response = await fetch(`${API_BASE}/events/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
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
    throw new Error(json.message || 'Failed to upload event image to Cloudinary');
  }

  return json.data;
}

/**
 * Create a new event.
 */
export async function createEvent(eventData) {
  const response = await fetch(`${API_BASE}/events`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(eventData),
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || json.errors?.join(', ') || 'Failed to create event');
  }

  return json.data;
}

/**
 * Update an existing event.
 */
export async function updateEvent(id, eventData) {
  const response = await fetch(`${API_BASE}/events/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(eventData),
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || json.errors?.join(', ') || 'Failed to update event');
  }

  return json.data;
}

/**
 * Delete an event.
 */
export async function deleteEvent(id) {
  const response = await fetch(`${API_BASE}/events/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || 'Failed to delete event');
  }

  return json;
}
