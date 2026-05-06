import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../hooks/useAuth';
import { getMyReservations } from '../../api/reservations';

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

  const upcoming = reservations
    .filter((r) => r.status === 'Confirmed' || r.status === 'Pending' || r.status === 'CONFIRMED' || r.status === 'PENDING')
    .slice(0, 3);

  const displayName = user?.fullName?.split(' ')[0] ?? 'Guest';

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
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-rv-text">{res.roomType || `Room #${res.roomId}`}</span>
                    <StatusBadge status={res.status} />
                  </div>
                  <p className="mt-1 text-sm text-rv-muted">
                    {res.checkIn} &rarr; {res.checkOut}
                  </p>
                </div>
                <Link
                  to={`/reservation/${res.roomId}`}
                  className="text-xs font-medium text-rv-accent hover:underline"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
