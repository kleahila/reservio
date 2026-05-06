import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import { getSummary } from '../../api/analytics';

function fmtDate(s) {
  return new Date(s + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const STATUS_META = ['Confirmed', 'CheckedIn', 'Pending', 'CheckedOut', 'CONFIRMED', 'CHECKED_IN', 'PENDING', 'CHECKED_OUT'];

export default function AnalyticsDashboard() {
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getSummary(fromDate || undefined, toDate || undefined)
      .then((data) => { if (!cancelled) { setSummary(data); setLoading(false); } })
      .catch((err) => { if (!cancelled) { setError(err.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, [fromDate, toDate]);

  const inputCls =
    'rounded-lg border border-rv-border2 bg-rv-bg px-3 py-2 text-sm text-rv-text outline-none focus:ring-2 focus:ring-rv-accent/40';

  const bookingsByDay = summary?.bookingsByDay || [];
  const maxCount = Math.max(...bookingsByDay.map((d) => d.count), 1);
  const statusCounts = summary?.statusCounts || {};
  const totalBookings = summary?.totalBookings ?? 0;

  const occupancyPct = summary?.occupancyPct ?? 0;
  const occupiedRooms = summary?.occupiedRooms ?? 0;
  const totalRooms = summary?.totalRooms ?? 0;

  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="Hotel performance overview. Use date range to filter."
        action={
          <button className="rounded-lg border border-rv-border2 bg-rv-surface px-4 py-2 text-sm font-medium text-rv-muted hover:text-rv-text">
            Export
          </button>
        }
      />

      <div className="mb-6 flex flex-wrap items-end gap-4 rounded-xl border border-rv-border bg-rv-surface p-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-rv-muted">From</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-rv-muted">To</label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className={inputCls} />
        </div>
        {(fromDate || toDate) && (
          <button onClick={() => { setFromDate(''); setToDate(''); }} className="rounded-lg border border-rv-border2 px-3 py-2 text-xs text-rv-muted hover:text-rv-text">
            Clear
          </button>
        )}
      </div>

      {loading && <div className="py-8 text-center text-rv-muted">Loading analytics…</div>}

      {error && (
        <div className="mb-4 rounded-xl border border-rv-danger/20 bg-rv-danger-soft px-5 py-3 text-sm text-rv-danger">
          Failed to load analytics: {error}
        </div>
      )}

      {!loading && !error && summary && (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Total Bookings', value: totalBookings, sub: 'in selected range' },
              { label: 'Daily Revenue', value: `$${summary.dailyRevenue ?? 0}`, sub: 'active stays today' },
              {
                label: 'Occupancy', value: `${occupancyPct}%`, sub: `${occupiedRooms} of ${totalRooms} rooms`,
                action: () => navigate('/admin/pricing'),
              },
            ].map(({ label, value, sub, action }) => (
              <div key={label} onClick={action}
                className={`rounded-xl border border-rv-border bg-rv-surface p-5 ${action ? 'cursor-pointer hover:border-rv-border2' : ''}`}>
                <p className="text-xs font-semibold uppercase tracking-wide text-rv-muted">{label}</p>
                <p className="mt-2 text-3xl font-bold text-rv-text">{value}</p>
                <p className="mt-1 text-xs text-rv-muted">{sub}</p>
              </div>
            ))}
          </div>

          <div className="mb-6 rounded-xl border border-rv-border bg-rv-surface p-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-rv-text">Room Occupancy</p>
              <span className="text-sm font-bold text-rv-accent">{occupancyPct}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-rv-surface2">
              <div className="h-3 rounded-full bg-rv-accent transition-all duration-700" style={{ width: `${occupancyPct}%` }} />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-xl border border-rv-border bg-rv-surface p-6 lg:col-span-2">
              <h2 className="mb-5 text-sm font-semibold text-rv-text">Check-ins per Day</h2>
              {bookingsByDay.length === 0 ? (
                <p className="py-12 text-center text-sm text-rv-muted">No reservations in range.</p>
              ) : (
                <>
                  <div className="flex items-end gap-2" style={{ height: 120 }}>
                    {bookingsByDay.map(({ date, count }) => {
                      const h = (count / maxCount) * 100;
                      return (
                        <div key={date} className="flex flex-1 flex-col items-center gap-1" title={`${count} on ${date}`}>
                          <span className="text-xs font-bold text-rv-accent">{count}</span>
                          <div className="relative w-full flex-1 overflow-hidden rounded-t-md bg-rv-surface2">
                            <div className="absolute bottom-0 left-0 right-0 rounded-t-md bg-rv-accent transition-all duration-700" style={{ height: `${h}%` }} />
                          </div>
                          <span className="text-xs text-rv-muted">{fmtDate(date)}</span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="mt-3 border-t border-rv-border pt-3 text-sm text-rv-muted">
                    Total revenue: <span className="font-semibold text-rv-text">${(summary.totalRevenue ?? 0).toLocaleString()}</span>
                  </p>
                </>
              )}
            </div>

            <div className="rounded-xl border border-rv-border bg-rv-surface p-5">
              <h2 className="mb-4 text-sm font-semibold text-rv-text">Reservation Statuses</h2>
              {Object.keys(statusCounts).length === 0 ? (
                <p className="mt-4 text-center text-xs text-rv-muted">No data.</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(statusCounts).map(([status, count]) => {
                    const pct = totalBookings > 0 ? Math.round((count / totalBookings) * 100) : 0;
                    return (
                      <div key={status}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <StatusBadge status={status} />
                          <span className="font-semibold text-rv-text">{count}</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-rv-surface2">
                          <div className="h-1.5 rounded-full bg-rv-accent transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
