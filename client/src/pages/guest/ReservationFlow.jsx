import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getRoom } from '../../api/rooms';
import { createReservation } from '../../api/reservations';

const STEPS = ['Dates', 'Details', 'Confirm'];

const input =
  'w-full rounded-lg border border-rv-border2 bg-rv-surface px-3 py-2.5 text-sm text-rv-text placeholder:text-rv-subtle outline-none transition focus:ring-2 focus:ring-rv-accent/40';

export default function ReservationFlow() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [roomLoading, setRoomLoading] = useState(true);
  const [roomError, setRoomError] = useState(null);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ checkIn: '', checkOut: '', name: '', email: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getRoom(roomId)
      .then((data) => { if (!cancelled) { setRoom(data); setRoomLoading(false); } })
      .catch((err) => { if (!cancelled) { setRoomError(err.message); setRoomLoading(false); } });
    return () => { cancelled = true; };
  }, [roomId]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  const nights =
    form.checkIn && form.checkOut
      ? Math.max(0, Math.round((new Date(form.checkOut) - new Date(form.checkIn)) / 86400000))
      : 0;

  async function handleConfirm() {
    setSubmitting(true);
    setSubmitError('');
    try {
      const result = await createReservation({
        roomId: roomId,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        notes: form.notes,
      });
      setConfirmation(result);
    } catch (err) {
      setSubmitError(err.message || 'Reservation failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (roomLoading) {
    return <div className="py-20 text-center text-rv-muted">Loading room details…</div>;
  }

  if (roomError || !room) {
    return (
      <div className="py-20 text-center text-rv-muted">
        Room not found.{' '}
        <Link to="/rooms" className="text-rv-accent hover:underline">Browse rooms</Link>
      </div>
    );
  }

  if (confirmation) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-rv-border bg-rv-surface p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rv-success-soft">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-rv-success">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-bold text-rv-text">Reservation confirmed</h2>
          {confirmation.reference && (
            <p className="mb-1 text-sm font-mono text-rv-accent">Ref: {confirmation.reference}</p>
          )}
          <p className="mb-1 text-sm text-rv-muted">
            <span className="font-semibold text-rv-text">{room.type}</span>
          </p>
          <p className="mb-6 text-sm text-rv-muted">
            {form.checkIn} &rarr; {form.checkOut} &middot; {nights} night{nights !== 1 ? 's' : ''}
          </p>
          <Link
            to="/guest/dashboard"
            className="inline-block rounded-lg bg-rv-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-rv-accent/90"
          >
            View my bookings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex gap-4 overflow-hidden rounded-xl border border-rv-border bg-rv-surface p-4">
        {room.photos?.[0] && (
          <img src={room.photos[0]} alt={room.type} className="h-20 w-28 rounded-lg object-cover" />
        )}
        <div>
          <h1 className="font-semibold text-rv-text">{room.type}</h1>
          <p className="mt-1 text-sm text-rv-muted line-clamp-2">{room.description}</p>
          <p className="mt-2 text-sm font-bold text-rv-text">
            ${room.pricePerNight}/night
            {nights > 0 && (
              <span className="ml-2 font-normal text-rv-muted">
                &times; {nights} = ${room.pricePerNight * nights}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition ${
                i <= step ? 'bg-rv-accent text-white' : 'bg-rv-surface2 text-rv-muted'
              }`}
            >
              {i + 1}
            </div>
            <span className={`text-sm ${i === step ? 'font-semibold text-rv-text' : 'text-rv-muted'}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && <div className="h-px w-6 bg-rv-border2" />}
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-rv-border bg-rv-surface p-6 shadow-sm">
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-rv-text">Select dates</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-rv-text">Check-in</label>
                <input type="date" value={form.checkIn} onChange={(e) => set('checkIn', e.target.value)} className={input} min={new Date().toISOString().slice(0, 10)} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-rv-text">Check-out</label>
                <input type="date" value={form.checkOut} onChange={(e) => set('checkOut', e.target.value)} className={input} min={form.checkIn || new Date().toISOString().slice(0, 10)} />
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-rv-text">Your details</h2>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-rv-text">Full name</label>
              <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Jane Smith" className={input} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-rv-text">Email</label>
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="jane@example.com" className={input} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-rv-text">Special requests</label>
              <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={3} placeholder="Any preferences or notes…" className={input + ' resize-none'} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <h2 className="mb-4 font-semibold text-rv-text">Confirm reservation</h2>
            {[
              ['Room', room.type],
              ['Check-in', form.checkIn],
              ['Check-out', form.checkOut],
              ['Nights', nights],
              ['Total', `$${room.pricePerNight * nights}`],
              ['Name', form.name],
              ['Email', form.email],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between border-b border-rv-border pb-2 text-sm last:border-0">
                <span className="text-rv-muted">{label}</span>
                <span className="font-medium text-rv-text">{val}</span>
              </div>
            ))}
            {submitError && (
              <p className="mt-2 rounded-lg border border-rv-danger/20 bg-rv-danger-soft px-3 py-2 text-sm text-rv-danger">
                {submitError}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between">
        {step > 0 ? (
          <button onClick={() => setStep((s) => s - 1)} className="rounded-lg border border-rv-border2 px-4 py-2 text-sm font-medium text-rv-muted hover:text-rv-text">
            Back
          </button>
        ) : (
          <Link to="/rooms" className="rounded-lg border border-rv-border2 px-4 py-2 text-sm font-medium text-rv-muted hover:text-rv-text">
            Cancel
          </Link>
        )}

        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={step === 0 && (!form.checkIn || !form.checkOut || nights <= 0)}
            className="rounded-lg bg-rv-accent px-6 py-2 text-sm font-semibold text-white transition hover:bg-rv-accent/90 disabled:opacity-40"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="rounded-lg bg-rv-accent px-6 py-2 text-sm font-semibold text-white transition hover:bg-rv-accent/90 disabled:opacity-50"
          >
            {submitting ? 'Confirming…' : 'Confirm reservation'}
          </button>
        )}
      </div>
    </div>
  );
}
