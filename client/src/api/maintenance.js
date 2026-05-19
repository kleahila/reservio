import { apiCall } from './client';

export function getMaintenanceRequests() {
  return apiCall('GET', '/api/maintenance', undefined, true);
}

export function getMyMaintenanceTasks() {
  return apiCall('GET', '/api/maintenance/my', undefined, true);
}

export function createMaintenanceRequest(data) {
  return apiCall('POST', '/api/maintenance', data, true);
}

export function assignMaintenanceRequest(id, assignedTo) {
  return apiCall('PATCH', `/api/maintenance/${id}/assign`, { assignedTo }, true);
}

export function updateMaintenanceStatus(id, status) {
  return apiCall('PATCH', `/api/maintenance/${id}/status`, { status }, true);
}
