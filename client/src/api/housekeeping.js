import { apiCall } from './client';

export function getTasks() {
  return apiCall('GET', '/api/tasks', undefined, true);
}

export function markUrgent(id) {
  return apiCall('PUT', `/api/tasks/${id}/urgent`, undefined, true);
}

export function completeTask(id) {
  return apiCall('PUT', `/api/tasks/${id}/complete`, undefined, true);
}

export function assignTask(id, staffId) {
  return apiCall('PUT', `/api/tasks/${id}/assign`, { staffId: staffId ?? null }, true);
}
