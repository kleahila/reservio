import { useState } from "react";
import Modal from "../../components/Modal";
import Button from "../../components/Button";
import Toast from "../../components/Toast";
import { parkingSpots } from "../../data/parkingSpots";

let nextId = Math.max(...parkingSpots.map((s) => s.id)) + 1;

const STATUS_CONFIG = {
  available: {
    card: "bg-green-50 border-green-300 hover:bg-green-100",
    text: "text-green-800",
    dot: "bg-green-500",
    badge: "bg-green-100 text-green-800",
    label: "Available",
  },
  occupied: {
    card: "bg-blue-50 border-blue-300 hover:bg-blue-100",
    text: "text-blue-800",
    dot: "bg-blue-500",
    badge: "bg-blue-100 text-blue-800",
    label: "Occupied",
  },
  maintenance: {
    card: "bg-orange-50 border-orange-300 hover:bg-orange-100",
    text: "text-orange-800",
    dot: "bg-orange-500",
    badge: "bg-orange-100 text-orange-800",
    label: "Maintenance",
  },
  reserved: {
    card: "bg-purple-50 border-purple-300 hover:bg-purple-100",
    text: "text-purple-800",
    dot: "bg-purple-500",
    badge: "bg-purple-100 text-purple-800",
    label: "Reserved",
  },
};

const STATUS_CYCLE = ["available", "occupied", "maintenance", "reserved"];

function SpotCard({ spot, onStatusChange }) {
  const cfg = STATUS_CONFIG[spot.status] || STATUS_CONFIG.available;
  return (
    <div
      className={`relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 p-3 text-center transition-all duration-150 hover:shadow-md ${cfg.card}`}
      onClick={() => onStatusChange(spot)}
      title={`Click to change status of ${spot.label}`}
    >
      <div className={`absolute top-2 right-2 h-2 w-2 rounded-full ${cfg.dot}`} />
      <p className={`text-lg font-bold ${cfg.text}`}>{spot.label}</p>
      <p className={`mt-0.5 text-xs font-medium ${cfg.text} opacity-80`}>
        {cfg.label}
      </p>
      {spot.pricePerNight > 0 && (
        <p className="mt-1 text-xs text-slate-500">${spot.pricePerNight}/night</p>
      )}
      {spot.lockedUntil && (
        <p className="mt-1 text-xs text-slate-400 truncate w-full text-center">
          until {new Date(spot.lockedUntil).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </p>
      )}
      {/* Hover actions */}
      <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 rounded-b-xl bg-black/5 py-1 opacity-0 transition-opacity hover:opacity-0 group-hover:opacity-100">
      </div>
    </div>
  );
}

function ParkingManagement() {
  const [spots, setSpots] = useState(parkingSpots);
  const [view, setView] = useState("grid"); // "grid" | "table"
  const [toast, setToast] = useState(null);

  const [statusModal, setStatusModal] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ label: "", price: "" });
  const [addErrors, setAddErrors] = useState({});
  const [editTarget, setEditTarget] = useState(null);
  const [editError, setEditError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const showToast = (msg, type = "success") => setToast({ message: msg, type });

  const stats = {
    total: spots.length,
    available: spots.filter((s) => s.status === "available").length,
    occupied: spots.filter((s) => s.status === "occupied").length,
    maintenance: spots.filter((s) => s.status === "maintenance").length,
    revenue: spots.filter((s) => s.status === "occupied").reduce((s, p) => s + p.pricePerNight, 0),
  };

  function handleStatusCycle(spot) {
    const nextStatus = STATUS_CYCLE[(STATUS_CYCLE.indexOf(spot.status) + 1) % STATUS_CYCLE.length];
    setStatusModal({ spot, nextStatus });
  }

  function confirmStatusChange() {
    const { spot, nextStatus } = statusModal;
    setSpots((p) => p.map((s) => s.id === spot.id ? { ...s, status: nextStatus } : s));
    showToast(`${spot.label} → ${STATUS_CONFIG[nextStatus].label}`);
    setStatusModal(null);
  }

  function validateAdd() {
    const errs = {};
    if (!addForm.label.trim()) errs.label = "Label is required.";
    else if (spots.some((s) => s.label.toLowerCase() === addForm.label.trim().toLowerCase()))
      errs.label = `"${addForm.label.trim()}" already exists.`;
    const p = Number(addForm.price);
    if (!addForm.price || isNaN(p) || p <= 0) errs.price = "Price must be > 0.";
    return errs;
  }

  function handleAddSubmit(e) {
    e.preventDefault();
    const errs = validateAdd();
    setAddErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const newSpot = {
      id: nextId++,
      label: addForm.label.trim().toUpperCase(),
      status: "available",
      pricePerNight: Number(addForm.price),
      lockedUntil: null,
      tenantId: 1,
    };
    setSpots((p) => [...p, newSpot]);
    showToast(`Spot ${newSpot.label} added.`);
    setAddForm({ label: "", price: "" });
    setAddErrors({});
    setShowAdd(false);
  }

  function handleEditSave() {
    const p = Number(editTarget.price);
    if (!editTarget.price || isNaN(p) || p <= 0) {
      setEditError("Price must be > 0.");
      return;
    }
    setSpots((prev) =>
      prev.map((s) => s.id === editTarget.spot.id ? { ...s, pricePerNight: p } : s),
    );
    showToast(`${editTarget.spot.label} price updated to $${p}/night.`);
    setEditTarget(null);
  }

  function handleDeleteConfirm() {
    setSpots((p) => p.filter((s) => s.id !== deleteTarget.id));
    showToast(`Spot ${deleteTarget.label} removed.`, "error");
    setDeleteTarget(null);
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Parking Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Click any spot in the grid to cycle its status.
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)}>+ Add Spot</Button>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Total", value: stats.total, color: "bg-white border-slate-200 text-slate-800" },
          { label: "Available", value: stats.available, color: "bg-green-50 border-green-200 text-green-900" },
          { label: "Occupied", value: stats.occupied, color: "bg-blue-50 border-blue-200 text-blue-900" },
          { label: "Maintenance", value: stats.maintenance, color: "bg-orange-50 border-orange-200 text-orange-900" },
          { label: "Est. Revenue Tonight", value: `$${stats.revenue}`, color: "bg-brand-light border-slate-200 text-brand-primary" },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-xl border p-4 shadow-sm ${color}`}>
            <p className="text-xs font-medium opacity-60">{label}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      {/* View toggle */}
      <div className="mb-4 flex items-center gap-2">
        {["grid", "table"].map((v) => (
          <button key={v} onClick={() => setView(v)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
              view === v
                ? "bg-brand-primary text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}>
            {v === "grid" ? "⊞ Grid" : "≡ Table"}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-400">
          Tap a spot in grid view to cycle status
        </span>
      </div>

      {/* Grid View */}
      {view === "grid" && (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8">
          {spots.map((spot) => (
            <SpotCard
              key={spot.id}
              spot={spot}
              onStatusChange={handleStatusCycle}
            />
          ))}
        </div>
      )}

      {/* Table View */}
      {view === "table" && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3">Spot</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Price/Night</th>
                <th className="px-5 py-3">Locked Until</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {spots.map((spot) => {
                const cfg = STATUS_CONFIG[spot.status] || STATUS_CONFIG.available;
                return (
                  <tr key={spot.id} className="group transition hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-2 font-mono font-bold text-slate-800">
                        <span className={`h-2.5 w-2.5 rounded-full ${cfg.dot}`} />
                        {spot.label}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.badge}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {spot.pricePerNight > 0 ? `$${spot.pricePerNight}` : "—"}
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-400">
                      {spot.lockedUntil
                        ? new Date(spot.lockedUntil).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                        : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatusCycle(spot)}
                          className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
                        >
                          ⟳ Status
                        </button>
                        <button
                          onClick={() => { setEditTarget({ spot, price: String(spot.pricePerNight) }); setEditError(""); }}
                          className="rounded-md bg-brand-accent px-2.5 py-1 text-xs font-medium text-white transition hover:bg-brand-primary"
                        >
                          Edit Price
                        </button>
                        <button
                          onClick={() => setDeleteTarget(spot)}
                          className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 transition hover:bg-red-600 hover:text-white"
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Status Change Modal */}
      <Modal isOpen={!!statusModal} onClose={() => setStatusModal(null)}
        title={`Change Spot ${statusModal?.spot.label} Status`}>
        <div className="mb-5 flex items-center justify-center gap-5 rounded-xl bg-slate-50 py-5">
          <div className="text-center">
            <span className={`inline-block rounded-full px-4 py-1.5 text-sm font-semibold ${STATUS_CONFIG[statusModal?.spot.status]?.badge}`}>
              {STATUS_CONFIG[statusModal?.spot.status]?.label}
            </span>
            <p className="mt-1 text-xs text-slate-400">Current</p>
          </div>
          <span className="text-xl text-slate-400">→</span>
          <div className="text-center">
            <span className={`inline-block rounded-full px-4 py-1.5 text-sm font-semibold ${STATUS_CONFIG[statusModal?.nextStatus]?.badge}`}>
              {STATUS_CONFIG[statusModal?.nextStatus]?.label}
            </span>
            <p className="mt-1 text-xs text-slate-400">New Status</p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setStatusModal(null)}>Cancel</Button>
          <Button onClick={confirmStatusChange}>Confirm</Button>
        </div>
      </Modal>

      {/* Add Spot Modal */}
      <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setAddForm({ label: "", price: "" }); setAddErrors({}); }}
        title="Add Parking Spot">
        <form onSubmit={handleAddSubmit} noValidate>
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Spot Label <span className="text-red-500">*</span>
            </label>
            <input type="text" value={addForm.label}
              onChange={(e) => setAddForm((p) => ({ ...p, label: e.target.value }))}
              placeholder="e.g. D1"
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent ${addErrors.label ? "border-red-400 bg-red-50" : "border-slate-300"}`} />
            {addErrors.label && <p className="mt-1 text-xs text-red-500">{addErrors.label}</p>}
          </div>
          <div className="mb-5">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Price per Night ($) <span className="text-red-500">*</span>
            </label>
            <input type="number" min={1} value={addForm.price}
              onChange={(e) => setAddForm((p) => ({ ...p, price: e.target.value }))}
              placeholder="15"
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent ${addErrors.price ? "border-red-400 bg-red-50" : "border-slate-300"}`} />
            {addErrors.price && <p className="mt-1 text-xs text-red-500">{addErrors.price}</p>}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button"
              onClick={() => { setShowAdd(false); setAddForm({ label: "", price: "" }); setAddErrors({}); }}>
              Cancel
            </Button>
            <Button type="submit">Add Spot</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Price Modal */}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)}
        title={`Edit Price — ${editTarget?.spot.label}`}>
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            New Price per Night ($)
          </label>
          <input type="number" min={1} value={editTarget?.price ?? ""}
            onChange={(e) => setEditTarget((p) => ({ ...p, price: e.target.value }))}
            className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent ${editError ? "border-red-400" : "border-slate-300"}`} />
          {editError && <p className="mt-1 text-xs text-red-500">{editError}</p>}
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setEditTarget(null)}>Cancel</Button>
          <Button onClick={handleEditSave}>Save</Button>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Remove Spot">
        <p className="mb-5 text-sm text-slate-600">
          Permanently remove spot <span className="font-semibold">{deleteTarget?.label}</span>? This cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>Remove</Button>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default ParkingManagement;
