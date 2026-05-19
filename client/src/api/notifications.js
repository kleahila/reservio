import { apiCall } from './client';

export function getMyNotifications() {
  return apiCall('GET', '/api/notifications/my', undefined, true);
}

export function markNotificationRead(id) {
  return apiCall('PATCH', `/api/notifications/${id}/read`, undefined, true);
}
