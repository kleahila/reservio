import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { getAllShifts } from '../../api/shifts';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function nMonthsAgo(n) {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d.toISOString().slice(0, 10);
}

function downloadExcel(rows) {
  const now = new Date();
  const month = now.toLocaleString('en-US', { month: 'long' });
  const year = now.getFullYear();
  const data = [
    ['Name', 'Username', 'Role', 'Date', 'Clock In', 'Clock Out', 'Hours Worked', 'Handover Note'],
    ...rows.map((s) => [
      s.user?.fullName ?? '',
      s.user?.username ?? '',
      s.user?.role ?? '',
      formatDate(s.clockIn),
      formatTime(s.clockIn),
      formatTime(s.clockOut),
      s.hoursWorked != null ? parseFloat(s.hoursWorked.toFixed(2)) : '',
      s.note ?? '',
    ]),
  ];
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Staff Hours');
  XLSX.writeFile(wb, `reservio-staff-hours-${month.toLowerCase()}-${year}.xlsx`);
}

export default function StaffHours() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [from, setFrom] = useState(nMonthsAgo(3));
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAllShifts({ from, to })
      .then((data) => { if (!cancelled) { setShifts(data || []); setLoading(false); } })
      .catch((err) => { if (!cancelled) { setError(err.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, [from, to]);

  const grouped = shifts.reduce((acc, s) => {
    const uid = s.userId;
    if (!acc[uid]) acc[uid] = { user: s.user, shifts: [] };
    acc[uid].shifts.push(s);
    return acc;
  }, {});

  const staffRows = Object.values(grouped).map((g) => {
    const totalHours = g.shifts.reduce((sum, s) => sum + (s.hoursWorked ?? 0), 0);
    const lastIn = g.shifts
      .filter((s) => s.clockIn)
      .sort((a, b) => new Date(b.clockIn) - new Date(a.clockIn))[0]?.clockIn ?? null;
    return { ...g, totalHours, lastIn };
  });

  return (
    <div className="px-6 md:px-10 lg:px-16 py-8 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl font-bold text-rv-text">Staff Hours</h1>
          <p className="mt-1 text-sm text-rv-muted">Track clock-in / clock-out across your team.</p>
        </div>
        <button
          onClick={() => downloadExcel(shifts)}
          className="rounded-lg border border-rv-border2 bg-rv-surface px-4 py-2 text-sm font-medium text-rv-muted transition hover:text-rv-text"
        >
          Export Excel
        </button>
      </div>

      {/* Date filter */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <label className="font-medium text-rv-text">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-lg border border-rv-border2 bg-rv-surface px-3 py-1.5 text-sm text-rv-text outline-none focus:ring-2 focus:ring-rv-olive-400/40"
          />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <label className="font-medium text-rv-text">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-lg border border-rv-border2 bg-rv-surface px-3 py-1.5 text-sm text-rv-text outline-none focus:ring-2 focus:ring-rv-olive-400/40"
          />
        </div>
      </div>

      {loading && <p className="text-sm text-rv-muted">Loading shifts…</p>}
      {error && <p className="text-sm text-rv-danger">Error: {error}</p>}

      {!loading && !error && (
        <div className="rounded-xl border border-rv-border bg-rv-surface overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-rv-border">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-rv-muted">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Hours (period)</th>
                <th className="px-5 py-3">Last Clock-In</th>
                <th className="px-5 py-3">Shifts</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {staffRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-rv-muted">
                    No shifts found for this period.
                  </td>
                </tr>
              ) : (
                staffRows.map(({ user, shifts: uShifts, totalHours, lastIn }) => (
                  <>
                    <tr
                      key={user?.id}
                      className="border-b border-rv-border hover:bg-rv-surface2 transition cursor-pointer"
                      onClick={() => setExpanded(expanded === user?.id ? null : user?.id)}
                    >
                      <td className="px-5 py-3 font-medium text-rv-text">{user?.fullName ?? '—'}</td>
                      <td className="px-5 py-3 text-rv-muted capitalize">{user?.role?.toLowerCase() ?? '—'}</td>
                      <td className="px-5 py-3 font-semibold text-rv-text">{totalHours.toFixed(1)}h</td>
                      <td className="px-5 py-3 text-rv-muted">{lastIn ? `${formatDate(lastIn)} ${formatTime(lastIn)}` : '—'}</td>
                      <td className="px-5 py-3 text-rv-muted">{uShifts.length}</td>
                      <td className="px-5 py-3 text-rv-muted text-xs">
                        {expanded === user?.id ? '▲ hide' : '▼ show'}
                      </td>
                    </tr>

                    {expanded === user?.id && (
                      <tr key={`${user?.id}-detail`} className="bg-rv-surface2/50">
                        <td colSpan={6} className="px-5 py-4">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-rv-muted border-b border-rv-border">
                                <th className="pb-2 pr-4">Date</th>
                                <th className="pb-2 pr-4">Clock In</th>
                                <th className="pb-2 pr-4">Clock Out</th>
                                <th className="pb-2 pr-4">Hours</th>
                                <th className="pb-2">Handover Note</th>
                              </tr>
                            </thead>
                            <tbody>
                              {uShifts
                                .slice()
                                .sort((a, b) => new Date(b.clockIn) - new Date(a.clockIn))
                                .map((s) => (
                                  <tr key={s.id} className="border-b border-rv-border/50 last:border-0">
                                    <td className="py-1.5 pr-4 text-rv-muted">{formatDate(s.clockIn)}</td>
                                    <td className="py-1.5 pr-4 text-rv-text">{formatTime(s.clockIn)}</td>
                                    <td className="py-1.5 pr-4 text-rv-muted">{formatTime(s.clockOut)}</td>
                                    <td className="py-1.5 pr-4 text-rv-text font-medium">
                                      {s.hoursWorked != null ? `${s.hoursWorked.toFixed(2)}h` : <span className="text-rv-warning">open</span>}
                                    </td>
                                    <td className="py-1.5 text-rv-muted italic">
                                      {s.note ? `"${s.note}"` : ''}
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
