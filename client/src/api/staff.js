import { apiCall } from './client';

export function getStaff() {
  return apiCall('GET', '/api/staff', undefined, true);
}

export function createStaff(data) {
  return apiCall('POST', '/api/staff', data, true);
}

export function updateStaff(id, data) {
  return apiCall('PUT', `/api/staff/${id}`, data, true);
}

export function deactivateStaff(id) {
  return apiCall('PATCH', `/api/staff/${id}/deactivate`, undefined, true);
}
