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
 * Fetch all team members for the admin panel (includes inactive members).
 */
export async function fetchAdminTeamMembers() {
  const token = getToken();
  let response;
  try {
    response = await fetch(`${API_BASE}/team?all=true`, {
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
    throw new Error(json.message || 'Failed to fetch team members');
  }

  return json.data;
}

/**
 * Fetch a single team member by ID.
 */
export async function fetchTeamMemberById(id) {
  let response;
  try {
    response = await fetch(`${API_BASE}/team/${id}`, {
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
    throw new Error(json.message || 'Failed to fetch team member');
  }

  return json.data;
}

/**
 * Upload a team member photo to Cloudinary via the backend upload endpoint.
 * @param {File} file - File object selected from file input
 * @returns {Promise<{ url: string, publicId: string }>}
 */
export async function uploadTeamPhoto(file) {
  const token = getToken();
  if (!token) {
    throw new Error('Not authenticated. Please log in as admin.');
  }

  const formData = new FormData();
  formData.append('photo', file);

  let response;
  try {
    response = await fetch(`${API_BASE}/team/upload`, {
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
    throw new Error(json.message || 'Failed to upload photo to Cloudinary');
  }

  return json.data;
}

/**
 * Create a new team member (admin only).
 */
export async function createTeamMember(memberData) {
  let response;
  try {
    response = await fetch(`${API_BASE}/team`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(memberData),
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
      json.message || json.errors?.join(', ') || 'Failed to create team member'
    );
  }

  return json.data;
}

/**
 * Update an existing team member (admin only).
 */
export async function updateTeamMember(id, memberData) {
  let response;
  try {
    response = await fetch(`${API_BASE}/team/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(memberData),
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
      json.message || json.errors?.join(', ') || 'Failed to update team member'
    );
  }

  return json.data;
}

/**
 * Delete a team member (admin only).
 */
export async function deleteTeamMember(id) {
  let response;
  try {
    response = await fetch(`${API_BASE}/team/${id}`, {
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
    throw new Error(json.message || 'Failed to delete team member');
  }

  return json;
}
