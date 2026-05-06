import { useState, useEffect, useRef } from 'react';
import StatusBadge from '../../components/StatusBadge';
import { getSunbeds, lockSunbed, confirmSunbed, releaseSunbed } from '../../api/sunbeds';

const ZONES = ['All', 'Poolside', 'Beach', 'Terrace'];
const SLOTS = ['Morning', 'Afternoon', 'Full Day'];

export default function SunbedMap() {
  const [sunbeds, setSunbeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zone, setZone] = useState('All');
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedSlot, setSelectedSlot] = useState('Full Day');
  const [locking, setLocking] = useState(false);
  const [lockedId, setLockedId] = useState(null);
  const [countdown, setCountdown] = useState(300);
  const timerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    getSunbeds()
      .then((data) => { if (!cancelled) { setSunbeds(data || []); setLoading(false); } })
      .catch((err) => { if (!cancelled) { setError(err.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  // 5-minute countdown after locking
  useEffect(() => {
    if (!lockedId) return;
    setCountdown(300);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          releaseSunbed(lockedId).catch(() => {});
          setLockedId(null);
          setSelected(null);
          setSunbeds((prev) => prev.map((s) => s.id === lockedId ? { ...s, status: 'Available' } : s));
          return 300;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [lockedId]);

  const visible = zone === 'All' ? sunbeds : sunbeds.filter((s) => s.zone === zone);

  async function handleSunbedClick(sunbed) {
    if (sunbed.status !== 'Available') return;
    setLocking(true);
    try {
      await lockSunbed(sunbed.id);
      setSunbeds((prev) => prev.map((s) => s.id === sunbed.id ? { ...s, status: 'Reserved' } : s));
      setSelected(sunbed);
      setLockedId(sunbed.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLocking(false);
    }
  }

  async function handleConfirm() {
    if (!selected) return;
    try {
      await confirmSunbed(selected.id, selectedDate, selectedSlot);
      clearInterval(timerRef.current);
      setLockedId(null);
      setConfirmed({ ...selected, date: selectedDate, slot: selectedSlot });
      setSelected(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCancel() {
    if (!selected) return;
    try {
      await releaseSunbed(selected.id);
    } catch { /* ignore */ }
    clearInterval(timerRef.current);
    setLockedId(null);
    setSunbeds((prev) => prev.map((s) => s.id === selected.id ? { ...s, status: 'Available' } : s));
    setSelected(null);
  }

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-rv-text">Sunbeds</h1>
        <p className="mt-1 text-rv-muted">Reserve a sunbed in your favourite zone.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {ZONES.map((z) => (
          <button
            key={z}
            onClick={() => setZone(z)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              zone === z
                ? 'bg-rv-accent text-white'
                : 'border border-rv-border2 bg-rv-surface text-rv-muted hover:text-rv-text'
            }`}
          >
            {z}
          </button>
        ))}
      </div>

      {loading && <div className="py-8 text-center text-rv-muted">Loading sunbeds…</div>}

      {error && (
        <div className="rounded-xl border border-rv-danger/20 bg-rv-danger-soft px-5 py-4 text-sm text-rv-danger">
          {error}
        </div>
      )}

      {confirmed && (
        <div className="rounded-xl border border-rv-success/30 bg-rv-success-soft px-5 py-4">
          <p className="font-semibold text-rv-success">
            Sunbed <strong>{confirmed.label}</strong> in {confirmed.zone} — {confirmed.slot} on {confirmed.date}.
          </p>
          <button onClick={() => setConfirmed(null)} className="mt-1 text-xs text-rv-success/70 hover:text-rv-success">Dismiss</button>
        </div>
      )}

      {!loading && !error && ZONES.filter((z) => z !== 'All' && (zone === 'All' || zone === z)).map((z) => {
        const group = visible.filter((s) => s.zone === z);
        if (group.length === 0) return null;
        return (
          <div key={z}>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-rv-muted">{z}</h2>
            <div className="grid grid-cols-5 gap-3 sm:grid-cols-8 lg:grid-cols-10">
              {group.map((sunbed) => (
                <button
                  key={sunbed.id}
                  onClick={() => handleSunbedClick(sunbed)}
                  disabled={sunbed.status !== 'Available' || locking}
                  className={`flex flex-col items-center justify-center rounded-xl border-2 p-3 transition ${
                    sunbed.status === 'Available'
                      ? 'border-rv-success/40 bg-rv-success-soft hover:border-rv-success/60 cursor-pointer'
                      : 'border-rv-warning/30 bg-rv-warning-soft cursor-not-allowed opacity-60'
                  } ${selected?.id === sunbed.id ? 'ring-2 ring-rv-accent ring-offset-1' : ''}`}
                >
                  <span className="text-sm font-bold text-rv-text">{sunbed.label}</span>
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {!loading && !error && (
        <div className="flex gap-3 text-xs">
          <StatusBadge status="Available" />
          <StatusBadge status="Reserved" />
        </div>
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
                  className="w-full rounded-lg border border-rv-border2 bg-rv-surface px-3 py-2 text-sm text-rv-text outline-none focus:ring-2 focus:ring-rv-accent/40"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-rv-text">Slot</label>
                <select
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  className="w-full rounded-lg border border-rv-border2 bg-rv-surface px-3 py-2 text-sm text-rv-text outline-none focus:ring-2 focus:ring-rv-accent/40"
                >
                  {SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={handleCancel} className="rounded-lg border border-rv-border2 px-4 py-2 text-sm font-medium text-rv-muted">Cancel</button>
              <button onClick={handleConfirm} className="rounded-lg bg-rv-accent px-5 py-2 text-sm font-semibold text-white hover:bg-rv-accent/90">Reserve</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
