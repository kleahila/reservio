import { useState, useEffect } from 'react';
import { apiCall } from '../../api/client';

function Kpi({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-rv-border bg-rv-surface p-6">
      <p className="text-sm text-rv-muted">{label}</p>
      <p className="mt-1 text-3xl font-bold text-rv-text">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-rv-muted">{sub}</p>}
    </div>
  );
}

export default function PlatformStatus() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiCall('GET', '/api/admin/status', undefined, true)
      .then((data) => { setStatus(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-16 text-center text-rv-muted">Loading platform status…</div>;

  if (!status) return <div className="py-16 text-center text-rv-muted">Failed to load status.</div>;

  return (
    <div className="px-6 md:px-10 lg:px-16 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-rv-olive-900 dark:text-rv-olive-100">Platform Status</h1>
        <p className="mt-1 text-sm text-rv-muted">Live overview across all tenants.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Active Tenants" value={status.activeTenants} />
        <Kpi label="Reservations Today" value={status.reservationsToday} />
        <Kpi label="Total Users" value={status.totalUsers} />
        <Kpi label="Total Tenants" value={status.tenants?.length ?? '—'} />
      </div>

      {/* Per-tenant table */}
      <section>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-rv-muted">Per-Tenant Breakdown</h2>
        <div className="overflow-x-auto rounded-xl border border-rv-border bg-rv-surface">
          <table className="min-w-full text-sm">
            <thead className="border-b border-rv-border">
              <tr className="text-xs font-semibold uppercase tracking-wide text-rv-muted">
                {['Hotel', 'Subdomain', 'Plan', 'Active', 'Rooms', 'Users', 'Reservations'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-rv-border">
              {(status.tenants || []).map((t) => (
                <tr key={t.id} className="hover:bg-rv-surface2 transition">
                  <td className="px-5 py-3 font-medium text-rv-text">{t.name}</td>
                  <td className="px-5 py-3 font-mono text-xs text-rv-muted">{t.subdomain}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      t.plan === 'PREMIUM'
                        ? 'bg-rv-warning-soft text-rv-warning'
                        : t.plan === 'ENTERPRISE'
                        ? 'bg-rv-sea-50 text-rv-sea-700 dark:bg-rv-sea-900/20 dark:text-rv-sea-300'
                        : 'bg-rv-surface2 text-rv-muted'
                    }`}>
                      {t.plan}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${t.active ? 'bg-rv-olive-50 text-rv-olive-700 dark:bg-rv-olive-900/30 dark:text-rv-olive-300' : 'bg-rv-danger-soft text-rv-danger'}`}>
                      {t.active ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-rv-muted">{t.roomCount ?? t._count?.rooms ?? '—'}</td>
                  <td className="px-5 py-3 text-rv-muted">{t.userCount ?? '—'}</td>
                  <td className="px-5 py-3 text-rv-muted">{t.reservationCount ?? '—'}</td>
                </tr>
              ))}
              {(!status.tenants || status.tenants.length === 0) && (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-rv-muted">No tenants found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
