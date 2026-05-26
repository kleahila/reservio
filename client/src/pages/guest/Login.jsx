import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { apiCall } from '../../api/client';

const input = (err) =>
  `w-full rounded-lg border px-3 py-2.5 text-sm bg-rv-surface text-rv-text placeholder:text-rv-subtle outline-none transition focus:ring-2 focus:ring-rv-olive-400/40 ${
    err ? 'border-rv-danger' : 'border-rv-border2'
  }`;

const ROLE_REDIRECT = {
  GUEST:       '/guest/dashboard',
  STAFF:       '/staff/reservations',
  RECEPTIONIST: '/staff/reservations',
  HOUSEKEEPER: '/housekeeper/tasks',
  TECHNICIAN:  '/technician/tasks',
  HOTEL_ADMIN: '/admin/command-center',
  SUPER_ADMIN: '/superadmin/tenants',
};

export default function Login() {
  const navigate = useNavigate();
  const { login, loginAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hotels, setHotels] = useState([]);
  const [tenant, setTenant] = useState(() => localStorage.getItem('rv_tenant') || 'grandtirana');
  const isSuperAdmin = tenant === '__superadmin__';

  useEffect(() => {
    apiCall('GET', '/api/public/tenants', undefined, false)
      .then((data) => setHotels(data || []))
      .catch(() => {});
  }, []);

  function handleTenantChange(subdomain, name) {
    setTenant(subdomain);
    if (subdomain !== '__superadmin__') {
      localStorage.setItem('rv_tenant', subdomain);
      if (name) localStorage.setItem('rv_tenant_name', name);
    }
    setApiError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!email.trim()) errs.email = 'Email is required.';
    if (!password.trim()) errs.password = 'Password is required.';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setApiError('');
    try {
      if (isSuperAdmin) {
        await loginAdmin(email, password);
        navigate('/superadmin/tenants', { replace: true });
        return;
      }
      const user = await login(email, password);
      const redirect = ROLE_REDIRECT[user?.role] || '/';
      navigate(redirect, { replace: true });
    } catch (err) {
      setApiError(err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-rv-text">Sign in</h1>
          <p className="mt-1 text-sm text-rv-muted">Welcome back to Reservio.</p>
        </div>

        <div className="rounded-2xl border border-rv-border bg-rv-surface p-8 shadow-sm">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {hotels.length > 0 && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-rv-text">Sign in as</label>
                <div className="flex flex-wrap gap-2">
                  {hotels.map((h) => (
                    <button
                      key={h.subdomain}
                      type="button"
                      onClick={() => handleTenantChange(h.subdomain, h.name)}
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                        tenant === h.subdomain
                          ? 'border-rv-accent bg-rv-accent/10 text-rv-accent'
                          : 'border-rv-border2 bg-rv-surface text-rv-muted hover:border-rv-accent/50 hover:text-rv-text'
                      }`}
                    >
                      {h.name}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleTenantChange('__superadmin__')}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                      isSuperAdmin
                        ? 'border-rv-warning bg-rv-warning-soft text-rv-warning'
                        : 'border-rv-border2 bg-rv-surface text-rv-muted hover:border-rv-warning/50 hover:text-rv-text'
                    }`}
                  >
                    Super Admin
                  </button>
                </div>
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-rv-text">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((x) => ({ ...x, email: '' })); setApiError(''); }}
                disabled={loading}
                className={input(errors.email)}
              />
              {errors.email && <p className="mt-1 text-xs text-rv-danger">{errors.email}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-rv-text">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((x) => ({ ...x, password: '' })); setApiError(''); }}
                disabled={loading}
                className={input(errors.password)}
              />
              {errors.password && <p className="mt-1 text-xs text-rv-danger">{errors.password}</p>}
            </div>

            {apiError && (
              <p className="rounded-lg border border-rv-danger/20 bg-rv-danger-soft px-3 py-2 text-sm text-rv-danger">
                {apiError}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-rv-accent py-2.5 text-sm font-semibold text-white transition hover:bg-rv-accent/90 disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="mt-5 flex items-center justify-between text-xs text-rv-muted">
            <Link to="/forgot-password" className="font-medium text-rv-sea-500 hover:underline">Forgot password?</Link>
            <span>No account?{' '}
              <Link to="/register" className="font-medium text-rv-sea-500 hover:underline">Create one</Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
