import { useState, useEffect } from 'react';
import { getTasks, completeTask, markUrgent } from '../../api/housekeeping';

const URGENCY_CLS = {
  high:   'border-rv-danger/40 bg-rv-danger-soft',
  medium: 'border-rv-warning/40 bg-rv-warning-soft',
  low:    'border-rv-border bg-rv-surface',
  HIGH:   'border-rv-danger/40 bg-rv-danger-soft',
  MEDIUM: 'border-rv-warning/40 bg-rv-warning-soft',
  LOW:    'border-rv-border bg-rv-surface',
};

const URGENCY_DOT = {
  high: 'bg-rv-danger', medium: 'bg-rv-warning', low: 'bg-rv-muted/40',
  HIGH: 'bg-rv-danger', MEDIUM: 'bg-rv-warning', LOW: 'bg-rv-muted/40',
};

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
      showToast('Task marked as cleaned.');
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-rv-text">My Schedule</h1>
        <p className="text-sm text-rv-muted">{today}</p>
      </div>

      {toast && (
        <div className="rounded-xl border border-rv-success/30 bg-rv-success-soft px-5 py-3 text-sm font-medium text-rv-success">
          {toast}
        </div>
      )}

      {loading && <div className="py-8 text-center text-rv-muted">Loading tasks…</div>}

      {error && (
        <div className="rounded-xl border border-rv-danger/20 bg-rv-danger-soft px-5 py-4 text-sm text-rv-danger">
          {error}
        </div>
      )}

      {!loading && !error && tasks.length === 0 && (
        <div className="rounded-xl border border-rv-border bg-rv-surface p-12 text-center text-rv-muted">
          No tasks scheduled for today.
        </div>
      )}

      {!loading && !error && tasks.length > 0 && (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`rounded-xl border-2 p-4 ${URGENCY_CLS[task.urgency] ?? 'border-rv-border bg-rv-surface'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${URGENCY_DOT[task.urgency] ?? 'bg-rv-muted/40'}`} />
                  <div className="min-w-0">
                    <p className="font-semibold text-rv-text">{task.roomLabel || `Room #${task.roomId}`}</p>
                    <p className="text-xs text-rv-muted">Floor {task.floor} &middot; {task.scheduledTime?.split('T')[1] ?? ''} &middot; {task.duration} min</p>
                    {task.notes && <p className="mt-1 text-sm text-rv-muted italic">{task.notes}</p>}
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  {(task.urgency === 'low' || task.urgency === 'LOW' || task.urgency === 'medium' || task.urgency === 'MEDIUM') && (
                    <button
                      onClick={() => handleUrgent(task.id)}
                      disabled={working === task.id}
                      className="rounded-lg border border-rv-danger/30 bg-rv-danger-soft px-3 py-1.5 text-xs font-semibold text-rv-danger hover:bg-rv-danger/20 disabled:opacity-50"
                    >
                      Urgent
                    </button>
                  )}
                  {task.status !== 'Cleaned' && task.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleComplete(task.id)}
                      disabled={working === task.id}
                      className="rounded-lg bg-rv-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-rv-accent/90 disabled:opacity-50"
                    >
                      {working === task.id ? '…' : 'Done'}
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
