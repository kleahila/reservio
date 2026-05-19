import { useState, useEffect } from 'react';
import { getMaintenanceRequests, assignMaintenanceRequest, updateMaintenanceStatus, createMaintenanceRequest } from '../../api/maintenance';
import { getStaff } from '../../api/staff';
import { getRooms } from '../../api/rooms';
import Modal from '../../components/Modal';

const CATEGORY_OPTS = ['ALL', 'LIGHTS', 'PLUMBING', 'CLEANING', 'OTHER'];
const STATUS_OPTS   = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'];

const STATUS_BADGE = {
  OPEN:        'bg-rv-danger-soft text-rv-danger',
  IN_PROGRESS: 'bg-rv-warning-soft text-rv-warning',
  RESOLVED:    'bg-rv-olive-50 text-rv-olive-700 dark:bg-rv-olive-900/30 dark:text-rv-olive-300',
};

const CATEGORY_BADGE = {
  LIGHTS:   'bg-rv-warning-soft text-rv-warning',
  PLUMBING: 'bg-rv-sea-50 text-rv-sea-700 dark:bg-rv-sea-900/20 dark:text-rv-sea-300',
  CLEANING: 'bg-rv-olive-50 text-rv-olive-700 dark:bg-rv-olive-900/20',
  OTHER:    'bg-rv-surface2 text-rv-muted',
};

const inputCls = 'w-full rounded-lg border border-rv-border2 bg-rv-bg px-3 py-2.5 text-sm text-rv-text outline-none focus:ring-2 focus:ring-rv-sea-400/40';

export default function MaintenanceBoard() {
  const [requests, setRequests] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ roomId: '', issue: '', category: 'OTHER' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  useEffect(() => {
    Promise.all([getMaintenanceRequests(), getStaff(), getRooms()])
      .then(([reqs, staff, roomList]) => {
        setRequests(reqs || []);
        setTechnicians((staff || []).filter((s) => s.role === 'TECHNICIAN'));
        setRooms(roomList || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleAssign(reqId, userId) {
    try {
      const updated = await assignMaintenanceRequest(reqId, userId || null);
      setRequests((prev) => prev.map((r) => r.id === reqId ? { ...r, ...updated } : r));
      showToast('Assigned.');
    } catch (err) { showToast('Error: ' + err.message); }
  }

  async function handleStatus(reqId, status) {
    try {
      const updated = await updateMaintenanceStatus(reqId, status);
      setRequests((prev) => prev.map((r) => r.id === reqId ? { ...r, ...updated } : r));
      showToast('Status updated.');
    } catch (err) { showToast('Error: ' + err.message); }
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!addForm.roomId || !addForm.issue) return;
    setSaving(true);
    try {
      const newReq = await createMaintenanceRequest(addForm);
      setRequests((prev) => [newReq, ...prev]);
      showToast('Request created.');
      setShowAdd(false);
      setAddForm({ roomId: '', issue: '', category: 'OTHER' });
    } catch (err) { showToast('Error: ' + err.message); }
    finally { setSaving(false); }
  }

  const visible = requests.filter((r) => {
    if (filterStatus !== 'ALL' && r.status !== filterStatus) return false;
    if (filterCategory !== 'ALL' && r.category !== filterCategory) return false;
    return true;
  });

  return (
    <div className="px-6 md:px-10 lg:px-16 py-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-rv-olive-900 dark:text-rv-olive-100">Maintenance Board</h1>
          <p className="mt-1 text-sm text-rv-muted">Track and assign maintenance requests.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="rounded-lg bg-rv-sea-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rv-sea-700">
          + New Request
        </button>
      </div>

      {toast && <div className="rounded-xl border border-rv-sea-200/60 bg-rv-sea-50 dark:bg-rv-sea-900/20 px-5 py-3 text-sm text-rv-sea-700 dark:text-rv-sea-300">{toast}</div>}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 text-sm">
          <label className="font-medium text-rv-text">Status</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-lg border border-rv-border2 bg-rv-surface px-3 py-1.5 text-sm text-rv-text outline-none">
            {STATUS_OPTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <label className="font-medium text-rv-text">Category</label>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="rounded-lg border border-rv-border2 bg-rv-surface px-3 py-1.5 text-sm text-rv-text outline-none">
            {CATEGORY_OPTS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {loading && <div className="py-8 text-center text-rv-muted">Loading…</div>}

      {!loading && (
        <div className="overflow-x-auto rounded-xl border border-rv-border bg-rv-surface">
          <table className="min-w-full text-sm">
            <thead className="border-b border-rv-border">
              <tr className="text-xs font-semibold uppercase tracking-wide text-rv-muted">
                {['Room', 'Issue', 'Category', 'Status', 'Reported By', 'Assigned To', 'Created', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-rv-border">
              {visible.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-8 text-center text-rv-muted">No requests found.</td></tr>
              ) : visible.map((req) => (
                <tr key={req.id} className="hover:bg-rv-surface2 transition">
                  <td className="px-5 py-3 font-medium text-rv-text whitespace-nowrap">
                    {req.room?.type} {req.room?.description}
                  </td>
                  <td className="px-5 py-3 text-rv-text max-w-[200px] truncate">{req.issue}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${CATEGORY_BADGE[req.category] ?? 'bg-rv-surface2 text-rv-muted'}`}>
                      {req.category}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE[req.status] ?? 'bg-rv-surface2 text-rv-muted'}`}>
                      {req.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-rv-muted">{req.reportedBy?.fullName ?? '—'}</td>
                  <td className="px-5 py-3">
                    <select
                      value={req.assignedToId ?? ''}
                      onChange={(e) => handleAssign(req.id, e.target.value)}
                      className="rounded border border-rv-border2 bg-rv-surface px-2 py-1 text-xs text-rv-text"
                    >
                      <option value="">Unassigned</option>
                      {technicians.map((t) => (
                        <option key={t.id} value={t.id}>{t.fullName}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3 text-rv-muted whitespace-nowrap">
                    {new Date(req.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3">
                    {req.status !== 'RESOLVED' && (
                      <button
                        onClick={() => handleStatus(req.id, req.status === 'OPEN' ? 'IN_PROGRESS' : 'RESOLVED')}
                        className="rounded-lg border border-rv-sea-400/40 bg-rv-sea-50 px-2.5 py-1 text-xs font-medium text-rv-sea-700 hover:bg-rv-sea-100 dark:bg-rv-sea-900/20 dark:text-rv-sea-300"
                      >
                        {req.status === 'OPEN' ? 'Start' : 'Resolve'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="New Maintenance Request">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-rv-text">Room</label>
            <select value={addForm.roomId} onChange={(e) => setAddForm((f) => ({ ...f, roomId: e.target.value }))} className={inputCls} required>
              <option value="">Select room…</option>
              {rooms.map((r) => <option key={r.id} value={r.id}>{r.type} — {r.description}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-rv-text">Issue</label>
            <textarea rows={3} value={addForm.issue} onChange={(e) => setAddForm((f) => ({ ...f, issue: e.target.value }))} placeholder="Describe the issue…" className={inputCls + ' resize-none'} required />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-rv-text">Category</label>
            <select value={addForm.category} onChange={(e) => setAddForm((f) => ({ ...f, category: e.target.value }))} className={inputCls}>
              {['LIGHTS', 'PLUMBING', 'CLEANING', 'OTHER'].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowAdd(false)} className="rounded-lg border border-rv-border2 px-4 py-2 text-sm font-medium text-rv-muted">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-rv-sea-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rv-sea-700 disabled:opacity-50">
              {saving ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
