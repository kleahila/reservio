import { useState } from "react";

const INITIAL = [
  { id: 1, type: "info",    title: "Reservation confirmed",    body: "Your stay at Grand Hotel is confirmed for Apr 15–18.",    time: "2 hours ago",  read: false },
  { id: 2, type: "success", title: "Check-in ready",           body: "Your room is ready early. Head to reception anytime.",    time: "1 day ago",    read: false },
  { id: 3, type: "warning", title: "Parking spot expiring",    body: "Your parking reservation for spot A1 expires tomorrow.",  time: "1 day ago",    read: true  },
  { id: 4, type: "info",    title: "New service available",    body: "Sunset terrace dining is now available to book.",          time: "3 days ago",   read: true  },
  { id: 5, type: "success", title: "Sunbed booked",            body: "Poolside sunbed P3 is reserved for you tomorrow, 10 AM.", time: "3 days ago",   read: true  },
];

const TYPE_CLS = {
  info:    "border-rv-accent/20 bg-rv-accent-soft",
  success: "border-rv-success/20 bg-rv-success-soft",
  warning: "border-rv-warning/20 bg-rv-warning-soft",
  danger:  "border-rv-danger/20 bg-rv-danger-soft",
};

const DOT_CLS = {
  info:    "bg-rv-accent",
  success: "bg-rv-success",
  warning: "bg-rv-warning",
  danger:  "bg-rv-danger",
};

export default function Notifications() {
  const [notifications, setNotifications] = useState(INITIAL);
  const unread = notifications.filter((n) => !n.read).length;

  function markAll() {
    setNotifications((n) => n.map((x) => ({ ...x, read: true })));
  }

  function dismiss(id) {
    setNotifications((n) => n.filter((x) => x.id !== id));
  }

  function markRead(id) {
    setNotifications((n) => n.map((x) => x.id === id ? { ...x, read: true } : x));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-rv-text">Notifications</h1>
          <p className="mt-1 text-rv-muted">
            {unread > 0 ? `${unread} unread notification${unread !== 1 ? "s" : ""}` : "All caught up."}
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={markAll}
            className="rounded-lg border border-rv-border2 px-4 py-2 text-sm font-medium text-rv-muted hover:text-rv-text"
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-xl border border-rv-border bg-rv-surface p-12 text-center text-rv-muted">
          No notifications.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`relative flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition ${
                n.read
                  ? "border-rv-border bg-rv-surface"
                  : TYPE_CLS[n.type] ?? TYPE_CLS.info
              }`}
            >
              {!n.read && (
                <span
                  className={`mt-1 h-2 w-2 shrink-0 rounded-full ${DOT_CLS[n.type] ?? DOT_CLS.info}`}
                />
              )}
              <div className={`flex-1 ${n.read ? "pl-6" : ""}`}>
                <p className="font-semibold text-rv-text">{n.title}</p>
                <p className="mt-0.5 text-sm text-rv-muted">{n.body}</p>
                <p className="mt-2 text-xs text-rv-subtle">{n.time}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                className="shrink-0 text-rv-subtle hover:text-rv-muted"
                aria-label="Dismiss"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="1" y1="1" x2="13" y2="13" />
                  <line x1="13" y1="1" x2="1" y2="13" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
