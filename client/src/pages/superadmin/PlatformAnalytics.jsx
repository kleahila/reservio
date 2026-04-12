import { useState, useMemo } from "react";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { mockTenants } from "../../data/mockTenants";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const MRR_DATA = [3920, 4200, 4700, 4500, 5100, 5480];
const TENANT_GROWTH = [8, 9, 11, 11, 13, mockTenants.length];

export default function PlatformAnalytics() {
  const [period, setPeriod] = useState("6m");

  const stats = useMemo(() => ({
    totalTenants:  mockTenants.length,
    activeTenants: mockTenants.filter((t) => t.status === "Active").length,
    mrr:           mockTenants.filter((t) => t.status === "Active").reduce((sum, t) => {
      return sum + (t.plan === "Premium" ? 99 : t.plan === "Custom" ? 249 : 49);
    }, 0),
    pendingApproval: mockTenants.filter((t) => t.status === "Pending").length,
  }), []);

  const maxMrr = Math.max(...MRR_DATA, 1);
  const maxTenants = Math.max(...TENANT_GROWTH, 1);

  return (
    <div>
      <PageHeader
        title="Platform Analytics"
        subtitle="Platform-wide KPIs across all hotel tenants."
        action={
          <div className="flex gap-1">
            {["1m", "3m", "6m"].map((p) => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  period === p ? "bg-rv-accent text-white" : "border border-rv-border2 text-rv-muted hover:text-rv-text"
                }`}>
                {p}
              </button>
            ))}
          </div>
        }
      />

      {/* KPIs */}
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total Tenants",    value: stats.totalTenants },
          { label: "Active Tenants",   value: stats.activeTenants },
          { label: "MRR",              value: `$${stats.mrr.toLocaleString()}` },
          { label: "Pending Approval", value: stats.pendingApproval },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-rv-border bg-rv-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-rv-muted">{label}</p>
            <p className="mt-1 text-3xl font-bold text-rv-text">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* MRR chart */}
        <div className="rounded-xl border border-rv-border bg-rv-surface p-6">
          <h2 className="mb-5 text-sm font-semibold text-rv-text">Monthly Recurring Revenue</h2>
          <div className="flex items-end gap-2" style={{ height: 120 }}>
            {MRR_DATA.map((value, i) => {
              const h = (value / maxMrr) * 100;
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs font-bold text-rv-accent">${(value / 1000).toFixed(1)}k</span>
                  <div className="relative w-full flex-1 overflow-hidden rounded-t-md bg-rv-surface2">
                    <div className="absolute bottom-0 left-0 right-0 rounded-t-md bg-rv-accent transition-all duration-700"
                      style={{ height: `${h}%` }} />
                  </div>
                  <span className="text-xs text-rv-muted">{MONTHS[i]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tenant growth chart */}
        <div className="rounded-xl border border-rv-border bg-rv-surface p-6">
          <h2 className="mb-5 text-sm font-semibold text-rv-text">Tenant Growth</h2>
          <div className="flex items-end gap-2" style={{ height: 120 }}>
            {TENANT_GROWTH.map((value, i) => {
              const h = (value / maxTenants) * 100;
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs font-bold text-rv-success">{value}</span>
                  <div className="relative w-full flex-1 overflow-hidden rounded-t-md bg-rv-surface2">
                    <div className="absolute bottom-0 left-0 right-0 rounded-t-md bg-rv-success transition-all duration-700"
                      style={{ height: `${h}%` }} />
                  </div>
                  <span className="text-xs text-rv-muted">{MONTHS[i]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Plan breakdown */}
      <div className="mt-6 rounded-xl border border-rv-border bg-rv-surface p-5">
        <h2 className="mb-4 text-sm font-semibold text-rv-text">Plan Distribution</h2>
        <div className="space-y-3">
          {["Basic", "Premium", "Custom"].map((plan) => {
            const count = mockTenants.filter((t) => t.plan === plan).length;
            const pct = mockTenants.length > 0 ? Math.round((count / mockTenants.length) * 100) : 0;
            return (
              <div key={plan}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <StatusBadge status={plan.toLowerCase() === "premium" ? "Premium" : plan === "Custom" ? "Pending" : "Active"} />
                  <span className="font-semibold text-rv-text">{count} tenants ({pct}%)</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-rv-surface2">
                  <div className="h-2 rounded-full bg-rv-accent transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
