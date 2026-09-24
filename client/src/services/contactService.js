import { API_BASE } from './api';

/**
 * Submit public contact message.
 *
 * @param {Object} contactData
 * @param {string} contactData.name
 * @param {string} contactData.email
 * @param {string} contactData.subject
 * @param {string} contactData.message
 * @param {string} [contactData.preferredContactMethod='email']
 * @param {string} [contactData.whatsappNumber]
 * @param {string} [contactData.phoneNumber]
 * @param {string} [contactData.turnstileToken]
 * @returns {Promise<Object>} The created contact record
 */
export async function submitContactMessage(contactData) {
  let response;
  try {
    response = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactData),
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
      : json.message || 'Failed to send message';
    throw new Error(errorDetails);
  }

  return json;
}
