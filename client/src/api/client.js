const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function getTenant() {
  return (
    localStorage.getItem('rv_tenant') ||
    import.meta.env.VITE_TENANT_SUBDOMAIN ||
    'grandtirana'
  );
}

export async function apiCall(method, path, body, requiresAuth = false) {
  const headers = {
    'Content-Type': 'application/json',
    'X-Tenant-Subdomain': getTenant(),
  };

  if (requiresAuth) {
    const token = localStorage.getItem('rv_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (body !== undefined && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE_URL}${path}`, options);

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const data = await res.json();
      message = data.message || data.error || message;
    } catch { /* ignore parse errors */ }
    throw new Error(message);
  }

  if (res.status === 204) return null;
  return res.json();
}
