import { apiCall } from './client';

export function getActivityLog() {
  return apiCall('GET', '/api/activity', undefined, true);
}

export function getSuperAdminActivityLog() {
  return apiCall('GET', '/api/admin/activity', undefined, true);
}
