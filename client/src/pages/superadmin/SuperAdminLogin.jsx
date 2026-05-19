import { useState } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const inputCls =
  "w-full rounded-lg border border-rv-border2 bg-rv-surface px-3 py-2.5 text-sm text-rv-text placeholder:text-rv-subtle outline-none focus:ring-2 focus:ring-rv-accent/40";

export default function SuperAdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("superadmin@reservio.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('rv_token', data.token);
      localStorage.setItem('rv_role', 'SUPER_ADMIN');
      navigate('/superadmin/tenants');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-rv-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-lg font-bold text-rv-text">Reservio</span>
          <h1 className="mt-3 text-2xl font-bold text-rv-text">Super Admin</h1>
          <p className="mt-1 text-sm text-rv-muted">Platform administration</p>
        </div>
        <div className="rounded-2xl border border-rv-border bg-rv-surface p-8 shadow-sm">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-rv-text">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-rv-text">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
            </div>
            <div className="rounded-lg border border-rv-border bg-rv-surface2 px-4 py-3 text-xs text-rv-muted">
              <span className="font-semibold text-rv-text">Demo:</span> superadmin@reservio.com / password123
            </div>
            {error && (
              <p className="rounded-lg border border-rv-danger/20 bg-rv-danger-soft px-3 py-2 text-sm text-rv-danger">
                {error}
              </p>
            )}
            <button type="submit" disabled={loading}
              className="w-full rounded-lg bg-rv-accent py-2.5 text-sm font-semibold text-white hover:bg-rv-accent/90 disabled:opacity-50">
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
