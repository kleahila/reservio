import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register as apiRegister } from '../../api/auth';

function validate(form) {
  const e = {};
  if (!form.fullName.trim()) e.fullName = 'Full name is required.';
  if (!form.email.includes('@')) e.email = 'Valid email is required.';
  if (form.password.length < 6) e.password = 'Password must be at least 6 characters.';
  if (form.confirmPassword !== form.password) e.confirmPassword = 'Passwords do not match.';
  return e;
}

const inputCls = (err) =>
  `w-full rounded-lg border px-3 py-2.5 text-sm bg-rv-surface text-rv-text placeholder:text-rv-subtle outline-none transition focus:ring-2 focus:ring-rv-olive-400/40 ${
    err ? 'border-rv-danger' : 'border-rv-border2'
  }`;

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
    setApiError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setApiError('');
    try {
      await apiRegister(form.fullName, form.email, form.password);
      setSuccess(true);
      setTimeout(() => navigate('/login', { state: { message: 'Account created! Please sign in.' } }), 1800);
    } catch (err) {
      setApiError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-2xl font-bold text-rv-text">Create your account</h1>
          <p className="mt-1 text-sm text-rv-muted">Start your stay with Reservio.</p>
        </div>

        {success ? (
          <div className="rounded-xl border border-rv-olive-300/50 bg-rv-olive-50 p-6 text-center dark:bg-rv-olive-900/20">
            <p className="font-semibold text-rv-olive">Account created! Redirecting to login&hellip;</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-rv-border bg-rv-surface p-8 shadow-sm">
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-rv-text">Full name</label>
                <input
                  value={form.fullName}
                  onChange={(e) => set('fullName', e.target.value)}
                  placeholder="Jane Smith"
                  className={inputCls(errors.fullName)}
                />
                {errors.fullName && <p className="mt-1 text-xs text-rv-danger">{errors.fullName}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-rv-text">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="you@example.com"
                  className={inputCls(errors.email)}
                />
                {errors.email && <p className="mt-1 text-xs text-rv-danger">{errors.email}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-rv-text">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  placeholder="Min. 6 characters"
                  className={inputCls(errors.password)}
                />
                {errors.password && <p className="mt-1 text-xs text-rv-danger">{errors.password}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-rv-text">Confirm password</label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => set('confirmPassword', e.target.value)}
                  placeholder="Repeat password"
                  className={inputCls(errors.confirmPassword)}
                />
                {errors.confirmPassword && <p className="mt-1 text-xs text-rv-danger">{errors.confirmPassword}</p>}
              </div>

              {apiError && (
                <p className="rounded-lg border border-rv-danger/20 bg-rv-danger-soft px-3 py-2 text-sm text-rv-danger">
                  {apiError}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-rv-olive-600 py-2.5 text-sm font-semibold text-white transition hover:bg-rv-olive-700 disabled:opacity-50"
              >
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </form>

            <p className="mt-5 text-center text-xs text-rv-muted">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-rv-olive-600 hover:underline">Sign in</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
