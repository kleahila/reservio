import { useState } from "react";
import { useNavigate } from "react-router-dom";

const inputCls =
  "w-full rounded-lg border border-rv-border2 bg-rv-surface px-3 py-2.5 text-sm text-rv-text placeholder:text-rv-subtle outline-none focus:ring-2 focus:ring-rv-accent/40";

export default function SuperAdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("superadmin@reservio.com");
  const [password, setPassword] = useState("demo123");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem("rv-role", "superadmin");
      navigate("/superadmin/tenants");
    }, 600);
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
              <span className="font-semibold text-rv-text">Demo:</span> any credentials accepted
            </div>
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
