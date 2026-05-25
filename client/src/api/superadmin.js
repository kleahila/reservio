import { apiCall } from './client';

export function getTenants() {
  return apiCall('GET', '/api/admin/tenants', undefined, true);
}

export function createTenant(data) {
  return apiCall('POST', '/api/admin/tenants', data, true);
}

export function approveTenant(id) {
  return apiCall('PATCH', `/api/admin/tenants/${id}/approve`, undefined, true);
}

export function suspendTenant(id) {
  return apiCall('PATCH', `/api/admin/tenants/${id}/suspend`, undefined, true);
}

export function deleteTenant(id) {
  return apiCall('DELETE', `/api/admin/tenants/${id}`, undefined, true);
}

export function changePlan(id, plan) {
  return apiCall('PATCH', `/api/admin/tenants/${id}/plan`, { plan }, true);
}

export function getStats() {
  return apiCall('GET', '/api/admin/analytics', undefined, true);
}
