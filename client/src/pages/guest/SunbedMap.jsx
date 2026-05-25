import { useState, useEffect, useRef } from 'react';
import StatusBadge from '../../components/StatusBadge';
import { getSunbeds, lockSunbed, confirmSunbed, releaseSunbed } from '../../api/sunbeds';
import { getTenantConfig } from '../../config/tenants';

const SLOTS = [
  { value: 'MORNING',   label: 'Morning'   },
  { value: 'AFTERNOON', label: 'Afternoon' },
  { value: 'FULL_DAY',  label: 'Full Day'  },
];

function SunbedButton({ bed, selected, onSelect, disabled }) {
  const isAvail = bed.status?.toUpperCase() === 'AVAILABLE';
  return (
    <button
      onClick={() => isAvail && !disabled && onSelect(bed)}
      disabled={!isAvail || disabled}
      className={`flex flex-col items-center justify-center rounded-xl border-2 p-3 transition ${
        isAvail
          ? 'border-rv-sea-400/50 bg-rv-sea-50 hover:border-rv-sea-500 cursor-pointer dark:bg-rv-sea-900/20'
          : 'border-rv-warning/30 bg-rv-warning-soft cursor-not-allowed opacity-60'
      } ${selected?.id === bed.id ? 'ring-2 ring-rv-sea ring-offset-1' : ''}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17l4-8 4 3 3-6 4 11" />
        <line x1="3" y1="21" x2="21" y2="21" />
      </svg>
      <span className="mt-1 text-xs font-bold text-rv-text">{bed.label}</span>
    </button>
  );
}

function PoolABLayout({ sunbeds, selected, onSelect, loading }) {
  const poolA = sunbeds.filter((s) => s.zone === 'Pool A');
  const poolB = sunbeds.filter((s) => s.zone === 'Pool B');
  const topRow = poolA.slice(0, 4);
  const botRow = poolA.slice(4, 8);
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-rv-muted">Pool A</p>
        <div className="rounded-2xl border-2 border-rv-sea-200 bg-rv-sea-50/50 p-4 dark:bg-rv-sea-900/10">
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            {topRow.map((b) => <SunbedButton key={b.id} bed={b} selected={selected} onSelect={onSelect} disabled={loading} />)}
          </div>
          <div className="mx-4 h-16 rounded-xl bg-rv-sea-200/60 dark:bg-rv-sea-800/30 flex items-center justify-center text-xs font-semibold text-rv-sea uppercase tracking-wider">Pool</div>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {botRow.map((b) => <SunbedButton key={b.id} bed={b} selected={selected} onSelect={onSelect} disabled={loading} />)}
          </div>
        </div>
      </div>
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-rv-muted">Pool B</p>
        <div className="flex flex-wrap gap-3">
          {poolB.map((b) => <SunbedButton key={b.id} bed={b} selected={selected} onSelect={onSelect} disabled={loading} />)}
        </div>
      </div>
    </div>
  );
}

function TerraceLine({ sunbeds, selected, onSelect, loading }) {
  const terrace = sunbeds.filter((s) => s.zone === 'Terrace');
  return (
    <div>
      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-rv-muted">Terrace</p>
      <div className="rounded-xl border border-rv-sand-300 bg-rv-sand-50 dark:bg-rv-sand-900/10 p-4">
        <div className="flex flex-wrap gap-3">
          {terrace.map((b) => <SunbedButton key={b.id} bed={b} selected={selected} onSelect={onSelect} disabled={loading} />)}
        </div>
        <div className="mt-3 rounded-lg border border-rv-sand-400/40 bg-rv-sand-100/60 py-2 text-center text-xs font-medium text-rv-muted dark:bg-rv-sand-900/20">
          Terrace Edge
        </div>
      </div>
    </div>
  );
}

export default function SunbedMap() {
  const [sunbeds, setSunbeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedSlot, setSelectedSlot] = useState('FULL_DAY');
  const [locking, setLocking] = useState(false);
  const [lockedId, setLockedId] = useState(null);
  const [countdown, setCountdown] = useState(300);
  const timerRef = useRef(null);

  const { sunbedLayout } = getTenantConfig();

  useEffect(() => {
    let cancelled = false;
    getSunbeds()
      .then((data) => { if (!cancelled) { setSunbeds(data || []); setLoading(false); } })
      .catch((err) => { if (!cancelled) { setError(err.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!lockedId) return;
    setCountdown(300);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          releaseSunbed(lockedId).catch(() => {});
          setLockedId(null);
          setSelected(null);
          setSunbeds((prev) => prev.map((s) => s.id === lockedId ? { ...s, status: 'AVAILABLE' } : s));
          return 300;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [lockedId]);

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  async function handleSunbedClick(bed) {
    setLocking(true);
    try {
      await lockSunbed(bed.id);
      setSunbeds((prev) => prev.map((s) => s.id === bed.id ? { ...s, status: 'RESERVED' } : s));
      setSelected(bed);
      setLockedId(bed.id);
    } catch (err) { setError(err.message); }
    finally { setLocking(false); }
  }

  async function handleConfirm() {
    if (!selected) return;
    try {
      await confirmSunbed(selected.id, selectedDate, selectedSlot);
      clearInterval(timerRef.current);
      setLockedId(null);
      setConfirmed({ ...selected, date: selectedDate, slot: selectedSlot });
      setSelected(null);
    } catch (err) { setError(err.message); }
  }

  async function handleCancel() {
    if (!selected) return;
    try { await releaseSunbed(selected.id); } catch { /* ignore */ }
    clearInterval(timerRef.current);
    setLockedId(null);
    setSunbeds((prev) => prev.map((s) => s.id === selected.id ? { ...s, status: 'AVAILABLE' } : s));
    setSelected(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-rv-text">Sunbeds</h1>
        <p className="mt-1 text-rv-muted">Reserve a sunbed in your favourite spot.</p>
      </div>

      {loading && <div className="py-8 text-center text-rv-muted">Loading sunbeds…</div>}
      {error && (
        <div className="rounded-xl border border-rv-danger/20 bg-rv-danger-soft px-5 py-4 text-sm text-rv-danger">{error}</div>
      )}

      {confirmed && (
        <div className="rounded-xl border border-rv-sea-300/50 bg-rv-sea-50 px-5 py-4 dark:bg-rv-sea-900/20">
          <p className="font-semibold text-rv-sea">
            Sunbed <strong>{confirmed.label}</strong> — {SLOTS.find(s => s.value === confirmed.slot)?.label ?? confirmed.slot} on {confirmed.date}.
          </p>
          <button onClick={() => setConfirmed(null)} className="mt-1 text-xs text-rv-muted hover:text-rv-text">Dismiss</button>
        </div>
      )}

      {!loading && !error && (
        <>
          {sunbedLayout === 'pool-ab' ? (
            <PoolABLayout sunbeds={sunbeds} selected={selected} onSelect={handleSunbedClick} loading={locking} />
          ) : (
            <TerraceLine sunbeds={sunbeds} selected={selected} onSelect={handleSunbedClick} loading={locking} />
          )}

          <div className="flex gap-3 text-xs">
            <StatusBadge status="Available" />
            <StatusBadge status="Reserved" />
          </div>
        </>
      )}

      {selected && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-rv-border bg-rv-surface p-4 shadow-xl md:static md:rounded-xl md:shadow-sm">
          <div className="mx-auto max-w-lg space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-rv-text">Sunbed {selected.label} — {selected.zone}</p>
                {lockedId && (
                  <p className="text-xs text-rv-warning">Locked for {fmt(countdown)} — confirm or it will be released</p>
                )}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-rv-text">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                  className="w-full rounded-lg border border-rv-border2 bg-rv-surface px-3 py-2 text-sm text-rv-text outline-none focus:ring-2 focus:ring-rv-sea/40"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-rv-text">Slot</label>
                <select
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  className="w-full rounded-lg border border-rv-border2 bg-rv-surface px-3 py-2 text-sm text-rv-text outline-none focus:ring-2 focus:ring-rv-sea/40"
                >
                  {SLOTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={handleCancel} className="rounded-lg border border-rv-border2 px-4 py-2 text-sm font-medium text-rv-muted">Cancel</button>
              <button onClick={handleConfirm} className="rounded-lg bg-rv-sea px-5 py-2 text-sm font-semibold text-white hover:bg-rv-sea-600">Reserve</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
