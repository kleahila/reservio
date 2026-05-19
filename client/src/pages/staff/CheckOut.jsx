import { useState, useEffect } from 'react';
import { getReservations, updateReservationStatus } from '../../api/reservations';

export default function CheckOut() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getReservations({ status: 'CHECKED_IN' })
      .then((data) => { setReservations(data || []); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, []);

  async function handleCheckOut(id) {
    try {
      await updateReservationStatus(id, 'CHECKED_OUT');
      setReservations((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-rv-text">Check-Out</h1>
        <p className="mt-1 text-rv-muted">Process guest departures and release rooms.</p>
      </div>

      {loading && <div className="py-12 text-center text-rv-muted">Loading reservations…</div>}

      {error && (
        <div className="rounded-xl border border-rv-danger/20 bg-rv-danger-soft px-5 py-4 text-sm text-rv-danger">
          {error}
        </div>
      )}

      {!loading && !error && reservations.length === 0 && (
        <div className="rounded-xl border border-rv-border bg-rv-surface p-12 text-center text-rv-muted">
          No guests currently checked in.
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
                <p className="text-sm text-rv-muted">Room {r.room?.description} · checked in {r.checkIn}</p>
              </div>
              <button
                onClick={() => handleCheckOut(r.id)}
                className="rounded-lg bg-rv-sea-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rv-sea-600"
              >
                Check Out
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
