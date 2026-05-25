import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { login as apiLogin, adminLogin as apiAdminLogin } from '../api/auth';

const AuthContext = createContext(null);

function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    if (decoded.exp && decoded.exp * 1000 < Date.now()) return null;
    return {
      userId: decoded.userId || decoded.sub || decoded.id,
      tenantId: decoded.tenantId,
      role: decoded.role,
      fullName: decoded.fullName || decoded.name || null,
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('rv_token');
    return token ? decodeToken(token) : null;
  });

  const login = useCallback(async (email, password) => {
    const data = await apiLogin(email, password);
    const token = data.token || data.accessToken;
    localStorage.setItem('rv_token', token);
    const decoded = decodeToken(token);
    setUser(decoded);
    return decoded;
  }, []);

  const loginAdmin = useCallback(async (email, password) => {
    const data = await apiAdminLogin(email, password);
    const token = data.token || data.accessToken;
    localStorage.setItem('rv_token', token);
    const decoded = decodeToken(token);
    setUser(decoded);
    return decoded;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('rv_token');
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, login, loginAdmin, logout }), [user, login, loginAdmin, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
