import { useState } from "react";
import StatusBadge from "../../components/StatusBadge";
import { mockParking } from "../../data/mockParking";

const CARD_CLS = {
  Available:   "border-rv-success/40 bg-rv-success-soft hover:border-rv-success/60 cursor-pointer",
  Occupied:    "border-rv-accent/30 bg-rv-accent-soft cursor-not-allowed opacity-60",
  Maintenance: "border-rv-danger/30 bg-rv-danger-soft cursor-not-allowed opacity-60",
  Reserved:    "border-rv-warning/30 bg-rv-warning-soft cursor-not-allowed opacity-60",
};

export default function ParkingMap() {
  const [spots, setSpots] = useState(mockParking);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(null);

  const stats = {
    available:   spots.filter((s) => s.status === "Available").length,
    occupied:    spots.filter((s) => s.status === "Occupied").length,
    reserved:    spots.filter((s) => s.status === "Reserved").length,
    maintenance: spots.filter((s) => s.status === "Maintenance").length,
  };

  function handleReserve() {
    if (!selected) return;
    setSpots((p) => p.map((s) => s.id === selected.id ? { ...s, status: "Reserved" } : s));
    setConfirmed(selected);
    setSelected(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-rv-text">Parking</h1>
        <p className="mt-1 text-rv-muted">Tap an available spot to reserve it for your stay.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {Object.entries(stats).map(([label, count]) => (
          <div key={label} className="rounded-lg border border-rv-border bg-rv-surface px-4 py-2 text-sm">
            <span className="capitalize text-rv-muted">{label}</span>
            <span className="ml-2 font-bold text-rv-text">{count}</span>
          </div>
        ))}
      </div>

      {confirmed && (
        <div className="rounded-xl border border-rv-success/30 bg-rv-success-soft px-5 py-4">
          <p className="font-semibold text-rv-success">
            Spot <strong>{confirmed.label}</strong> reserved &mdash; ${confirmed.pricePerNight}/night.
          </p>
          <button onClick={() => setConfirmed(null)} className="mt-1 text-xs text-rv-success/70 hover:text-rv-success">
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8">
        {spots.map((spot) => (
          <button
            key={spot.id}
            onClick={() => spot.status === "Available" && setSelected(spot)}
            disabled={spot.status !== "Available"}
            className={`flex flex-col items-center justify-center rounded-xl border-2 p-3 text-center transition ${
              CARD_CLS[spot.status] ?? ""
            } ${selected?.id === spot.id ? "ring-2 ring-rv-accent ring-offset-1" : ""}`}
          >
            <span className="text-sm font-bold text-rv-text">{spot.label}</span>
            <span className="text-xs text-rv-muted">${spot.pricePerNight}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 text-xs">
        {["Available", "Occupied", "Reserved", "Maintenance"].map((s) => (
          <StatusBadge key={s} status={s} />
        ))}
      </div>

      {selected && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-rv-border bg-rv-surface p-4 shadow-xl md:static md:rounded-xl md:shadow-sm">
          <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-rv-text">Spot {selected.label}</p>
              <p className="text-sm text-rv-muted">${selected.pricePerNight}/night</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSelected(null)} className="rounded-lg border border-rv-border2 px-4 py-2 text-sm font-medium text-rv-muted">Cancel</button>
              <button onClick={handleReserve} className="rounded-lg bg-rv-accent px-5 py-2 text-sm font-semibold text-white hover:bg-rv-accent/90">Reserve</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
