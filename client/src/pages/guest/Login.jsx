import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const input = (err) =>
  `w-full rounded-lg border px-3 py-2.5 text-sm bg-rv-surface text-rv-text placeholder:text-rv-subtle outline-none transition focus:ring-2 focus:ring-rv-accent/40 ${
    err ? "border-rv-danger" : "border-rv-border2"
  }`;

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("anna@example.com");
  const [password, setPassword] = useState("demo123");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!email.trim()) errs.email = "Email is required.";
    if (!password.trim()) errs.password = "Password is required.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setTimeout(() => {
      const ok = login(email, password);
      setLoading(false);
      if (ok) {
        navigate("/guest/dashboard");
      } else {
        setErrors({ email: "Invalid credentials.", password: "Invalid credentials." });
      }
    }, 600);
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
                onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((x) => ({ ...x, email: "" })); }}
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
                onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((x) => ({ ...x, password: "" })); }}
                disabled={loading}
                className={input(errors.password)}
              />
              {errors.password && <p className="mt-1 text-xs text-rv-danger">{errors.password}</p>}
            </div>

            <div className="rounded-lg border border-rv-border bg-rv-surface2 px-4 py-3 text-xs text-rv-muted">
              <span className="font-semibold text-rv-text">Demo:</span> anna@example.com / demo123
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-rv-accent py-2.5 text-sm font-semibold text-white transition hover:bg-rv-accent/90 disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-rv-muted">
            No account?{" "}
            <Link to="/register" className="font-medium text-rv-accent hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
