import { apiCall } from './client';

export function getRooms(checkIn, checkOut, requireAuth = false) {
  const params = new URLSearchParams();
  if (checkIn) params.set('checkIn', checkIn);
  if (checkOut) params.set('checkOut', checkOut);
  const query = params.toString() ? `?${params}` : '';
  return apiCall('GET', `/api/rooms${query}`, undefined, requireAuth);
}

export function getRoom(id) {
  return apiCall('GET', `/api/rooms/${id}`, undefined, false);
}

export function createRoom(data) {
  return apiCall('POST', '/api/rooms', data, true);
}

export function updateRoom(id, data) {
  return apiCall('PUT', `/api/rooms/${id}`, data, true);
}

export function deleteRoom(id) {
  return apiCall('DELETE', `/api/rooms/${id}`, undefined, true);
}

export function updateRoomStatus(id, status) {
  return apiCall('PATCH', `/api/rooms/${id}/status`, { status }, true);
}
