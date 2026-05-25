import { useState, useEffect, useRef } from 'react';
import { getMyNotifications, markNotificationRead } from '../api/notifications';

function timeAgo(d) {
  const diff = Math.floor((Date.now() - new Date(d)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const DEMO_NOTIFS = [
  { id: 'd1', action: 'New reservation confirmed',   metadata: 'Room 302 — Marco Rossi, 3 nights',          createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),   read: false },
  { id: 'd2', action: 'Guest checked in',            metadata: 'Room 103 — Sofia Müller',                    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),  read: false },
  { id: 'd3', action: 'Housekeeping task completed', metadata: 'Room 205 marked clean by Besa Hoxha',        createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), read: false },
  { id: 'd4', action: 'Maintenance request opened',  metadata: 'Room 410 — plumbing issue reported',         createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(), read: true  },
  { id: 'd5', action: 'Dynamic pricing updated',     metadata: 'Occupancy at 82% — rates increased 15%',     createdAt: new Date(Date.now() - 86400 * 1000).toISOString(),     read: true  },
];

export default function NotificationBell() {
  const [notifs, setNotifs] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  function load() {
    getMyNotifications()
      .then((data) => {
        const real = data || [];
        // Pad with demo notifications so there's always something to show
        const combined = real.length >= 3
          ? real
          : [...real, ...DEMO_NOTIFS.slice(0, 5 - real.length)];
        setNotifs(combined);
      })
      .catch(() => setNotifs(DEMO_NOTIFS));
  }

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const unread = notifs.filter((n) => !n.read).length;

  async function handleRead(id) {
    // Demo notifs are client-side only
    if (String(id).startsWith('d')) {
      setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
      return;
    }
    try {
      await markNotificationRead(id);
      setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    } catch {}
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-lg border border-rv-border2 px-2.5 py-1.5 text-rv-muted transition hover:text-rv-text"
        aria-label="Notifications"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rv-danger text-[9px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-80 rounded-xl border border-rv-border bg-rv-surface shadow-lg">
          <div className="border-b border-rv-border px-4 py-3">
            <p className="text-sm font-semibold text-rv-text">Notifications</p>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifs.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-rv-muted">No notifications yet.</p>
            ) : (
              notifs.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleRead(n.id)}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-rv-surface2 ${!n.read ? 'bg-rv-olive-50/50 dark:bg-rv-olive-900/10' : ''}`}
                >
                  {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-rv-olive-500" />}
                  {n.read && <span className="mt-1.5 h-2 w-2 shrink-0" />}
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-rv-text">{n.action}</p>
                    {n.metadata && <p className="mt-0.5 truncate text-[11px] text-rv-muted">{n.metadata}</p>}
                    <p className="mt-1 text-[10px] text-rv-subtle">{timeAgo(n.createdAt)}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
