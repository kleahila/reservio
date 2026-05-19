export const TENANT_CONFIG = {
  grandtirana: {
    parkingLayout: 'grid-ab',
    sunbedLayout:  'pool-ab',
  },
  hotelriviera: {
    parkingLayout: 'l-shape-c',
    sunbedLayout:  'terrace-line',
  },
};

export function getTenantConfig() {
  const subdomain = import.meta.env.VITE_TENANT_SUBDOMAIN || 'grandtirana';
  return TENANT_CONFIG[subdomain] ?? TENANT_CONFIG.grandtirana;
}

export function getActiveTenant() {
  return import.meta.env.VITE_TENANT_SUBDOMAIN || 'grandtirana';
}
