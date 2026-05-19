import { apiCall } from './client';

export function createReview(data) {
  return apiCall('POST', '/api/reviews', data, true);
}

export function getRoomReviews(roomId) {
  return apiCall('GET', `/api/reviews/room/${roomId}`, undefined, false);
}

export function getAllReviews() {
  return apiCall('GET', '/api/reviews', undefined, true);
}
