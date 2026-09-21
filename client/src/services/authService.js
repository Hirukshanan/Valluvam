import { API_BASE } from './api';

const TOKEN_KEY = 'valluvam_admin_token';
const USER_KEY = 'valluvam_admin_user';

/**
 * Authenticate an admin user against the backend.
 *
 * On success the JWT and basic user data are persisted to localStorage
 * and returned.  On failure an error is thrown with a user-friendly message.
 */
export async function login(email, password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || 'Login failed. Please try again.');
  }

  localStorage.setItem(TOKEN_KEY, json.token);
  localStorage.setItem(USER_KEY, JSON.stringify(json.data));

  return { token: json.token, user: json.data };
}

/**
 * Fetch the currently authenticated admin's profile.
 */
export async function fetchMe() {
  const token = getToken();

  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    // Token is invalid / expired — clean up
    logout();
    throw new Error(json.message || 'Session expired. Please log in again.');
  }

  return json.data;
}

/**
 * Remove persisted auth state.
 */
export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Return the stored JWT, or null.
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Return the stored user object, or null.
 */
export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Quick check — is there a token in storage?
 */
export function isAuthenticated() {
  return !!getToken();
}

