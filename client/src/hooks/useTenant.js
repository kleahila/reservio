import { createContext, createElement, useContext, useMemo } from 'react';
import { tenants } from '../data/tenants';
import { useAuth } from './useAuth';

const TenantContext = createContext(null);

export function TenantProvider({ children }) {
  const { user } = useAuth();

  const tenant = useMemo(() => {
    if (!user || user.tenantId == null) return null;
    return tenants.find((item) => item.id === user.tenantId) || null;
  }, [user]);

  return createElement(TenantContext.Provider, { value: { tenant } }, children);
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) throw new Error('useTenant must be used within TenantProvider');
  return context;
}
