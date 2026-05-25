import { useState, useEffect } from 'react';
import { apiCall } from '../../api/client';
import { getMaintenanceRequests } from '../../api/maintenance';
import { getActivityLog } from '../../api/activityLog';
import { getTasks as getHousekeepingTasks } from '../../api/housekeeping';

function formatTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function formatMetadata(raw) {
  if (!raw) return '—';
  try {
    const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const entries = Object.entries(obj).filter(([, v]) => v !== null && v !== undefined && v !== '');
    if (entries.length === 0) return '—';
    return entries
      .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
      .join(', ');
  } catch {
    return String(raw);
  }
}

const STATUS_CLS = {
  AVAILABLE:   'bg-rv-olive-50 text-rv-olive-700 dark:bg-rv-olive-900/30 dark:text-rv-olive-300',
  OCCUPIED:    'bg-rv-sea-50 text-rv-sea-700 dark:bg-rv-sea-900/20 dark:text-rv-sea-300',
  MAINTENANCE: 'bg-rv-warning-soft text-rv-warning',
};

const TASK_CLS = {
  PENDING:     'bg-rv-warning-soft text-rv-warning',
  IN_PROGRESS: 'bg-rv-sea-50 text-rv-sea-700 dark:bg-rv-sea-900/20 dark:text-rv-sea-300',
  DONE:        'bg-rv-olive-50 text-rv-olive-700 dark:bg-rv-olive-900/30 dark:text-rv-olive-300',
};

const REQ_STATUS_CLS = {
  OPEN:        'bg-rv-danger-soft text-rv-danger',
  IN_PROGRESS: 'bg-rv-warning-soft text-rv-warning',
  RESOLVED:    'bg-rv-olive-50 text-rv-olive-700 dark:bg-rv-olive-900/30 dark:text-rv-olive-300',
};

export default function CommandCenter() {
  const [rooms, setRooms] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  function loadAll() {
    Promise.all([
      apiCall('GET', '/api/rooms', undefined, true),
      getHousekeepingTasks(),
      getMaintenanceRequests(),
      getActivityLog(),
    ])
      .then(([r, t, m, l]) => {
        setRooms(r || []);
        setTasks(t || []);
        setMaintenance(m || []);
        setLogs(l || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    loadAll();
    const interval = setInterval(() => {
      getActivityLog().then((l) => setLogs(l || [])).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const pendingTasks = tasks.filter((t) => t.status !== 'DONE');
  const openMaintenance = maintenance.filter((m) => m.status !== 'RESOLVED');
  const todayLogs = logs.filter((l) => {
    const d = new Date(l.createdAt);
    const today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  });

  const roomsByStatus = rooms.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  if (loading) return <div className="py-16 text-center text-rv-muted">Loading command center…</div>;

  return (
    <div className="px-6 md:px-10 lg:px-16 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-rv-olive-900 dark:text-rv-olive-100">Command Center</h1>
        <p className="mt-1 text-sm text-rv-muted">Live snapshot of your property.</p>
      </div>

      {/* Room Status Summary */}
      <section>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-rv-muted">Room Status</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Available', key: 'AVAILABLE', cls: STATUS_CLS.AVAILABLE },
            { label: 'Occupied', key: 'OCCUPIED', cls: STATUS_CLS.OCCUPIED },
            { label: 'Maintenance', key: 'MAINTENANCE', cls: STATUS_CLS.MAINTENANCE },
          ].map(({ label, key, cls }) => (
            <div key={key} className={`rounded-xl border border-rv-border p-5 ${cls} bg-opacity-30`}>
              <p className="text-3xl font-bold">{roomsByStatus[key] ?? 0}</p>
              <p className="mt-1 text-sm font-medium">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-rv-border bg-rv-surface overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead className="border-b border-rv-border">
              <tr className="text-xs font-semibold uppercase tracking-wide text-rv-muted">
                <th className="px-4 py-2 text-left">Room</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rv-border">
              {rooms.map((r) => (
                <tr key={r.id} className="hover:bg-rv-surface2">
                  <td className="px-4 py-2 font-mono text-rv-muted">{r.description}</td>
                  <td className="px-4 py-2 text-rv-text">{r.type}</td>
                  <td className="px-4 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_CLS[r.status] ?? 'bg-rv-surface2 text-rv-muted'}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Housekeeping Queue */}
      <section>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-rv-muted">
          Housekeeping Queue <span className="normal-case font-normal text-rv-muted">({pendingTasks.length} pending)</span>
        </h2>
        {pendingTasks.length === 0 ? (
          <div className="rounded-xl border border-rv-border bg-rv-surface p-6 text-center text-sm text-rv-muted">
            All housekeeping tasks completed.
          </div>
        ) : (
          <div className="rounded-xl border border-rv-border bg-rv-surface overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="border-b border-rv-border">
                <tr className="text-xs font-semibold uppercase tracking-wide text-rv-muted">
                  <th className="px-4 py-2 text-left">Room</th>
                  <th className="px-4 py-2 text-left">Priority</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Assigned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rv-border">
                {pendingTasks.slice(0, 6).map((t) => (
                  <tr key={t.id} className="hover:bg-rv-surface2">
                    <td className="px-4 py-2 font-mono text-rv-muted">{t.room?.description ?? '—'}</td>
                    <td className="px-4 py-2 text-rv-text">{t.priority}</td>
                    <td className="px-4 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${TASK_CLS[t.status] ?? 'bg-rv-surface2 text-rv-muted'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-rv-muted">{t.assignedTo?.fullName ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Maintenance Queue */}
      <section>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-rv-muted">
          Maintenance Queue <span className="normal-case font-normal text-rv-muted">({openMaintenance.length} open)</span>
        </h2>
        {openMaintenance.length === 0 ? (
          <div className="rounded-xl border border-rv-border bg-rv-surface p-6 text-center text-sm text-rv-muted">
            No open maintenance requests.
          </div>
        ) : (
          <div className="rounded-xl border border-rv-border bg-rv-surface overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="border-b border-rv-border">
                <tr className="text-xs font-semibold uppercase tracking-wide text-rv-muted">
                  <th className="px-4 py-2 text-left">Room</th>
                  <th className="px-4 py-2 text-left">Issue</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Assigned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rv-border">
                {openMaintenance.slice(0, 6).map((m) => (
                  <tr key={m.id} className="hover:bg-rv-surface2">
                    <td className="px-4 py-2 font-mono text-rv-muted">{m.room?.description ?? '—'}</td>
                    <td className="px-4 py-2 text-rv-text max-w-[200px] truncate">{m.issue}</td>
                    <td className="px-4 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${REQ_STATUS_CLS[m.status] ?? 'bg-rv-surface2 text-rv-muted'}`}>
                        {m.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-rv-muted">{m.assignedTo?.fullName ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Today's Activity */}
      <section>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-rv-muted">
          Today's Activity <span className="normal-case font-normal text-rv-muted">({todayLogs.length} events)</span>
        </h2>
        {todayLogs.length === 0 ? (
          <div className="rounded-xl border border-rv-border bg-rv-surface p-6 text-center text-sm text-rv-muted">
            No activity logged today.
          </div>
        ) : (
          <div className="rounded-xl border border-rv-border bg-rv-surface overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="border-b border-rv-border">
                <tr className="text-xs font-semibold uppercase tracking-wide text-rv-muted">
                  <th className="px-4 py-2 text-left">Time</th>
                  <th className="px-4 py-2 text-left">Action</th>
                  <th className="px-4 py-2 text-left">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rv-border">
                {todayLogs.slice(0, 8).map((l) => (
                  <tr key={l.id} className="hover:bg-rv-surface2">
                    <td className="px-4 py-2 text-rv-muted whitespace-nowrap">{formatTime(l.createdAt)}</td>
                    <td className="px-4 py-2 font-mono text-rv-text">{l.action}</td>
                    <td className="px-4 py-2 text-rv-muted max-w-[240px] truncate">{formatMetadata(l.metadata)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Live Feed */}
      <section>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-rv-muted">Live Feed</h2>
        <div className="rounded-xl border border-rv-border bg-rv-surface p-4 space-y-2 max-h-48 overflow-y-auto">
          {logs.slice(0, 15).map((l) => (
            <div key={l.id} className="flex items-start gap-3 text-xs">
              <span className="shrink-0 text-rv-subtle whitespace-nowrap">{formatTime(l.createdAt)}</span>
              <span className="font-mono text-rv-text">{l.action}</span>
              {l.entity && <span className="text-rv-muted">{l.entity}</span>}
            </div>
          ))}
          {logs.length === 0 && <p className="text-center text-rv-muted">No activity yet.</p>}
        </div>
      </section>
    </div>
  );
}
