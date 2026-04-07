import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "../../components/Toast";
import { rooms } from "../../data/rooms";

const totalRooms = rooms.length;
const occupiedCount = rooms.filter((r) => r.status === "Occupied").length;
const currentOccupancy = Math.round((occupiedCount / totalRooms) * 100);

function Toggle({ enabled, onToggle }) {
  return (
    <button type="button" onClick={onToggle} aria-pressed={enabled}
      className={`relative inline-flex h-7 w-13 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-1 ${
        enabled ? "bg-green-500" : "bg-slate-300"
      }`}>
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
        enabled ? "translate-x-6" : "translate-x-1"
      }`} />
    </button>
  );
}

function OccupancyRing({ pct, threshold, ruleEnabled }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const filled = (pct / 100) * circ;
  const over = ruleEnabled && pct >= threshold;
  const color = over ? "#16a34a" : "#2E75B6";

  return (
    <div className="relative flex items-center justify-center">
      <svg width="148" height="148" className="-rotate-90">
        <circle cx="74" cy="74" r={r} fill="none" stroke="#e2e8f0" strokeWidth="14" />
        <circle cx="74" cy="74" r={r} fill="none" stroke={color} strokeWidth="14"
          strokeDasharray={`${filled} ${circ - filled}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }} />
        {ruleEnabled && threshold > 0 && (
          <circle cx="74" cy="74" r={r} fill="none" stroke="#f97316" strokeWidth="3"
            strokeDasharray={`2 ${circ - 2}`}
            strokeDashoffset={-(threshold / 100) * circ}
            strokeLinecap="round" />
        )}
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-4xl font-bold ${over ? "text-green-700" : "text-brand-primary"}`}>
          {pct}%
        </span>
        <span className="text-xs text-slate-500">Occupied</span>
      </div>
    </div>
  );
}

function DynamicPricing() {
  const navigate = useNavigate();
  const [rule, setRule] = useState({ threshold: 80, adjustment: 20, enabled: false });
  const [form, setForm] = useState({ threshold: "80", adjustment: "20" });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const isActive = rule.enabled && currentOccupancy >= rule.threshold;

  function validate() {
    const errs = {};
    const t = Number(form.threshold);
    const a = Number(form.adjustment);
    if (!form.threshold || isNaN(t) || t < 1 || t > 100)
      errs.threshold = "Must be between 1 and 100.";
    if (!form.adjustment || isNaN(a) || a <= 0)
      errs.adjustment = "Must be greater than 0.";
    return errs;
  }

  function handleSave(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setRule((p) => ({ ...p, threshold: Number(form.threshold), adjustment: Number(form.adjustment) }));
    setToast({ message: "Pricing rule saved successfully.", type: "success" });
  }

  const adjustedRooms = rooms.map((r) => ({
    ...r,
    adjustedPrice: isActive ? Math.round(r.pricePerNight * (1 + rule.adjustment / 100)) : null,
  }));

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Dynamic Pricing</h1>
          <p className="mt-1 text-sm text-slate-500">
            Automatically adjust room prices when occupancy hits your threshold.
          </p>
        </div>
        <button onClick={() => navigate("/admin/analytics")}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50">
          View Analytics →
        </button>
      </div>

      {/* Active banner */}
      {isActive && (
        <div className="mb-6 flex items-center gap-4 rounded-xl border border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 px-5 py-4 shadow-sm">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-xl">⚡</span>
          <div>
            <p className="font-semibold text-green-800">
              Price adjustment ACTIVE — +{rule.adjustment}% applied to all rooms
            </p>
            <p className="text-sm text-green-700">
              Occupancy ({currentOccupancy}%) exceeds threshold ({rule.threshold}%).
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Occupancy Card */}
        <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Live Occupancy
          </p>
          <OccupancyRing pct={currentOccupancy} threshold={rule.threshold} ruleEnabled={rule.enabled} />
          <p className="mt-4 text-sm text-slate-500">
            {occupiedCount} of {totalRooms} rooms occupied
          </p>
          {rule.enabled && (
            <div className={`mt-3 rounded-full px-4 py-1.5 text-xs font-medium ${
              isActive ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"
            }`}>
              Threshold: {rule.threshold}% —{" "}
              {isActive ? "✓ Exceeded, rule firing" : `Need ${rule.threshold - currentOccupancy}% more`}
            </div>
          )}
          {/* Status of each room */}
          <div className="mt-5 w-full space-y-1.5">
            {rooms.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 text-xs">
                <span className="font-medium text-slate-700 truncate">{r.type}</span>
                <span className={`rounded-full px-2 py-0.5 font-semibold ${
                  r.status === "Occupied" ? "bg-blue-100 text-blue-800"
                  : r.status === "Maintenance" ? "bg-orange-100 text-orange-700"
                  : "bg-green-100 text-green-800"
                }`}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Rule Form + Adjusted Prices */}
        <div className="flex flex-col gap-5">
          <form onSubmit={handleSave} noValidate
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-sm font-semibold text-brand-primary">Rule Configuration</h2>

            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Occupancy Threshold
              </label>
              <div className="flex items-center gap-2">
                <input type="number" min={1} max={100} value={form.threshold}
                  onChange={(e) => setForm((p) => ({ ...p, threshold: e.target.value }))}
                  className={`w-24 rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-accent ${
                    errors.threshold ? "border-red-400 bg-red-50" : "border-slate-300"
                  }`} />
                <span className="text-sm text-slate-500">%</span>
                <div className="ml-2 h-2 flex-1 rounded-full bg-slate-200">
                  <div className="h-2 rounded-full bg-brand-accent transition-all"
                    style={{ width: `${form.threshold || 0}%` }} />
                </div>
              </div>
              {errors.threshold && <p className="mt-1 text-xs text-red-500">{errors.threshold}</p>}
            </div>

            <div className="mb-5">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Price Adjustment
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-green-600">+</span>
                <input type="number" min={1} value={form.adjustment}
                  onChange={(e) => setForm((p) => ({ ...p, adjustment: e.target.value }))}
                  className={`w-24 rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-accent ${
                    errors.adjustment ? "border-red-400 bg-red-50" : "border-slate-300"
                  }`} />
                <span className="text-sm text-slate-500">%</span>
              </div>
              {errors.adjustment && <p className="mt-1 text-xs text-red-500">{errors.adjustment}</p>}
            </div>

            <div className="mb-5 flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-3">
              <Toggle enabled={rule.enabled}
                onToggle={() => setRule((p) => ({ ...p, enabled: !p.enabled }))} />
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Rule is{" "}
                  <span className={rule.enabled ? "text-green-600" : "text-slate-400"}>
                    {rule.enabled ? "enabled" : "disabled"}
                  </span>
                </p>
                <p className="text-xs text-slate-400">
                  Evaluated nightly against live occupancy
                </p>
              </div>
            </div>

            <button type="submit"
              className="w-full rounded-lg bg-brand-primary py-2.5 text-sm font-semibold text-white transition hover:bg-brand-accent">
              Save Rule
            </button>
          </form>

          {/* Live price preview */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700">Room Price Preview</h2>
              {isActive && (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                  Adjusted +{rule.adjustment}%
                </span>
              )}
            </div>
            <div className="space-y-2">
              {adjustedRooms.map((r) => (
                <div key={r.id}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                  <span className="font-medium text-slate-700 truncate pr-2">{r.type}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-slate-500">${r.pricePerNight}</span>
                    {r.adjustedPrice && r.adjustedPrice !== r.pricePerNight && (
                      <>
                        <span className="text-slate-300">→</span>
                        <span className="font-bold text-green-600">${r.adjustedPrice}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default DynamicPricing;
