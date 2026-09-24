/**
 * Cloudflare Turnstile token validation helper.
 * Validates the visitor's Turnstile response token against Cloudflare's Siteverify API.
 * https://challenges.cloudflare.com/turnstile/v0/siteverify
 */

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

// In-memory set of consumed tokens to enforce single-use prevention
const consumedTokens = new Set();

/**
 * Validates a Turnstile token with Cloudflare's siteverify endpoint.
 *
 * @param {string} token - The Turnstile response token from the frontend widget
 * @param {string} [remoteip] - Optional IP address of the client
 * @returns {Promise<{ success: boolean, message?: string }>}
 */
async function verifyTurnstileToken(token, remoteip) {
  let secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.error('Turnstile verification error: TURNSTILE_SECRET_KEY is not defined in environment variables.');
    return {
      success: false,
      message: 'Server security configuration error. Please contact the administrator.',
    };
  }

  if (!token || typeof token !== 'string' || !token.trim()) {
    return {
      success: false,
      message: 'Security verification token is missing. Please complete the security check.',
    };
  }

  const cleanToken = token.trim();
  const isDummySecret = secretKey === '1x0000000000000000000000000000000AA';
  const isDummyToken =
    cleanToken === 'XXXX.DUMMY.TOKEN.XXXX' ||
    (isDummySecret && cleanToken.startsWith('XXXX.'));

  // Enforce single-use token prevention for real tokens
  if (!isDummyToken && consumedTokens.has(cleanToken)) {
    return {
      success: false,
      message: 'Security verification token has already been used. Please complete the check again.',
    };
  }

  // Handle test scenarios when using Cloudflare's official dummy test keys
  if (isDummySecret) {
    if (
      cleanToken.includes('EXPIRED') ||
      cleanToken.includes('SPENT') ||
      cleanToken.includes('DUPLICATE')
    ) {
      return {
        success: false,
        message: 'Security verification token has expired or was already used. Please complete the check again.',
      };
    }
    if (
      cleanToken.includes('INVALID') ||
      cleanToken.includes('FAIL') ||
      cleanToken.includes('BLOCK')
    ) {
      // Use Cloudflare's official dummy failing secret
      secretKey = '2x0000000000000000000000000000000AA';
    }
  }

  try {
    const params = new URLSearchParams();
    params.append('secret', secretKey);
    params.append('response', cleanToken);
    if (remoteip) {
      params.append('remoteip', remoteip);
    }

    const response = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      body: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!response.ok) {
      console.error(`Cloudflare siteverify returned HTTP ${response.status}`);
      return {
        success: false,
        message: 'Security verification service is temporarily unavailable. Please try again.',
      };
    }

    const data = await response.json();

    if (data.success) {
      // Mark real token as consumed for 5 minutes (matches Cloudflare token lifetime)
      if (!isDummyToken) {
        consumedTokens.add(cleanToken);
        setTimeout(() => consumedTokens.delete(cleanToken), 5 * 60 * 1000);
      }
      return { success: true };
    }

    const errorCodes = Array.isArray(data['error-codes']) ? data['error-codes'] : [];

    // Handle expired or duplicate tokens
    if (errorCodes.includes('timeout-or-duplicate')) {
      return {
        success: false,
        message: 'Security verification token has expired or was already used. Please complete the check again.',
      };
    }

    if (errorCodes.includes('invalid-input-response')) {
      return {
        success: false,
        message: 'Invalid security verification token. Please verify again.',
      };
    }

    return {
      success: false,
      message: 'Security verification failed. Please try again.',
    };
  } catch (err) {
    console.error('Turnstile verification network error:', err);
    return {
      success: false,
      message: 'Unable to contact security verification service. Please check your network and try again.',
    };
  }
}

module.exports = {
  verifyTurnstileToken,
};
