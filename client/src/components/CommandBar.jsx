// CommandBar — Cmd+K floating command palette.
// Groups results by type: Rooms | Guests | Actions

import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getRooms } from "../api/rooms";
import { getReservations } from "../api/reservations";

const QUICK_ACTIONS = [
  { id: "checkin",    label: "Check in guest",          icon: "→", path: "/staff/reservations" },
  { id: "checkout",   label: "Check out guest",         icon: "←", path: "/staff/reservations" },
  { id: "clean",      label: "Assign cleaning task",    icon: "✦", path: "/staff/housekeeping" },
  { id: "newres",     label: "New reservation",         icon: "+", path: "/staff/reservations" },
  { id: "roomstatus", label: "View room status board",  icon: "◉", path: "/staff/rooms"        },
];

// ── Result group heading ──────────────────────────────────────────────────────
function Group({ label }) {
  return (
    <p className="px-4 pt-2.5 pb-1 text-[9px] font-bold uppercase tracking-[0.14em] text-rv-subtle">
      {label}
    </p>
  );
}

// ── Single result row ─────────────────────────────────────────────────────────
function Row({ active, onClick, children }) {
  const ref = useRef(null);
  useEffect(() => {
    if (active) ref.current?.scrollIntoView({ block: "nearest" });
  }, [active]);
  return (
    <button
      ref={ref}
      onClick={onClick}
      className={[
        "w-full flex items-center gap-3 px-4 py-2 text-[13px] text-left transition-colors",
        active ? "bg-rv-accent/10 text-rv-text" : "hover:bg-rv-surface2 text-rv-text",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

// ── Room status pill ──────────────────────────────────────────────────────────
function RoomPill({ status }) {
  const map = {
    Available:   "bg-rv-olive/15 text-rv-olive",
    Occupied:    "bg-rv-accent/15 text-rv-accent",
    Cleaning:    "bg-rv-warning/15 text-rv-warning",
    Maintenance: "bg-rv-muted/15 text-rv-muted",
  };
  return (
    <span className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full ${map[status] ?? map.Available}`}>
      {status}
    </span>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function CommandBar({ onClose }) {
  const [query, setQuery]           = useState("");
  const [active, setActive]         = useState(0);
  const [rooms, setRooms]           = useState([]);
  const [reservations, setReservations] = useState([]);
  const inputRef                    = useRef(null);
  const navigate                    = useNavigate();
  const q                           = query.toLowerCase().trim();

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    getRooms(undefined, undefined, true).then((data) => setRooms(data || [])).catch(() => {});
    getReservations().then((data) => setReservations(data || [])).catch(() => {});
  }, []);

  // Close on Escape
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  // Build result list
  const results = useMemo(() => {
    const out = [];

    if (!q) {
      out.push(...QUICK_ACTIONS.map((a) => ({ type: "action", ...a })));
      return out;
    }

    // Rooms
    rooms
      .filter((r) => r.roomNumber?.toLowerCase().includes(q) || r.type?.toLowerCase().includes(q))
      .slice(0, 4)
      .forEach((r) => out.push({ type: "room", ...r }));

    // Guests (active reservations only)
    reservations
      .filter((r) => {
        const name = (r.guest?.fullName ?? r.guestName ?? "").toLowerCase();
        return name.includes(q) && r.status !== "CheckedOut";
      })
      .slice(0, 4)
      .forEach((r) => {
        const room = rooms.find((rm) => rm.id === r.roomId);
        out.push({ type: "guest", ...r, roomNumber: room?.roomNumber });
      });

    // Actions
    QUICK_ACTIONS
      .filter((a) => a.label.toLowerCase().includes(q))
      .forEach((a) => out.push({ type: "action", ...a }));

    return out;
  }, [q, rooms, reservations]);

  // Group results for rendering
  const roomResults   = results.filter((r) => r.type === "room");
  const guestResults  = results.filter((r) => r.type === "guest");
  const actionResults = results.filter((r) => r.type === "action");

  function handleKeyDown(e) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(i + 1, results.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && results[active]) select(results[active]);
  }

  function select(item) {
    if (item.path) navigate(item.path);
    onClose();
  }

  // Compute per-item global index for keyboard highlight
  let idx = 0;
  const roomStart   = idx;   idx += roomResults.length;
  const guestStart  = idx;   idx += guestResults.length;
  const actionStart = idx;

  return (
    <div className="cmd-backdrop fixed inset-0 z-50 bg-rv-text/20 backdrop-blur-[3px] flex items-start justify-center pt-20 px-4"
         onClick={onClose}>
      <div
        className="cmd-panel w-full max-w-[480px] bg-rv-surface border border-rv-border rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 30px 70px rgba(30,20,10,0.22), 0 0 0 1px rgba(198,93,59,0.07)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-rv-border">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2" strokeLinecap="round" className="text-rv-muted shrink-0">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActive(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Search rooms, guests, or actions…"
            className="flex-1 bg-transparent text-[13px] text-rv-text placeholder-rv-subtle outline-none"
          />
          <kbd className="text-[9px] text-rv-subtle border border-rv-border px-1.5 py-0.5 rounded shrink-0">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[320px] overflow-y-auto pb-2">
          {roomResults.length > 0 && (
            <>
              <Group label="Rooms" />
              {roomResults.map((r, i) => (
                <Row key={r.id} active={active === roomStart + i} onClick={() => select(r)}>
                  <span className="font-mono font-bold text-rv-text text-[13px]">{r.roomNumber}</span>
                  <span className="text-rv-muted text-[12px] truncate">{r.type}</span>
                  <RoomPill status={r.status} />
                </Row>
              ))}
            </>
          )}

          {guestResults.length > 0 && (
            <>
              <Group label="Guests" />
              {guestResults.map((r, i) => {
                const guestName = r.guest?.fullName ?? r.guestName ?? "—";
                return (
                  <Row key={r.id} active={active === guestStart + i} onClick={() => select(r)}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                         style={{ background: "rgba(58,111,115,0.12)", color: "rgb(var(--rv-sea))" }}>
                      {guestName.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <span className="text-rv-text truncate">{guestName}</span>
                    <span className="ml-auto text-[10px] text-rv-muted font-mono shrink-0">
                      Rm {r.roomNumber}
                    </span>
                  </Row>
                );
              })}
            </>
          )}

          {actionResults.length > 0 && (
            <>
              <Group label={q ? "Actions" : "Quick Actions"} />
              {actionResults.map((a, i) => (
                <Row key={a.id} active={active === actionStart + i} onClick={() => select(a)}>
                  <span className="w-5 text-center text-[13px]" style={{ color: "rgb(var(--rv-accent))" }}>
                    {a.icon}
                  </span>
                  <span className="text-rv-text">{a.label}</span>
                </Row>
              ))}
            </>
          )}

          {q && results.length === 0 && (
            <div className="py-8 text-center text-[13px] text-rv-muted">
              No results for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
