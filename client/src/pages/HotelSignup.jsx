import { useState } from "react";
import { Link } from "react-router-dom";

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const PLANS = ["Basic", "Premium", "Custom"];

export default function HotelSignup() {
  const [form, setForm] = useState({
    hotelName: "",
    subdomain: "",
    email: "",
    ownerName: "",
    plan: "Basic",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  function set(field, value) {
    setForm((f) => {
      const next = { ...f, [field]: value };
      if (field === "hotelName") next.subdomain = slugify(value);
      return next;
    });
  }

  function validate() {
    const e = {};
    if (!form.hotelName.trim()) e.hotelName = "Hotel name is required.";
    if (!form.subdomain.trim()) e.subdomain = "Subdomain is required.";
    else if (!/^[a-z0-9-]+$/.test(form.subdomain)) e.subdomain = "Only lowercase letters, numbers and hyphens.";
    if (!form.email.includes("@")) e.email = "Valid email is required.";
    if (!form.ownerName.trim()) e.ownerName = "Owner name is required.";
    if (form.password.length < 8) e.password = "Password must be at least 8 characters.";
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) setSubmitted(true);
  }

  const inputClass = (field) =>
    `w-full rounded-lg border px-3 py-2.5 text-sm bg-rv-surface text-rv-text placeholder:text-rv-subtle focus:outline-none focus:ring-2 focus:ring-rv-accent/40 transition ${
      errors[field] ? "border-rv-danger" : "border-rv-border2"
    }`;

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-rv-bg px-4">
        <div className="w-full max-w-md rounded-2xl border border-rv-border bg-rv-surface p-8 text-center shadow-lg">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rv-success-soft">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-rv-success">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-bold text-rv-text">Application submitted</h2>
          <p className="mb-6 text-sm text-rv-muted">
            Your application for <span className="font-semibold text-rv-text">{form.hotelName}</span> is
            pending review. Our team will reach out to <span className="font-semibold text-rv-text">{form.email}</span> within 24 hours.
          </p>
          <Link to="/" className="text-sm font-medium text-rv-accent hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-start justify-center bg-rv-bg px-4 py-16">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <Link to="/" className="text-lg font-bold text-rv-text">Reservio</Link>
          <h1 className="mt-4 text-2xl font-bold text-rv-text">Register your hotel</h1>
          <p className="mt-1 text-sm text-rv-muted">
            Create your hotel workspace. Approval usually takes under 24 hours.
          </p>
        </div>

        <div className="rounded-2xl border border-rv-border bg-rv-surface p-8 shadow-sm">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-rv-text">Hotel name</label>
              <input
                type="text"
                value={form.hotelName}
                onChange={(e) => set("hotelName", e.target.value)}
                placeholder="Grand Hotel Tirana"
                className={inputClass("hotelName")}
              />
              {errors.hotelName && <p className="mt-1 text-xs text-rv-danger">{errors.hotelName}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-rv-text">Subdomain</label>
              <div className="flex items-center overflow-hidden rounded-lg border border-rv-border2 bg-rv-surface focus-within:ring-2 focus-within:ring-rv-accent/40">
                <input
                  type="text"
                  value={form.subdomain}
                  onChange={(e) => set("subdomain", e.target.value)}
                  placeholder="grandhotel"
                  className="flex-1 bg-transparent px-3 py-2.5 text-sm text-rv-text outline-none"
                />
                <span className="border-l border-rv-border2 bg-rv-surface2 px-3 py-2.5 text-sm text-rv-muted">.reservio.com</span>
              </div>
              {errors.subdomain && <p className="mt-1 text-xs text-rv-danger">{errors.subdomain}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-rv-text">Contact email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="owner@yourhotel.com"
                className={inputClass("email")}
              />
              {errors.email && <p className="mt-1 text-xs text-rv-danger">{errors.email}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-rv-text">Owner full name</label>
              <input
                type="text"
                value={form.ownerName}
                onChange={(e) => set("ownerName", e.target.value)}
                placeholder="Jane Smith"
                className={inputClass("ownerName")}
              />
              {errors.ownerName && <p className="mt-1 text-xs text-rv-danger">{errors.ownerName}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-rv-text">Subscription plan</label>
              <select
                value={form.plan}
                onChange={(e) => set("plan", e.target.value)}
                className={inputClass("plan")}
              >
                {PLANS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-rv-text">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder="Min. 8 characters"
                className={inputClass("password")}
              />
              {errors.password && <p className="mt-1 text-xs text-rv-danger">{errors.password}</p>}
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-lg bg-rv-accent py-2.5 text-sm font-semibold text-white transition hover:bg-rv-accent/90"
            >
              Submit application
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-rv-muted">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-rv-accent hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
