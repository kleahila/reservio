import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const input = (err) =>
  `w-full rounded-lg border px-3 py-2.5 text-sm bg-rv-surface text-rv-text placeholder:text-rv-subtle outline-none transition focus:ring-2 focus:ring-rv-olive-400/40 ${
    err ? 'border-rv-danger' : 'border-rv-border2'
  }`;

const ROLE_REDIRECT = {
  GUEST:       '/guest/dashboard',
  STAFF:       '/staff/reservations',
  RECEPTIONIST: '/staff/reservations',
  MANAGER:     '/staff/reservations',
  HOUSEKEEPER: '/housekeeper/tasks',
  TECHNICIAN:  '/technician/tasks',
  HOTEL_ADMIN: '/admin/command-center',
  SUPER_ADMIN: '/superadmin/tenants',
};

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

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
