import { apiCall } from './client';

export function getRoomBlocks() {
  return apiCall('GET', '/api/room-blocks', undefined, true);
}

export function createRoomBlock(data) {
  return apiCall('POST', '/api/room-blocks', data, true);
}

export function deleteRoomBlock(id) {
  return apiCall('DELETE', `/api/room-blocks/${id}`, undefined, true);
}
