import { useParams, Link } from "react-router-dom";
import StatusBadge from "../../components/StatusBadge";
import { mockRooms } from "../../data/mockRooms";

export default function RoomDetail() {
  const { id } = useParams();
  const room = mockRooms.find((r) => r.id === Number(id));

  if (!room) {
    return (
      <div className="py-20 text-center text-rv-muted">
        Room not found.{" "}
        <Link to="/rooms" className="text-rv-accent hover:underline">Browse rooms</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/rooms" className="inline-flex items-center gap-1 text-sm text-rv-muted hover:text-rv-text">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polyline points="9 1 2 7 9 13" />
        </svg>
        All rooms
      </Link>

      <img src={room.photos[0]} alt={room.type} className="h-64 w-full rounded-2xl object-cover" />

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-rv-text">{room.type}</h1>
          <p className="mt-1 text-rv-muted">Floor {room.floor}</p>
        </div>
        <StatusBadge status={room.status} />
      </div>

      <div className="rounded-xl border border-rv-border bg-rv-surface p-6">
        <h2 className="mb-3 font-semibold text-rv-text">About this room</h2>
        <p className="leading-relaxed text-rv-muted">{room.description}</p>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-rv-border bg-rv-surface p-5">
        <div>
          <p className="text-2xl font-bold text-rv-text">
            ${room.pricePerNight}
            <span className="text-base font-normal text-rv-muted">/night</span>
          </p>
        </div>
        {room.status === "Available" ? (
          <Link
            to={`/reservation/${room.id}`}
            className="rounded-lg bg-rv-accent px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-rv-accent/90"
          >
            Reserve now
          </Link>
        ) : (
          <span className="rounded-lg bg-rv-surface2 px-6 py-2.5 text-sm font-semibold text-rv-muted">
            Unavailable
          </span>
        )}
      </div>
    </div>
  );
}
