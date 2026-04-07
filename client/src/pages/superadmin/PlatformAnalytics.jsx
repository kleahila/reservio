import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { tenants } from "../../data/tenants";
import { reservations } from "../../data/reservations";
import { rooms } from "../../data/rooms";

function diffDays(checkIn, checkOut) {
  return Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000));
}
function getRoom(roomId) {
  return rooms.find((r) => r.id === roomId);
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const PLAN_COLORS = {
  Basic: "bg-slate-100 text-slate-700",
  Premium: "bg-blue-100 text-blue-800",
  Custom: "bg-amber-100 text-amber-800",
};
const STATUS_DOT = {
  Active: "bg-green-500",
  Pending: "bg-amber-400",
  Suspended: "bg-orange-500",
};

function KpiCard({ label, value, sub, icon, gradient }) {
  return (
    <div className={`relative overflow-hidden rounded-xl p-5 shadow-sm ${gradient}`}>
      <div className="absolute right-4 top-4 text-3xl opacity-20">{icon}</div>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      {sub && <p className="mt-1 text-xs opacity-60">{sub}</p>}
    </div>
  );
}

function PlatformAnalytics() {
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [planFilter, setPlanFilter] = useState("All");

  const filteredTenants = useMemo(
    () => planFilter === "All" ? tenants : tenants.filter((t) => t.plan === planFilter),
    [planFilter],
  );
  const activeTenantIds = useMemo(
    () => new Set(filteredTenants.filter((t) => t.status === "Active").map((t) => t.id)),
    [filteredTenants],
  );

  const filteredRes = useMemo(() =>
    reservations.filter((r) => {
      if (!activeTenantIds.has(r.tenantId)) return false;
      if (fromDate && r.checkIn < fromDate) return false;
      if (toDate && r.checkIn > toDate) return false;
      return true;
    }),
    [activeTenantIds, fromDate, toDate],
  );

  const totalRevenue = useMemo(() =>
    filteredRes.reduce((sum, r) => {
      const room = getRoom(r.roomId);
      return room ? sum + room.pricePerNight * diffDays(r.checkIn, r.checkOut) : sum;
    }, 0),
    [filteredRes],
  );

  const bookingsByMonth = useMemo(() => {
    const counts = Array(12).fill(0);
    filteredRes.forEach((r) => { counts[new Date(r.checkIn).getMonth()]++; });
    return counts;
  }, [filteredRes]);

  const maxMonthCount = Math.max(...bookingsByMonth, 1);

  // Only show months with bookings
  const chartData = MONTHS.map((label, i) => ({ label, count: bookingsByMonth[i] }))
    .filter((m) => m.count > 0);

  const displayChart = chartData.length > 0
    ? chartData
    : MONTHS.slice(0, 6).map((label, i) => ({ label, count: 0 }));

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Platform Analytics</h1>
          <p className="mt-1 text-sm text-slate-500">
            Aggregated metrics across all active tenants.
          </p>
        </div>
        <button
          onClick={() => navigate("/superadmin/tenants")}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50"
        >
          Manage Tenants →
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">From</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">To</label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">Plan Tier</label>
          <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent">
            <option value="All">All Plans</option>
            <option>Basic</option>
            <option>Premium</option>
            <option>Custom</option>
          </select>
        </div>
        {(fromDate || toDate || planFilter !== "All") && (
          <button onClick={() => { setFromDate(""); setToDate(""); setPlanFilter("All"); }}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50">
            ✕ Clear filters
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <KpiCard label="Active Tenants" value={activeTenantIds.size}
          sub={`of ${filteredTenants.length} in filter`} icon="🏨"
          gradient="bg-gradient-to-br from-green-50 to-green-100 text-green-900" />
        <KpiCard label="Total Bookings" value={filteredRes.length}
          sub="matching filters" icon="📋"
          gradient="bg-gradient-to-br from-blue-50 to-blue-100 text-blue-900" />
        <KpiCard label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`}
          sub="rooms × nights" icon="💰"
          gradient="bg-gradient-to-br from-brand-primary/5 to-brand-accent/10 text-brand-primary border border-slate-200" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Bar Chart */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-sm font-semibold text-slate-700">Bookings by Month</h2>
          {filteredRes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <span className="text-4xl">📊</span>
              <p className="mt-2 text-sm">No data for current filters.</p>
            </div>
          ) : (
            <div className="flex items-end gap-2" style={{ height: 140 }}>
              {displayChart.map(({ label, count }) => {
                const h = maxMonthCount > 0 ? (count / maxMonthCount) * 100 : 0;
                return (
                  <div key={label} className="flex flex-1 flex-col items-center gap-1">
                    {count > 0 && <span className="text-xs font-bold text-brand-primary">{count}</span>}
                    <div className="relative w-full flex-1 rounded-t-md overflow-hidden bg-slate-100">
                      <div
                        className="absolute bottom-0 left-0 right-0 rounded-t-md bg-brand-accent transition-all duration-700"
                        style={{ height: `${h}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500">{label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tenant Breakdown */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Tenant Breakdown</h2>
          <div className="space-y-2.5">
            {filteredTenants.map((t) => (
              <div key={t.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[t.status] || "bg-slate-300"}`} />
                  <span className="truncate text-slate-700 font-medium">{t.name}</span>
                </div>
                <span className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${PLAN_COLORS[t.plan]}`}>
                  {t.plan}
                </span>
              </div>
            ))}
          </div>
          {filteredTenants.length === 0 && (
            <p className="text-center text-xs text-slate-400 py-4">No tenants in filter.</p>
          )}
        </div>
      </div>

      <p className="mt-6 rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-xs text-slate-400 shadow-sm">
        🔒 Individual guest data is not shown at platform level. All metrics are aggregated by
        tenant.
      </p>
    </div>
  );
}

export default PlatformAnalytics;
