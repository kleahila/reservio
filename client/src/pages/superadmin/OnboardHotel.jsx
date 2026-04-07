import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import Toast from "../../components/Toast";
import StatusBadge from "../../components/StatusBadge";
import { tenants as initialTenants } from "../../data/tenants";

const PLANS = [
  { name: "Basic", price: "$49/mo", desc: "Up to 25 rooms" },
  { name: "Premium", price: "$99/mo", desc: "Up to 80 rooms + analytics" },
  { name: "Custom", price: "Contact us", desc: "Unlimited + white-label" },
];

const PLAN_STYLES = {
  Basic: "border-slate-300 bg-white",
  Premium: "border-blue-400 bg-blue-50",
  Custom: "border-amber-400 bg-amber-50",
};
const PLAN_BADGE = {
  Basic: "bg-slate-100 text-slate-700",
  Premium: "bg-blue-100 text-blue-800",
  Custom: "bg-amber-100 text-amber-800",
};

function toSubdomain(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 30);
}

function OnboardHotel() {
  const navigate = useNavigate();
  const [tenantList, setTenantList] = useState(initialTenants);
  const [form, setForm] = useState({ name: "", subdomain: "", plan: "Basic" });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [manualSubdomain, setManualSubdomain] = useState(false);
  const [submitted, setSubmitted] = useState([]);

  useEffect(() => {
    if (!manualSubdomain) {
      setForm((p) => ({ ...p, subdomain: toSubdomain(p.name) }));
    }
  }, [form.name, manualSubdomain]);

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = "Hotel name is required.";
    if (!form.subdomain) {
      errs.subdomain = "Subdomain is required.";
    } else if (!/^[a-z0-9]+$/.test(form.subdomain)) {
      errs.subdomain = "Lowercase letters and numbers only — no spaces or symbols.";
    } else if (tenantList.some((t) => t.subdomain === form.subdomain)) {
      errs.subdomain = `"${form.subdomain}" is already taken.`;
    }
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const newTenant = {
      id: Date.now(),
      name: form.name.trim(),
      subdomain: form.subdomain,
      plan: form.plan,
      status: "Active",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setTenantList((p) => [...p, newTenant]);
    setSubmitted((p) => [newTenant, ...p]);
    setToast({ message: `✓ ${form.name.trim()} onboarded at ${form.subdomain}.reservio.com`, type: "success" });
    setForm({ name: "", subdomain: "", plan: "Basic" });
    setManualSubdomain(false);
    setErrors({});
  }

  const preview = form.name.trim()
    ? { ...form, status: "Active", createdAt: new Date().toISOString().slice(0, 10) }
    : null;

  const subdomainOk = form.subdomain && /^[a-z0-9]+$/.test(form.subdomain) &&
    !tenantList.some((t) => t.subdomain === form.subdomain);

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Onboard New Hotel</h1>
          <p className="mt-1 text-sm text-slate-500">
            Register a new tenant on the Reservio platform.
          </p>
        </div>
        <button
          onClick={() => navigate("/superadmin/tenants")}
          className="text-sm text-brand-accent hover:underline"
        >
          ← All Tenants
        </button>
      </div>

      {/* Plan selection */}
      <div className="mb-6">
        <p className="mb-3 text-sm font-semibold text-slate-600">Choose a Plan</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {PLANS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, plan: p.name }))}
              className={`rounded-xl border-2 p-4 text-left transition hover:shadow-md ${
                form.plan === p.name
                  ? `${PLAN_STYLES[p.name]} shadow-sm ring-2 ring-brand-accent`
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${PLAN_BADGE[p.name]}`}>
                {p.name}
              </span>
              <p className="mt-2 text-base font-bold text-slate-800">{p.price}</p>
              <p className="text-xs text-slate-500">{p.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            Hotel Name <span className="text-red-500">*</span>
          </label>
          <input type="text" value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Grand Hotel Tirana"
            className={`w-full rounded-lg border px-3.5 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-accent ${errors.name ? "border-red-400 bg-red-50" : "border-slate-300"}`}
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">⚠ {errors.name}</p>}
        </div>

        <div className="mb-6">
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            Subdomain <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center overflow-hidden rounded-lg border border-slate-300 shadow-sm focus-within:ring-2 focus-within:ring-brand-accent">
            <input type="text" value={form.subdomain}
              onChange={(e) => {
                setManualSubdomain(true);
                setForm((p) => ({
                  ...p,
                  subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ""),
                }));
              }}
              placeholder="grandhotel"
              className={`flex-1 bg-transparent px-3.5 py-2.5 font-mono text-sm focus:outline-none ${errors.subdomain ? "bg-red-50" : ""}`}
            />
            <span className="border-l border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-400">
              .reservio.com
            </span>
            {subdomainOk && (
              <span className="px-3 text-green-500">✓</span>
            )}
          </div>
          {errors.subdomain && <p className="mt-1 text-xs text-red-500">⚠ {errors.subdomain}</p>}
          {!errors.subdomain && form.subdomain && (
            <p className="mt-1 text-xs text-slate-400">
              Auto-generated from name — you can edit it.
            </p>
          )}
        </div>

        <Button type="submit">🚀 Onboard Hotel</Button>
      </form>

      {/* Live Preview */}
      {preview && (
        <div className="mt-5 rounded-xl border border-dashed border-brand-accent bg-brand-light p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Preview
          </p>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div>
              <p className="font-semibold text-slate-800">{preview.name || "Hotel Name"}</p>
              <p className="font-mono text-xs text-slate-400">
                {preview.subdomain || "subdomain"}.reservio.com
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${PLAN_BADGE[preview.plan]}`}>
                {preview.plan}
              </span>
              <StatusBadge status="Active" />
              <span className="text-xs text-slate-400">{preview.createdAt}</span>
            </div>
          </div>
        </div>
      )}

      {/* Successfully onboarded this session */}
      {submitted.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            ✓ Onboarded this session
          </p>
          <div className="space-y-2">
            {submitted.map((t) => (
              <div key={t.id}
                className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                <div>
                  <p className="font-semibold text-green-900">{t.name}</p>
                  <p className="font-mono text-xs text-green-600">{t.subdomain}.reservio.com</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${PLAN_BADGE[t.plan]}`}>
                    {t.plan}
                  </span>
                  <button
                    onClick={() => navigate("/superadmin/tenants")}
                    className="text-xs text-green-700 underline"
                  >
                    View →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default OnboardHotel;
