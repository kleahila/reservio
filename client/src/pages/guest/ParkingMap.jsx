import { useState, useEffect, useRef } from 'react';
import StatusBadge from '../../components/StatusBadge';
import { getParking, lockSpot, confirmSpot, releaseSpot } from '../../api/parking';

const CARD_CLS = {
  Available:   'border-rv-success/40 bg-rv-success-soft hover:border-rv-success/60 cursor-pointer',
  Occupied:    'border-rv-accent/30 bg-rv-accent-soft cursor-not-allowed opacity-60',
  Maintenance: 'border-rv-danger/30 bg-rv-danger-soft cursor-not-allowed opacity-60',
  Reserved:    'border-rv-warning/30 bg-rv-warning-soft cursor-not-allowed opacity-60',
  LOCKED:      'border-rv-warning/40 bg-rv-warning-soft cursor-not-allowed opacity-60',
};

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

  useEffect(() => {
    let cancelled = false;
    getParking()
      .then((data) => { if (!cancelled) { setSpots(data || []); setLoading(false); } })
      .catch((err) => { if (!cancelled) { setError(err.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  // 5-minute countdown after locking a spot
  useEffect(() => {
    if (!lockedId) return;
    setCountdown(300);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          releaseSpot(lockedId).catch(() => {});
          setLockedId(null);
          setSelected(null);
          setSpots((prev) => prev.map((s) => s.id === lockedId ? { ...s, status: 'Available' } : s));
          return 300;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [lockedId]);

  const stats = {
    available:   spots.filter((s) => s.status === 'Available').length,
    occupied:    spots.filter((s) => s.status === 'Occupied' || s.status === 'OCCUPIED').length,
    reserved:    spots.filter((s) => s.status === 'Reserved' || s.status === 'RESERVED').length,
    maintenance: spots.filter((s) => s.status === 'Maintenance' || s.status === 'MAINTENANCE').length,
  };

  async function handleSpotClick(spot) {
    if (spot.status !== 'Available') return;
    setLocking(true);
    try {
      await lockSpot(spot.id);
      setSpots((prev) => prev.map((s) => s.id === spot.id ? { ...s, status: 'Reserved' } : s));
      setSelected(spot);
      setLockedId(spot.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLocking(false);
    }
  }

  async function handleConfirm() {
    if (!selected) return;
    try {
      await confirmSpot(selected.id);
      clearInterval(timerRef.current);
      setLockedId(null);
      setConfirmed(selected);
      setSelected(null);
      setSpots((prev) => prev.map((s) => s.id === selected.id ? { ...s, status: 'Occupied' } : s));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCancel() {
    if (!selected) return;
    try {
      await releaseSpot(selected.id);
    } catch { /* ignore */ }
    clearInterval(timerRef.current);
    setLockedId(null);
    setSpots((prev) => prev.map((s) => s.id === selected.id ? { ...s, status: 'Available' } : s));
    setSelected(null);
  }

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-rv-text">Parking</h1>
        <p className="mt-1 text-rv-muted">Tap an available spot to reserve it for your stay.</p>
      </div>

      {loading && <div className="py-8 text-center text-rv-muted">Loading parking spots…</div>}

      {error && (
        <div className="rounded-xl border border-rv-danger/20 bg-rv-danger-soft px-5 py-4 text-sm text-rv-danger">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
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
                onClick={() => handleSpotClick(spot)}
                disabled={spot.status !== 'Available' || locking}
                className={`flex flex-col items-center justify-center rounded-xl border-2 p-3 text-center transition ${
                  CARD_CLS[spot.status] ?? ''
                } ${selected?.id === spot.id ? 'ring-2 ring-rv-accent ring-offset-1' : ''}`}
              >
                <span className="text-sm font-bold text-rv-text">{spot.label}</span>
                <span className="text-xs text-rv-muted">${spot.pricePerNight}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 text-xs">
            {['Available', 'Occupied', 'Reserved', 'Maintenance'].map((s) => (
              <StatusBadge key={s} status={s} />
            ))}
          </div>

          {selected && (
            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-rv-border bg-rv-surface p-4 shadow-xl md:static md:rounded-xl md:shadow-sm">
              <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-rv-text">Spot {selected.label}</p>
                  <p className="text-sm text-rv-muted">${selected.pricePerNight}/night</p>
                  {lockedId && (
                    <p className="text-xs text-rv-warning">Reserved for {fmt(countdown)} — confirm or it will be released</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={handleCancel} className="rounded-lg border border-rv-border2 px-4 py-2 text-sm font-medium text-rv-muted">Cancel</button>
                  <button onClick={handleConfirm} className="rounded-lg bg-rv-accent px-5 py-2 text-sm font-semibold text-white hover:bg-rv-accent/90">Confirm</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
