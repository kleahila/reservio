import { useState } from "react";
import StatusBadge from "../../components/StatusBadge";
import { mockSunbeds } from "../../data/mockSunbeds";

const ZONES = ["All", "Poolside", "Beach", "Terrace"];

export default function SunbedMap() {
  const [sunbeds, setSunbeds] = useState(mockSunbeds);
  const [zone, setZone] = useState("All");
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(null);

  const visible = zone === "All" ? sunbeds : sunbeds.filter((s) => s.zone === zone);

  function handleReserve() {
    if (!selected) return;
    setSunbeds((p) => p.map((s) => s.id === selected.id ? { ...s, status: "Reserved" } : s));
    setConfirmed(selected);
    setSelected(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-rv-text">Sunbeds</h1>
        <p className="mt-1 text-rv-muted">Reserve a sunbed in your favourite zone.</p>
      </div>

      {/* Zone filter */}
      <div className="flex flex-wrap gap-2">
        {ZONES.map((z) => (
          <button
            key={z}
            onClick={() => setZone(z)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              zone === z
                ? "bg-rv-accent text-white"
                : "border border-rv-border2 bg-rv-surface text-rv-muted hover:text-rv-text"
            }`}
          >
            {z}
          </button>
        ))}
      </div>

      {confirmed && (
        <div className="rounded-xl border border-rv-success/30 bg-rv-success-soft px-5 py-4">
          <p className="font-semibold text-rv-success">
            Sunbed <strong>{confirmed.label}</strong> in {confirmed.zone} reserved.
          </p>
          <button onClick={() => setConfirmed(null)} className="mt-1 text-xs text-rv-success/70 hover:text-rv-success">Dismiss</button>
        </div>
      )}

      {/* Grouped by zone */}
      {ZONES.filter((z) => z !== "All" && (zone === "All" || zone === z)).map((z) => {
        const group = visible.filter((s) => s.zone === z);
        if (group.length === 0) return null;
        return (
          <div key={z}>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-rv-muted">{z}</h2>
            <div className="grid grid-cols-5 gap-3 sm:grid-cols-8 lg:grid-cols-10">
              {group.map((sunbed) => (
                <button
                  key={sunbed.id}
                  onClick={() => sunbed.status === "Available" && setSelected(sunbed)}
                  disabled={sunbed.status !== "Available"}
                  className={`flex flex-col items-center justify-center rounded-xl border-2 p-3 transition ${
                    sunbed.status === "Available"
                      ? "border-rv-success/40 bg-rv-success-soft hover:border-rv-success/60 cursor-pointer"
                      : "border-rv-warning/30 bg-rv-warning-soft cursor-not-allowed opacity-60"
                  } ${selected?.id === sunbed.id ? "ring-2 ring-rv-accent ring-offset-1" : ""}`}
                >
                  <span className="text-sm font-bold text-rv-text">{sunbed.label}</span>
                </button>
              ))}
            </div>
          </div>
        );
      })}

      <div className="flex gap-3 text-xs">
        <StatusBadge status="Available" />
        <StatusBadge status="Reserved" />
      </div>

      {selected && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-rv-border bg-rv-surface p-4 shadow-xl md:static md:rounded-xl md:shadow-sm">
          <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-rv-text">Sunbed {selected.label}</p>
              <p className="text-sm text-rv-muted">{selected.zone}</p>
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
