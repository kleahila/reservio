import { useState, useEffect } from 'react';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import { getRooms, updateRoomStatus } from '../../api/rooms';

const STATUSES = ['Available', 'Occupied', 'Maintenance'];

export default function RoomStatusGrid() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getRooms()
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
                <span className="text-rv-muted">{s}</span>
                <span className="ml-2 font-bold text-rv-text">{counts[s]}</span>
              </div>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rooms.map((room) => (
              <div key={room.id} className="rounded-xl border border-rv-border bg-rv-surface p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold text-rv-text">{room.type}</h3>
                  <StatusBadge status={room.status} />
                </div>
                <p className="mb-3 text-xs text-rv-muted">Floor {room.floor}</p>
                <select
                  value={room.status}
                  onChange={(e) => handleStatusChange(room.id, e.target.value)}
                  disabled={updating === room.id}
                  className="w-full rounded-lg border border-rv-border2 bg-rv-bg px-3 py-2 text-sm text-rv-text outline-none focus:ring-2 focus:ring-rv-accent/40 disabled:opacity-50"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
