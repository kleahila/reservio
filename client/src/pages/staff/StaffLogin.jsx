import { useState } from "react";
import { useNavigate } from "react-router-dom";

const input = (err) =>
  `w-full rounded-lg border px-3 py-2.5 text-sm bg-rv-surface text-rv-text placeholder:text-rv-subtle outline-none transition focus:ring-2 focus:ring-rv-accent/40 ${
    err ? "border-rv-danger" : "border-rv-border2"
  }`;

export default function StaffLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("elena.baroni@grandhotel.com");
  const [password, setPassword] = useState("demo123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) { setError("All fields are required."); return; }
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem("rv-role", "staff");
      navigate("/staff/dashboard");
    }, 600);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-rv-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-lg font-bold text-rv-text">Reservio</span>
          <h1 className="mt-3 text-2xl font-bold text-rv-text">Staff login</h1>
          <p className="mt-1 text-sm text-rv-muted">staff.reservio.com</p>
        </div>
        <div className="rounded-2xl border border-rv-border bg-rv-surface p-8 shadow-sm">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-rv-text">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} className={input(error)} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-rv-text">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} className={input(error)} />
            </div>
            {error && <p className="text-xs text-rv-danger">{error}</p>}
            <div className="rounded-lg border border-rv-border bg-rv-surface2 px-4 py-3 text-xs text-rv-muted">
              <span className="font-semibold text-rv-text">Demo:</span> any valid email / any password
            </div>
            <button type="submit" disabled={loading} className="w-full rounded-lg bg-rv-accent py-2.5 text-sm font-semibold text-white hover:bg-rv-accent/90 disabled:opacity-50">
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
