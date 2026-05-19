import { useState, useEffect, useCallback } from 'react';
import { getActivityLog } from '../../api/activityLog';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const load = useCallback(() => {
    getActivityLog()
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
    if (filterDate && !l.createdAt.startsWith(filterDate)) return false;
    return true;
  });

  const actionTypes = [...new Set(logs.map((l) => l.action))].sort();

  return (
    <div className="px-6 md:px-10 lg:px-16 py-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-rv-olive-900 dark:text-rv-olive-100">Activity Log</h1>
          <p className="mt-1 text-sm text-rv-muted">Last 100 actions for this property. Auto-refreshes every 30s.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 text-sm">
          <label className="font-medium text-rv-text">Action</label>
          <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)} className="rounded-lg border border-rv-border2 bg-rv-surface px-3 py-1.5 text-sm text-rv-text outline-none">
            <option value="">All</option>
            {actionTypes.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <label className="font-medium text-rv-text">Date</label>
          <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="rounded-lg border border-rv-border2 bg-rv-surface px-3 py-1.5 text-sm text-rv-text outline-none" />
        </div>
        {(filterAction || filterDate) && (
          <button onClick={() => { setFilterAction(''); setFilterDate(''); }} className="text-sm text-rv-muted hover:text-rv-text">Clear filters</button>
        )}
      </div>

      {loading && <div className="py-8 text-center text-rv-muted">Loading…</div>}

      {!loading && (
        <div className="overflow-x-auto rounded-xl border border-rv-border bg-rv-surface">
          <table className="min-w-full text-sm">
            <thead className="border-b border-rv-border">
              <tr className="text-xs font-semibold uppercase tracking-wide text-rv-muted">
                {['Timestamp', 'Action', 'Entity', 'Details'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-rv-border">
              {visible.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-rv-muted">No log entries found.</td></tr>
              ) : visible.map((log) => (
                <tr key={log.id} className="hover:bg-rv-surface2 transition">
                  <td className="px-5 py-3 text-rv-muted whitespace-nowrap">{formatDate(log.createdAt)}</td>
                  <td className="px-5 py-3 font-mono text-xs text-rv-text">{log.action}</td>
                  <td className="px-5 py-3 text-rv-muted">{log.entity ?? '—'} {log.entityId ? <span className="font-mono text-[10px]">…{log.entityId.slice(-6)}</span> : ''}</td>
                  <td className="px-5 py-3 text-rv-muted text-xs max-w-[300px] truncate">{log.metadata ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
