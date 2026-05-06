import { apiCall } from './client';

export function getSummary(startDate, endDate) {
  const params = new URLSearchParams();
  if (startDate) params.set('start', startDate);
  if (endDate) params.set('end', endDate);
  const query = params.toString() ? `?${params}` : '';
  return apiCall('GET', `/api/analytics/summary${query}`, undefined, true);
}
