import { useState, useRef, useMemo } from "react";

// ── Layout constants ──────────────────────────────────────────────────────────
const DAY_PX  = 46;   // pixels per day
const DAYS    = 22;   // total days shown
const OFFSET  = 7;    // days before today shown on left

// ── Status colors for booking blocks ─────────────────────────────────────────
const BLOCK = {
  Confirmed:  "bg-rv-sea/75 border-rv-sea/50 text-white",
  CheckedIn:  "bg-rv-accent/80 border-rv-accent/50 text-white",
  Pending:    "bg-rv-warning/45 border-rv-warning/35 text-rv-text",
  CheckedOut: "bg-rv-surface2 border-rv-border text-rv-muted",
};

// ── Date helpers ──────────────────────────────────────────────────────────────
function rangeStart() {
  const d = new Date();
  d.setDate(d.getDate() - OFFSET);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dayOffset(dateStr, origin) {
  return (new Date(dateStr) - origin) / 86_400_000;
}

// ── Draggable / resizable booking block ──────────────────────────────────────
function Block({ reservation, left, width, onUpdate }) {
  const [hover, setHover]         = useState(false);
  const [dragging, setDragging]   = useState(false);
  const [resizing, setResizing]   = useState(false);
  const ref = useRef({ startX: 0, origCheckIn: "", origCheckOut: "" });

  const origin = useMemo(rangeStart, []);
  const colorCls = BLOCK[reservation.status] ?? BLOCK.Pending;
  const nights   = Math.round(width / DAY_PX);

  // ── Drag to move ─────────────────────────────────────────────────────
  function startDrag(e) {
    if (reservation.status === "CheckedOut") return;
    e.preventDefault();
    setDragging(true);
    ref.current = {
      startX:       e.clientX,
      origCheckIn:  reservation.checkIn,
      origCheckOut: reservation.checkOut,
    };
    function onMove() { /* visual handled by CSS */ }
    function onUp(ev) {
      const dx = ev.clientX - ref.current.startX;
      const dd = Math.round(dx / DAY_PX);
      if (dd !== 0) {
        const ci = new Date(ref.current.origCheckIn);
        const co = new Date(ref.current.origCheckOut);
        ci.setDate(ci.getDate() + dd);
        co.setDate(co.getDate() + dd);
        onUpdate(reservation.id, {
          checkIn:  ci.toISOString().split("T")[0],
          checkOut: co.toISOString().split("T")[0],
        });
      }
      setDragging(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  // ── Drag right edge to resize ─────────────────────────────────────────
  function startResize(e) {
    e.preventDefault();
    e.stopPropagation();
    setResizing(true);
    ref.current = { startX: e.clientX, origCheckOut: reservation.checkOut };
    function onMove() { /* visual only */ }
    function onUp(ev) {
      const dx = ev.clientX - ref.current.startX;
      const dd = Math.round(dx / DAY_PX);
      if (dd !== 0) {
        const co = new Date(ref.current.origCheckOut);
        co.setDate(co.getDate() + dd);
        if (co > new Date(reservation.checkIn)) {
          onUpdate(reservation.id, { checkOut: co.toISOString().split("T")[0] });
        }
      }
      setResizing(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  return (
    <div
      className={[
        "tl-block absolute top-1.5 bottom-1.5 rounded-full border flex items-center overflow-hidden",
        colorCls,
        dragging || resizing ? "is-dragging" : "",
      ].join(" ")}
      style={{ left: left + 2, width: Math.max(width - 4, 18) }}
      onMouseDown={startDrag}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Label */}
      <div className="flex items-center gap-1.5 px-2.5 overflow-hidden flex-1">
        {hover ? (
          <>
            <span className="text-[10px] font-semibold truncate">{reservation.guestName}</span>
            {nights > 0 && <span className="text-[9px] opacity-60 shrink-0">{nights}n</span>}
          </>
        ) : (
          <span className="text-[10px] font-semibold truncate">
            {reservation.guestName.split(" ")[0]}
          </span>
        )}
      </div>

      {/* Resize handle — right edge */}
      {reservation.status !== "CheckedOut" && (
        <div
          className="absolute right-0 top-0 bottom-0 w-3 flex items-center justify-center
                     opacity-0 hover:opacity-100 cursor-e-resize transition-opacity"
          onMouseDown={startResize}
        >
          <div className="w-0.5 h-3 rounded-full bg-white/40" />
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function BookingTimeline({ rooms, reservations, onReservationUpdate, selectedRoomId, onRoomSelect }) {
  const origin    = useMemo(rangeStart, []);
  const today     = useMemo(() => new Date().toISOString().split("T")[0], []);
  const todayLeft = useMemo(() => dayOffset(today, origin) * DAY_PX, [today, origin]);

  // Build day labels
  const days = useMemo(() =>
    Array.from({ length: DAYS }, (_, i) => {
      const d = new Date(origin);
      d.setDate(d.getDate() + i);
      return d;
    }), [origin]);

  return (
    <div className="shrink-0 h-[180px] border-t border-rv-border bg-rv-surface flex flex-col overflow-hidden">

      {/* ── Header row ──────────────────────────────────────────────────── */}
      <div className="flex h-7 shrink-0 items-stretch border-b border-rv-border bg-rv-surface2/60 overflow-hidden">
        {/* Room label column header */}
        <div className="w-[148px] shrink-0 flex items-center px-3 border-r border-rv-border">
          <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-rv-subtle">Timeline</span>
        </div>

        {/* Day headers */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex h-full" style={{ width: DAYS * DAY_PX }}>
            {days.map((day, i) => {
              const isToday   = day.toDateString() === new Date().toDateString();
              const isWeekend = day.getDay() === 0 || day.getDay() === 6;
              return (
                <div
                  key={i}
                  className={[
                    "shrink-0 flex items-center justify-center border-r border-rv-border text-[9px] font-mono",
                    isToday   ? "bg-rv-accent/12 text-rv-accent font-bold" :
                    isWeekend ? "text-rv-accent/60" : "text-rv-subtle",
                  ].join(" ")}
                  style={{ width: DAY_PX }}
                >
                  {day.getDate() === 1 || i === 0
                    ? day.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    : day.getDate()}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Room rows ───────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {rooms.map((room) => {
          const roomRes   = reservations.filter((r) => r.roomId === room.id && r.status !== "CheckedOut");
          const isSelected = selectedRoomId === room.id;

          return (
            <div
              key={room.id}
              className={[
                "flex items-stretch h-[37px] border-b border-rv-border/50 transition-colors",
                isSelected ? "bg-rv-accent/5" : "hover:bg-rv-surface2/40",
              ].join(" ")}
            >
              {/* Room label */}
              <button
                className="w-[148px] shrink-0 flex items-center px-3 gap-2 border-r border-rv-border/50 text-left"
                onClick={() => onRoomSelect(isSelected ? null : room.id)}
              >
                <span className="font-mono text-[11px] font-bold text-rv-text">{room.roomNumber}</span>
                <span className="text-[9px] text-rv-muted truncate">{room.type.split(" ")[0]}</span>
              </button>

              {/* Booking track */}
              <div className="flex-1 overflow-x-auto overflow-y-hidden">
                <div className="relative h-full" style={{ width: DAYS * DAY_PX }}>
                  {/* Today marker */}
                  {todayLeft >= 0 && todayLeft <= DAYS * DAY_PX && (
                    <div
                      className="absolute top-0 bottom-0 w-px z-10 pointer-events-none"
                      style={{ left: todayLeft, background: "rgba(198,93,59,0.35)" }}
                    />
                  )}

                  {roomRes.map((res) => {
                    const left  = dayOffset(res.checkIn, origin) * DAY_PX;
                    const width = (dayOffset(res.checkOut, origin) - dayOffset(res.checkIn, origin)) * DAY_PX;
                    if (width <= 0) return null;
                    return (
                      <Block
                        key={res.id}
                        reservation={res}
                        left={left}
                        width={width}
                        onUpdate={onReservationUpdate}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
