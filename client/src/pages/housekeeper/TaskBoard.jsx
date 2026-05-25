import { useState, useEffect } from 'react';
import { getTasks, completeTask, markUrgent } from '../../api/housekeeping';

const URGENCY_BADGE = {
  true:  'bg-rv-danger-soft text-rv-danger border border-rv-danger/30',
  false: 'bg-rv-surface2 text-rv-muted border border-rv-border',
};

const STATUS_BADGE = {
  PENDING:   'bg-rv-warning-soft text-rv-warning',
  COMPLETED: 'bg-rv-olive-50 text-rv-olive-700 dark:bg-rv-olive-900/30 dark:text-rv-olive-300',
};

function getFloor(roomDesc) {
  const num = parseInt(roomDesc, 10);
  if (isNaN(num)) return '—';
  return Math.floor(num / 100) || 1;
}

export default function TaskBoard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState('');
  const [working, setWorking] = useState(null);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  function load() {
    return getTasks()
      .then((data) => { setTasks(data || []); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }

  useEffect(() => { load(); }, []);

  async function handleComplete(id) {
    setWorking(id);
    try {
      await completeTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      showToast('Room marked as cleaned.');
    } catch (err) {
      setError(err.message);
    } finally {
      setWorking(null);
    }
  }

  async function handleUrgent(id) {
    setWorking(id);
    try {
      await markUrgent(id);
      await load();
      showToast('Task marked urgent.');
    } catch (err) {
      setError(err.message);
    } finally {
      setWorking(null);
    }
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="px-6 md:px-10 lg:px-16 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-rv-text">My Schedule</h1>
        <p className="mt-1 text-sm text-rv-muted">{today}</p>
      </div>

      {toast && (
        <div className="rounded-xl border border-rv-success/30 bg-rv-success-soft px-5 py-3 text-sm font-medium text-rv-success">
          {toast}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rv-danger/20 bg-rv-danger-soft px-5 py-3 text-sm text-rv-danger">{error}</div>
      )}

      {loading && <div className="py-8 text-center text-rv-muted">Loading tasks…</div>}

      {!loading && !error && tasks.length === 0 && (
        <div className="rounded-xl border border-rv-border bg-rv-surface p-12 text-center text-rv-muted">
          No tasks scheduled for today.
        </div>
      )}

      {!loading && !error && tasks.length > 0 && (
        <div className="space-y-4">
          {tasks.map((task) => {
            const roomNum = task.room?.description ?? task.roomId;
            const floor = getFloor(roomNum);
            const isUrgent = task.urgency === true;

            return (
              <div key={task.id} className="rounded-xl border border-rv-border bg-rv-surface p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-rv-text">
                        {task.room?.type} — Room {roomNum}
                      </span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${isUrgent ? URGENCY_BADGE.true : URGENCY_BADGE.false}`}>
                        {isUrgent ? 'Urgent' : 'Normal'}
                      </span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE[task.status] ?? 'bg-rv-surface2 text-rv-muted'}`}>
                        {task.status === 'PENDING' ? 'Pending' : 'Completed'}
                      </span>
                    </div>
                    <p className="text-sm text-rv-muted">Floor {floor}</p>
                    {task.notes && <p className="text-sm text-rv-muted italic">{task.notes}</p>}
                    <p className="text-xs text-rv-muted">
                      Added {new Date(task.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col gap-2">
                    {!isUrgent && task.status !== 'COMPLETED' && (
                      <button
                        onClick={() => handleUrgent(task.id)}
                        disabled={working === task.id}
                        className="rounded-lg border border-rv-danger/30 bg-rv-danger-soft px-4 py-2 text-xs font-semibold text-rv-danger hover:bg-rv-danger/20 disabled:opacity-50"
                      >
                        Mark Urgent
                      </button>
                    )}
                    {task.status !== 'COMPLETED' && (
                      <button
                        onClick={() => handleComplete(task.id)}
                        disabled={working === task.id}
                        className="rounded-lg bg-rv-accent px-4 py-2 text-xs font-semibold text-white hover:bg-rv-accent/90 disabled:opacity-50"
                      >
                        {working === task.id ? '…' : 'Mark Cleaned'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
