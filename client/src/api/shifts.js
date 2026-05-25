import { apiCall } from './client';

export function clockIn() {
  return apiCall('POST', '/api/shifts/clockin', undefined, true);
}

export function clockOut(note) {
  return apiCall('POST', '/api/shifts/clockout', note ? { note } : undefined, true);
}

export function getMyShifts() {
  return apiCall('GET', '/api/shifts/my', undefined, true);
}

export function getLastHandover() {
  return apiCall('GET', '/api/shifts/last-handover', undefined, true);
}

export function getAllShifts(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v) qs.set(k, v); });
  const query = qs.toString() ? `?${qs}` : '';
  return apiCall('GET', `/api/shifts${query}`, undefined, true);
}
