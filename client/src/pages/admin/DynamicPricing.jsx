import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import { getRules, createRule, updateRule } from '../../api/pricing';
import { getRooms } from '../../api/rooms';

function Toggle({ enabled, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={enabled}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-rv-accent/40 ${
        enabled ? 'bg-rv-accent' : 'bg-rv-border2'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

function OccupancyRing({ pct, threshold, ruleEnabled }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const filled = (pct / 100) * circ;
  const over = ruleEnabled && pct >= threshold;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="148" height="148" className="-rotate-90">
        <circle cx="74" cy="74" r={r} fill="none" stroke="var(--rv-border2)" strokeWidth="14" />
        <circle cx="74" cy="74" r={r} fill="none"
          stroke={over ? 'rgb(var(--rv-success))' : 'rgb(var(--rv-accent))'}
          strokeWidth="14"
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
        {ruleEnabled && threshold > 0 && (
          <circle cx="74" cy="74" r={r} fill="none"
            stroke="rgb(var(--rv-warning))" strokeWidth="3"
            strokeDasharray={`2 ${circ - 2}`}
            strokeDashoffset={-(threshold / 100) * circ}
            strokeLinecap="round"
          />
        )}
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-4xl font-bold ${over ? 'text-rv-success' : 'text-rv-accent'}`}>{pct}%</span>
        <span className="text-xs text-rv-muted">Occupied</span>
      </div>
    </div>
  );
}

export default function DynamicPricing() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [existingRuleId, setExistingRuleId] = useState(null);
  const [rule, setRule] = useState({ threshold: 80, adjustment: 20, enabled: false });
  const [form, setForm] = useState({ threshold: '80', adjustment: '20' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    Promise.all([getRooms(), getRules()])
      .then(([roomData, ruleData]) => {
        setRooms(roomData || []);
        if (ruleData && ruleData.length > 0) {
          const r = ruleData[0];
          setExistingRuleId(r.id);
          setRule({ threshold: r.threshold, adjustment: r.adjustment, enabled: r.enabled });
          setForm({ threshold: String(r.threshold), adjustment: String(r.adjustment) });
        }
      })
      .catch((err) => setLoadError(err.message));
  }, []);

  const totalRooms = rooms.length;
  const occupiedCount = rooms.filter((r) => r.status === 'Occupied').length;
  const currentOccupancy = totalRooms > 0 ? Math.round((occupiedCount / totalRooms) * 100) : 0;
  const isActive = rule.enabled && currentOccupancy >= rule.threshold;

  function validate() {
    const errs = {};
    const t = Number(form.threshold);
    const a = Number(form.adjustment);
    if (!form.threshold || isNaN(t) || t < 1 || t > 100) errs.threshold = 'Must be 1–100.';
    if (!form.adjustment || isNaN(a) || a <= 0) errs.adjustment = 'Must be > 0.';
    return errs;
  }

  async function handleSave(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSaving(true);
    const data = { threshold: Number(form.threshold), adjustment: Number(form.adjustment), enabled: rule.enabled };
    try {
      if (existingRuleId) {
        const updated = await updateRule(existingRuleId, data);
        setExistingRuleId(updated.id ?? existingRuleId);
      } else {
        const created = await createRule(data);
        setExistingRuleId(created.id);
      }
      setRule((p) => ({ ...p, threshold: Number(form.threshold), adjustment: Number(form.adjustment) }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const adjustedRooms = rooms.map((r) => ({
    ...r,
    adjustedPrice: isActive ? Math.round(r.pricePerNight * (1 + rule.adjustment / 100)) : null,
  }));

  const inputCls = (field) =>
    `w-24 rounded-lg border px-3 py-2 text-sm bg-rv-bg text-rv-text outline-none focus:ring-2 focus:ring-rv-accent/40 ${
      errors[field] ? 'border-rv-danger' : 'border-rv-border2'
    }`;

  return (
    <div>
      <PageHeader
        title="Dynamic Pricing"
        subtitle="Automatically adjust room prices when occupancy hits your threshold."
        action={
          <button onClick={() => navigate('/admin/analytics')} className="rounded-lg border border-rv-border2 bg-rv-surface px-4 py-2 text-sm font-medium text-rv-muted hover:text-rv-text">
            View Analytics
          </button>
        }
      />

      {loadError && (
        <div className="mb-4 rounded-xl border border-rv-danger/20 bg-rv-danger-soft px-5 py-3 text-sm text-rv-danger">
          {loadError}
        </div>
      )}

      {isActive && (
        <div className="mb-6 flex items-center gap-4 rounded-xl border border-rv-success/30 bg-rv-success-soft px-5 py-4">
          <div>
            <p className="font-semibold text-rv-success">Price adjustment active &mdash; +{rule.adjustment}% on all rooms</p>
            <p className="text-sm text-rv-success/70">Occupancy ({currentOccupancy}%) exceeds threshold ({rule.threshold}%).</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col items-center rounded-xl border border-rv-border bg-rv-surface p-8">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-rv-muted">Live Occupancy</p>
          <OccupancyRing pct={currentOccupancy} threshold={rule.threshold} ruleEnabled={rule.enabled} />
          <p className="mt-4 text-sm text-rv-muted">{occupiedCount} of {totalRooms} rooms occupied</p>
          {rule.enabled && (
            <div className={`mt-3 rounded-full px-4 py-1.5 text-xs font-medium ${isActive ? 'bg-rv-success-soft text-rv-success' : 'bg-rv-surface2 text-rv-muted'}`}>
              Threshold {rule.threshold}% &mdash; {isActive ? 'Exceeded, rule firing' : `Need ${rule.threshold - currentOccupancy}% more`}
            </div>
          )}
          <div className="mt-5 w-full space-y-1.5">
            {rooms.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg bg-rv-surface2 px-3 py-1.5 text-xs">
                <span className="truncate pr-2 font-medium text-rv-text">{r.type}</span>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <form onSubmit={handleSave} noValidate className="rounded-xl border border-rv-border bg-rv-surface p-6">
            <h2 className="mb-5 text-sm font-semibold text-rv-text">Rule Configuration</h2>
            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-medium text-rv-text">Occupancy threshold</label>
              <div className="flex items-center gap-2">
                <input type="number" min={1} max={100} value={form.threshold}
                  onChange={(e) => setForm((p) => ({ ...p, threshold: e.target.value }))}
                  className={inputCls('threshold')} />
                <span className="text-sm text-rv-muted">%</span>
                <div className="ml-2 h-2 flex-1 overflow-hidden rounded-full bg-rv-surface2">
                  <div className="h-2 rounded-full bg-rv-accent transition-all" style={{ width: `${Math.min(100, Number(form.threshold) || 0)}%` }} />
                </div>
              </div>
              {errors.threshold && <p className="mt-1 text-xs text-rv-danger">{errors.threshold}</p>}
            </div>
            <div className="mb-5">
              <label className="mb-1.5 block text-sm font-medium text-rv-text">Price adjustment</label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-rv-success">+</span>
                <input type="number" min={1} value={form.adjustment}
                  onChange={(e) => setForm((p) => ({ ...p, adjustment: e.target.value }))}
                  className={inputCls('adjustment')} />
                <span className="text-sm text-rv-muted">%</span>
              </div>
              {errors.adjustment && <p className="mt-1 text-xs text-rv-danger">{errors.adjustment}</p>}
            </div>
            <div className="mb-5 flex items-center gap-3 rounded-lg bg-rv-surface2 px-4 py-3">
              <Toggle enabled={rule.enabled} onToggle={() => setRule((p) => ({ ...p, enabled: !p.enabled }))} />
              <div>
                <p className="text-sm font-medium text-rv-text">
                  Rule is <span className={rule.enabled ? 'text-rv-success' : 'text-rv-muted'}>{rule.enabled ? 'enabled' : 'disabled'}</span>
                </p>
                <p className="text-xs text-rv-muted">Evaluated nightly against live occupancy</p>
              </div>
            </div>
            {saved && <p className="mb-3 text-sm font-medium text-rv-success">Rule saved.</p>}
            <button type="submit" disabled={saving} className="w-full rounded-lg bg-rv-accent py-2.5 text-sm font-semibold text-white hover:bg-rv-accent/90 disabled:opacity-50">
              {saving ? 'Saving…' : 'Save rule'}
            </button>
          </form>

          <div className="rounded-xl border border-rv-border bg-rv-surface p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-rv-text">Room Price Preview</h2>
              {isActive && <span className="rounded-full bg-rv-success-soft px-2 py-0.5 text-xs font-semibold text-rv-success">+{rule.adjustment}% active</span>}
            </div>
            <div className="space-y-2">
              {adjustedRooms.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-lg bg-rv-surface2 px-3 py-2 text-sm">
                  <span className="truncate pr-2 font-medium text-rv-text">{r.type}</span>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-rv-muted">${r.pricePerNight}</span>
                    {r.adjustedPrice && r.adjustedPrice !== r.pricePerNight && (
                      <>
                        <span className="text-rv-subtle">&rarr;</span>
                        <span className="font-bold text-rv-success">${r.adjustedPrice}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
