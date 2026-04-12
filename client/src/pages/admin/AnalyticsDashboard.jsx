import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { mockReservations } from "../../data/mockReservations";
import { mockRooms } from "../../data/mockRooms";

const totalRooms = mockRooms.length;
const occupiedRooms = mockRooms.filter((r) => r.status === "Occupied").length;

function diffDays(a, b) {
  return Math.max(1, Math.round((new Date(b) - new Date(a)) / 86400000));
}

function fmtDate(s) {
  return new Date(s + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getRoom(id) {
  return mockRooms.find((r) => r.id === id);
}

const STATUS_META = {
  Confirmed:  "Confirmed",
  CheckedIn:  "CheckedIn",
  Pending:    "Pending",
  CheckedOut: "CheckedOut",
};

export default function AnalyticsDashboard() {
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const today = new Date().toISOString().slice(0, 10);
  const allDates = mockReservations.map((r) => r.checkIn).sort();
  const refDate = today <= (allDates[allDates.length - 1] ?? today) ? today : allDates[allDates.length - 1];

  const filtered = useMemo(() =>
    mockReservations.filter((r) => {
      if (fromDate && r.checkIn < fromDate) return false;
      if (toDate && r.checkIn > toDate) return false;
      return true;
    }),
    [fromDate, toDate],
  );

  const dailyRevenue = useMemo(() =>
    filtered.filter((r) => r.checkIn <= refDate && r.checkOut > refDate)
      .reduce((sum, r) => { const room = getRoom(r.roomId); return room ? sum + room.pricePerNight : sum; }, 0),
    [filtered, refDate],
  );

  const totalRevenue = useMemo(() =>
    filtered.reduce((sum, r) => { const room = getRoom(r.roomId); return room ? sum + room.pricePerNight * diffDays(r.checkIn, r.checkOut) : sum; }, 0),
    [filtered],
  );

  const occupancyPct = Math.round((occupiedRooms / totalRooms) * 100);

  const statusCounts = useMemo(() => {
    const counts = {};
    filtered.forEach((r) => { counts[r.status] = (counts[r.status] || 0) + 1; });
    return counts;
  }, [filtered]);

  const bookingsByDay = useMemo(() => {
    const map = {};
    filtered.forEach((r) => { map[r.checkIn] = (map[r.checkIn] || 0) + 1; });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({ date, count }));
  }, [filtered]);

  const maxCount = Math.max(...bookingsByDay.map((d) => d.count), 1);

  const inputCls =
    "rounded-lg border border-rv-border2 bg-rv-bg px-3 py-2 text-sm text-rv-text outline-none focus:ring-2 focus:ring-rv-accent/40";

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

      {/* Date filter */}
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
          <button onClick={() => { setFromDate(""); setToDate(""); }}
            className="rounded-lg border border-rv-border2 px-3 py-2 text-xs text-rv-muted hover:text-rv-text">
            Clear
          </button>
        )}
        <span className="ml-auto self-center text-xs text-rv-muted">
          {filtered.length} / {mockReservations.length} reservations
        </span>
      </div>

      {/* KPI cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Bookings", value: filtered.length, sub: "in selected range" },
          { label: "Daily Revenue", value: `$${dailyRevenue}`, sub: `active stays on ${refDate}` },
          {
            label: "Occupancy", value: `${occupancyPct}%`, sub: `${occupiedRooms} of ${totalRooms} rooms`,
            action: () => navigate("/admin/pricing"),
          },
        ].map(({ label, value, sub, action }) => (
          <div key={label} onClick={action}
            className={`rounded-xl border border-rv-border bg-rv-surface p-5 ${action ? "cursor-pointer hover:border-rv-border2" : ""}`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-rv-muted">{label}</p>
            <p className="mt-2 text-3xl font-bold text-rv-text">{value}</p>
            <p className="mt-1 text-xs text-rv-muted">{sub}</p>
          </div>
        ))}
      </div>

      {/* Occupancy bar */}
      <div className="mb-6 rounded-xl border border-rv-border bg-rv-surface p-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-rv-text">Room Occupancy</p>
          <span className="text-sm font-bold text-rv-accent">{occupancyPct}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-rv-surface2">
          <div className="h-3 rounded-full bg-rv-accent transition-all duration-700" style={{ width: `${occupancyPct}%` }} />
        </div>
        <div className="mt-2 flex gap-4 text-xs text-rv-muted">
          {["Available", "Occupied", "Maintenance"].map((label) => {
            const count = mockRooms.filter((r) => r.status === label).length;
            return (
              <span key={label} className="flex items-center gap-1">
                <StatusBadge status={label} />
                <span>{count}</span>
              </span>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Bar chart */}
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
                        <div className="absolute bottom-0 left-0 right-0 rounded-t-md bg-rv-accent transition-all duration-700"
                          style={{ height: `${h}%` }} />
                      </div>
                      <span className="text-xs text-rv-muted">{fmtDate(date)}</span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 border-t border-rv-border pt-3 text-sm text-rv-muted">
                Total revenue: <span className="font-semibold text-rv-text">${totalRevenue.toLocaleString()}</span>
              </p>
            </>
          )}
        </div>

        {/* Status breakdown */}
        <div className="rounded-xl border border-rv-border bg-rv-surface p-5">
          <h2 className="mb-4 text-sm font-semibold text-rv-text">Reservation Statuses</h2>
          <div className="space-y-3">
            {Object.keys(STATUS_META).map((status) => {
              const count = statusCounts[status] || 0;
              const pct = filtered.length > 0 ? Math.round((count / filtered.length) * 100) : 0;
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
          {filtered.length === 0 && <p className="mt-4 text-center text-xs text-rv-muted">No data.</p>}
        </div>
      </div>
    </div>
  );
}
