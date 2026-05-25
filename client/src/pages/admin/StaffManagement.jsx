import { useState, useEffect } from 'react';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import { getStaff, createStaff, updateStaff, deactivateStaff, deleteStaff } from '../../api/staff';

const ROLES = ['RECEPTIONIST', 'HOUSEKEEPER', 'TECHNICIAN'];

const inputCls =
  'w-full rounded-lg border border-rv-border2 bg-rv-bg px-3 py-2.5 text-sm text-rv-text placeholder:text-rv-subtle outline-none focus:ring-2 focus:ring-rv-accent/40';

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'RECEPTIONIST' });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  useEffect(() => {
    let cancelled = false;
    getStaff()
      .then((data) => { if (!cancelled) { setStaff(data || []); setLoading(false); } })
      .catch((err) => { if (!cancelled) { setError(err.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    if (!form.email.includes('@')) e.email = 'Valid email is required.';
    return e;
  }

  async function handleDelete(member) {
    try {
      await deleteStaff(member.id);
      setStaff((s) => s.filter((m) => m.id !== member.id));
      showToast(`${member.name ?? member.fullName} removed.`);
      setDeleteTarget(null);
    } catch (err) {
      setError(err.message);
    }
  }

  function openAdd() {
    setEditTarget(null);
    setForm({ name: '', email: '', role: 'RECEPTIONIST' });
    setErrors({});
    setShowModal(true);
  }

  function openEdit(member) {
    setEditTarget(member);
    setForm({ name: member.name, email: member.email, role: member.role });
    setErrors({});
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSaving(true);
    try {
      if (editTarget) {
        const updated = await updateStaff(editTarget.id, form);
        setStaff((s) => s.map((m) => m.id === editTarget.id ? { ...m, ...updated, ...form } : m));
        showToast('Staff member updated.');
      } else {
        const newMember = await createStaff(form);
        setStaff((s) => [...s, newMember]);
        showToast(`Invite sent to ${form.email}`);
      }
      setShowModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(member) {
    try {
      await deactivateStaff(member.id);
      setStaff((s) => s.map((m) => m.id === member.id ? { ...m, status: 'Inactive' } : m));
      showToast(`${member.name} deactivated.`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="px-6 md:px-10 lg:px-16 py-8">
      <PageHeader
        title="Staff Accounts"
        subtitle="Manage hotel staff members and housekeepers."
        action={
          <button onClick={openAdd} className="rounded-lg bg-rv-accent px-4 py-2 text-sm font-semibold text-white hover:bg-rv-accent/90">
            Add staff member
          </button>
        }
      />

      {toast && (
        <div className="mb-4 rounded-xl border border-rv-success/30 bg-rv-success-soft px-5 py-3 text-sm font-medium text-rv-success">
          {toast}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-rv-danger/20 bg-rv-danger-soft px-5 py-3 text-sm text-rv-danger">
          {error}
        </div>
      )}

      {loading && <div className="py-8 text-center text-rv-muted">Loading staff…</div>}

      {!loading && (
        <div className="overflow-hidden rounded-xl border border-rv-border bg-rv-surface">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="border-b border-rv-border">
              <tr className="text-xs font-semibold uppercase tracking-wider text-rv-muted">
                {['Name', 'Username', 'Email', 'Role', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-rv-border">
              {staff.map((member) => (
                <tr key={member.id} className="transition hover:bg-rv-surface2">
                  <td className="px-5 py-3 font-medium text-rv-text">{member.fullName ?? member.name}</td>
                  <td className="px-5 py-3 font-mono text-xs text-rv-muted">{member.username ?? '—'}</td>
                  <td className="px-5 py-3 text-rv-muted">{member.email}</td>
                  <td className="px-5 py-3 text-rv-muted">{member.role}</td>
                  <td className="px-5 py-3"><StatusBadge status={member.active === false ? 'Inactive' : (member.status ?? 'Active')} /></td>
                  <td className="px-5 py-3 flex gap-2">
                    <button onClick={() => openEdit(member)} className="rounded-lg border border-rv-border2 px-3 py-1.5 text-xs font-medium text-rv-muted hover:text-rv-text">
                      Edit
                    </button>
                    {member.active !== false && member.status !== 'Inactive' && (
                      <button onClick={() => handleDeactivate(member)} className="rounded-lg bg-rv-warning-soft px-3 py-1.5 text-xs font-semibold text-rv-warning hover:bg-rv-warning/20">
                        Deactivate
                      </button>
                    )}
                    <button onClick={() => setDeleteTarget(member)} className="rounded-lg bg-rv-danger-soft px-3 py-1.5 text-xs font-semibold text-rv-danger hover:bg-rv-danger/20">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {staff.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-rv-muted">No staff members found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Staff Member">
        <p className="mb-5 text-sm text-rv-muted">
          Permanently delete <strong className="text-rv-text">{deleteTarget?.fullName ?? deleteTarget?.name}</strong>? This cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setDeleteTarget(null)} className="rounded-lg border border-rv-border2 px-4 py-2 text-sm font-medium text-rv-muted">Cancel</button>
          <button onClick={() => handleDelete(deleteTarget)} className="rounded-lg bg-rv-danger px-4 py-2 text-sm font-semibold text-white hover:bg-rv-danger/90">Delete</button>
        </div>
      </Modal>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editTarget ? 'Edit staff member' : 'Add staff member'}>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-rv-text">Full name</label>
            <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Jane Smith" className={inputCls} />
            {errors.name && <p className="mt-1 text-xs text-rv-danger">{errors.name}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-rv-text">Email</label>
            <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="jane@hotel.com" className={inputCls} />
            {errors.email && <p className="mt-1 text-xs text-rv-danger">{errors.email}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-rv-text">Role</label>
            <select value={form.role} onChange={(e) => set('role', e.target.value)} className={inputCls}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setShowModal(false)} className="rounded-lg border border-rv-border2 px-4 py-2 text-sm font-medium text-rv-muted">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="rounded-lg bg-rv-accent px-4 py-2 text-sm font-semibold text-white hover:bg-rv-accent/90 disabled:opacity-50">
              {saving ? 'Saving…' : editTarget ? 'Save changes' : 'Send invite'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
