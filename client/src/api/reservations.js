import { apiCall } from './client';

export function getReservations(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
  const query = params.toString() ? `?${params}` : '';
  return apiCall('GET', `/api/reservations${query}`, undefined, true);
}

export function getMyReservations() {
  return apiCall('GET', '/api/reservations/my', undefined, true);
}

export function createReservation(data) {
  return apiCall('POST', '/api/reservations', data, true);
}

export function updateReservationStatus(id, status) {
  return apiCall('PATCH', `/api/reservations/${id}/status`, { status }, true);
}

export function cancelReservation(id) {
  return apiCall('DELETE', `/api/reservations/${id}`, undefined, true);
}
