/**
 * Base API URL for backend requests.
 * In production this should be set to the deployed API path (often '/api').
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Socket server URL.
 * In production this should be set to the deployed socket endpoint,
 * otherwise it falls back to the current frontend origin.
 */
const defaultSocketUrl = typeof window !== 'undefined'
  ? window.location.origin
  : '';

export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || defaultSocketUrl;

export const APP_NAME = 'AuthKit';
