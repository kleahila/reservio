import { useState } from "react";
import PageHeader from "../../components/PageHeader";
import { mockTenants } from "../../data/mockTenants";

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const PLANS = ["Basic", "Premium", "Custom"];

const inputCls = (err) =>
  `w-full rounded-lg border px-3 py-2.5 text-sm bg-rv-bg text-rv-text placeholder:text-rv-subtle outline-none focus:ring-2 focus:ring-rv-accent/40 ${
    err ? "border-rv-danger" : "border-rv-border2"
  }`;

export default function OnboardHotel() {
  const [tenants, setTenants] = useState(mockTenants);
  const [form, setForm] = useState({ name: "", subdomain: "", email: "", plan: "Basic" });
  const [errors, setErrors] = useState({});
  const [added, setAdded] = useState(null);

  function set(field, value) {
    setForm((f) => {
      const next = { ...f, [field]: value };
      if (field === "name") next.subdomain = slugify(value);
      return next;
    });
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Hotel name is required.";
    if (!form.subdomain.trim()) e.subdomain = "Subdomain is required.";
    else if (tenants.some((t) => t.subdomain === form.subdomain)) e.subdomain = "Subdomain already taken.";
    if (!form.email.includes("@")) e.email = "Valid email is required.";
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const newTenant = {
      id: Math.max(...tenants.map((t) => t.id)) + 1,
      name: form.name,
      subdomain: form.subdomain,
      plan: form.plan,
      status: "Active",
      createdAt: new Date().toISOString().slice(0, 10),
      ownerEmail: form.email,
    };
    setTenants((t) => [...t, newTenant]);
    setAdded(newTenant);
    setForm({ name: "", subdomain: "", email: "", plan: "Basic" });
  }

  return (
    <div>
      <PageHeader title="Onboard Hotel" subtitle="Manually register a new hotel tenant." />

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Form */}
        <div className="rounded-xl border border-rv-border bg-rv-surface p-6">
          <h2 className="mb-5 font-semibold text-rv-text">Hotel details</h2>

          {added && (
            <div className="mb-5 rounded-xl border border-rv-success/30 bg-rv-success-soft px-5 py-3 text-sm font-medium text-rv-success">
              <strong>{added.name}</strong> onboarded successfully.
              <button onClick={() => setAdded(null)} className="ml-3 text-xs text-rv-success/70 hover:text-rv-success">Dismiss</button>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-rv-text">Hotel name</label>
              <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Grand Hotel Tirana" className={inputCls(errors.name)} />
              {errors.name && <p className="mt-1 text-xs text-rv-danger">{errors.name}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-rv-text">Subdomain</label>
              <div className="flex items-center overflow-hidden rounded-lg border border-rv-border2 focus-within:ring-2 focus-within:ring-rv-accent/40">
                <input value={form.subdomain} onChange={(e) => set("subdomain", e.target.value)}
                  placeholder="grandhotel"
                  className="flex-1 bg-rv-bg px-3 py-2.5 text-sm text-rv-text outline-none" />
                <span className="border-l border-rv-border2 bg-rv-surface2 px-3 py-2.5 text-sm text-rv-muted">.reservio.com</span>
              </div>
              {errors.subdomain && <p className="mt-1 text-xs text-rv-danger">{errors.subdomain}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-rv-text">Owner email</label>
              <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="owner@hotel.com" className={inputCls(errors.email)} />
              {errors.email && <p className="mt-1 text-xs text-rv-danger">{errors.email}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-rv-text">Subscription plan</label>
              <select value={form.plan} onChange={(e) => set("plan", e.target.value)} className={inputCls(false)}>
                {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <button type="submit" className="w-full rounded-lg bg-rv-accent py-2.5 text-sm font-semibold text-white hover:bg-rv-accent/90">
              Onboard hotel
            </button>
          </form>
        </div>

        {/* Tenant list */}
        <div>
          <h2 className="mb-4 font-semibold text-rv-text">All Tenants ({tenants.length})</h2>
          <div className="space-y-2">
            {tenants.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-xl border border-rv-border bg-rv-surface px-4 py-3">
                <div>
                  <p className="font-medium text-rv-text">{t.name}</p>
                  <p className="text-xs text-rv-muted">{t.subdomain}.reservio.com &middot; {t.plan}</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  t.status === "Active"    ? "bg-rv-success-soft text-rv-success"  :
                  t.status === "Suspended" ? "bg-rv-danger-soft text-rv-danger"   :
                                             "bg-rv-warning-soft text-rv-warning"
                }`}>{t.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
