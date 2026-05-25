import { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import { getServices, createOrder } from '../../api/services';
import { getMyReservations } from '../../api/reservations';

export default function Marketplace() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('All');
  const [booking, setBooking] = useState(null);
  const [confirmed, setConfirmed] = useState(null);
  const [ordering, setOrdering] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [activeReservationId, setActiveReservationId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getServices(), getMyReservations()])
      .then(([svcData, resData]) => {
        if (cancelled) return;
        setServices(svcData || []);
        const active = (resData || []).find(
          (r) => r.status === 'CHECKED_IN' || r.status === 'CheckedIn' || r.status === 'CONFIRMED',
        );
        setActiveReservationId(active?.id ?? null);
        setLoading(false);
      })
      .catch((err) => {
        if (!cancelled) { setError(err.message); setLoading(false); }
      });

    return () => { cancelled = true; };
  }, []);

  const categories = ['All', ...new Set(services.map((s) => s.category))];
  const visible = category === 'All' ? services : services.filter((s) => s.category === category);

  async function handleBook() {
    if (!booking) return;
    setOrdering(true);
    setOrderError('');
    try {
      await createOrder(booking.id, activeReservationId);
      setConfirmed(booking);
      setBooking(null);
    } catch (err) {
      setOrderError(err.message || 'Order failed. Please try again.');
    } finally {
      setOrdering(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-rv-text">Services</h1>
        <p className="mt-1 text-rv-muted">Book hotel services and experiences directly from your phone.</p>
      </div>

      {loading && <div className="py-8 text-center text-rv-muted">Loading services…</div>}

      {error && (
        <div className="rounded-xl border border-rv-danger/20 bg-rv-danger-soft px-5 py-4 text-sm text-rv-danger">
          Failed to load services: {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  category === c
                    ? 'bg-rv-accent text-white'
                    : 'border border-rv-border2 bg-rv-surface text-rv-muted hover:text-rv-text'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {confirmed && (
            <div className="rounded-xl border border-rv-success/30 bg-rv-success-soft px-5 py-4">
              <p className="font-semibold text-rv-success">
                <strong>{confirmed.name}</strong> booked for ${confirmed.price}.
              </p>
              <button onClick={() => setConfirmed(null)} className="mt-1 text-xs text-rv-success/70 hover:text-rv-success">Dismiss</button>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((service) => (
              <div
                key={service.id}
                className="flex flex-col rounded-xl border border-rv-border bg-rv-surface p-5 shadow-sm transition hover:border-rv-border2"
              >
                <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-rv-muted">
                  {service.category}
                </div>
                <h3 className="mb-2 font-semibold text-rv-text">{service.name}</h3>
                <p className="mb-4 flex-1 text-sm leading-relaxed text-rv-muted">{service.description}</p>
                <div className="flex items-center justify-between border-t border-rv-border pt-3">
                  <span className="text-sm font-bold text-rv-text">${service.price}</span>
                  <button
                    onClick={() => { setBooking(service); setOrderError(''); }}
                    className="rounded-lg bg-rv-accent px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rv-accent/90"
                  >
                    Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Modal isOpen={!!booking} onClose={() => setBooking(null)} title="Confirm booking">
        {booking && (
          <div>
            <p className="mb-2 text-sm text-rv-muted">{booking.description}</p>
            <div className="mb-5 flex justify-between rounded-lg border border-rv-border bg-rv-surface2 px-4 py-3 text-sm">
              <span className="text-rv-muted">Total</span>
              <span className="font-bold text-rv-text">${booking.price}</span>
            </div>
            {!activeReservationId && (
              <p className="mb-3 text-xs text-rv-warning">No active or upcoming reservation found. Charge will be recorded without a reservation reference.</p>
            )}
            {orderError && (
              <p className="mb-3 rounded-lg border border-rv-danger/20 bg-rv-danger-soft px-3 py-2 text-sm text-rv-danger">
                {orderError}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <button onClick={() => setBooking(null)} className="rounded-lg border border-rv-border2 px-4 py-2 text-sm font-medium text-rv-muted">
                Cancel
              </button>
              <button
                onClick={handleBook}
                disabled={ordering}
                className="rounded-lg bg-rv-accent px-5 py-2 text-sm font-semibold text-white hover:bg-rv-accent/90 disabled:opacity-50"
              >
                {ordering ? 'Billing…' : 'Bill to room'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
