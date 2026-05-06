import { useState } from "react";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import Modal from "../../components/Modal";
import { mockTenants } from "../../data/mockTenants";

const PLANS = ["Basic", "Premium", "Custom"];
const PLAN_BADGE = {
  Basic:   "bg-rv-surface2 text-rv-muted border border-rv-border",
  Premium: "bg-rv-accent-soft text-rv-accent border border-rv-accent/20",
  Custom:  "bg-rv-warning-soft text-rv-warning border border-rv-warning/20",
};

export default function TenantManagement() {
  const [tenants, setTenants] = useState(mockTenants);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [suspendTarget, setSuspendTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState("");

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  const filtered = tenants.filter((t) =>
    (planFilter === "All" || t.plan === planFilter) &&
    (statusFilter === "All" || t.status === statusFilter) &&
    (!search || t.name.toLowerCase().includes(search.toLowerCase()) || t.subdomain.includes(search.toLowerCase())),
  );

  const stats = {
    total:  tenants.length,
    active:  tenants.filter((t) => t.status === "Active").length,
    pending: tenants.filter((t) => t.status === "Pending").length,
    suspended: tenants.filter((t) => t.status === "Suspended").length,
  };

  function changePlan(id, plan) {
    setTenants((t) => t.map((x) => x.id === id ? { ...x, plan } : x));
    showToast("Plan updated.");
  }

  function confirmSuspend() {
    const nextStatus = suspendTarget.status === "Active" ? "Suspended" : "Active";
    setTenants((t) => t.map((x) => x.id === suspendTarget.id ? { ...x, status: nextStatus } : x));
    showToast(`${suspendTarget.name} ${nextStatus === "Suspended" ? "suspended" : "reactivated"}.`);
    setSuspendTarget(null);
  }

  function confirmDelete() {
    setTenants((t) => t.filter((x) => x.id !== deleteTarget.id));
    showToast(`${deleteTarget.name} deleted.`);
    setDeleteTarget(null);
  }

  function approve(id) {
    setTenants((t) => t.map((x) => x.id === id ? { ...x, status: "Active" } : x));
    showToast("Tenant approved.");
  }

  return (
    <div>
      <PageHeader title="Tenant Management" subtitle="Manage hotel accounts across the platform." />

      {/* Stats */}
      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        {Object.entries(stats).map(([label, value]) => (
          <div key={label} className="rounded-xl border border-rv-border bg-rv-surface p-4">
            <p className="text-xs font-semibold capitalize text-rv-muted">{label}</p>
            <p className="mt-1 text-3xl font-bold text-rv-text">{value}</p>
          </div>
        ))}
      </div>

      {toast && (
        <div className="mb-4 rounded-xl border border-rv-success/30 bg-rv-success-soft px-5 py-3 text-sm font-medium text-rv-success">
          {toast}
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tenants…"
          className="rounded-lg border border-rv-border2 bg-rv-surface px-3 py-2 text-sm text-rv-text placeholder:text-rv-subtle outline-none focus:ring-2 focus:ring-rv-accent/40" />
        <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}
          className="rounded-lg border border-rv-border2 bg-rv-surface px-3 py-2 text-sm text-rv-text outline-none focus:ring-2 focus:ring-rv-accent/40">
          <option value="All">All plans</option>
          {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-rv-border2 bg-rv-surface px-3 py-2 text-sm text-rv-text outline-none focus:ring-2 focus:ring-rv-accent/40">
          <option value="All">All statuses</option>
          {["Active", "Pending", "Suspended"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="ml-auto text-xs text-rv-muted">{filtered.length} tenants</span>
      </div>

      <div className="overflow-hidden rounded-xl border border-rv-border bg-rv-surface">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="border-b border-rv-border">
            <tr className="text-xs font-semibold uppercase tracking-wider text-rv-muted">
              {["Hotel", "Subdomain", "Plan", "Status", "Created", "Actions"].map((h) => (
                <th key={h} className="px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-rv-border">
            {filtered.map((tenant) => (
              <tr key={tenant.id} className="transition hover:bg-rv-surface2">
                <td className="px-5 py-3">
                  <p className="font-medium text-rv-text">{tenant.name}</p>
                  <p className="text-xs text-rv-muted">{tenant.ownerEmail}</p>
                </td>
                <td className="px-5 py-3 font-mono text-xs text-rv-muted">{tenant.subdomain}.reservio.com</td>
                <td className="px-5 py-3">
                  <select value={tenant.plan} onChange={(e) => changePlan(tenant.id, e.target.value)}
                    className="rounded-lg border border-rv-border2 bg-rv-bg px-2 py-1 text-xs text-rv-text outline-none focus:ring-1 focus:ring-rv-accent/40">
                    {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </td>
                <td className="px-5 py-3"><StatusBadge status={tenant.status} /></td>
                <td className="px-5 py-3 text-rv-muted">{tenant.createdAt}</td>
                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    {tenant.status === "Pending" && (
                      <button onClick={() => approve(tenant.id)}
                        className="rounded-lg bg-rv-success-soft px-3 py-1.5 text-xs font-semibold text-rv-success hover:bg-rv-success/20">
                        Approve
                      </button>
                    )}
                    <button onClick={() => setSuspendTarget(tenant)}
                      className="rounded-lg border border-rv-border2 px-3 py-1.5 text-xs font-medium text-rv-muted hover:text-rv-text">
                      {tenant.status === "Active" ? "Suspend" : "Activate"}
                    </button>
                    <button onClick={() => setDeleteTarget(tenant)}
                      className="rounded-lg bg-rv-danger-soft px-3 py-1.5 text-xs font-semibold text-rv-danger hover:bg-rv-danger/20">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-rv-muted">No tenants match.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={!!suspendTarget} onClose={() => setSuspendTarget(null)}
        title={suspendTarget?.status === "Active" ? "Suspend Tenant" : "Reactivate Tenant"}>
        <p className="mb-5 text-sm text-rv-muted">
          {suspendTarget?.status === "Active"
            ? `Suspend ${suspendTarget?.name}? Their portal will become inaccessible immediately.`
            : `Reactivate ${suspendTarget?.name}? Their portal will be restored.`}
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setSuspendTarget(null)} className="rounded-lg border border-rv-border2 px-4 py-2 text-sm font-medium text-rv-muted">Cancel</button>
          <button onClick={confirmSuspend}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${
              suspendTarget?.status === "Active" ? "bg-rv-warning hover:bg-rv-warning/90" : "bg-rv-success hover:bg-rv-success/90"
            }`}>
            Confirm
          </button>
        </div>
      </Modal>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Tenant">
        <p className="mb-5 text-sm text-rv-muted">
          Permanently delete <strong className="text-rv-text">{deleteTarget?.name}</strong>? All data will be removed. This cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setDeleteTarget(null)} className="rounded-lg border border-rv-border2 px-4 py-2 text-sm font-medium text-rv-muted">Cancel</button>
          <button onClick={confirmDelete} className="rounded-lg bg-rv-danger px-4 py-2 text-sm font-semibold text-white hover:bg-rv-danger/90">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
