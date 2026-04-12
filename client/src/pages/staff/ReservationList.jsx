import { useState } from "react";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { mockReservations } from "../../data/mockReservations";
import { mockRooms } from "../../data/mockRooms";

function roomLabel(id) {
  return mockRooms.find((r) => r.id === id)?.type ?? `Room #${id}`;
}

const STATUSES = ["All", "Pending", "Confirmed", "CheckedIn", "CheckedOut"];

const ACTIONS = {
  Pending:   { label: "Confirm",   next: "Confirmed"  },
  Confirmed: { label: "Check In",  next: "CheckedIn"  },
  CheckedIn: { label: "Check Out", next: "CheckedOut" },
};

export default function ReservationList() {
  const [reservations, setReservations] = useState(mockReservations);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = reservations.filter((r) =>
    (statusFilter === "All" || r.status === statusFilter) &&
    (!search || r.guestName.toLowerCase().includes(search.toLowerCase())),
  );

  function transition(id, next) {
    setReservations((list) => list.map((x) => x.id === id ? { ...x, status: next } : x));
  }

  return (
    <div>
      <PageHeader title="Reservations" subtitle="Manage all guest reservations." />

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search guest…"
          className="rounded-lg border border-rv-border2 bg-rv-surface px-3 py-2 text-sm text-rv-text placeholder:text-rv-subtle outline-none focus:ring-2 focus:ring-rv-accent/40"
        />
        <div className="flex flex-wrap gap-1">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                statusFilter === s
                  ? "bg-rv-accent text-white"
                  : "border border-rv-border2 text-rv-muted hover:text-rv-text"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-rv-muted">{filtered.length} results</span>
      </div>

      <div className="overflow-hidden rounded-xl border border-rv-border bg-rv-surface">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="border-b border-rv-border">
            <tr className="text-xs font-semibold uppercase tracking-wider text-rv-muted">
              {["#", "Guest", "Room", "Check-in", "Check-out", "Status", "Actions"].map((h) => (
                <th key={h} className="px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-rv-border">
            {filtered.map((r) => {
              const action = ACTIONS[r.status];
              return (
                <tr key={r.id} className="transition hover:bg-rv-surface2">
                  <td className="px-5 py-3 text-rv-subtle">#{r.id}</td>
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
              <tr><td colSpan={7} className="px-5 py-8 text-center text-rv-muted">No results.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
