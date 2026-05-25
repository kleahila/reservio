import { useState, useEffect, useRef } from 'react';
import StatusBadge from '../../components/StatusBadge';
import { getParking, lockSpot, confirmSpot, releaseSpot } from '../../api/parking';
import { getTenantConfig } from '../../config/tenants';

function CarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 17H3v-5l2-5h14l2 5v5h-2" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  );
}

function SpotCard({ spot, selected, onSelect, disabled }) {
  const normalizedStatus = spot.status?.toUpperCase();
  const statusColor =
    normalizedStatus === 'AVAILABLE'
      ? 'border-rv-olive-400/60 bg-rv-olive-50 dark:bg-rv-olive-900/20 cursor-pointer hover:border-rv-olive-500'
      : normalizedStatus === 'LOCKED' || normalizedStatus === 'RESERVED'
      ? 'border-rv-warning/50 bg-rv-warning-soft cursor-not-allowed opacity-70'
      : 'border-rv-danger/40 bg-rv-danger-soft cursor-not-allowed opacity-60';

  const isAvail = normalizedStatus === 'AVAILABLE';

  return (
    <button
      onClick={() => isAvail && !disabled && onSelect(spot)}
      disabled={!isAvail || disabled}
      className={`flex flex-col items-center justify-center gap-1 rounded-xl border-2 p-3 text-center transition ${statusColor} ${selected?.id === spot.id ? 'ring-2 ring-rv-olive-500 ring-offset-1' : ''}`}
    >
      <CarIcon />
      <span className="text-sm font-bold text-rv-text">{spot.label}</span>
      <span className="text-[10px] text-rv-muted">${spot.pricePerNight}/n</span>
    </button>
  );
}

function GridABLayout({ spots, selected, onSelect, loading }) {
  const rowA = spots.filter((s) => s.label.startsWith('A'));
  const rowB = spots.filter((s) => s.label.startsWith('B'));
  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-rv-muted">Row A</p>
        <div className="flex flex-wrap gap-3">
          {rowA.map((s) => <SpotCard key={s.id} spot={s} selected={selected} onSelect={onSelect} disabled={loading} />)}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-rv-muted">Row B</p>
        <div className="flex flex-wrap gap-3">
          {rowB.map((s) => <SpotCard key={s.id} spot={s} selected={selected} onSelect={onSelect} disabled={loading} />)}
        </div>
      </div>
    </div>
  );
}

function LShapeCLayout({ spots, selected, onSelect, loading }) {
  const colC = spots.filter((s) => s.label.startsWith('C'));
  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-rv-muted">Column C</p>
      <div className="flex flex-col gap-3 w-fit">
        {colC.map((s) => <SpotCard key={s.id} spot={s} selected={selected} onSelect={onSelect} disabled={loading} />)}
      </div>
    </div>
  );
}

export default function ParkingMap() {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(null);
  const [locking, setLocking] = useState(false);
  const [countdown, setCountdown] = useState(300);
  const [lockedId, setLockedId] = useState(null);
  const timerRef = useRef(null);

  const { parkingLayout } = getTenantConfig();

  useEffect(() => {
    let cancelled = false;
    getParking()
      .then((data) => { if (!cancelled) { setSpots(data || []); setLoading(false); } })
      .catch((err) => { if (!cancelled) { setError(err.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!lockedId) return;
    setCountdown(300);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          releaseSpot(lockedId).catch(() => {});
          setLockedId(null);
          setSelected(null);
          setSpots((prev) => prev.map((s) => s.id === lockedId ? { ...s, status: 'AVAILABLE' } : s));
          return 300;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [lockedId]);

  const available = spots.filter((s) => s.status?.toUpperCase() === 'AVAILABLE').length;
  const taken     = spots.length - available;
  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  async function handleSpotClick(spot) {
    setLocking(true);
    try {
      await lockSpot(spot.id);
      setSpots((prev) => prev.map((s) => s.id === spot.id ? { ...s, status: 'RESERVED' } : s));
      setSelected(spot);
      setLockedId(spot.id);
    } catch (err) { setError(err.message); }
    finally { setLocking(false); }
  }

  async function handleConfirm() {
    if (!selected) return;
    try {
      await confirmSpot(selected.id);
      clearInterval(timerRef.current);
      setLockedId(null);
      setConfirmed(selected);
      setSelected(null);
      setSpots((prev) => prev.map((s) => s.id === selected.id ? { ...s, status: 'TAKEN' } : s));
    } catch (err) { setError(err.message); }
  }

  async function handleCancel() {
    if (!selected) return;
    try { await releaseSpot(selected.id); } catch { /* ignore */ }
    clearInterval(timerRef.current);
    setLockedId(null);
    setSpots((prev) => prev.map((s) => s.id === selected.id ? { ...s, status: 'AVAILABLE' } : s));
    setSelected(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-rv-text">Parking</h1>
        <p className="mt-1 text-rv-muted">Tap an available spot to reserve it.</p>
      </div>

      {loading && <div className="py-8 text-center text-rv-muted">Loading parking spots…</div>}
      {error && (
        <div className="rounded-xl border border-rv-danger/20 bg-rv-danger-soft px-5 py-4 text-sm text-rv-danger">{error}</div>
      )}

      {!loading && !error && (
        <>
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'Available', count: available, cls: 'text-rv-olive' },
              { label: 'Taken',     count: taken,     cls: 'text-rv-danger' },
            ].map(({ label, count, cls }) => (
              <div key={label} className="rounded-lg border border-rv-border bg-rv-surface px-4 py-2 text-sm">
                <span className="text-rv-muted">{label}</span>
                <span className={`ml-2 font-bold ${cls}`}>{count}</span>
              </div>
            ))}
          </div>

          {confirmed && (
            <div className="rounded-xl border border-rv-olive-300/50 bg-rv-olive-50 px-5 py-4 dark:bg-rv-olive-900/20">
              <p className="font-semibold text-rv-olive">
                Spot <strong>{confirmed.label}</strong> reserved — ${confirmed.pricePerNight}/night.
              </p>
              <button onClick={() => setConfirmed(null)} className="mt-1 text-xs text-rv-muted hover:text-rv-text">Dismiss</button>
            </div>
          )}

          {parkingLayout === 'grid-ab' ? (
            <GridABLayout spots={spots} selected={selected} onSelect={handleSpotClick} loading={locking} />
          ) : (
            <LShapeCLayout spots={spots} selected={selected} onSelect={handleSpotClick} loading={locking} />
          )}

          <div className="flex flex-wrap gap-3 text-xs">
            <StatusBadge status="Available" />
            <StatusBadge status="Occupied" />
          </div>

          {selected && (
            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-rv-border bg-rv-surface p-4 shadow-xl md:static md:rounded-xl md:shadow-sm">
              <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-rv-text">Spot {selected.label}</p>
                  <p className="text-sm text-rv-muted">${selected.pricePerNight}/night</p>
                  {lockedId && (
                    <p className="text-xs text-rv-warning">Locked for {fmt(countdown)} — confirm or it will be released</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={handleCancel} className="rounded-lg border border-rv-border2 px-4 py-2 text-sm font-medium text-rv-muted">Cancel</button>
                  <button onClick={handleConfirm} className="rounded-lg bg-rv-olive-600 px-5 py-2 text-sm font-semibold text-white hover:bg-rv-olive-700">Confirm</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
