import { apiCall } from './client';

export function getServices(category) {
  const query = category ? `?category=${encodeURIComponent(category)}` : '';
  return apiCall('GET', `/api/services${query}`, undefined, true);
}

export function createOrder(serviceId, reservationId) {
  return apiCall('POST', '/api/orders', { serviceId, reservationId }, true);
}

export function getOrders() {
  return apiCall('GET', '/api/orders', undefined, true);
}

export function getMyOrders() {
  return apiCall('GET', '/api/orders/my', undefined, true);
}
