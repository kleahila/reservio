import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function validate(form) {
  const e = {};
  if (!form.fullName.trim()) e.fullName = "Full name is required.";
  if (!form.email.includes("@")) e.email = "Valid email is required.";
  if (form.password.length < 6) e.password = "Password must be at least 6 characters.";
  return e;
}

const input = (err) =>
  `w-full rounded-lg border px-3 py-2.5 text-sm bg-rv-surface text-rv-text placeholder:text-rv-subtle outline-none transition focus:ring-2 focus:ring-rv-accent/40 ${
    err ? "border-rv-danger" : "border-rv-border2"
  }`;

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSuccess(true);
    setTimeout(() => navigate("/login"), 2000);
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-rv-text">Create your account</h1>
          <p className="mt-1 text-sm text-rv-muted">Start your stay with Reservio.</p>
        </div>

        {success ? (
          <div className="rounded-xl border border-rv-success/30 bg-rv-success-soft p-6 text-center">
            <p className="font-semibold text-rv-success">Account created! Redirecting to login&hellip;</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-rv-border bg-rv-surface p-8 shadow-sm">
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-rv-text">Full name</label>
                <input
                  value={form.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                  placeholder="Jane Smith"
                  className={input(errors.fullName)}
                />
                {errors.fullName && <p className="mt-1 text-xs text-rv-danger">{errors.fullName}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-rv-text">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="you@example.com"
                  className={input(errors.email)}
                />
                {errors.email && <p className="mt-1 text-xs text-rv-danger">{errors.email}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-rv-text">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder="Min. 6 characters"
                  className={input(errors.password)}
                />
                {errors.password && <p className="mt-1 text-xs text-rv-danger">{errors.password}</p>}
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-rv-accent py-2.5 text-sm font-semibold text-white transition hover:bg-rv-accent/90"
              >
                Create account
              </button>
            </form>

            <p className="mt-5 text-center text-xs text-rv-muted">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-rv-accent hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
