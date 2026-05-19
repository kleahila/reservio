import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getMyOrders } from '../../api/orders';
import { getMyReservations } from '../../api/reservations';
import { apiCall } from '../../api/client';

const DEMO_BALANCE = 500.0;

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function StatusPill({ status }) {
  const cls = {
    CONFIRMED:   'bg-rv-sea-100 text-rv-sea-700 dark:bg-rv-sea-900/30 dark:text-rv-sea-300',
    CHECKED_IN:  'bg-rv-olive-100 text-rv-olive-700 dark:bg-rv-olive-900/30 dark:text-rv-olive-300',
    CHECKED_OUT: 'bg-rv-surface2 text-rv-muted',
    CANCELLED:   'bg-rv-danger-soft text-rv-danger',
    PENDING:     'bg-rv-warning-soft text-rv-warning',
  }[status] ?? 'bg-rv-surface2 text-rv-muted';
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{status}</span>;
}

export default function Profile() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingRes, setLoadingRes] = useState(true);
  const [showTopUp, setShowTopUp] = useState(false);

  useEffect(() => {
    apiCall('GET', '/api/auth/me', undefined, true)
      .then((data) => setProfile(data))
      .catch(() => {});
    getMyOrders()
      .then((data) => setOrders(data || []))
      .catch(() => {})
      .finally(() => setLoadingOrders(false));
    getMyReservations()
      .then((data) => setReservations(data || []))
      .catch(() => {})
      .finally(() => setLoadingRes(false));
  }, []);

  const user = profile ?? authUser;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-rv-text">
          Welcome back{user?.fullName ? `, ${user.fullName}` : ''}
        </h1>
        <p className="mt-1 text-rv-muted">Manage your account and view your stay history.</p>
      </div>

      {/* Account card */}
      <div className="rounded-xl border border-rv-border bg-rv-surface p-6">
        <h2 className="mb-4 font-semibold text-rv-text">Account</h2>
        <div className="grid gap-3 sm:grid-cols-2 text-sm">
          <div>
            <p className="text-rv-muted">Name</p>
            <p className="font-medium text-rv-text">{user?.fullName ?? '—'}</p>
          </div>
          <div>
            <p className="text-rv-muted">Email</p>
            <p className="font-medium text-rv-text">{user?.email ?? '—'}</p>
          </div>
          <div>
            <p className="text-rv-muted">Role</p>
            <p className="font-medium text-rv-text capitalize">{user?.role?.toLowerCase() ?? '—'}</p>
          </div>
        </div>
      </div>

      {/* Wallet */}
      <div className="rounded-xl border border-rv-sea-200/60 bg-rv-sea-50 p-6 dark:bg-rv-sea-900/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-rv-text">Wallet</h2>
            <p className="mt-1 text-3xl font-bold text-rv-sea">${DEMO_BALANCE.toFixed(2)}</p>
            <p className="text-xs text-rv-muted mt-1">Demo balance — no real funds</p>
          </div>
          <button
            onClick={() => setShowTopUp(true)}
            className="rounded-lg bg-rv-sea-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rv-sea-700"
          >
            Top Up Wallet
          </button>
        </div>
      </div>

      {/* Top-Up modal (demo) */}
      {showTopUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-rv-border bg-rv-surface p-6 shadow-xl">
            <h3 className="mb-4 font-semibold text-rv-text">Top Up Wallet</h3>
            <div className="mb-4 flex items-start gap-3 rounded-xl border border-rv-warning/40 bg-rv-warning-soft px-4 py-3">
              <span className="text-lg">⚠️</span>
              <p className="text-xs text-rv-warning font-medium">
                Demo top-up — no real transactions. Do not enter real card details.
              </p>
            </div>
            <div className="space-y-3">
              <input placeholder="Cardholder name" className="w-full rounded-lg border border-rv-border2 bg-rv-surface px-3 py-2 text-sm text-rv-text outline-none" />
              <input placeholder="0000 0000 0000 0000" maxLength={19} className="w-full rounded-lg border border-rv-border2 bg-rv-surface px-3 py-2 text-sm font-mono tracking-wider text-rv-text outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="MM/YY" maxLength={5} className="rounded-lg border border-rv-border2 bg-rv-surface px-3 py-2 text-sm text-rv-text outline-none" />
                <input type="password" placeholder="CVV" maxLength={4} className="rounded-lg border border-rv-border2 bg-rv-surface px-3 py-2 text-sm text-rv-text outline-none" />
              </div>
            </div>
            <div className="mt-5 flex gap-3 justify-end">
              <button onClick={() => setShowTopUp(false)} className="rounded-lg border border-rv-border2 px-4 py-2 text-sm font-medium text-rv-muted">Cancel</button>
              <button onClick={() => setShowTopUp(false)} className="rounded-lg bg-rv-sea-600 px-5 py-2 text-sm font-semibold text-white hover:bg-rv-sea-700">Demo Top Up</button>
            </div>
          </div>
        </div>
      )}

      {/* Reservation history */}
      <div className="rounded-xl border border-rv-border bg-rv-surface p-6">
        <h2 className="mb-4 font-semibold text-rv-text">Reservation History</h2>
        {loadingRes ? (
          <p className="text-sm text-rv-muted">Loading…</p>
        ) : reservations.length === 0 ? (
          <p className="text-sm text-rv-muted">No reservations yet. <Link to="/rooms" className="text-rv-olive-600 hover:underline">Browse rooms</Link></p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-rv-border text-left text-xs font-semibold uppercase tracking-wide text-rv-muted">
                  <th className="pb-2 pr-4">Ref</th>
                  <th className="pb-2 pr-4">Room</th>
                  <th className="pb-2 pr-4">Check-in</th>
                  <th className="pb-2 pr-4">Check-out</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r) => (
                  <tr key={r.id} className="border-b border-rv-border last:border-0">
                    <td className="py-3 pr-4 font-mono text-xs text-rv-subtle">RES-{r.id?.slice(0, 8).toUpperCase()}</td>
                    <td className="py-3 pr-4 font-medium text-rv-text">{r.room?.type ?? '—'} {r.room?.description ? `(${r.room.description})` : ''}</td>
                    <td className="py-3 pr-4 text-rv-muted">{formatDate(r.checkIn)}</td>
                    <td className="py-3 pr-4 text-rv-muted">{formatDate(r.checkOut)}</td>
                    <td className="py-3"><StatusPill status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Service order history */}
      <div className="rounded-xl border border-rv-border bg-rv-surface p-6">
        <h2 className="mb-4 font-semibold text-rv-text">Service Order History</h2>
        {loadingOrders ? (
          <p className="text-sm text-rv-muted">Loading…</p>
        ) : orders.length === 0 ? (
          <p className="text-sm text-rv-muted">No service orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-rv-border text-left text-xs font-semibold uppercase tracking-wide text-rv-muted">
                  <th className="pb-2 pr-4">Service</th>
                  <th className="pb-2 pr-4">Category</th>
                  <th className="pb-2 pr-4">Amount</th>
                  <th className="pb-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-rv-border last:border-0">
                    <td className="py-3 pr-4 font-medium text-rv-text">{o.service?.name ?? '—'}</td>
                    <td className="py-3 pr-4 text-rv-muted">{o.service?.category ?? '—'}</td>
                    <td className="py-3 pr-4 font-semibold text-rv-text">${o.service?.price?.toFixed(2) ?? '—'}</td>
                    <td className="py-3 text-rv-muted">{formatDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
