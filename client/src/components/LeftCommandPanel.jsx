import { mockRooms } from "../data/mockRooms";

// ── Shared section divider ────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-2 px-4 pt-3 pb-1.5">
      <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-rv-subtle whitespace-nowrap">
        {children}
      </span>
      <div className="flex-1 h-px bg-rv-border" />
    </div>
  );
}

// ── Single alert row (checkout due / urgent task) ─────────────────────────────
function AlertRow({ type, label, sub }) {
  const isUrgent = type === "urgent";
  return (
    <div className={[
      "mx-2 mb-1 flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-xs border",
      isUrgent
        ? "bg-rv-danger/6 border-rv-danger/18 "
        : "bg-rv-warning/6 border-rv-warning/18",
    ].join(" ")}>
      <span className={[
        "mt-0.5 w-1.5 h-1.5 rounded-full shrink-0",
        isUrgent ? "bg-rv-danger" : "bg-rv-warning",
      ].join(" ")} />
      <div className="min-w-0">
        <p className="font-semibold text-rv-text leading-snug truncate">{label}</p>
        <p className="text-rv-muted mt-0.5 leading-snug truncate">{sub}</p>
      </div>
    </div>
  );
}

// ── Arrival card ──────────────────────────────────────────────────────────────
function ArrivalRow({ reservation }) {
  const room = mockRooms.find((r) => r.id === reservation.roomId);
  const initials = reservation.guestName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  return (
    <div className="mx-2 mb-1 flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rv-surface2 cursor-pointer transition-colors duration-150">
      {/* Avatar */}
      <div
        className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold"
        style={{ background: "rgba(58,111,115,0.12)", color: "rgb(var(--rv-sea))" }}
      >
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-medium text-rv-text truncate leading-snug">
          {reservation.guestName}
        </p>
        <p className="text-[10px] text-rv-muted leading-snug">
          {room?.roomNumber ?? `Room ${reservation.roomId}`} · {reservation.guests ?? 1}{" "}
          {reservation.guests === 1 ? "guest" : "guests"}
        </p>
      </div>
      {/* ETA pill */}
      <span className="shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
            style={{ background: "rgba(58,111,115,0.10)", color: "rgb(var(--rv-sea))" }}>
        Today
      </span>
    </div>
  );
}

// ── Staff on-duty row ─────────────────────────────────────────────────────────
function StaffRow({ member }) {
  const initials = member.name.split(" ").map((n) => n[0]).join("").toUpperCase();
  const isHK = member.role === "Housekeeper";
  return (
    <div className="mx-2 mb-0.5 flex items-center gap-2.5 px-3 py-2 rounded-xl">
      <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[9px] font-bold border border-rv-border bg-rv-surface2 text-rv-muted">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-rv-text truncate leading-snug">{member.name}</p>
        <p className="text-[10px] text-rv-subtle leading-snug">{member.role}</p>
      </div>
      {/* Online indicator */}
      <div className={[
        "w-1.5 h-1.5 rounded-full shrink-0",
        isHK ? "bg-rv-olive" : "bg-rv-success",
      ].join(" ")} />
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function LeftCommandPanel({ reservations, tasks, staff }) {
  const today = new Date().toISOString().split("T")[0];

  const arrivalsToday    = reservations.filter((r) => r.checkIn === today && r.status === "Confirmed");
  const checkoutsToday   = reservations.filter((r) => r.checkOut === today && r.status === "CheckedIn");
  const urgentTasks      = tasks.filter((t) => t.urgency === "high");
  const hasAlerts        = checkoutsToday.length > 0 || urgentTasks.length > 0;

  return (
    <aside className="w-56 shrink-0 flex flex-col border-r border-rv-border bg-rv-surface overflow-y-auto">
      {/* Panel identity */}
      <div className="px-4 py-3.5 border-b border-rv-border">
        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-rv-subtle">Operations</p>
        <p className="mt-1 font-serif text-[15px] text-rv-text leading-snug">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month:   "short",
            day:     "numeric",
          })}
        </p>
      </div>

      {/* ── Alerts ─────────────────────────────────────────────────────── */}
      <SectionLabel>Alerts</SectionLabel>
      {hasAlerts ? (
        <>
          {checkoutsToday.map((r) => (
            <AlertRow key={`co-${r.id}`} type="checkout" label={r.guestName} sub="Check-out due today" />
          ))}
          {urgentTasks.map((t) => (
            <AlertRow key={`ut-${t.id}`} type="urgent" label={t.roomLabel} sub={t.notes || "Urgent cleaning"} />
          ))}
        </>
      ) : (
        <p className="px-4 py-2 text-[11px] text-rv-subtle">No active alerts</p>
      )}

      {/* ── Arrivals Today ──────────────────────────────────────────────── */}
      <SectionLabel>Arrivals Today</SectionLabel>
      {arrivalsToday.length > 0 ? (
        arrivalsToday.map((r) => <ArrivalRow key={r.id} reservation={r} />)
      ) : (
        <p className="px-4 py-2 text-[11px] text-rv-subtle">No arrivals scheduled</p>
      )}

      {/* ── Staff on Duty ───────────────────────────────────────────────── */}
      <SectionLabel>Staff on Duty</SectionLabel>
      <div className="pb-4">
        {staff.slice(0, 5).map((s) => <StaffRow key={s.id} member={s} />)}
      </div>
    </aside>
  );
}
