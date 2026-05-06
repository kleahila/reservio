import { apiCall } from './client';

export function getParking() {
  return apiCall('GET', '/api/parking', undefined, false);
}

export function lockSpot(id) {
  return apiCall('POST', `/api/parking/${id}/lock`, undefined, true);
}

export function confirmSpot(id) {
  return apiCall('POST', `/api/parking/${id}/confirm`, undefined, true);
}

export function releaseSpot(id) {
  return apiCall('POST', `/api/parking/${id}/release`, undefined, true);
}

export function addSpot(data) {
  return apiCall('POST', '/api/parking', data, true);
}

export function deleteSpot(id) {
  return apiCall('DELETE', `/api/parking/${id}`, undefined, true);
}

export function updateSpotPrice(id, price) {
  return apiCall('PATCH', `/api/parking/${id}/price`, { price }, true);
}
