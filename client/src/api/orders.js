import { apiCall } from './client';

export function getMyOrders() {
  return apiCall('GET', '/api/orders/my', undefined, true);
}

export function createOrder(data) {
  return apiCall('POST', '/api/orders', data, true);
}

export function getAllOrders() {
  return apiCall('GET', '/api/orders', undefined, true);
}
