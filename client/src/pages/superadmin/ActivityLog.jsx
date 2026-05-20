import { useState, useEffect, useCallback } from 'react';
import { getSuperAdminActivityLog } from '../../api/activityLog';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function MetadataCell({ metadata }) {
  if (!metadata || metadata === '{}') return '—';
  try {
    const parsed = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
    const entries = Object.entries(parsed);
    if (entries.length === 0) return '—';
    return (
      <div className="flex flex-wrap gap-1">
        {entries.map(([k, v]) => (
          <span key={k} className="inline-flex items-center gap-1 bg-rv-surface2 rounded px-1.5 py-0.5">
            <span className="text-rv-muted">{k}:</span>
            <span className="font-medium text-rv-text">{String(v)}</span>
          </span>
        ))}
      </div>
    );
  } catch {
    return <span className="truncate">{String(metadata)}</span>;
  }
}

export default function SuperAdminActivityLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('');
  const [filterTenant, setFilterTenant] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const load = useCallback(() => {
    getSuperAdminActivityLog()
      .then((data) => { setLogs(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const visible = logs.filter((l) => {
    if (filterAction && !l.action.toLowerCase().includes(filterAction.toLowerCase())) return false;
    if (filterTenant && l.tenantId !== filterTenant) return false;
    if (filterDate && !l.createdAt.startsWith(filterDate)) return false;
    return true;
  });

  const actionTypes = [...new Set(logs.map((l) => l.action))].sort();
  const tenants = [...new Set(logs.map((l) => l.tenantId).filter(Boolean))].sort();

  const clearAll = () => { setFilterAction(''); setFilterTenant(''); setFilterDate(''); };
  const hasFilter = filterAction || filterTenant || filterDate;

  return (
    <div className="px-6 md:px-10 lg:px-16 py-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-rv-olive-900 dark:text-rv-olive-100">Platform Activity Log</h1>
          <p className="mt-1 text-sm text-rv-muted">Last 200 actions across all tenants. Auto-refreshes every 30s.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 text-sm">
          <label className="font-medium text-rv-text">Action</label>
          <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)} className="rounded-lg border border-rv-border2 bg-rv-surface px-3 py-1.5 text-sm text-rv-text outline-none">
            <option value="">All</option>
            {actionTypes.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <label className="font-medium text-rv-text">Tenant</label>
          <select value={filterTenant} onChange={(e) => setFilterTenant(e.target.value)} className="rounded-lg border border-rv-border2 bg-rv-surface px-3 py-1.5 text-sm text-rv-text outline-none">
            <option value="">All</option>
            {tenants.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <label className="font-medium text-rv-text">Date</label>
          <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="rounded-lg border border-rv-border2 bg-rv-surface px-3 py-1.5 text-sm text-rv-text outline-none" />
        </div>
        {hasFilter && (
          <button onClick={clearAll} className="text-sm text-rv-muted hover:text-rv-text">Clear filters</button>
        )}
      </div>

      {loading && <div className="py-8 text-center text-rv-muted">Loading…</div>}

      {!loading && (
        <div className="overflow-x-auto rounded-xl border border-rv-border bg-rv-surface">
          <table className="min-w-full text-sm">
            <thead className="border-b border-rv-border">
              <tr className="text-xs font-semibold uppercase tracking-wide text-rv-muted">
                {['Timestamp', 'Tenant', 'Action', 'Entity', 'Details'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-rv-border">
              {visible.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-rv-muted">No log entries found.</td></tr>
              ) : visible.map((log) => (
                <tr key={log.id} className="hover:bg-rv-surface2 transition">
                  <td className="px-5 py-3 text-rv-muted whitespace-nowrap">{formatDate(log.createdAt)}</td>
                  <td className="px-5 py-3 font-mono text-xs text-rv-muted">{log.tenantId ?? '—'}</td>
                  <td className="px-5 py-3 font-mono text-xs text-rv-text">{log.action}</td>
                  <td className="px-5 py-3">
                    <span className="font-medium text-rv-text">{log.entity ?? '—'}</span>
                    {log.entityId ? (
                      <span className="ml-1 font-mono text-[10px] text-rv-muted bg-rv-surface2 px-1 py-0.5 rounded">
                        #{log.entityId.slice(-6)}
                      </span>
                    ) : ''}
                  </td>
                  <td className="px-5 py-3 text-xs max-w-[280px]">
                    <MetadataCell metadata={log.metadata} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}