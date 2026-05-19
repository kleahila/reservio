import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { getRoom, getRooms } from '../../api/rooms';
import { createReservation } from '../../api/reservations';

const DEMO_BANNER = (
  <div className="flex items-start gap-3 rounded-xl border border-rv-warning/40 bg-rv-warning-soft px-5 py-4">
    <span className="text-xl leading-none">⚠️</span>
    <p className="text-sm text-rv-warning font-medium">
      This is a <strong>demo payment system</strong> for academic purposes.
      No real transactions are processed. <strong>Do not enter real card details.</strong>
    </p>
  </div>
);

function formatCard(value) {
  return value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

const inputCls =
  'w-full rounded-lg border border-rv-border2 bg-rv-surface px-3 py-2.5 text-sm text-rv-text placeholder:text-rv-subtle outline-none transition focus:ring-2 focus:ring-rv-sea-400/40';

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const stateRoom    = location.state?.room    ?? null;
  const stateCheckIn  = location.state?.checkIn  ?? '';
  const stateCheckOut = location.state?.checkOut ?? '';

  const [room, setRoom] = useState(stateRoom);
  const [roomLoading, setRoomLoading] = useState(!stateRoom);
  const [checkIn, setCheckIn] = useState(stateCheckIn);
  const [checkOut, setCheckOut] = useState(stateCheckOut);

  const [extraRooms, setExtraRooms] = useState([]);
  const [showRoomPicker, setShowRoomPicker] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);

  const [payment, setPayment] = useState({ name: '', card: '', expiry: '', cvv: '' });
  const [payErrors, setPayErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [breakfast, setBreakfast] = useState(false);

  const BREAKFAST_PRICE = 15;

  const today = new Date().toISOString().slice(0, 10);
  const nights =
    checkIn && checkOut
      ? Math.max(0, Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000))
      : 0;

  useEffect(() => {
    if (stateRoom || !location.state?.roomId) return;
    getRoom(location.state.roomId)
      .then((r) => { setRoom(r); setRoomLoading(false); })
      .catch(() => setRoomLoading(false));
  }, []);

  function setP(field, value) {
    setPayment((p) => ({ ...p, [field]: value }));
    if (payErrors[field]) setPayErrors((e) => ({ ...e, [field]: '' }));
  }

  function touchField(field) {
    setTouched((t) => ({ ...t, [field]: true }));
    const errs = validatePayment();
    if (errs[field]) setPayErrors((e) => ({ ...e, [field]: errs[field] }));
    else setPayErrors((e) => ({ ...e, [field]: '' }));
  }

  const totalNights = nights > 0 ? nights : 0;
  const allRooms = room ? [room, ...extraRooms] : [];
  const breakfastTotal = breakfast ? BREAKFAST_PRICE * totalNights * allRooms.length : 0;
  const roomTotal = allRooms.reduce((s, r) => s + r.pricePerNight * totalNights, 0);
  const grandTotal = roomTotal + breakfastTotal;

  function openRoomPicker() {
    getRooms(checkIn, checkOut)
      .then((rooms) => {
        const usedIds = new Set(allRooms.map((r) => r.id));
        setAvailableRooms((rooms || []).filter((r) => !usedIds.has(r.id)));
        setShowRoomPicker(true);
      })
      .catch(() => {});
  }

  const isFormValid = (() => {
    if (!payment.name.trim()) return false;
    if (payment.card.replace(/\s/g, '').length !== 16) return false;
    if (!/^\d{2}\/\d{2}$/.test(payment.expiry)) return false;
    if (!/^\d{3}$/.test(payment.cvv)) return false;
    if (!checkIn) return false;
    if (!checkOut || totalNights <= 0) return false;
    return true;
  })();

  function validatePayment() {
    const e = {};
    if (!payment.name.trim()) e.name = 'Cardholder name is required.';
    if (payment.card.replace(/\s/g, '').length !== 16) e.card = 'Enter a valid 16-digit card number.';
    if (!/^\d{2}\/\d{2}$/.test(payment.expiry)) e.expiry = 'Use MM/YY format.';
    if (!/^\d{3}$/.test(payment.cvv)) e.cvv = '3-digit CVV required.';
    if (!checkIn) e.checkIn = 'Check-in date required.';
    if (!checkOut || nights <= 0) e.checkOut = 'Check-out must be after check-in.';
    return e;
  }

  async function handlePay(e) {
    e.preventDefault();
    const errs = validatePayment();
    setPayErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    setSubmitError('');
    try {
      const roomIds = allRooms.map((r) => r.id);
      const result = await createReservation({
        roomIds,
        checkIn,
        checkOut,
        breakfastIncluded: breakfast,
        breakfastPrice: breakfast ? BREAKFAST_PRICE : 0,
      });
      setConfirmation(Array.isArray(result) ? result[0] : result);
    } catch (err) {
      setSubmitError(err.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (roomLoading) return <div className="py-20 text-center text-rv-muted">Loading…</div>;

  if (!room) {
    return (
      <div className="py-20 text-center text-rv-muted">
        No room selected.{' '}
        <Link to="/rooms" className="text-rv-olive-600 hover:underline">Browse rooms</Link>
      </div>
    );
  }

  if (confirmation) {
    const ref = confirmation.id?.slice(0, 8).toUpperCase() ?? 'DEMO0000';
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-rv-border bg-rv-surface p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rv-olive-50 dark:bg-rv-olive-900/30">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-rv-olive">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="mb-2 font-serif text-xl font-bold text-rv-text">Booking confirmed!</h2>
          <p className="mb-1 font-mono text-sm text-rv-sea">Ref: RES-{ref}</p>
          <p className="mb-1 text-sm text-rv-muted">
            <span className="font-semibold text-rv-text">{room.type}</span> — Room {room.description}
          </p>
          <p className="mb-6 text-sm text-rv-muted">
            {checkIn} → {checkOut} · {nights} night{nights !== 1 ? 's' : ''} · ${room.pricePerNight * nights}
          </p>
          <Link
            to="/guest/dashboard"
            className="inline-block rounded-lg bg-rv-olive-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-rv-olive-700"
          >
            View my bookings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link to={`/rooms/${room.id}`} className="inline-flex items-center gap-1 text-sm text-rv-muted hover:text-rv-text">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polyline points="9 1 2 7 9 13" />
        </svg>
        Back to room
      </Link>

      <h1 className="font-serif text-2xl font-bold text-rv-text">Checkout</h1>

      {/* Room summary */}
      <div className="space-y-3">
        {allRooms.map((r, i) => (
          <div key={r.id} className="flex gap-4 overflow-hidden rounded-xl border border-rv-border bg-rv-surface p-4">
            {r.photos?.[0] && (
              <img src={r.photos[0]} alt={r.type} className="h-20 w-28 rounded-lg object-cover" />
            )}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <h2 className="font-semibold text-rv-text">{r.type} — Room {r.description}</h2>
                {i > 0 && (
                  <button
                    type="button"
                    onClick={() => setExtraRooms((prev) => prev.filter((x) => x.id !== r.id))}
                    className="ml-2 text-xs text-rv-danger hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="mt-1 text-sm font-bold text-rv-text">
                ${r.pricePerNight}/night
                {totalNights > 0 && <span className="ml-2 font-normal text-rv-muted">× {totalNights} = ${r.pricePerNight * totalNights}</span>}
              </p>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={openRoomPicker}
          className="w-full rounded-xl border border-dashed border-rv-border2 py-3 text-sm font-medium text-rv-muted transition hover:border-rv-olive-400 hover:text-rv-olive-700"
        >
          + Add Another Room
        </button>
      </div>

      {showRoomPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-rv-border bg-rv-surface p-6 shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-rv-text">Add a Room</h3>
              <button onClick={() => setShowRoomPicker(false)} className="text-rv-muted hover:text-rv-text">✕</button>
            </div>
            {availableRooms.length === 0 ? (
              <p className="text-sm text-rv-muted">No other rooms available for these dates.</p>
            ) : (
              <div className="space-y-2">
                {availableRooms.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => { setExtraRooms((prev) => [...prev, r]); setShowRoomPicker(false); }}
                    className="w-full flex items-center justify-between rounded-xl border border-rv-border bg-rv-bg px-4 py-3 text-left transition hover:border-rv-olive-400 hover:bg-rv-olive-50 dark:hover:bg-rv-olive-900/20"
                  >
                    <div>
                      <p className="font-medium text-rv-text">{r.type} — Room {r.description}</p>
                      <p className="text-xs text-rv-muted">${r.pricePerNight}/night</p>
                    </div>
                    <span className="text-xs font-semibold text-rv-olive-700">Add</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Breakfast package */}
      <div className="rounded-xl border border-rv-border bg-rv-surface p-5 flex items-center justify-between gap-4">
        <div>
          <p className="font-medium text-rv-text">Breakfast Package</p>
          <p className="text-xs text-rv-muted mt-0.5">${BREAKFAST_PRICE}/room/night · continental breakfast included</p>
        </div>
        <label className="flex cursor-pointer items-center gap-3">
          <div
            onClick={() => setBreakfast((b) => !b)}
            className={`relative h-6 w-11 rounded-full transition-colors ${breakfast ? 'bg-rv-sea-500' : 'bg-rv-border2'}`}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${breakfast ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
          <span className="text-sm text-rv-text">{breakfast ? 'Added' : 'Add'}</span>
        </label>
      </div>

      {/* Dates */}
      <div className="rounded-xl border border-rv-border bg-rv-surface p-6 space-y-4">
        <h2 className="font-semibold text-rv-text">Stay dates</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-rv-text">Check-in</label>
            <input type="date" value={checkIn} min={today} onChange={(e) => setCheckIn(e.target.value)} className={inputCls} />
            {payErrors.checkIn && <p className="mt-1 text-xs text-rv-danger">{payErrors.checkIn}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-rv-text">Check-out</label>
            <input type="date" value={checkOut} min={checkIn || today} onChange={(e) => setCheckOut(e.target.value)} className={inputCls} />
            {payErrors.checkOut && <p className="mt-1 text-xs text-rv-danger">{payErrors.checkOut}</p>}
          </div>
        </div>
      </div>

      {/* Payment form */}
      <form onSubmit={handlePay} className="rounded-xl border border-rv-border bg-rv-surface p-6 space-y-5">
        <h2 className="font-semibold text-rv-text">Payment details</h2>

        {DEMO_BANNER}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-rv-text">Cardholder name</label>
          <input
            value={payment.name}
            onChange={(e) => setP('name', e.target.value)}
            onBlur={() => touchField('name')}
            placeholder="Jane Smith"
            className={`${inputCls} ${payErrors.name ? 'border-rv-danger' : ''}`}
          />
          {payErrors.name && <p className="mt-1 text-xs text-rv-danger">{payErrors.name}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-rv-text">Card number</label>
          <input
            value={payment.card}
            onChange={(e) => setP('card', formatCard(e.target.value))}
            onBlur={() => touchField('card')}
            placeholder="0000 0000 0000 0000"
            maxLength={19}
            className={`${inputCls} font-mono tracking-wider ${payErrors.card ? 'border-rv-danger' : ''}`}
          />
          {payErrors.card && <p className="mt-1 text-xs text-rv-danger">{payErrors.card}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-rv-text">Expiry</label>
            <input
              value={payment.expiry}
              onChange={(e) => {
                let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
                setP('expiry', v);
              }}
              onBlur={() => touchField('expiry')}
              placeholder="MM/YY"
              maxLength={5}
              className={`${inputCls} ${payErrors.expiry ? 'border-rv-danger' : ''}`}
            />
            {payErrors.expiry && <p className="mt-1 text-xs text-rv-danger">{payErrors.expiry}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-rv-text">CVV</label>
            <input
              type="password"
              value={payment.cvv}
              onChange={(e) => setP('cvv', e.target.value.replace(/\D/g, '').slice(0, 3))}
              onBlur={() => touchField('cvv')}
              placeholder="•••"
              maxLength={3}
              className={`${inputCls} ${payErrors.cvv ? 'border-rv-danger' : ''}`}
            />
            {payErrors.cvv && <p className="mt-1 text-xs text-rv-danger">{payErrors.cvv}</p>}
          </div>
        </div>

        {submitError && (
          <p className="rounded-lg border border-rv-danger/20 bg-rv-danger-soft px-3 py-2 text-sm text-rv-danger">
            {submitError}
          </p>
        )}

        <div className="flex items-center justify-between border-t border-rv-border pt-4">
          <span className="text-sm text-rv-muted">
            Total: <span className="text-lg font-bold text-rv-text">{totalNights > 0 ? `$${grandTotal}` : '—'}</span>
          </span>
          <button
            type="submit"
            disabled={submitting || !isFormValid}
            className="rounded-lg bg-rv-sea-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-rv-sea-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Processing…' : 'Pay Now'}
          </button>
        </div>
      </form>
    </div>
  );
}
