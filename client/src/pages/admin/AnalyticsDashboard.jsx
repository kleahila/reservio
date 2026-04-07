import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "../../components/Toast";
import { reservations } from "../../data/reservations";
import { rooms } from "../../data/rooms";

const totalRooms = rooms.length;
const occupiedRooms = rooms.filter((r) => r.status === "Occupied").length;

function diffDays(a, b) {
  return Math.max(1, Math.round((new Date(b) - new Date(a)) / 86400000));
}
function getRoom(id) {
  return rooms.find((r) => r.id === id);
}
function fmtDate(s) {
  const d = new Date(s + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const STATUS_META = {
  Confirmed: { color: "bg-green-100 text-green-800", icon: "✓" },
  CheckedIn: { color: "bg-blue-100 text-blue-800", icon: "→" },
  Pending: { color: "bg-amber-100 text-amber-800", icon: "⏳" },
  CheckedOut: { color: "bg-slate-200 text-slate-600", icon: "←" },
};

function KpiCard({ label, value, sub, icon, color, onClick }) {
  return (
    <div onClick={onClick}
      className={`relative overflow-hidden rounded-xl p-5 shadow-sm ${color} ${onClick ? "cursor-pointer hover:shadow-md transition" : ""}`}>
      <div className="absolute right-4 top-4 text-3xl opacity-15">{icon}</div>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      {sub && <p className="mt-1 text-xs opacity-60">{sub}</p>}
    </div>
  );
}

function AnalyticsDashboard() {
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [toast, setToast] = useState(null);

  const today = new Date().toISOString().slice(0, 10);
  const allDates = reservations.map((r) => r.checkIn).sort();
  const latestDate = allDates[allDates.length - 1] || today;
  const refDate = today <= latestDate ? today : latestDate;

  const filtered = useMemo(() =>
    reservations.filter((r) => {
      if (fromDate && r.checkIn < fromDate) return false;
      if (toDate && r.checkIn > toDate) return false;
      return true;
    }),
    [fromDate, toDate],
  );

  const dailyRevenue = useMemo(() =>
    filtered
      .filter((r) => r.checkIn <= refDate && r.checkOut > refDate)
      .reduce((sum, r) => {
        const room = getRoom(r.roomId);
        return room ? sum + room.pricePerNight : sum;
      }, 0),
    [filtered, refDate],
  );

  const totalRevenue = useMemo(() =>
    filtered.reduce((sum, r) => {
      const room = getRoom(r.roomId);
      return room ? sum + room.pricePerNight * diffDays(r.checkIn, r.checkOut) : sum;
    }, 0),
    [filtered],
  );

  const occupancyPct = Math.round((occupiedRooms / totalRooms) * 100);

  // Status breakdown
  const statusCounts = useMemo(() => {
    const counts = {};
    filtered.forEach((r) => { counts[r.status] = (counts[r.status] || 0) + 1; });
    return counts;
  }, [filtered]);

  // Bookings per day for bar chart
  const bookingsByDay = useMemo(() => {
    const map = {};
    filtered.forEach((r) => { map[r.checkIn] = (map[r.checkIn] || 0) + 1; });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));
  }, [filtered]);

  const maxCount = Math.max(...bookingsByDay.map((d) => d.count), 1);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Analytics Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Hotel performance overview. Use date range to filter.
          </p>
        </div>
        <button
          onClick={() => setToast({ message: "Export feature coming soon.", type: "info" })}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
        >
          ↓ Export
        </button>
      </div>

      {/* Date filter */}
      <div className="mb-6 flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-500">From</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-500">To</label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" />
        </div>
        {(fromDate || toDate) && (
          <button onClick={() => { setFromDate(""); setToDate(""); }}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50">
            ✕ Clear
          </button>
        )}
        <span className="ml-auto self-center text-xs text-slate-400">
          {filtered.length} / {reservations.length} reservations
        </span>
      </div>

      {/* KPI Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <KpiCard label="Total Bookings" value={filtered.length}
          sub="in selected range" icon="📋"
          color="bg-gradient-to-br from-blue-50 to-blue-100 text-blue-900" />
        <KpiCard label="Daily Revenue" value={`$${dailyRevenue}`}
          sub={`active stays on ${refDate}`} icon="💰"
          color="bg-gradient-to-br from-green-50 to-emerald-100 text-green-900" />
        <KpiCard label="Occupancy" value={`${occupancyPct}%`}
          sub={`${occupiedRooms} of ${totalRooms} rooms`} icon="🏨"
          color="bg-gradient-to-br from-brand-primary/5 to-brand-accent/10 text-brand-primary border border-slate-200"
          onClick={() => navigate("/admin/pricing")} />
      </div>

      {/* Occupancy bar */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">Room Occupancy</p>
          <span className="text-sm font-bold text-brand-primary">{occupancyPct}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-3 rounded-full bg-gradient-to-r from-brand-primary to-brand-accent transition-all duration-700"
            style={{ width: `${occupancyPct}%` }} />
        </div>
        <div className="mt-2 flex gap-4 text-xs text-slate-500">
          {Object.entries({ Available: "bg-green-400", Occupied: "bg-blue-400", Maintenance: "bg-orange-400" })
            .map(([label, dot]) => {
              const count = rooms.filter((r) => r.status === label).length;
              return (
                <span key={label} className="flex items-center gap-1">
                  <span className={`h-2 w-2 rounded-full ${dot}`} />
                  {count} {label}
                </span>
              );
            })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Bar Chart */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-sm font-semibold text-slate-700">
            Check-ins per Day
          </h2>
          {bookingsByDay.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-slate-400">
              <span className="text-4xl">📅</span>
              <p className="mt-2 text-sm">No reservations in range.</p>
            </div>
          ) : (
            <>
              <div className="flex items-end gap-2" style={{ height: 120 }}>
                {bookingsByDay.map(({ date, count }) => {
                  const h = (count / maxCount) * 100;
                  return (
                    <div key={date} className="flex flex-1 flex-col items-center gap-1" title={`${count} on ${date}`}>
                      <span className="text-xs font-bold text-brand-primary">{count}</span>
                      <div className="relative w-full flex-1 overflow-hidden rounded-t-md bg-slate-100">
                        <div className="absolute bottom-0 left-0 right-0 rounded-t-md bg-gradient-to-t from-brand-primary to-brand-accent transition-all duration-700"
                          style={{ height: `${h}%` }} />
                      </div>
                      <span className="text-xs text-slate-400">{fmtDate(date)}</span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 border-t border-slate-100 pt-3 text-sm text-slate-500">
                Total revenue in range:{" "}
                <span className="font-semibold text-brand-primary">
                  ${totalRevenue.toLocaleString()}
                </span>
              </p>
            </>
          )}
        </div>

        {/* Status Breakdown */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Reservation Statuses</h2>
          <div className="space-y-3">
            {Object.entries(STATUS_META).map(([status, { color, icon }]) => {
              const count = statusCounts[status] || 0;
              const pct = filtered.length > 0 ? Math.round((count / filtered.length) * 100) : 0;
              return (
                <div key={status}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${color}`}>
                      {icon} {status}
                    </span>
                    <span className="font-semibold text-slate-700">{count}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-1.5 rounded-full bg-brand-accent transition-all duration-500"
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <p className="mt-4 text-center text-xs text-slate-400">No data in range.</p>
          )}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default AnalyticsDashboard;
