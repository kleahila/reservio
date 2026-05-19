import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import { getRooms } from '../../api/rooms';

function floorFromDescription(description) {
  const num = parseInt(description?.replace(/\D/g, '') || '0', 10);
  if (num >= 400) return 4;
  if (num >= 300) return 3;
  if (num >= 200) return 2;
  return 1;
}

const FLOOR_LABELS = { 1: 'Floor 1', 2: 'Floor 2', 3: 'Floor 3', 4: 'Floor 4 – Penthouse' };

export default function RoomBrowsing() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFloor, setActiveFloor] = useState('all');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getRooms()
      .then((data) => {
        if (!cancelled) {
          const available = (data || []).filter((r) => r.status === 'AVAILABLE');
          setRooms(available);
          setLoading(false);
        }
      })
      .catch((err) => { if (!cancelled) { setError(err.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  const floors = [...new Set(rooms.map((r) => floorFromDescription(r.description)))].sort();

  const visible =
    activeFloor === 'all'
      ? rooms
      : rooms.filter((r) => floorFromDescription(r.description) === activeFloor);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-rv-text">Browse Rooms</h1>
        <p className="mt-1 text-rv-muted">{rooms.length} available rooms across all floors.</p>
      </div>

      {!loading && !error && floors.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveFloor('all')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              activeFloor === 'all'
                ? 'bg-rv-olive-600 text-white'
                : 'border border-rv-border2 bg-rv-surface text-rv-muted hover:text-rv-text'
            }`}
          >
            All floors
          </button>
          {floors.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFloor(f)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                activeFloor === f
                  ? 'bg-rv-olive-600 text-white'
                  : 'border border-rv-border2 bg-rv-surface text-rv-muted hover:text-rv-text'
              }`}
            >
              {FLOOR_LABELS[f] ?? `Floor ${f}`}
            </button>
          ))}

          <Link
            to="/rooms/availability"
            className="ml-auto rounded-full border border-rv-border2 bg-rv-surface px-4 py-1.5 text-sm font-medium text-rv-muted transition hover:text-rv-text"
          >
            Check availability
          </Link>
        </div>
      )}

      {loading && <div className="py-12 text-center text-rv-muted">Loading rooms…</div>}

      {error && (
        <div className="rounded-xl border border-rv-danger/20 bg-rv-danger-soft px-5 py-4 text-sm text-rv-danger">
          Failed to load rooms: {error}
        </div>
      )}

      {!loading && !error && visible.length === 0 && (
        <div className="rounded-xl border border-rv-border bg-rv-surface p-12 text-center text-rv-muted">
          No rooms available on this floor.
        </div>
      )}

      {!loading && !error && visible.length > 0 && (
        <div className="space-y-10">
          {(activeFloor === 'all' ? floors : [activeFloor]).map((floor) => {
            const group = visible.filter((r) => floorFromDescription(r.description) === floor);
            if (group.length === 0) return null;
            return (
              <section key={floor}>
                <h2 className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-rv-muted">
                  <span>{FLOOR_LABELS[floor] ?? `Floor ${floor}`}</span>
                  <span className="h-px flex-1 bg-rv-border" />
                  <span className="font-normal normal-case">{group.length} room{group.length !== 1 ? 's' : ''}</span>
                </h2>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {group.map((room) => (
                    <div
                      key={room.id}
                      className="room-tile flex flex-col overflow-hidden rounded-xl border border-rv-border bg-rv-surface shadow-sm"
                    >
                      {room.photos?.[0] && (
                        <img src={room.photos[0]} alt={room.type} className="h-44 w-full object-cover" />
                      )}
                      <div className="flex flex-1 flex-col p-4">
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-rv-text">{room.type}</h3>
                            <p className="text-xs text-rv-muted">Room {room.description}</p>
                          </div>
                          <StatusBadge status={room.status} />
                        </div>
                        {room.averageRating > 0 && (
                          <div className="flex items-center gap-1 mb-2">
                            <span className="text-xs text-rv-warning">{'★'.repeat(Math.round(room.averageRating))}{'☆'.repeat(5 - Math.round(room.averageRating))}</span>
                            <span className="text-xs text-rv-muted">{room.averageRating.toFixed(1)}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between border-t border-rv-border pt-3 mt-auto">
                          <span className="text-sm font-bold text-rv-text">
                            ${room.pricePerNight}
                            <span className="text-xs font-normal text-rv-muted">/night</span>
                          </span>
                          <Link
                            to={`/rooms/${room.id}`}
                            className="rounded-lg bg-rv-olive-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rv-olive-700"
                          >
                            View &amp; Book
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
