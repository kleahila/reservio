import { useState } from "react";
import { Link } from "react-router-dom";
import StatusBadge from "../../components/StatusBadge";
import { getRooms } from "../../api/rooms";

export default function RoomAvailability() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [searched, setSearched] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSearch(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSearched(false);
    try {
      const data = await getRooms(checkIn, checkOut);
      setRooms(data || []);
      setSearched(true);
    } catch (err) {
      setError(err.message || "Failed to load rooms.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-rv-border2 bg-rv-surface px-3 py-2.5 text-sm text-rv-text outline-none transition focus:ring-2 focus:ring-rv-accent/40";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-rv-text">Check Availability</h1>
        <p className="mt-1 text-rv-muted">Search available rooms for your dates.</p>
      </div>

      {/* Search form */}
      <div className="rounded-xl border border-rv-border bg-rv-surface p-6 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-40">
            <label className="mb-1.5 block text-sm font-medium text-rv-text">Check-in</label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
              className={inputClass}
            />
          </div>
          <div className="flex-1 min-w-40">
            <label className="mb-1.5 block text-sm font-medium text-rv-text">Check-out</label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              min={checkIn || new Date().toISOString().slice(0, 10)}
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-rv-accent px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-rv-accent/90 disabled:opacity-50"
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </form>
      </div>

      {loading && <div className="py-8 text-center text-rv-muted">Checking availability…</div>}

      {error && (
        <div className="rounded-xl border border-rv-danger/20 bg-rv-danger-soft px-5 py-4 text-sm text-rv-danger">
          {error}
        </div>
      )}

      {/* Results */}
      {searched && !loading && !error && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-rv-text">
            {rooms.length} rooms available
            {checkIn && checkOut && (
              <span className="ml-2 text-sm font-normal text-rv-muted">
                &mdash; {checkIn} to {checkOut}
              </span>
            )}
          </h2>
          {rooms.length === 0 ? (
            <div className="rounded-xl border border-rv-border bg-rv-surface p-8 text-center text-rv-muted">
              No rooms available for the selected dates.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="flex flex-col overflow-hidden rounded-xl border border-rv-border bg-rv-surface shadow-sm"
                >
                  {room.photos?.[0] && (
                    <img src={room.photos[0]} alt={room.type} className="h-40 w-full object-cover" />
                  )}
                  <div className="flex flex-1 flex-col p-4">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-rv-text">{room.type}</h3>
                      <StatusBadge status={room.status} />
                    </div>
                    <p className="mb-4 flex-1 text-sm text-rv-muted line-clamp-2">{room.description}</p>
                    <div className="flex items-center justify-between border-t border-rv-border pt-3">
                      <span className="text-sm font-bold text-rv-text">
                        ${room.pricePerNight}
                        <span className="text-xs font-normal text-rv-muted">/night</span>
                      </span>
                      <Link
                        to={`/rooms/${room.id}`}
                        className="rounded-lg bg-rv-accent px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rv-accent/90"
                      >
                        Reserve
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
