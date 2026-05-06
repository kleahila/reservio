import { useState } from "react";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import Modal from "../../components/Modal";
import { mockRooms } from "../../data/mockRooms";

const STATUSES = ["Available", "Occupied", "Maintenance"];

const inputCls =
  "w-full rounded-lg border border-rv-border2 bg-rv-bg px-3 py-2.5 text-sm text-rv-text outline-none focus:ring-2 focus:ring-rv-accent/40";

export default function RoomManagement() {
  const [rooms, setRooms] = useState(mockRooms);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({});
  const [saved, setSaved] = useState(false);

  function openEdit(room) {
    setEditTarget(room);
    setForm({ price: String(room.pricePerNight), status: room.status });
    setSaved(false);
  }

  function handleSave() {
    setRooms((r) =>
      r.map((x) =>
        x.id === editTarget.id
          ? { ...x, pricePerNight: Number(form.price), status: form.status }
          : x,
      ),
    );
    setSaved(true);
    setTimeout(() => setEditTarget(null), 700);
  }

  return (
    <div>
      <PageHeader title="Room Inventory" subtitle="Manage room status and nightly pricing." />

      <div className="overflow-hidden rounded-xl border border-rv-border bg-rv-surface">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="border-b border-rv-border">
            <tr className="text-xs font-semibold uppercase tracking-wider text-rv-muted">
              {["Type", "Floor", "Price/Night", "Status", "Actions"].map((h) => (
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
                  <button onClick={() => openEdit(room)}
                    className="rounded-lg bg-rv-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-rv-accent/90">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title={`Edit — ${editTarget?.type}`}>
        {editTarget && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-rv-text">Price per night ($)</label>
              <input type="number" min={1} value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-rv-text">Status</label>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className={inputCls}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {saved && <p className="text-sm font-medium text-rv-success">Saved.</p>}
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditTarget(null)} className="rounded-lg border border-rv-border2 px-4 py-2 text-sm font-medium text-rv-muted">Cancel</button>
              <button onClick={handleSave} className="rounded-lg bg-rv-accent px-4 py-2 text-sm font-semibold text-white hover:bg-rv-accent/90">Save</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
