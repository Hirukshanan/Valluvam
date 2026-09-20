/**
 * Shared API configuration.
 *
 * All service modules import API_BASE from here so the backend URL is
 * defined in exactly one place and read from the VITE_API_URL env var.
 */
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

