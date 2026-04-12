import { Link } from "react-router-dom";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "../../hooks/useAuth";
import { mockReservations } from "../../data/mockReservations";
import { mockRooms } from "../../data/mockRooms";

const QUICK_LINKS = [
  { to: "/rooms",       label: "Browse Rooms" },
  { to: "/parking",     label: "Parking" },
  { to: "/sunbeds",     label: "Sunbeds" },
  { to: "/marketplace", label: "Services" },
  { to: "/notifications", label: "Notifications" },
];

export default function Dashboard() {
  const { currentUser } = useAuth();
  const upcoming = mockReservations.filter((r) => r.status === "Confirmed" || r.status === "Pending").slice(0, 3);

  function roomName(id) {
    return mockRooms.find((r) => r.id === id)?.type ?? `Room #${id}`;
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="rounded-xl border border-rv-border bg-rv-surface p-6">
        <h1 className="text-2xl font-bold text-rv-text">
          Welcome back, {currentUser?.fullName?.split(" ")[0] ?? "Guest"}
        </h1>
        <p className="mt-1 text-sm text-rv-muted">
          Here&apos;s an overview of your upcoming stays and hotel services.
        </p>
      </div>

      {/* Quick links */}
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

      {/* Upcoming reservations */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-rv-text">Upcoming Reservations</h2>
        {upcoming.length === 0 ? (
          <div className="rounded-xl border border-rv-border bg-rv-surface p-8 text-center text-rv-muted">
            No upcoming reservations.{" "}
            <Link to="/rooms" className="text-rv-accent hover:underline">Browse rooms</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((res) => (
              <div
                key={res.id}
                className="flex items-center justify-between rounded-xl border border-rv-border bg-rv-surface p-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-rv-text">{roomName(res.roomId)}</span>
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
