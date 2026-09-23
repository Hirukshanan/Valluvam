import { API_BASE } from './api';

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

