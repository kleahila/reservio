import { apiCall } from './client';

export function login(email, password) {
  return apiCall('POST', '/api/auth/login', { email, password }, false);
}

export function register(fullName, email, password) {
  return apiCall('POST', '/api/auth/register', { fullName, email, password }, false);
}

export function getMe() {
  return apiCall('GET', '/api/auth/me', undefined, true);
}
