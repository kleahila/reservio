import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../../components/StatusBadge";
import Modal from "../../components/Modal";
import Button from "../../components/Button";
import Toast from "../../components/Toast";
import { tenants } from "../../data/tenants";

const PLANS = ["Basic", "Premium", "Custom"];

const PLAN_STYLES = {
  Basic: "bg-slate-100 text-slate-700 border border-slate-200",
  Premium: "bg-blue-100 text-blue-800 border border-blue-200",
  Custom: "bg-amber-100 text-amber-800 border border-amber-200",
};

function PlanBadge({ plan }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${PLAN_STYLES[plan] || "bg-slate-100 text-slate-700"}`}
    >
      {plan}
    </span>
  );
}

function Initials({ name }) {
  const parts = name.trim().split(" ");
  const letters = parts.length >= 2
    ? parts[0][0] + parts[1][0]
    : name.slice(0, 2);
  const colors = [
    "bg-blue-500", "bg-purple-500", "bg-green-600",
    "bg-orange-500", "bg-pink-500", "bg-teal-500",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${color}`}>
      {letters.toUpperCase()}
    </div>
  );
}

function StatPill({ label, count, color }) {
  return (
    <div className={`flex items-center gap-2 rounded-lg px-4 py-2.5 ${color}`}>
      <span className="text-2xl font-bold">{count}</span>
      <span className="text-sm font-medium opacity-80">{label}</span>
    </div>
  );
}

function TenantManagement() {
  const [tenantList, setTenantList] = useState(tenants);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [suspendTarget, setSuspendTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [planTarget, setPlanTarget] = useState(null);

  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const showToast = (message, type = "success") => setToast({ message, type });

  const filtered = tenantList.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.subdomain.toLowerCase().includes(search.toLowerCase());
    const matchPlan = planFilter === "All" || t.plan === planFilter;
    const matchStatus = statusFilter === "All" || t.status === statusFilter;
    return matchSearch && matchPlan && matchStatus;
  });

  const counts = {
    Active: tenantList.filter((t) => t.status === "Active").length,
    Pending: tenantList.filter((t) => t.status === "Pending").length,
    Suspended: tenantList.filter((t) => t.status === "Suspended").length,
  };

  function handleApprove(id) {
    setTenantList((p) => p.map((t) => t.id === id ? { ...t, status: "Active" } : t));
    showToast("Tenant approved and activated.");
  }

  function handleSuspendConfirm() {
    setTenantList((p) =>
      p.map((t) => t.id === suspendTarget.id ? { ...t, status: "Suspended" } : t),
    );
    showToast(`${suspendTarget.name} suspended.`, "error");
    setSuspendTarget(null);
  }

  function handleDeleteConfirm() {
    setTenantList((p) => p.filter((t) => t.id !== deleteTarget.id));
    showToast(`${deleteTarget.name} permanently deleted.`, "error");
    setDeleteTarget(null);
  }

  function handlePlanChange(tenant, newPlan) {
    if (newPlan === tenant.plan) return;
    setPlanTarget({ tenant, newPlan });
  }

  function handlePlanConfirm() {
    const { tenant, newPlan } = planTarget;
    setTenantList((p) =>
      p.map((t) => t.id === tenant.id ? { ...t, plan: newPlan } : t),
    );
    showToast(`${tenant.name} moved to ${newPlan} plan.`);
    setPlanTarget(null);
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Tenant Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage hotel tenants, plans, and access.
          </p>
        </div>
        <button
          onClick={() => navigate("/superadmin/onboard")}
          className="flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-accent"
        >
          <span>+</span> Onboard New Hotel
        </button>
      </div>

      {/* Stat pills */}
      <div className="mb-6 flex flex-wrap gap-3">
        <StatPill label="Active" count={counts.Active} color="bg-green-50 text-green-800" />
        <StatPill label="Pending" count={counts.Pending} color="bg-amber-50 text-amber-800" />
        <StatPill label="Suspended" count={counts.Suspended} color="bg-orange-50 text-orange-800" />
        <StatPill label="Total" count={tenantList.length} color="bg-slate-100 text-slate-700" />
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="Search name or subdomain…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
          />
        </div>
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
        >
          <option value="All">All Plans</option>
          {PLANS.map((p) => <option key={p}>{p}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
        >
          <option value="All">All Statuses</option>
          <option>Active</option>
          <option>Pending</option>
          <option>Suspended</option>
        </select>
        {(search || planFilter !== "All" || statusFilter !== "All") && (
          <button
            onClick={() => { setSearch(""); setPlanFilter("All"); setStatusFilter("All"); }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 hover:bg-slate-50"
          >
            ✕ Clear
          </button>
        )}
        <span className="ml-auto self-center text-xs text-slate-400">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-5 py-3">Hotel</th>
              <th className="px-5 py-3">Subdomain</th>
              <th className="px-5 py-3">Plan</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Created</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center">
                  <p className="text-3xl">🏨</p>
                  <p className="mt-2 text-sm text-slate-400">No tenants match your filters.</p>
                </td>
              </tr>
            ) : (
              filtered.map((tenant) => (
                <tr key={tenant.id} className="group transition hover:bg-slate-50">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Initials name={tenant.name} />
                      <div>
                        <p className="font-semibold text-slate-800">{tenant.name}</p>
                        <p className="text-xs text-slate-400">ID #{tenant.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-600">
                      {tenant.subdomain}.reservio.com
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <PlanBadge plan={tenant.plan} />
                      <select
                        value={tenant.plan}
                        onChange={(e) => handlePlanChange(tenant, e.target.value)}
                        className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-xs text-slate-500 opacity-0 transition group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-1 focus:ring-brand-accent"
                        title="Change plan"
                      >
                        {PLANS.map((p) => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={tenant.status} />
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">{tenant.createdAt}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1.5">
                      {tenant.status === "Pending" && (
                        <button
                          onClick={() => handleApprove(tenant.id)}
                          className="rounded-md bg-green-600 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-green-700"
                        >
                          ✓ Approve
                        </button>
                      )}
                      {tenant.status === "Active" && (
                        <button
                          onClick={() => setSuspendTarget(tenant)}
                          className="rounded-md bg-orange-500 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-orange-600"
                        >
                          ⏸ Suspend
                        </button>
                      )}
                      {tenant.status === "Suspended" && (
                        <button
                          onClick={() => handleApprove(tenant.id)}
                          className="rounded-md bg-green-600 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-green-700"
                        >
                          ▶ Reactivate
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteTarget(tenant)}
                        className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-600 hover:text-white"
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Suspend Modal */}
      <Modal isOpen={!!suspendTarget} onClose={() => setSuspendTarget(null)} title="Suspend Tenant">
        <div className="mb-5 rounded-lg bg-orange-50 p-4 text-sm text-orange-800">
          <p className="font-semibold">⚠️ This will suspend access</p>
          <p className="mt-1">
            <span className="font-semibold">{suspendTarget?.name}</span>'s portal will become
            inaccessible to all users until reactivated.
          </p>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setSuspendTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleSuspendConfirm}>Suspend Tenant</Button>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Tenant">
        <div className="mb-5 rounded-lg bg-red-50 p-4 text-sm text-red-800">
          <p className="font-semibold">⛔ This action cannot be undone</p>
          <p className="mt-1">
            Permanently delete <span className="font-semibold">{deleteTarget?.name}</span> and all
            associated data?
          </p>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>Delete Permanently</Button>
        </div>
      </Modal>

      {/* Change Plan Modal */}
      <Modal isOpen={!!planTarget} onClose={() => setPlanTarget(null)} title="Change Subscription Plan">
        <div className="mb-2 text-sm text-slate-600">
          You are changing the plan for{" "}
          <span className="font-semibold">{planTarget?.tenant.name}</span>:
        </div>
        <div className="mb-5 flex items-center gap-3 rounded-lg bg-slate-50 p-4">
          <PlanBadge plan={planTarget?.tenant.plan} />
          <span className="text-slate-400">→</span>
          <PlanBadge plan={planTarget?.newPlan} />
          <span className="ml-auto text-xs text-slate-400">Feature access updates immediately</span>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setPlanTarget(null)}>Cancel</Button>
          <Button onClick={handlePlanConfirm}>Confirm Change</Button>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default TenantManagement;
