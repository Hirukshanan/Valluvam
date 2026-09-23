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
 * Fetch a single gallery album by ID (public endpoint).
 */
export async function fetchGalleryAlbumById(id) {
  const response = await fetch(`${API_BASE}/gallery/${id}`);

  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || 'Failed to fetch gallery album');
  }

  return json.data;
}

/**
 * Upload image files to Cloudinary via the backend upload endpoint.
 * @param {File|File[]|FileList} files - One or more File objects
 * @returns {Promise<Array<{ url: string, publicId: string }>>}
 */
export async function uploadGalleryImages(files) {
  const token = getToken();
  if (!token) {
    throw new Error('Not authenticated. Please log in as admin.');
  }

  const formData = new FormData();
  const fileArray = Array.isArray(files) ? files : Array.from(files);

  for (const file of fileArray) {
    formData.append('images', file);
  }

  let response;
  try {
    response = await fetch(`${API_BASE}/gallery/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  } catch (networkErr) {
    throw new Error(
      `Cannot connect to backend API at ${API_BASE}. Please ensure the backend server is running on port 5000.`
    );
  }

  let json;
  try {
    json = await response.json();
  } catch (parseErr) {
    throw new Error(`Server returned status ${response.status} (${response.statusText || 'Unknown response'})`);
  }

  if (!response.ok || !json.success) {
    throw new Error(json.message || 'Failed to upload image(s) to Cloudinary');
  }

  return json.data;
}

/**
 * Create a new gallery album (admin only).
 */
export async function createAlbum(albumData) {
  let response;
  try {
    response = await fetch(`${API_BASE}/gallery`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(albumData),
    });
  } catch (networkErr) {
    throw new Error(`Cannot connect to backend API at ${API_BASE}. Please ensure the backend server is running.`);
  }

  let json;
  try {
    json = await response.json();
  } catch (parseErr) {
    throw new Error(`Server returned status ${response.status} (${response.statusText || 'Unknown response'})`);
  }

  if (!response.ok || !json.success) {
    throw new Error(json.message || json.errors?.join(', ') || 'Failed to create album');
  }

  return json.data;
}

/**
 * Update an existing gallery album (admin only).
 */
export async function updateAlbum(id, albumData) {
  let response;
  try {
    response = await fetch(`${API_BASE}/gallery/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(albumData),
    });
  } catch (networkErr) {
    throw new Error(`Cannot connect to backend API at ${API_BASE}. Please ensure the backend server is running.`);
  }

  let json;
  try {
    json = await response.json();
  } catch (parseErr) {
    throw new Error(`Server returned status ${response.status} (${response.statusText || 'Unknown response'})`);
  }

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

/**
 * Delete a gallery album (admin only).
 */
export async function deleteAlbum(id) {
  const response = await fetch(`${API_BASE}/gallery/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || 'Failed to delete album');
  }

  return json;
}

