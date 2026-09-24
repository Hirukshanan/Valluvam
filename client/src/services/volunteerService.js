import { API_BASE } from './api';

/**
 * Submit volunteer interest application.
 *
 * @param {Object} volunteerData
 * @param {string} volunteerData.name
 * @param {string} volunteerData.email
 * @param {string} [volunteerData.phone]
 * @param {string} [volunteerData.location]
 * @param {string} [volunteerData.volunteerArea]
 * @param {string} [volunteerData.availability]
 * @param {string} volunteerData.message
 * @returns {Promise<Object>} The created volunteer record
 */
export async function submitVolunteer(volunteerData) {
  let response;
  try {
    response = await fetch(`${API_BASE}/volunteers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(volunteerData),
    });
  } catch (networkErr) {
    throw new Error(
      `Cannot connect to server at ${API_BASE}. Please check your connection or try again later.`
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
    const errorDetails = Array.isArray(json.errors) && json.errors.length > 0
      ? json.errors.join('. ')
      : json.message || 'Failed to submit volunteer application';
    throw new Error(errorDetails);
  }

  return json;
}
