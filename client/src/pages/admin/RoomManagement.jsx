import { useState, useEffect } from 'react';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import { getRooms, createRoom, updateRoom, deleteRoom } from '../../api/rooms';
import { getRoomBlocks, createRoomBlock, deleteRoomBlock } from '../../api/roomBlocks';

const STATUSES = ['Available', 'Occupied', 'Maintenance'];

const inputCls =
  'w-full rounded-lg border border-rv-border2 bg-rv-bg px-3 py-2.5 text-sm text-rv-text outline-none focus:ring-2 focus:ring-rv-accent/40';

export default function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [addModal, setAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ type: '', floor: '', pricePerNight: '', status: 'Available', description: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [blocks, setBlocks] = useState([]);
  const [blockTarget, setBlockTarget] = useState(null);
  const [blockForm, setBlockForm] = useState({ startDate: '', endDate: '', reason: '' });

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  useEffect(() => {
    let cancelled = false;
    Promise.all([getRooms(), getRoomBlocks()])
      .then(([roomData, blockData]) => {
        if (!cancelled) {
          setRooms(roomData || []);
          setBlocks(blockData || []);
          setLoading(false);
        }
      })
      .catch((err) => { if (!cancelled) { setError(err.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  async function handleAddBlock(e) {
    e.preventDefault();
    if (!blockTarget || !blockForm.startDate || !blockForm.endDate) return;
    setSaving(true);
    try {
      const newBlock = await createRoomBlock({ roomId: blockTarget.id, ...blockForm });
      setBlocks((b) => [...b, newBlock]);
      showToast('Room blocked.');
      setBlockTarget(null);
      setBlockForm({ startDate: '', endDate: '', reason: '' });
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function handleRemoveBlock(blockId) {
    try {
      await deleteRoomBlock(blockId);
      setBlocks((b) => b.filter((x) => x.id !== blockId));
      showToast('Block removed.');
    } catch (err) { setError(err.message); }
  }

  function openEdit(room) {
    setEditTarget(room);
    setEditForm({ price: String(room.pricePerNight), status: room.status });
  }

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await updateRoom(editTarget.id, {
        pricePerNight: Number(editForm.price),
        status: editForm.status,
      });
      setRooms((r) => r.map((x) => x.id === editTarget.id ? { ...x, ...updated, pricePerNight: Number(editForm.price), status: editForm.status } : x));
      showToast('Room updated.');
      setEditTarget(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const newRoom = await createRoom({
        type: addForm.type,
        floor: Number(addForm.floor),
        pricePerNight: Number(addForm.pricePerNight),
        status: addForm.status,
        description: addForm.description,
      });
      setRooms((r) => [...r, newRoom]);
      showToast(`${newRoom.type || addForm.type} added.`);
      setAddModal(false);
      setAddForm({ type: '', floor: '', pricePerNight: '', status: 'Available', description: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setSaving(true);
    try {
      await deleteRoom(deleteTarget.id);
      setRooms((r) => r.filter((x) => x.id !== deleteTarget.id));
      showToast('Room removed.');
      setDeleteTarget(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-6 md:px-10 lg:px-16 py-8">
      <PageHeader
        title="Room Inventory"
        subtitle="Manage room status and nightly pricing."
        action={
          <button onClick={() => setAddModal(true)} className="rounded-lg bg-rv-accent px-4 py-2 text-sm font-semibold text-white hover:bg-rv-accent/90">
            Add room
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

      {loading && <div className="py-8 text-center text-rv-muted">Loading rooms…</div>}

      {!loading && (
        <div className="overflow-hidden rounded-xl border border-rv-border bg-rv-surface">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="border-b border-rv-border">
              <tr className="text-xs font-semibold uppercase tracking-wider text-rv-muted">
                {['Type', 'Floor', 'Price/Night', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-rv-border">
              {rooms.map((room) => (
                <tr key={room.id} className="transition hover:bg-rv-surface2">
                  <td className="px-5 py-3 font-medium text-rv-text">{room.type}</td>
                  <td className="px-5 py-3 text-rv-muted">Floor {room.floor}</td>
                  <td className="px-5 py-3 text-rv-text">${room.pricePerNight}</td>
                  <td className="px-5 py-3"><StatusBadge status={room.status} /></td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => openEdit(room)} className="rounded-lg bg-rv-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-rv-accent/90">
                        Edit
                      </button>
                      <button
                        onClick={() => { setBlockTarget(room); setBlockForm({ startDate: '', endDate: '', reason: '' }); }}
                        className="rounded-lg border border-rv-warning/40 bg-rv-warning-soft px-3 py-1.5 text-xs font-semibold text-rv-warning hover:bg-rv-warning/20"
                      >
                        Block
                      </button>
                      <button onClick={() => setDeleteTarget(room)} className="rounded-lg bg-rv-danger-soft px-3 py-1.5 text-xs font-semibold text-rv-danger hover:bg-rv-danger/20">
                        Delete
                      </button>
                    </div>
                    {blocks.filter((b) => b.roomId === room.id).map((b) => (
                      <div key={b.id} className="mt-1 flex items-center gap-1">
                        <span className="rounded-full bg-rv-danger-soft px-2 py-0.5 text-[10px] font-medium text-rv-danger">
                          Blocked {b.startDate?.slice(0, 10)} → {b.endDate?.slice(0, 10)}
                          {b.reason ? ` · ${b.reason}` : ''}
                        </span>
                        <button
                          onClick={() => handleRemoveBlock(b.id)}
                          className="text-[10px] text-rv-muted hover:text-rv-danger"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
              {rooms.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-rv-muted">No rooms found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit modal */}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title={`Edit — ${editTarget?.type}`}>
        {editTarget && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-rv-text">Price per night ($)</label>
              <input type="number" min={1} value={editForm.price} onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-rv-text">Status</label>
              <select value={editForm.status} onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))} className={inputCls}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditTarget(null)} className="rounded-lg border border-rv-border2 px-4 py-2 text-sm font-medium text-rv-muted">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="rounded-lg bg-rv-accent px-4 py-2 text-sm font-semibold text-white hover:bg-rv-accent/90 disabled:opacity-50">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add modal */}
      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Add Room">
        <form onSubmit={handleAdd} noValidate className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-rv-text">Room type</label>
            <input value={addForm.type} onChange={(e) => setAddForm((f) => ({ ...f, type: e.target.value }))} placeholder="Deluxe Suite" required className={inputCls} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-rv-text">Floor</label>
              <input type="number" min={1} value={addForm.floor} onChange={(e) => setAddForm((f) => ({ ...f, floor: e.target.value }))} placeholder="3" className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-rv-text">Price/night ($)</label>
              <input type="number" min={1} value={addForm.pricePerNight} onChange={(e) => setAddForm((f) => ({ ...f, pricePerNight: e.target.value }))} placeholder="150" className={inputCls} />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-rv-text">Status</label>
            <select value={addForm.status} onChange={(e) => setAddForm((f) => ({ ...f, status: e.target.value }))} className={inputCls}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-rv-text">Description</label>
            <textarea rows={2} value={addForm.description} onChange={(e) => setAddForm((f) => ({ ...f, description: e.target.value }))} placeholder="Room description…" className={inputCls + ' resize-none'} />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setAddModal(false)} className="rounded-lg border border-rv-border2 px-4 py-2 text-sm font-medium text-rv-muted">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-rv-accent px-4 py-2 text-sm font-semibold text-white hover:bg-rv-accent/90 disabled:opacity-50">
              {saving ? 'Adding…' : 'Add room'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Block dates modal */}
      <Modal isOpen={!!blockTarget} onClose={() => setBlockTarget(null)} title={`Block Dates — ${blockTarget?.type}`}>
        <form onSubmit={handleAddBlock} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-rv-text">Start date</label>
              <input type="date" value={blockForm.startDate} onChange={(e) => setBlockForm((f) => ({ ...f, startDate: e.target.value }))} className={inputCls} required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-rv-text">End date</label>
              <input type="date" value={blockForm.endDate} min={blockForm.startDate} onChange={(e) => setBlockForm((f) => ({ ...f, endDate: e.target.value }))} className={inputCls} required />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-rv-text">Reason (optional)</label>
            <input value={blockForm.reason} onChange={(e) => setBlockForm((f) => ({ ...f, reason: e.target.value }))} placeholder="e.g. Renovation" className={inputCls} />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setBlockTarget(null)} className="rounded-lg border border-rv-border2 px-4 py-2 text-sm font-medium text-rv-muted">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-rv-warning px-4 py-2 text-sm font-semibold text-white hover:bg-rv-warning/90 disabled:opacity-50">
              {saving ? 'Blocking…' : 'Block Dates'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Room">
        <p className="mb-5 text-sm text-rv-muted">
          Permanently delete <strong className="text-rv-text">{deleteTarget?.type}</strong>? This cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setDeleteTarget(null)} className="rounded-lg border border-rv-border2 px-4 py-2 text-sm font-medium text-rv-muted">Cancel</button>
          <button onClick={handleDelete} disabled={saving} className="rounded-lg bg-rv-danger px-4 py-2 text-sm font-semibold text-white hover:bg-rv-danger/90 disabled:opacity-50">
            {saving ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
