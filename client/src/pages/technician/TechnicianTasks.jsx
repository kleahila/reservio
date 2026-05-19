import { useState, useEffect } from 'react';
import { getMyMaintenanceTasks, updateMaintenanceStatus } from '../../api/maintenance';

const CATEGORY_BADGE = {
  LIGHTS:   'bg-rv-warning-soft text-rv-warning border border-rv-warning/30',
  PLUMBING: 'bg-rv-sea-50 text-rv-sea-700 border border-rv-sea-200 dark:bg-rv-sea-900/20 dark:text-rv-sea-300',
  CLEANING: 'bg-rv-olive-50 text-rv-olive-700 border border-rv-olive-200/60 dark:bg-rv-olive-900/20 dark:text-rv-olive-300',
  OTHER:    'bg-rv-surface2 text-rv-muted border border-rv-border',
};

const STATUS_BADGE = {
  OPEN:        'bg-rv-danger-soft text-rv-danger',
  IN_PROGRESS: 'bg-rv-warning-soft text-rv-warning',
  RESOLVED:    'bg-rv-olive-50 text-rv-olive-700 dark:bg-rv-olive-900/30 dark:text-rv-olive-300',
};

export default function TechnicianTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [working, setWorking] = useState(null);
  const [toast, setToast] = useState('');

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  useEffect(() => {
    getMyMaintenanceTasks()
      .then((data) => { setTasks(data || []); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, []);

  async function handleStatus(id, status) {
    setWorking(id);
    try {
      const updated = await updateMaintenanceStatus(id, status);
      setTasks((prev) => prev.map((t) => t.id === id ? { ...t, ...updated } : t));
      showToast(status === 'RESOLVED' ? 'Task resolved!' : 'Status updated.');
    } catch (err) {
      setError(err.message);
    } finally {
      setWorking(null);
    }
  }

  return (
    <div className="px-6 md:px-10 lg:px-16 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-rv-olive-900 dark:text-rv-olive-100">My Maintenance Tasks</h1>
        <p className="mt-1 text-sm text-rv-muted">Work requests assigned to you.</p>
      </div>

      {toast && (
        <div className="rounded-xl border border-rv-olive-300/50 bg-rv-olive-50 dark:bg-rv-olive-900/20 px-5 py-3 text-sm font-medium text-rv-olive-700 dark:text-rv-olive-300">
          {toast}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rv-danger/20 bg-rv-danger-soft px-5 py-3 text-sm text-rv-danger">{error}</div>
      )}

      {loading && <div className="py-8 text-center text-rv-muted">Loading tasks…</div>}

      {!loading && tasks.length === 0 && (
        <div className="rounded-xl border border-rv-border bg-rv-surface p-12 text-center text-rv-muted">
          No tasks assigned to you.
        </div>
      )}

      {!loading && tasks.length > 0 && (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="rounded-xl border border-rv-border bg-rv-surface p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-rv-text">
                      {task.room?.type} — Room {task.room?.description}
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${CATEGORY_BADGE[task.category] ?? CATEGORY_BADGE.OTHER}`}>
                      {task.category}
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE[task.status] ?? 'bg-rv-surface2 text-rv-muted'}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-rv-text">{task.issue}</p>
                  <p className="text-xs text-rv-muted">
                    Reported {new Date(task.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  {task.status === 'OPEN' && (
                    <button
                      onClick={() => handleStatus(task.id, 'IN_PROGRESS')}
                      disabled={working === task.id}
                      className="rounded-lg bg-rv-warning-soft border border-rv-warning/40 px-4 py-2 text-xs font-semibold text-rv-warning hover:bg-rv-warning/20 disabled:opacity-50"
                    >
                      Start Work
                    </button>
                  )}
                  {task.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleStatus(task.id, 'RESOLVED')}
                      disabled={working === task.id}
                      className="rounded-lg bg-rv-olive-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rv-olive-700 disabled:opacity-50"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
