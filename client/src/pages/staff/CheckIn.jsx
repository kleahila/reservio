import { useState } from 'react';
import { getReservations, updateReservationStatus } from '../../api/reservations';
import { useEffect } from 'react';

export default function CheckIn() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getReservations({ status: 'CONFIRMED' })
      .then((data) => { setReservations(data || []); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, []);

  async function handleCheckIn(id) {
    try {
      await updateReservationStatus(id, 'CHECKED_IN');
      setReservations((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-rv-text">Check-In</h1>
        <p className="mt-1 text-rv-muted">Process guest arrivals and assign rooms.</p>
      </div>

      {loading && <div className="py-12 text-center text-rv-muted">Loading reservations…</div>}

      {error && (
        <div className="rounded-xl border border-rv-danger/20 bg-rv-danger-soft px-5 py-4 text-sm text-rv-danger">
          {error}
        </div>
      )}

      {!loading && !error && reservations.length === 0 && (
        <div className="rounded-xl border border-rv-border bg-rv-surface p-12 text-center text-rv-muted">
          No reservations pending check-in.
        </div>
      )}

      {!loading && !error && reservations.length > 0 && (
        <div className="space-y-3">
          {reservations.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between rounded-xl border border-rv-border bg-rv-surface p-4"
            >
              <div>
                <p className="font-semibold text-rv-text">{r.guest?.fullName ?? 'Guest'}</p>
                <p className="text-sm text-rv-muted">Room {r.room?.description} · {r.checkIn} → {r.checkOut}</p>
              </div>
              <button
                onClick={() => handleCheckIn(r.id)}
                className="rounded-lg bg-rv-olive-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rv-olive-600"
              >
                Check In
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
