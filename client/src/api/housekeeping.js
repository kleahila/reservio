import { apiCall } from './client';

export function getTasks() {
  return apiCall('GET', '/api/housekeeping/tasks', undefined, true);
}

export function markUrgent(id) {
  return apiCall('PATCH', `/api/housekeeping/tasks/${id}/urgent`, undefined, true);
}

export function completeTask(id) {
  return apiCall('PATCH', `/api/housekeeping/tasks/${id}/complete`, undefined, true);
}
