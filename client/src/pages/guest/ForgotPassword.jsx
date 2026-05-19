import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiCall } from '../../api/client';

const inputCls =
  'w-full rounded-lg border border-rv-border2 bg-rv-surface px-3 py-2.5 text-sm text-rv-text placeholder:text-rv-subtle outline-none transition focus:ring-2 focus:ring-rv-olive-400/40';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    try {
      const data = await apiCall('POST', '/api/auth/forgot-password', { email }, false);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-rv-text">Reset password</h1>
          <p className="mt-1 text-sm text-rv-muted">Enter your email to receive a temporary password.</p>
        </div>

        <div className="rounded-2xl border border-rv-border bg-rv-surface p-8 shadow-sm">
          {result ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-rv-warning/40 bg-rv-warning-soft p-5 text-center">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-rv-warning">Temporary password</p>
                <p className="font-mono text-2xl font-bold tracking-widest text-rv-text">{result.newPassword}</p>
              </div>
              <p className="text-sm text-rv-danger font-medium text-center">
                Please log in immediately and change your password.
              </p>
              <Link
                to="/login"
                className="block w-full rounded-lg bg-rv-accent py-2.5 text-center text-sm font-semibold text-white hover:bg-rv-accent/90"
              >
                Go to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-rv-text">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="you@example.com"
                  disabled={loading}
                  className={inputCls}
                />
              </div>

              {error && (
                <p className="rounded-lg border border-rv-danger/20 bg-rv-danger-soft px-3 py-2 text-sm text-rv-danger">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-rv-accent py-2.5 text-sm font-semibold text-white transition hover:bg-rv-accent/90 disabled:opacity-50"
              >
                {loading ? 'Sending…' : 'Send temporary password'}
              </button>

              <p className="text-center text-xs text-rv-muted">
                <Link to="/login" className="font-medium text-rv-sea-500 hover:underline">Back to login</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
