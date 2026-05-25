import { useState, useEffect } from 'react';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import { getRooms, updateRoomStatus } from '../../api/rooms';

const STATUSES = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'];
const STATUS_LABEL = { AVAILABLE: 'Available', OCCUPIED: 'Occupied', MAINTENANCE: 'Maintenance' };

function floorFromDesc(desc) {
  const n = parseInt(desc, 10);
  if (isNaN(n)) return '—';
  return Math.floor(n / 100) || 1;
}

export default function RoomStatusGrid() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getRooms(undefined, undefined, true)
      .then((data) => { if (!cancelled) { setRooms(data || []); setLoading(false); } })
      .catch((err) => { if (!cancelled) { setError(err.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  async function handleStatusChange(id, status) {
    setUpdating(id);
    try {
      await updateRoomStatus(id, status);
      setRooms((r) => r.map((x) => x.id === id ? { ...x, status } : x));
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(null);
    }
  }

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = rooms.filter((r) => r.status === s).length;
    return acc;
  }, {});

  return (
    <div>
      <PageHeader title="Room Status" subtitle="Monitor and update room status in real time." />

      {loading && <div className="py-8 text-center text-rv-muted">Loading rooms…</div>}

      {error && (
        <div className="mb-4 rounded-xl border border-rv-danger/20 bg-rv-danger-soft px-5 py-3 text-sm text-rv-danger">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="mb-6 flex flex-wrap gap-3">
            {STATUSES.map((s) => (
              <div key={s} className="rounded-lg border border-rv-border bg-rv-surface px-4 py-2 text-sm">
                <span className="text-rv-muted">{STATUS_LABEL[s]}</span>
                <span className="ml-2 font-bold text-rv-text">{counts[s]}</span>
              </div>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rooms.map((room) => (
              <div key={room.id} className="rounded-xl border border-rv-border bg-rv-surface p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-rv-text">{room.type} — Room {room.description}</h3>
                    <p className="text-xs text-rv-muted">Floor {floorFromDesc(room.description)}</p>
                  </div>
                  <StatusBadge status={room.status} />
                </div>
                <select
                  value={room.status}
                  onChange={(e) => handleStatusChange(room.id, e.target.value)}
                  disabled={updating === room.id}
                  className="w-full rounded-lg border border-rv-border2 bg-rv-bg px-3 py-2 text-sm text-rv-text outline-none focus:ring-2 focus:ring-rv-accent/40 disabled:opacity-50"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                </select>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
