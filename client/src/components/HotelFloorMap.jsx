import { useState, useMemo } from "react";

// ── Status visual config ──────────────────────────────────────────────────────
// Keys must match DB RoomStatus enum values exactly (uppercase).

const STATUS = {
  AVAILABLE: {
    tile:    "bg-rv-olive/12 border-rv-olive/30 hover:border-rv-olive/55",
    dot:     "bg-rv-olive",
    tag:     "Ready Room",
    tagCls:  "text-rv-olive",
  },
  OCCUPIED: {
    tile:    "bg-rv-accent/10 border-rv-accent/30 hover:border-rv-accent/55",
    dot:     "bg-rv-accent",
    tag:     "Do Not Disturb",
    tagCls:  "text-rv-accent",
  },
  MAINTENANCE: {
    tile:    "bg-rv-muted/8 border-rv-border hover:border-rv-muted/40",
    dot:     "bg-rv-muted",
    tag:     "Maintenance",
    tagCls:  "text-rv-muted",
  },
};

// ── AI hint logic (subtle system suggestions) ─────────────────────────────────
function getAIHint(room, reservation) {
  if (room.status === "MAINTENANCE") return "Should be ready soon";
  if (room.status === "OCCUPIED" && reservation) {
    const today = new Date();
    const out   = new Date(reservation.checkOut);
    const diff  = Math.round((out - today) / 86_400_000);
    if (diff === 1) return "Likely to extend stay";
  }
  return null;
}

// ── Nights-remaining calculation ──────────────────────────────────────────────
function nightsRemaining(reservation) {
  if (!reservation) return null;
  const today  = new Date();
  const out    = new Date(reservation.checkOut);
  const nights = Math.round((out - today) / 86_400_000);
  return nights;
}

// ── Room Tile ─────────────────────────────────────────────────────────────────
function RoomTile({ room, reservation, isSelected, onRoomClick }) {
  const [hovered, setHovered] = useState(false);
  const cfg    = STATUS[room.status] ?? STATUS.AVAILABLE;
  const hint   = getAIHint(room, reservation);
  const nights = nightsRemaining(reservation);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => onRoomClick(room.id)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={[
          "room-tile relative flex flex-col justify-between",
          "w-[88px] h-[100px] rounded-2xl border-2 p-3 text-left",
          cfg.tile,
          isSelected ? "is-selected" : "",
        ].join(" ")}
      >
        {/* Status dot */}
        <span className={`absolute top-2.5 right-2.5 w-2 h-2 rounded-full ${cfg.dot}`} />

        {/* Room label – type abbreviation */}
        <span className="font-mono text-[12px] font-bold leading-none text-rv-text truncate">
          {room.roomNumber ?? room.type?.slice(0, 3).toUpperCase()}
        </span>

        {/* Room type – tiny, uppercase */}
        <span className="text-[8px] uppercase tracking-wider text-rv-muted leading-tight line-clamp-2">
          {room.type}
        </span>

        {/* Door-tag label */}
        <span className={`text-[8px] font-bold uppercase tracking-wider leading-tight ${cfg.tagCls}`}>
          {cfg.tag}
        </span>

        {/* AI hint glow (barely visible underline) */}
        {hint && (
          <div className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
               style={{ background: "rgba(58,111,115,0.35)" }} />
        )}
      </button>

      {/* ── Hover reveal tooltip ──────────────────────────────────────── */}
      {hovered && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 pointer-events-none
                        w-44 rounded-xl border border-rv-border bg-rv-surface shadow-lg px-3.5 py-3">
          {reservation ? (
            <>
              <p className="text-[12px] font-semibold text-rv-text leading-snug">
                {reservation.guest?.fullName ?? reservation.guestName ?? "Guest"}
              </p>
              <p className="text-[11px] text-rv-muted mt-0.5 leading-snug">
                {nights !== null && nights > 0
                  ? `${nights} night${nights === 1 ? "" : "s"} remaining`
                  : nights === 0
                  ? "Checking out today"
                  : `Check-in: ${reservation.checkIn}`}
              </p>
              <p className="text-[10px] text-rv-subtle mt-1 font-mono">
                {reservation.checkIn} → {reservation.checkOut}
              </p>
              {reservation.notes && (
                <p className="text-[10px] text-rv-muted mt-1.5 italic border-t border-rv-border pt-1.5 leading-snug">
                  {reservation.notes}
                </p>
              )}
            </>
          ) : (
            <p className="text-[12px] text-rv-muted">No active reservation</p>
          )}
          {hint && (
            <p className="mt-1.5 text-[9px] font-semibold uppercase tracking-wider"
               style={{ color: "rgb(var(--rv-sea))" }}>
              ✦ {hint}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Floor Row ─────────────────────────────────────────────────────────────────
function FloorRow({ floor, rooms, selectedRoomId, onRoomClick, getReservation }) {
  // Sort rooms within the floor by their column position
  const sorted = [...rooms].sort((a, b) => (a.col ?? 1) - (b.col ?? 1));

  return (
    <div className="flex items-center gap-4">
      {/* Floor / type label */}
      <div className="w-14 shrink-0 text-right">
        <span className="text-[10px] font-mono text-rv-subtle">
          {typeof floor === "number" ? `F${floor}` : String(floor).slice(0, 5).toUpperCase()}
        </span>
      </div>

      {/* Corridor guide line + tiles */}
      <div className="relative flex items-center gap-3 py-2">
        {/* Corridor line behind tiles */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-rv-border" />
        {sorted.map((room) => (
          <RoomTile
            key={room.id}
            room={room}
            reservation={getReservation(room.id)}
            isSelected={selectedRoomId === room.id}
            onRoomClick={onRoomClick}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function HotelFloorMap({ rooms, reservations, selectedRoomId, onRoomClick }) {
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Group rooms by type since DB has no floor field
  const floors = useMemo(() => {
    const map = {};
    rooms.forEach((r) => {
      const key = r.floor ?? r.type ?? "Room";
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return Object.entries(map).map(([f, rs]) => ({ floor: f, rooms: rs }));
  }, [rooms]);

  // Find the most relevant reservation for a room
  function getReservation(roomId) {
    return (
      reservations.find(
        (r) =>
          r.roomId === roomId &&
          r.status !== "CHECKED_OUT" &&
          r.checkOut?.slice(0, 10) >= today,
      ) ?? null
    );
  }

  const counts = {
    ready:   rooms.filter((r) => r.status === "AVAILABLE").length,
    occ:     rooms.filter((r) => r.status === "OCCUPIED").length,
    maint:   rooms.filter((r) => r.status === "MAINTENANCE").length,
  };

  return (
    <div className="p-6 min-h-full select-none">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="mb-5">
        <h1 className="font-serif text-[22px] font-semibold text-rv-text leading-tight">
          Hotel Floor Plan
        </h1>
        <p className="mt-1 text-[13px] text-rv-muted">
          <span className="text-rv-olive font-medium">{counts.ready} ready</span>
          {" · "}
          <span className="text-rv-accent font-medium">{counts.occ} occupied</span>
          {counts.maint > 0 && (
            <><span> · </span><span className="text-rv-muted font-medium">{counts.maint} maintenance</span></>
          )}
        </p>
      </div>

      {/* ── Legend ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-4 mb-7">
        {Object.entries(STATUS).map(([status, cfg]) => (
          <div key={status} className="flex items-center gap-1.5 text-[11px] text-rv-muted">
            <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
            {status}
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-[11px] text-rv-muted">
          <span className="w-4 h-0.5 rounded-full"
                style={{ background: "rgba(58,111,115,0.35)" }} />
          System hint
        </div>
      </div>

      {/* ── Floors ──────────────────────────────────────────────────────── */}
      <div className="space-y-2">
        {floors.map(({ floor, rooms: fr }) => (
          <FloorRow
            key={floor}
            floor={floor}
            rooms={fr}
            selectedRoomId={selectedRoomId}
            onRoomClick={onRoomClick}
            getReservation={getReservation}
          />
        ))}
      </div>
    </div>
  );
}
