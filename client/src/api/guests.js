import { apiCall } from './client';

export function getGuests() {
  return apiCall('GET', '/api/guests', undefined, true);
}

export function blacklistGuest(id, reason) {
  return apiCall('POST', `/api/guests/${id}/blacklist`, { reason }, true);
}

export function unblacklistGuest(id) {
  return apiCall('DELETE', `/api/guests/${id}/blacklist`, undefined, true);
}
