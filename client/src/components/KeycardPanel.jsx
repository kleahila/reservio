// KeycardPanel — right-side sliding panel for booking / room details.
// Styled to feel like placing a physical folder on a hotel desk.

const STATUS_DISPLAY = {
  Available:   { dot: "bg-rv-olive",   label: "Ready",       labelCls: "text-rv-olive"   },
  Occupied:    { dot: "bg-rv-accent",  label: "Occupied",    labelCls: "text-rv-accent"  },
  Cleaning:    { dot: "bg-rv-warning", label: "Cleaning",    labelCls: "text-rv-warning" },
  Maintenance: { dot: "bg-rv-muted",   label: "Maintenance", labelCls: "text-rv-muted"   },
};

const RES_ACTIONS = {
  Confirmed: { label: "Check In Guest",  next: "CheckedIn"  },
  CheckedIn: { label: "Check Out Guest", next: "CheckedOut" },
};

// ── Guest avatar ──────────────────────────────────────────────────────────────
function GuestAvatar({ name, size = "lg" }) {
  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const cls = size === "lg"
    ? "w-10 h-10 text-[13px]"
    : "w-7 h-7 text-[10px]";
  return (
    <div
      className={`${cls} rounded-full shrink-0 flex items-center justify-center font-bold`}
      style={{ background: "rgba(58,111,115,0.13)", color: "rgb(var(--rv-sea))" }}
    >
      {initials}
    </div>
  );
}

// ── Stay progress bar ─────────────────────────────────────────────────────────
function StayProgress({ checkIn, checkOut }) {
  const ci    = new Date(checkIn);
  const co    = new Date(checkOut);
  const now   = new Date();
  const total = co - ci;
  const pct   = total > 0 ? Math.max(0, Math.min(100, ((now - ci) / total) * 100)) : 0;
  const nights = Math.round(total / 86_400_000);
  const done   = Math.round((now - ci) / 86_400_000);

  return (
    <div>
      <div className="flex justify-between text-[10px] text-rv-subtle mb-1">
        <span>{done}/{nights} nights</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="h-1 bg-rv-surface2 rounded-full overflow-hidden">
        <div
          className="h-full bg-rv-accent rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Label + value pair ────────────────────────────────────────────────────────
function Field({ label, value, mono }) {
  return (
    <div>
      <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-rv-subtle mb-0.5">
        {label}
      </p>
      <p className={`text-[13px] text-rv-text ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function KeycardPanel({ room, reservation, onClose, onStatusChange, onReservationTransition }) {
  if (!room) return null;

  const statusDisp  = STATUS_DISPLAY[room.status] ?? STATUS_DISPLAY.Available;
  const resAction   = reservation ? RES_ACTIONS[reservation.status] : null;

  // Nights remaining for occupied rooms
  const today = new Date().toISOString().split("T")[0];
  const nightsLeft = reservation
    ? Math.max(0, Math.round((new Date(reservation.checkOut) - new Date()) / 86_400_000))
    : null;

  return (
    <aside className="keycard-slide-in w-72 shrink-0 flex flex-col border-l border-rv-border bg-rv-surface overflow-y-auto">

      {/* ── Card header ─────────────────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-4 border-b border-rv-border">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-rv-subtle">
              Room {room.roomNumber}
            </p>
            <h2 className="font-serif text-[19px] text-rv-text mt-0.5 leading-tight">
              {room.type}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-rv-muted hover:text-rv-text hover:bg-rv-surface2 transition-colors"
            aria-label="Close panel"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M1 1l12 12M13 1L1 13" />
            </svg>
          </button>
        </div>

        {/* Status badge */}
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-rv-border bg-rv-surface2">
          <span className={`w-1.5 h-1.5 rounded-full ${statusDisp.dot}`} />
          <span className={statusDisp.labelCls}>{statusDisp.label}</span>
        </span>
      </div>

      {/* ── Guest block ─────────────────────────────────────────────────── */}
      {reservation ? (
        <div className="px-5 py-4 border-b border-rv-border space-y-4">
          {/* Guest identity */}
          <div className="flex items-center gap-3">
            <GuestAvatar name={reservation.guestName} />
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-rv-text truncate">
                {reservation.guestName}
              </p>
              {reservation.phone && (
                <p className="text-[11px] text-rv-muted font-mono mt-0.5">{reservation.phone}</p>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Check-in"  value={reservation.checkIn}  mono />
            <Field label="Check-out" value={reservation.checkOut} mono />
          </div>
          {reservation.guests && (
            <Field label="Guests" value={`${reservation.guests} ${reservation.guests === 1 ? "guest" : "guests"}`} />
          )}

          {/* Stay progress */}
          {reservation.status === "CheckedIn" && (
            <StayProgress checkIn={reservation.checkIn} checkOut={reservation.checkOut} />
          )}

          {/* Notes */}
          {reservation.notes && (
            <div className="p-3 rounded-xl border border-rv-warning/20 bg-rv-warning/5">
              <p className="text-[9px] font-bold uppercase tracking-wider text-rv-warning mb-1">Note</p>
              <p className="text-[11px] text-rv-text leading-relaxed">{reservation.notes}</p>
            </div>
          )}

          {/* Special requests */}
          {reservation.specialRequests && (
            <div className="p-3 rounded-xl border border-rv-sea/15 bg-rv-sea/5">
              <p className="text-[9px] font-bold uppercase tracking-wider mb-1"
                 style={{ color: "rgb(var(--rv-sea))" }}>Special Request</p>
              <p className="text-[11px] text-rv-text leading-relaxed">{reservation.specialRequests}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="px-5 py-6 border-b border-rv-border">
          <p className="text-[12px] text-rv-subtle text-center">No active reservation for this room</p>
        </div>
      )}

      {/* ── Price ───────────────────────────────────────────────────────── */}
      <div className="px-5 py-3.5 border-b border-rv-border flex items-center justify-between">
        <span className="text-[11px] text-rv-muted">Rate per night</span>
        <span className="font-mono text-[18px] font-bold text-rv-text">
          €{room.pricePerNight}
        </span>
      </div>

      {/* ── Actions ─────────────────────────────────────────────────────── */}
      <div className="px-5 py-4 space-y-2 flex-1">
        {/* Primary reservation transition */}
        {resAction && (
          <button
            onClick={() => onReservationTransition(reservation.id, resAction.next)}
            className="w-full py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all duration-150
                       hover:opacity-90 active:scale-[0.98]"
            style={{ background: "rgb(var(--rv-accent))" }}
          >
            {resAction.label}
          </button>
        )}

        {/* Room status controls */}
        <div className="flex gap-2 flex-wrap">
          {room.status !== "Cleaning" && room.status !== "Occupied" && (
            <button
              onClick={() => onStatusChange(room.id, "Cleaning")}
              className="flex-1 py-2 rounded-xl border border-rv-border text-[12px] font-medium
                         text-rv-muted hover:text-rv-text hover:border-rv-border2 hover:bg-rv-surface2 transition-colors"
            >
              Assign Cleaning
            </button>
          )}
          {room.status === "Cleaning" && (
            <button
              onClick={() => onStatusChange(room.id, "Available")}
              className="flex-1 py-2 rounded-xl border border-rv-border text-[12px] font-medium
                         text-rv-muted hover:text-rv-text hover:border-rv-border2 hover:bg-rv-surface2 transition-colors"
            >
              Mark Ready
            </button>
          )}
          {room.status === "Maintenance" && (
            <button
              onClick={() => onStatusChange(room.id, "Available")}
              className="flex-1 py-2 rounded-xl border border-rv-border text-[12px] font-medium
                         text-rv-muted hover:text-rv-text hover:border-rv-border2 hover:bg-rv-surface2 transition-colors"
            >
              Mark Ready
            </button>
          )}
        </div>
      </div>

      {/* ── AI system hint ───────────────────────────────────────────────── */}
      {room.status === "Cleaning" && (
        <div className="mx-5 mb-5 px-3.5 py-2.5 rounded-xl border border-rv-sea/20 bg-rv-sea/6">
          <p className="text-[10px] leading-relaxed" style={{ color: "rgb(var(--rv-sea))" }}>
            ✦ Should be ready within ~30 min based on typical cleaning duration
          </p>
        </div>
      )}
      {reservation && nightsLeft === 1 && room.status === "Occupied" && (
        <div className="mx-5 mb-5 px-3.5 py-2.5 rounded-xl border border-rv-sea/20 bg-rv-sea/6">
          <p className="text-[10px] leading-relaxed" style={{ color: "rgb(var(--rv-sea))" }}>
            ✦ Guest checks out tomorrow — consider preparing the cleaning schedule
          </p>
        </div>
      )}
    </aside>
  );
}
