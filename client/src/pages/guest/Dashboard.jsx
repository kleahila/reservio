import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function roomLabel(res) {
  if (res.room?.type && res.room?.description) return `${res.room.type} — Room ${res.room.description}`;
  if (res.room?.type) return res.room.type;
  return 'Room';
}
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../hooks/useAuth';
import { getMyReservations } from '../../api/reservations';
import { createReview } from '../../api/reviews';

const QUICK_LINKS = [
  { to: '/rooms',         label: 'Browse Rooms' },
  { to: '/parking',       label: 'Parking' },
  { to: '/sunbeds',       label: 'Sunbeds' },
  { to: '/marketplace',   label: 'Services' },
  { to: '/notifications', label: 'Notifications' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getMyReservations()
      .then((data) => { if (!cancelled) { setReservations(data || []); setLoading(false); } })
      .catch((err) => { if (!cancelled) { setError(err.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  const [reviewedIds, setReviewedIds] = useState([]);
  const [ratingMap, setRatingMap] = useState({});
  const [commentMap, setCommentMap] = useState({});
  const [submittingReview, setSubmittingReview] = useState(null);
  const [reviewError, setReviewError] = useState(null);

  const upcoming = reservations
    .filter((r) => {
      const s = r.status?.toUpperCase();
      return s === 'CONFIRMED' || s === 'PENDING';
    })
    .slice(0, 3);

  const checkedOut = reservations.filter(
    (r) => r.status?.toUpperCase() === 'CHECKED_OUT' && !reviewedIds.includes(r.id),
  );

  const displayName = user?.fullName?.split(' ')[0] ?? 'Guest';

  async function submitReview(res) {
    const rating = ratingMap[res.id];
    if (!rating) return;
    setSubmittingReview(res.id);
    setReviewError(null);
    try {
      await createReview({ reservationId: res.id, roomId: res.roomId, rating, comment: commentMap[res.id] ?? '' });
      setReviewedIds((prev) => [...prev, res.id]);
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-rv-border bg-rv-surface p-6">
        <h1 className="text-2xl font-bold text-rv-text">Welcome back, {displayName}</h1>
        <p className="mt-1 text-sm text-rv-muted">
          Here&apos;s an overview of your upcoming stays and hotel services.
        </p>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-rv-muted">Quick links</h2>
        <div className="flex flex-wrap gap-2">
          {QUICK_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="rounded-lg border border-rv-border2 bg-rv-surface px-4 py-2 text-sm font-medium text-rv-text transition hover:border-rv-accent/30 hover:bg-rv-accent-soft hover:text-rv-accent"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-rv-text">Upcoming Reservations</h2>

        {loading && <p className="text-sm text-rv-muted">Loading reservations…</p>}

        {error && (
          <div className="rounded-xl border border-rv-danger/20 bg-rv-danger-soft px-5 py-4 text-sm text-rv-danger">
            Failed to load reservations: {error}
          </div>
        )}

        {!loading && !error && upcoming.length === 0 && (
          <div className="rounded-xl border border-rv-border bg-rv-surface p-8 text-center text-rv-muted">
            No upcoming reservations.{' '}
            <Link to="/rooms" className="text-rv-accent hover:underline">Browse rooms</Link>
          </div>
        )}

        {!loading && !error && upcoming.length > 0 && (
          <div className="space-y-3">
            {upcoming.map((res) => (
              <div
                key={res.id}
                className="flex items-center justify-between rounded-xl border border-rv-border bg-rv-surface p-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-rv-text">{roomLabel(res)}</span>
                    <StatusBadge status={res.status} />
                    {res.breakfastIncluded && (
                      <span className="rounded-full bg-rv-olive-100 px-2 py-0.5 text-xs font-medium text-rv-olive-700 dark:bg-rv-olive-900/30 dark:text-rv-olive-300">
                        Breakfast
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-rv-muted">{fmt(res.checkIn)} → {fmt(res.checkOut)}</p>
                  {res.orders && res.orders.length > 0 && (
                    <div className="mt-2 space-y-0.5">
                      {res.orders.map((o) => (
                        <p key={o.id} className="text-xs text-rv-muted">
                          · {o.service?.name} <span className="text-rv-subtle">${o.service?.price}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Rate your stay */}
      {checkedOut.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-rv-text">Rate Your Stay</h2>
          <div className="space-y-3">
            {checkedOut.map((res) => (
              <div key={res.id} className="rounded-xl border border-rv-border bg-rv-surface p-5 space-y-3">
                <div>
                  <p className="font-semibold text-rv-text">{roomLabel(res)}</p>
                  <p className="text-xs text-rv-muted">{fmt(res.checkIn)} → {fmt(res.checkOut)}</p>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRatingMap((m) => ({ ...m, [res.id]: star }))}
                      className={`text-xl transition ${(ratingMap[res.id] ?? 0) >= star ? 'text-rv-warning' : 'text-rv-border2 hover:text-rv-warning'}`}
                    >
                      ★
                    </button>
                  ))}
                  {ratingMap[res.id] && <span className="ml-2 text-sm text-rv-muted">{ratingMap[res.id]}/5</span>}
                </div>
                <textarea
                  rows={2}
                  value={commentMap[res.id] ?? ''}
                  onChange={(e) => setCommentMap((m) => ({ ...m, [res.id]: e.target.value }))}
                  placeholder="Share your experience (optional)…"
                  className="w-full rounded-lg border border-rv-border2 bg-rv-bg px-3 py-2 text-sm text-rv-text outline-none focus:ring-2 focus:ring-rv-olive-400/40 resize-none"
                />
                {reviewError && submittingReview !== res.id && (
                  <p className="rounded-lg border border-rv-danger/20 bg-rv-danger-soft px-3 py-2 text-sm text-rv-danger">
                    {reviewError}
                  </p>
                )}
                <button
                  onClick={() => submitReview(res)}
                  disabled={!ratingMap[res.id] || submittingReview === res.id}
                  className="rounded-lg bg-rv-olive-600 px-5 py-2 text-sm font-semibold text-white hover:bg-rv-olive-700 disabled:opacity-50"
                >
                  {submittingReview === res.id ? 'Submitting…' : 'Submit Review'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
