import { apiCall } from './client';

export function getRules() {
  return apiCall('GET', '/api/pricing/rules', undefined, true);
}

export function createRule(data) {
  return apiCall('POST', '/api/pricing/rules', data, true);
}

export function updateRule(id, data) {
  return apiCall('PUT', `/api/pricing/rules/${id}`, data, true);
}

export function deleteRule(id) {
  return apiCall('DELETE', `/api/pricing/rules/${id}`, undefined, true);
}
