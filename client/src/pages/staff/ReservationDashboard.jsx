import { useState } from "react";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { mockReservations } from "../../data/mockReservations";
import { mockRooms } from "../../data/mockRooms";

function roomLabel(id) {
  return mockRooms.find((r) => r.id === id)?.type ?? `Room #${id}`;
}

const ACTIONS = {
  Pending:   { label: "Confirm",   next: "Confirmed"  },
  Confirmed: { label: "Check In",  next: "CheckedIn"  },
  CheckedIn: { label: "Check Out", next: "CheckedOut" },
};

export default function ReservationDashboard() {
  const [reservations, setReservations] = useState(mockReservations);
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = reservations.filter((r) =>
    (!dateFilter || (r.checkIn <= dateFilter && r.checkOut >= dateFilter)) &&
    (!statusFilter || r.status === statusFilter),
  );

  const kpis = [
    { label: "Total",      value: reservations.length },
    { label: "Confirmed",  value: reservations.filter((r) => r.status === "Confirmed").length },
    { label: "Checked In", value: reservations.filter((r) => r.status === "CheckedIn").length },
    { label: "Pending",    value: reservations.filter((r) => r.status === "Pending").length },
  ];

  function transition(id, next) {
    setReservations((list) => list.map((x) => x.id === id ? { ...x, status: next } : x));
  }

  return (
    <div>
      <PageHeader title="Reservation Dashboard" subtitle="Today's overview of all reservations." />

      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        {kpis.map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-rv-border bg-rv-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-rv-muted">{label}</p>
            <p className="mt-1 text-3xl font-bold text-rv-text">{value}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-4 rounded-xl border border-rv-border bg-rv-surface p-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-rv-muted">Date</label>
          <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-lg border border-rv-border2 bg-rv-bg px-3 py-2 text-sm text-rv-text outline-none focus:ring-2 focus:ring-rv-accent/40" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-rv-muted">Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-rv-border2 bg-rv-bg px-3 py-2 text-sm text-rv-text outline-none focus:ring-2 focus:ring-rv-accent/40">
            <option value="">All</option>
            {["Pending", "Confirmed", "CheckedIn", "CheckedOut"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        {(dateFilter || statusFilter) && (
          <button onClick={() => { setDateFilter(""); setStatusFilter(""); }}
            className="rounded-lg border border-rv-border2 px-3 py-2 text-xs text-rv-muted hover:text-rv-text">
            Clear
          </button>
        )}
        <span className="ml-auto text-xs text-rv-muted">{filtered.length} results</span>
      </div>

      <div className="overflow-hidden rounded-xl border border-rv-border bg-rv-surface">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="border-b border-rv-border">
            <tr className="text-xs font-semibold uppercase tracking-wider text-rv-muted">
              {["Guest", "Room", "Check-in", "Check-out", "Status", "Actions"].map((h) => (
                <th key={h} className="px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-rv-border">
            {filtered.map((r) => {
              const action = ACTIONS[r.status];
              return (
                <tr key={r.id} className="transition hover:bg-rv-surface2">
                  <td className="px-5 py-3 font-medium text-rv-text">{r.guestName}</td>
                  <td className="px-5 py-3 text-rv-muted">{roomLabel(r.roomId)}</td>
                  <td className="px-5 py-3 text-rv-muted">{r.checkIn}</td>
                  <td className="px-5 py-3 text-rv-muted">{r.checkOut}</td>
                  <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-5 py-3">
                    {action && (
                      <button onClick={() => transition(r.id, action.next)}
                        className="rounded-lg bg-rv-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-rv-accent/90">
                        {action.label}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-rv-muted">No reservations match this filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
