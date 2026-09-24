import { API_BASE } from './api';

/**
 * Fetch active team members from the backend (public endpoint).
 * Returns an array of TeamMember objects sorted by displayOrder asc.
 */
export async function fetchActiveTeamMembers() {
  let response;
  try {
    response = await fetch(`${API_BASE}/team`);
  } catch (err) {
    throw new Error(
      `Cannot connect to team service at ${API_BASE}. Please ensure the server is running.`
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
    throw new Error(json.message || 'Failed to fetch team members');
  }

  return json.data;
}
