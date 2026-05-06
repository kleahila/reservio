import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import { getRooms } from '../../api/rooms';

const STATUSES = ['All', 'Available', 'Occupied', 'Maintenance'];

export default function RoomBrowsing() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getRooms()
      .then((data) => { if (!cancelled) { setRooms(data || []); setLoading(false); } })
      .catch((err) => { if (!cancelled) { setError(err.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  const visible = filter === 'All' ? rooms : rooms.filter((r) => r.status === filter);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-rv-text">Browse Rooms</h1>
        <p className="mt-1 text-rv-muted">{rooms.length} rooms available across all categories.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              filter === s
                ? 'bg-rv-accent text-white'
                : 'border border-rv-border2 bg-rv-surface text-rv-muted hover:text-rv-text'
            }`}
          >
            {s}
          </button>
        ))}
        <Link
          to="/rooms/availability"
          className="ml-auto rounded-full border border-rv-border2 bg-rv-surface px-4 py-1.5 text-sm font-medium text-rv-muted transition hover:text-rv-text"
        >
          Check availability
        </Link>
      </div>

      {loading && (
        <div className="py-12 text-center text-rv-muted">Loading rooms…</div>
      )}

      {error && (
        <div className="rounded-xl border border-rv-danger/20 bg-rv-danger-soft px-5 py-4 text-sm text-rv-danger">
          Failed to load rooms: {error}
        </div>
      )}

      {!loading && !error && visible.length === 0 && (
        <div className="rounded-xl border border-rv-border bg-rv-surface p-12 text-center text-rv-muted">
          No rooms match this filter.
        </div>
      )}

      {!loading && !error && visible.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((room) => (
            <div
              key={room.id}
              className="flex flex-col overflow-hidden rounded-xl border border-rv-border bg-rv-surface shadow-sm transition hover:border-rv-border2 hover:shadow-md"
            >
              {room.photos?.[0] && (
                <img src={room.photos[0]} alt={room.type} className="h-44 w-full object-cover" />
              )}
              <div className="flex flex-1 flex-col p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-rv-text">{room.type}</h3>
                  <StatusBadge status={room.status} />
                </div>
                <p className="mb-4 flex-1 text-sm leading-relaxed text-rv-muted line-clamp-2">
                  {room.description}
                </p>
                <div className="flex items-center justify-between border-t border-rv-border pt-3">
                  <span className="text-sm font-bold text-rv-text">
                    ${room.pricePerNight}
                    <span className="text-xs font-normal text-rv-muted">/night</span>
                  </span>
                  <Link
                    to={`/reservation/${room.id}`}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      room.status === 'Available'
                        ? 'bg-rv-accent text-white hover:bg-rv-accent/90'
                        : 'cursor-not-allowed bg-rv-surface2 text-rv-muted'
                    }`}
                    onClick={room.status !== 'Available' ? (e) => e.preventDefault() : undefined}
                  >
                    {room.status === 'Available' ? 'Reserve' : 'Unavailable'}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
