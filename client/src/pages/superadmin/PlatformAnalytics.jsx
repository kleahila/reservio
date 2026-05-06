import { useState, useEffect } from 'react';
import PageHeader from '../../components/PageHeader';
import { getStats } from '../../api/superadmin';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

export default function PlatformAnalytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('6m');

  useEffect(() => {
    let cancelled = false;
    getStats()
      .then((data) => { if (!cancelled) { setStats(data); setLoading(false); } })
      .catch((err) => { if (!cancelled) { setError(err.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  const mrrData = stats?.mrrByMonth || stats?.mrr_by_month || [];
  const tenantGrowth = stats?.tenantGrowthByMonth || stats?.tenant_growth_by_month || [];
  const maxMrr = Math.max(...mrrData, 1);
  const maxTenants = Math.max(...tenantGrowth, 1);

  const kpis = stats ? [
    { label: 'Total Tenants',    value: stats.totalTenants ?? stats.total_tenants ?? 0 },
    { label: 'Active Tenants',   value: stats.activeTenants ?? stats.active_tenants ?? 0 },
    { label: 'MRR',              value: `$${(stats.mrr ?? 0).toLocaleString()}` },
    { label: 'Pending Approval', value: stats.pendingApproval ?? stats.pending_approval ?? 0 },
  ] : [];

  return (
    <div>
      <PageHeader
        title="Platform Analytics"
        subtitle="Platform-wide KPIs across all hotel tenants."
        action={
          <div className="flex gap-1">
            {['1m', '3m', '6m'].map((p) => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  period === p ? 'bg-rv-accent text-white' : 'border border-rv-border2 text-rv-muted hover:text-rv-text'
                }`}>
                {p}
              </button>
            ))}
          </div>
        }
      />

      {loading && <div className="py-8 text-center text-rv-muted">Loading platform analytics…</div>}

      {error && (
        <div className="mb-4 rounded-xl border border-rv-danger/20 bg-rv-danger-soft px-5 py-3 text-sm text-rv-danger">
          Failed to load analytics: {error}
        </div>
      )}

      {!loading && !error && stats && (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-4">
            {kpis.map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-rv-border bg-rv-surface p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-rv-muted">{label}</p>
                <p className="mt-1 text-3xl font-bold text-rv-text">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {mrrData.length > 0 && (
              <div className="rounded-xl border border-rv-border bg-rv-surface p-6">
                <h2 className="mb-5 text-sm font-semibold text-rv-text">Monthly Recurring Revenue</h2>
                <div className="flex items-end gap-2" style={{ height: 120 }}>
                  {mrrData.map((value, i) => {
                    const h = (value / maxMrr) * 100;
                    return (
                      <div key={i} className="flex flex-1 flex-col items-center gap-1">
                        <span className="text-xs font-bold text-rv-accent">${(value / 1000).toFixed(1)}k</span>
                        <div className="relative w-full flex-1 overflow-hidden rounded-t-md bg-rv-surface2">
                          <div className="absolute bottom-0 left-0 right-0 rounded-t-md bg-rv-accent transition-all duration-700" style={{ height: `${h}%` }} />
                        </div>
                        <span className="text-xs text-rv-muted">{MONTHS[i] ?? i + 1}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {tenantGrowth.length > 0 && (
              <div className="rounded-xl border border-rv-border bg-rv-surface p-6">
                <h2 className="mb-5 text-sm font-semibold text-rv-text">Tenant Growth</h2>
                <div className="flex items-end gap-2" style={{ height: 120 }}>
                  {tenantGrowth.map((value, i) => {
                    const h = (value / maxTenants) * 100;
                    return (
                      <div key={i} className="flex flex-1 flex-col items-center gap-1">
                        <span className="text-xs font-bold text-rv-success">{value}</span>
                        <div className="relative w-full flex-1 overflow-hidden rounded-t-md bg-rv-surface2">
                          <div className="absolute bottom-0 left-0 right-0 rounded-t-md bg-rv-success transition-all duration-700" style={{ height: `${h}%` }} />
                        </div>
                        <span className="text-xs text-rv-muted">{MONTHS[i] ?? i + 1}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {stats.planDistribution && (
            <div className="mt-6 rounded-xl border border-rv-border bg-rv-surface p-5">
              <h2 className="mb-4 text-sm font-semibold text-rv-text">Plan Distribution</h2>
              <div className="space-y-3">
                {Object.entries(stats.planDistribution).map(([plan, count]) => {
                  const total = Object.values(stats.planDistribution).reduce((a, b) => a + b, 0);
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={plan}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium text-rv-text">{plan}</span>
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
          )}
        </>
      )}
    </div>
  );
}
