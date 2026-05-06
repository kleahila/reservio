import { apiCall } from './client';

export function getTenants() {
  return apiCall('GET', '/api/superadmin/tenants', undefined, true);
}

export function createTenant(data) {
  return apiCall('POST', '/api/superadmin/tenants', data, true);
}

export function approveTenant(id) {
  return apiCall('PATCH', `/api/superadmin/tenants/${id}/approve`, undefined, true);
}

export function suspendTenant(id) {
  return apiCall('PATCH', `/api/superadmin/tenants/${id}/suspend`, undefined, true);
}

export function deleteTenant(id) {
  return apiCall('DELETE', `/api/superadmin/tenants/${id}`, undefined, true);
}

export function changePlan(id, plan) {
  return apiCall('PATCH', `/api/superadmin/tenants/${id}/plan`, { plan }, true);
}

export function getStats() {
  return apiCall('GET', '/api/superadmin/stats', undefined, true);
}
