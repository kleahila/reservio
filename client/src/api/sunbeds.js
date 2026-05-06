import { apiCall } from './client';

export function getSunbeds() {
  return apiCall('GET', '/api/sunbeds', undefined, false);
}

export function lockSunbed(id) {
  return apiCall('POST', `/api/sunbeds/${id}/lock`, undefined, true);
}

export function confirmSunbed(id, date, slot) {
  return apiCall('POST', `/api/sunbeds/${id}/confirm`, { date, slot }, true);
}

export function releaseSunbed(id) {
  return apiCall('POST', `/api/sunbeds/${id}/release`, undefined, true);
}

export function addSunbed(data) {
  return apiCall('POST', '/api/sunbeds', data, true);
}

export function deleteSunbed(id) {
  return apiCall('DELETE', `/api/sunbeds/${id}`, undefined, true);
}
