import { API_BASE } from './api';

/**
 * Fetch all gallery albums from the backend (public endpoint).
 * Returns array of Album objects sorted by date desc.
 */
export async function fetchGalleryAlbums() {
  let response;
  try {
    response = await fetch(`${API_BASE}/gallery`);
  } catch (err) {
    throw new Error(
      `Cannot connect to gallery service at ${API_BASE}. Please ensure the server is running.`
    );
  }

  let json;
  try {
    json = await response.json();
  } catch (err) {
    throw new Error(
      `Server returned status ${response.status} (${response.statusText || 'Unknown response'})`
    );
  }

  if (!response.ok || !json.success) {
    throw new Error(json.message || 'Failed to fetch gallery albums');
  }

  return json.data;
}

/**
 * Fetch a single gallery album by ID from the backend (public endpoint).
 */
export async function fetchGalleryAlbumById(id) {
  let response;
  try {
    response = await fetch(`${API_BASE}/gallery/${id}`);
  } catch (err) {
    throw new Error(
      `Cannot connect to gallery service at ${API_BASE}. Please ensure the server is running.`
    );
  }

  let json;
  try {
    json = await response.json();
  } catch (err) {
    throw new Error(
      `Server returned status ${response.status} (${response.statusText || 'Unknown response'})`
    );
  }

  if (!response.ok || !json.success) {
    throw new Error(json.message || 'Failed to fetch gallery album');
  }

  return json.data;
}

