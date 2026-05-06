import { useState } from "react";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import Modal from "../../components/Modal";
import { mockParking } from "../../data/mockParking";

const STATUS_CYCLE = ["Available", "Occupied", "Maintenance", "Reserved"];

let nextId = Math.max(...mockParking.map((s) => s.id)) + 1;

export default function ParkingManagement() {
  const [spots, setSpots] = useState(mockParking);
  const [view, setView] = useState("grid");
  const [statusModal, setStatusModal] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ label: "", price: "" });
  const [addErrors, setAddErrors] = useState({});
  const [editTarget, setEditTarget] = useState(null);
  const [editError, setEditError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState("");

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  const stats = {
    total:       spots.length,
    available:   spots.filter((s) => s.status === "Available").length,
    occupied:    spots.filter((s) => s.status === "Occupied").length,
    maintenance: spots.filter((s) => s.status === "Maintenance").length,
    revenue:     spots.filter((s) => s.status === "Occupied").reduce((s, p) => s + p.pricePerNight, 0),
  };

  function cycleStatus(spot) {
    const nextStatus = STATUS_CYCLE[(STATUS_CYCLE.indexOf(spot.status) + 1) % STATUS_CYCLE.length];
    setStatusModal({ spot, nextStatus });
  }

  function confirmStatus() {
    setSpots((p) => p.map((s) => s.id === statusModal.spot.id ? { ...s, status: statusModal.nextStatus } : s));
    showToast(`${statusModal.spot.label} \u2192 ${statusModal.nextStatus}`);
    setStatusModal(null);
  }

  function validateAdd() {
    const errs = {};
    if (!addForm.label.trim()) errs.label = "Label is required.";
    else if (spots.some((s) => s.label.toLowerCase() === addForm.label.trim().toLowerCase()))
      errs.label = `"${addForm.label.trim()}" already exists.`;
    if (!addForm.price || Number(addForm.price) <= 0) errs.price = "Price must be > 0.";
    return errs;
  }

  function handleAdd(e) {
    e.preventDefault();
    const errs = validateAdd();
    setAddErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const newSpot = { id: nextId++, label: addForm.label.trim().toUpperCase(), status: "Available", pricePerNight: Number(addForm.price) };
    setSpots((p) => [...p, newSpot]);
    showToast(`Spot ${newSpot.label} added.`);
    setAddForm({ label: "", price: "" });
    setShowAdd(false);
  }

  function handleEditSave() {
    const p = Number(editTarget.price);
    if (!editTarget.price || isNaN(p) || p <= 0) { setEditError("Price must be > 0."); return; }
    setSpots((prev) => prev.map((s) => s.id === editTarget.spot.id ? { ...s, pricePerNight: p } : s));
    showToast(`${editTarget.spot.label} price updated.`);
    setEditTarget(null);
  }

  function handleDelete() {
    setSpots((p) => p.filter((s) => s.id !== deleteTarget.id));
    showToast(`Spot ${deleteTarget.label} removed.`);
    setDeleteTarget(null);
  }

  const inputCls = (err) =>
    `w-full rounded-lg border px-3 py-2 text-sm bg-rv-bg text-rv-text outline-none focus:ring-2 focus:ring-rv-accent/40 ${
      err ? "border-rv-danger" : "border-rv-border2"
    }`;

  return (
    <div>
      <PageHeader
        title="Parking Management"
        subtitle="Tap a grid spot to cycle its status."
        action={
          <button onClick={() => setShowAdd(true)}
            className="rounded-lg bg-rv-accent px-4 py-2 text-sm font-semibold text-white hover:bg-rv-accent/90">
            Add spot
          </button>
        }
      />

      {toast && (
        <div className="mb-4 rounded-xl border border-rv-success/30 bg-rv-success-soft px-5 py-3 text-sm font-medium text-rv-success">
          {toast}
        </div>
      )}

      {/* Summary */}
      <div className="mb-6 grid gap-3 sm:grid-cols-5">
        {[
          { label: "Total",     value: stats.total },
          { label: "Available", value: stats.available },
          { label: "Occupied",  value: stats.occupied },
          { label: "Maintenance", value: stats.maintenance },
          { label: "Est. Revenue", value: `$${stats.revenue}` },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-rv-border bg-rv-surface p-4">
            <p className="text-xs text-rv-muted">{label}</p>
            <p className="mt-1 text-2xl font-bold text-rv-text">{value}</p>
          </div>
        ))}
      </div>

      {/* View toggle */}
      <div className="mb-4 flex gap-2">
        {["grid", "table"].map((v) => (
          <button key={v} onClick={() => setView(v)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
              view === v
                ? "bg-rv-accent text-white"
                : "border border-rv-border2 bg-rv-surface text-rv-muted hover:text-rv-text"
            }`}>
            {v === "grid" ? "Grid" : "Table"}
          </button>
        ))}
      </div>

      {/* Grid */}
      {view === "grid" && (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8">
          {spots.map((spot) => (
            <button key={spot.id} onClick={() => cycleStatus(spot)}
              className={`flex flex-col items-center justify-center rounded-xl border-2 p-3 text-center transition hover:shadow-md ${
                spot.status === "Available"   ? "border-rv-success/40 bg-rv-success-soft" :
                spot.status === "Occupied"    ? "border-rv-accent/30 bg-rv-accent-soft" :
                spot.status === "Maintenance" ? "border-rv-danger/30 bg-rv-danger-soft" :
                                                "border-rv-warning/30 bg-rv-warning-soft"
              }`}>
              <span className="text-sm font-bold text-rv-text">{spot.label}</span>
              <span className="text-xs text-rv-muted">${spot.pricePerNight}</span>
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      {view === "table" && (
        <div className="overflow-hidden rounded-xl border border-rv-border bg-rv-surface">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="border-b border-rv-border">
              <tr className="text-xs font-semibold uppercase tracking-wider text-rv-muted">
                {["Spot", "Status", "Price/Night", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-rv-border">
              {spots.map((spot) => (
                <tr key={spot.id} className="transition hover:bg-rv-surface2">
                  <td className="px-5 py-3 font-mono font-bold text-rv-text">{spot.label}</td>
                  <td className="px-5 py-3"><StatusBadge status={spot.status} /></td>
                  <td className="px-5 py-3 text-rv-muted">${spot.pricePerNight}</td>
                  <td className="px-5 py-3 flex gap-2">
                    <button onClick={() => cycleStatus(spot)}
                      className="rounded-lg border border-rv-border2 px-2.5 py-1 text-xs font-medium text-rv-muted hover:text-rv-text">
                      Cycle
                    </button>
                    <button onClick={() => { setEditTarget({ spot, price: String(spot.pricePerNight) }); setEditError(""); }}
                      className="rounded-lg bg-rv-accent px-2.5 py-1 text-xs font-medium text-white hover:bg-rv-accent/90">
                      Price
                    </button>
                    <button onClick={() => setDeleteTarget(spot)}
                      className="rounded-lg bg-rv-danger-soft px-2.5 py-1 text-xs font-medium text-rv-danger hover:bg-rv-danger/20">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Status change modal */}
      <Modal isOpen={!!statusModal} onClose={() => setStatusModal(null)} title={`Change Spot ${statusModal?.spot.label}`}>
        <div className="mb-5 flex items-center justify-center gap-5 rounded-xl bg-rv-surface2 py-5">
          <div className="text-center">
            <StatusBadge status={statusModal?.spot.status} />
            <p className="mt-1 text-xs text-rv-muted">Current</p>
          </div>
          <span className="text-rv-muted">&rarr;</span>
          <div className="text-center">
            <StatusBadge status={statusModal?.nextStatus} />
            <p className="mt-1 text-xs text-rv-muted">New</p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={() => setStatusModal(null)} className="rounded-lg border border-rv-border2 px-4 py-2 text-sm font-medium text-rv-muted">Cancel</button>
          <button onClick={confirmStatus} className="rounded-lg bg-rv-accent px-4 py-2 text-sm font-semibold text-white hover:bg-rv-accent/90">Confirm</button>
        </div>
      </Modal>

      {/* Add spot modal */}
      <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setAddForm({ label: "", price: "" }); setAddErrors({}); }} title="Add Parking Spot">
        <form onSubmit={handleAdd} noValidate className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-rv-text">Spot label</label>
            <input value={addForm.label} onChange={(e) => setAddForm((f) => ({ ...f, label: e.target.value }))} placeholder="D1" className={inputCls(addErrors.label)} />
            {addErrors.label && <p className="mt-1 text-xs text-rv-danger">{addErrors.label}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-rv-text">Price per night ($)</label>
            <input type="number" min={1} value={addForm.price} onChange={(e) => setAddForm((f) => ({ ...f, price: e.target.value }))} placeholder="15" className={inputCls(addErrors.price)} />
            {addErrors.price && <p className="mt-1 text-xs text-rv-danger">{addErrors.price}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowAdd(false)} className="rounded-lg border border-rv-border2 px-4 py-2 text-sm font-medium text-rv-muted">Cancel</button>
            <button type="submit" className="rounded-lg bg-rv-accent px-4 py-2 text-sm font-semibold text-white hover:bg-rv-accent/90">Add spot</button>
          </div>
        </form>
      </Modal>

      {/* Edit price modal */}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title={`Edit Price — ${editTarget?.spot.label}`}>
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium text-rv-text">New price per night ($)</label>
          <input type="number" min={1} value={editTarget?.price ?? ""} onChange={(e) => setEditTarget((p) => ({ ...p, price: e.target.value }))}
            className={inputCls(editError)} />
          {editError && <p className="mt-1 text-xs text-rv-danger">{editError}</p>}
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={() => setEditTarget(null)} className="rounded-lg border border-rv-border2 px-4 py-2 text-sm font-medium text-rv-muted">Cancel</button>
          <button onClick={handleEditSave} className="rounded-lg bg-rv-accent px-4 py-2 text-sm font-semibold text-white hover:bg-rv-accent/90">Save</button>
        </div>
      </Modal>

      {/* Delete modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Remove Spot">
        <p className="mb-5 text-sm text-rv-muted">
          Permanently remove spot <strong className="text-rv-text">{deleteTarget?.label}</strong>? This cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setDeleteTarget(null)} className="rounded-lg border border-rv-border2 px-4 py-2 text-sm font-medium text-rv-muted">Cancel</button>
          <button onClick={handleDelete} className="rounded-lg bg-rv-danger px-4 py-2 text-sm font-semibold text-white hover:bg-rv-danger/90">Remove</button>
        </div>
      </Modal>
    </div>
  );
}
