import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiCall } from '../api/client';

const inputCls = 'w-full rounded-lg border border-rv-border2 bg-rv-surface px-3 py-2.5 text-sm text-rv-text placeholder:text-rv-subtle outline-none focus:ring-2 focus:ring-rv-olive-400/40';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) { setError('Email is required.'); return; }
    setLoading(true);
    setError('');
    try {
      const data = await apiCall('POST', '/api/auth/forgot-password', { email });
      setResult(data.newPassword);
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
          <h1 className="text-2xl font-bold text-rv-text">Reset Password</h1>
          <p className="mt-1 text-sm text-rv-muted">Enter your email to receive a temporary password.</p>
        </div>

        <div className="rounded-2xl border border-rv-border bg-rv-surface p-8 shadow-sm">
          {result ? (
            <div className="space-y-4 text-center">
              <div className="rounded-xl border border-rv-olive-300/50 bg-rv-olive-50 dark:bg-rv-olive-900/20 px-6 py-5">
                <p className="text-sm font-medium text-rv-muted mb-2">Your temporary password is:</p>
                <p className="font-mono text-2xl font-bold text-rv-olive-700 dark:text-rv-olive-300">{result}</p>
                <p className="mt-3 text-xs text-rv-warning font-medium">Please log in and change it immediately.</p>
              </div>
              <Link
                to="/login"
                className="inline-block rounded-lg bg-rv-olive-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-rv-olive-700"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-rv-text">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="you@example.com"
                  className={inputCls}
                />
                {error && <p className="mt-1 text-xs text-rv-danger">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-rv-olive-600 py-2.5 text-sm font-semibold text-white transition hover:bg-rv-olive-700 disabled:opacity-50"
              >
                {loading ? 'Sending…' : 'Reset Password'}
              </button>

              <p className="text-center text-xs text-rv-muted">
                <Link to="/login" className="text-rv-sea-500 hover:underline">Back to login</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
