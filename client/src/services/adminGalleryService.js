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
 * Fetch all gallery albums (public endpoint — no auth required).
 */
export async function fetchGalleryAlbums() {
  const response = await fetch(`${API_BASE}/gallery`);

  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || 'Failed to fetch gallery albums');
  }

  return json.data;
}

/**
 * Create a new gallery album (admin only).
 */
export async function createAlbum(albumData) {
  const response = await fetch(`${API_BASE}/gallery`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(albumData),
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || json.errors?.join(', ') || 'Failed to create album');
  }

  return json.data;
}

/**
 * Update an existing gallery album (admin only).
 */
export async function updateAlbum(id, albumData) {
  const response = await fetch(`${API_BASE}/gallery/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(albumData),
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || json.errors?.join(', ') || 'Failed to update album');
  }

  return json.data;
}

/**
 * Fetch published events for the optional event selector.
 */
export async function fetchEvents() {
  const response = await fetch(`${API_BASE}/events`);

  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || 'Failed to fetch events');
  }

  return json.data;
}

