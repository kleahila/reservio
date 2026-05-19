import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import StatusBadge from "../../components/StatusBadge";
import { getRoom } from "../../api/rooms";

export default function RoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  const nights =
    checkIn && checkOut
      ? Math.max(0, Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000))
      : 0;

  useEffect(() => {
    let cancelled = false;
    getRoom(id)
      .then((data) => { if (!cancelled) { setRoom(data); setLoading(false); } })
      .catch((err) => { if (!cancelled) { setError(err.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, [id]);

  function handleBook() {
    navigate("/guest/checkout", { state: { room, checkIn, checkOut } });
  }

  if (loading) return <div className="py-20 text-center text-rv-muted">Loading room…</div>;

  if (error || !room) {
    return (
      <div className="py-20 text-center text-rv-muted">
        Room not found.{" "}
        <Link to="/rooms" className="text-rv-olive-600 hover:underline">Browse rooms</Link>
      </div>
    );
  }

  const available = room.status === "AVAILABLE";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/rooms" className="inline-flex items-center gap-1 text-sm text-rv-muted hover:text-rv-text">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polyline points="9 1 2 7 9 13" />
        </svg>
        All rooms
      </Link>

      {room.photos?.[0] && (
        <img src={room.photos[0]} alt={room.type} className="h-64 w-full rounded-2xl object-cover" />
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-rv-text">{room.type}</h1>
          <p className="mt-1 text-rv-muted">Room {room.description}</p>
        </div>
        <StatusBadge status={room.status} />
      </div>

      {room.description && (
        <div className="rounded-xl border border-rv-border bg-rv-surface p-6">
          <h2 className="mb-3 font-semibold text-rv-text">About this room</h2>
          <p className="leading-relaxed text-rv-muted">{room.type} — Room {room.description}</p>
        </div>
      )}

      {available && (
        <div className="rounded-xl border border-rv-border bg-rv-surface p-6 space-y-4">
          <h2 className="font-semibold text-rv-text">Select dates</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-rv-text">Check-in</label>
              <input
                type="date"
                value={checkIn}
                min={today}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full rounded-lg border border-rv-border2 bg-rv-surface px-3 py-2.5 text-sm text-rv-text outline-none focus:ring-2 focus:ring-rv-olive-400/40"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-rv-text">Check-out</label>
              <input
                type="date"
                value={checkOut}
                min={checkIn || today}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full rounded-lg border border-rv-border2 bg-rv-surface px-3 py-2.5 text-sm text-rv-text outline-none focus:ring-2 focus:ring-rv-olive-400/40"
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between rounded-xl border border-rv-border bg-rv-surface p-5">
        <div>
          <p className="text-2xl font-bold text-rv-text">
            ${room.pricePerNight}
            <span className="text-base font-normal text-rv-muted">/night</span>
          </p>
          {nights > 0 && (
            <p className="mt-0.5 text-sm text-rv-muted">
              {nights} night{nights !== 1 ? "s" : ""} = <span className="font-semibold text-rv-text">${room.pricePerNight * nights}</span>
            </p>
          )}
        </div>

        {available ? (
          <button
            onClick={handleBook}
            disabled={!checkIn || !checkOut || nights <= 0}
            className="rounded-lg bg-rv-olive-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-rv-olive-700 disabled:opacity-40"
          >
            Book Now
          </button>
        ) : (
          <span className="rounded-lg bg-rv-surface2 px-6 py-2.5 text-sm font-semibold text-rv-muted">
            Unavailable
          </span>
        )}
      </div>
    </div>
  );
}
