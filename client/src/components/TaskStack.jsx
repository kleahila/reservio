// TaskStack — Mediterranean vertical time-based housekeeping schedule
// Brief §4: Vertical, time-based layout (NOT kanban); drag to reschedule (15-min snap);
//           conflict states visually; completed tasks fade/desaturate

import { useState, useMemo, useEffect, useRef } from "react";

// ── Layout constants ──────────────────────────────────────────────────────────
const START_HOUR  = 7;                             // 07:00
const END_HOUR    = 21;                            // 21:00
const TOTAL_MINS  = (END_HOUR - START_HOUR) * 60; // 840 min
const MIN_PX      = 1.8;                           // px per minute → 1 hr = 108 px
const SNAP_MINS   = 15;                            // drag snap grid
const LABEL_W     = 52;                            // px — time-label column width

// ── Urgency config ────────────────────────────────────────────────────────────
const URGENCY = {
  high:   { bar: "bg-rv-danger",  text: "text-rv-danger",  label: "H" },
  medium: { bar: "bg-rv-warning", text: "text-rv-warning", label: "M" },
  low:    { bar: "bg-rv-olive",   text: "text-rv-olive",   label: "L" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function minutesSinceStart(timeStr) {
  const t = timeStr.includes("T") ? timeStr.split("T")[1] : timeStr;
  const [h, m] = t.split(":").map(Number);
  return (h - START_HOUR) * 60 + (m || 0);
}

function minsToTime(dateStr, mins) {
  const clamped = Math.max(0, Math.min(TOTAL_MINS - 1, mins));
  const absH    = Math.floor((START_HOUR * 60 + clamped) / 60);
  const absM    = (START_HOUR * 60 + clamped) % 60;
  return `${dateStr}T${String(absH).padStart(2, "0")}:${String(absM).padStart(2, "0")}`;
}

function formatTimeRange(startMins, duration) {
  const fmt = (abs) => {
    const h = Math.floor(abs / 60), m = abs % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };
  const absStart = START_HOUR * 60 + startMins;
  return `${fmt(absStart)} – ${fmt(absStart + duration)}`;
}

// ── Conflict detection — same staff, overlapping time ranges ──────────────────
function detectConflicts(tasks) {
  const set = new Set();
  for (let i = 0; i < tasks.length; i++) {
    for (let j = i + 1; j < tasks.length; j++) {
      const a = tasks[i], b = tasks[j];
      if (a.assignedStaffId !== b.assignedStaffId) continue;
      if (a.status === "Cleaned" || b.status === "Cleaned") continue;
      const aS = minutesSinceStart(a.scheduledTime), aE = aS + a.duration;
      const bS = minutesSinceStart(b.scheduledTime), bE = bS + b.duration;
      if (aS < bE && aE > bS) { set.add(a.id); set.add(b.id); }
    }
  }
  return set;
}

function nowMinutes() {
  const n = new Date();
  return (n.getHours() - START_HOUR) * 60 + n.getMinutes();
}

// ── Task Block ────────────────────────────────────────────────────────────────
function TaskBlock({ task, staff, isConflict, onUpdate, onStatusChange }) {
  const [dragging,  setDragging]  = useState(false);
  const [dragDelta, setDragDelta] = useState(0);
  const [hover,     setHover]     = useState(false);
  const ref = useRef({ startY: 0, origMins: 0 });

  const isDone     = task.status === "Cleaned";
  const startMins  = minutesSinceStart(task.scheduledTime);
  const baseTop    = startMins * MIN_PX;
  const height     = Math.max(task.duration * MIN_PX, 48);
  const urgCfg     = URGENCY[task.urgency] ?? URGENCY.low;
  const assignee   = staff?.find((s) => s.id === task.assignedStaffId);
  const timeRange  = useMemo(() => formatTimeRange(startMins, task.duration), [startMins, task.duration]);

  // Snapped px translation during drag (visual only — committed on mouseup)
  const snappedPx = dragging
    ? Math.round((dragDelta / MIN_PX) / SNAP_MINS) * SNAP_MINS * MIN_PX
    : 0;

  function startDrag(e) {
    if (isDone || e.target.closest("button")) return;
    e.preventDefault();
    setDragging(true);
    ref.current = { startY: e.clientY, origMins: startMins };

    function onMove(ev) { setDragDelta(ev.clientY - ref.current.startY); }
    function onUp(ev) {
      const dy    = ev.clientY - ref.current.startY;
      const dMins = Math.round((dy / MIN_PX) / SNAP_MINS) * SNAP_MINS;
      if (dMins !== 0) {
        const newMins = Math.max(0, Math.min(TOTAL_MINS - task.duration, ref.current.origMins + dMins));
        const dateStr = task.scheduledTime.split("T")[0];
        onUpdate(task.id, { scheduledTime: minsToTime(dateStr, newMins) });
      }
      setDragging(false);
      setDragDelta(0);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  return (
    <div
      className={[
        "absolute rounded-xl border overflow-hidden select-none",
        isDone
          ? "task-block-done bg-rv-surface border-rv-border"
          : isConflict
            ? "task-block task-block-conflict"
            : "task-block bg-rv-surface border-rv-border",
        dragging ? "task-block-dragging" : "",
      ].join(" ")}
      style={{
        left:      LABEL_W + 8,
        right:     8,
        top:       baseTop,
        height,
        transform: `translateY(${snappedPx}px)`,
        cursor:    isDone ? "default" : dragging ? "grabbing" : "grab",
        zIndex:    dragging ? 30 : (isConflict && !isDone) ? 15 : 10,
        transition: dragging ? "none" : undefined,
      }}
      onMouseDown={startDrag}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Urgency stripe — left edge */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${urgCfg.bar}`} />

      <div className="pl-3.5 pr-2.5 py-2 h-full flex flex-col justify-between min-h-0 overflow-hidden">

        {/* Top row — room label + status badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="font-mono text-[12px] font-bold text-rv-text leading-none block truncate">
              {task.roomLabel}
            </span>
            {hover && (
              <span className="text-[9px] text-rv-subtle mt-0.5 block">
                Floor {task.floor}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {isConflict && !isDone && (
              <span className="text-[8px] font-bold uppercase tracking-wider text-rv-danger
                               bg-rv-danger-soft px-1.5 py-0.5 rounded-full border border-rv-danger/20">
                Conflict
              </span>
            )}
            {task.status === "Cleaning" && !isConflict && (
              <span className="w-1.5 h-1.5 rounded-full bg-rv-warning shrink-0" />
            )}
          </div>
        </div>

        {/* Notes — hover reveal when tall enough */}
        {hover && height >= 80 && task.notes && (
          <p className="text-[10px] text-rv-muted italic leading-snug line-clamp-2">
            {task.notes}
          </p>
        )}

        {/* Bottom row — assignee avatar + time range + urgency */}
        <div className="flex items-end justify-between gap-1">
          <div className="flex items-center gap-1.5 min-w-0">
            {assignee && (
              <>
                <div
                  className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center text-[8px] font-bold"
                  style={{ background: "rgba(58,111,115,0.12)", color: "rgb(var(--rv-sea))" }}
                >
                  {assignee.name.split(" ").map((n) => n[0]).join("")}
                </div>
                {hover && (
                  <span className="text-[9px] text-rv-subtle truncate">
                    {assignee.name.split(" ")[0]}
                  </span>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="font-mono text-[9px] text-rv-subtle">{timeRange}</span>
            <span className={`text-[8px] font-bold ${urgCfg.text}`}>{urgCfg.label}</span>
          </div>
        </div>
      </div>

      {/* ── Action strip — hover on active tasks ──────────────────────── */}
      {hover && !isDone && height >= 62 && (
        <div className="absolute bottom-0 left-1 right-1 pb-1.5 flex gap-1">
          {task.status === "Pending" && (
            <button
              onClick={(e) => { e.stopPropagation(); onStatusChange(task.id, "Cleaning"); }}
              className="flex-1 text-[10px] font-semibold py-1 rounded-lg
                         bg-rv-warning-soft text-rv-warning border border-rv-warning/20
                         hover:bg-rv-warning/20 transition-colors"
            >
              Start
            </button>
          )}
          {task.status === "Cleaning" && (
            <button
              onClick={(e) => { e.stopPropagation(); onStatusChange(task.id, "Cleaned"); }}
              className="flex-1 text-[10px] font-semibold py-1 rounded-lg text-white
                         hover:opacity-90 transition-opacity"
              style={{ background: "rgb(var(--rv-accent))" }}
            >
              Done
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main TaskStack export ─────────────────────────────────────────────────────
export default function TaskStack({
  tasks: initialTasks,
  staff = [],
  title = "Housekeeping Schedule",
  showStaffFilter = false,
}) {
  const [tasks,  setTasks]  = useState(initialTasks);
  const [filter, setFilter] = useState(null);   // null = show all
  const [nowY,   setNowY]   = useState(() => nowMinutes() * MIN_PX);

  // Update now-line every minute
  useEffect(() => {
    const t = setInterval(() => setNowY(nowMinutes() * MIN_PX), 60_000);
    return () => clearInterval(t);
  }, []);

  function handleUpdate(id, updates) {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, ...updates } : t));
  }
  function handleStatusChange(id, status) {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status } : t));
  }

  // Filter by assigned staff (staff portal only)
  const visible   = filter ? tasks.filter((t) => t.assignedStaffId === filter) : tasks;
  // Conflicts computed from full task list so cross-staff overlaps don't hide per-staff view
  const conflicts = useMemo(() => detectConflicts(tasks), [tasks]);

  // Header stats (on visible set)
  const nActive   = visible.filter((t) => t.status === "Cleaning").length;
  const nPending  = visible.filter((t) => t.status === "Pending").length;
  const nDone     = visible.filter((t) => t.status === "Cleaned").length;
  const nConflict = visible.filter((t) => conflicts.has(t.id)).length;

  // Housekeepers for filter pills
  const housekeepers = useMemo(
    () => staff.filter((s) => s.role === "Housekeeper"),
    [staff],
  );

  const today = useMemo(
    () => new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
    [],
  );

  // Build hour labels
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);
  const gridH = TOTAL_MINS * MIN_PX;

  return (
    <div className="flex flex-col">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="shrink-0 pb-6">
        <h1 className="font-serif text-[22px] font-semibold text-rv-text leading-tight">
          {title}
        </h1>
        <p className="mt-0.5 text-[13px] text-rv-muted">{today}</p>

        {/* Stats row */}
        <div className="flex items-center flex-wrap gap-5 mt-3">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rv-warning" />
            <span className="text-[12px] font-semibold text-rv-warning">{nActive}</span>
            <span className="text-[12px] text-rv-muted">in progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rv-muted/50" />
            <span className="text-[12px] font-semibold text-rv-text">{nPending}</span>
            <span className="text-[12px] text-rv-muted">pending</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rv-olive" />
            <span className="text-[12px] font-semibold text-rv-olive">{nDone}</span>
            <span className="text-[12px] text-rv-muted">done</span>
          </div>
          {nConflict > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rv-danger" />
              <span className="text-[12px] font-semibold text-rv-danger">{nConflict}</span>
              <span className="text-[12px] text-rv-muted">
                conflict{nConflict !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        {/* Staff filter pills — staff-portal dispatch view only */}
        {showStaffFilter && housekeepers.length > 0 && (
          <div className="flex items-center flex-wrap gap-2 mt-4">
            <button
              onClick={() => setFilter(null)}
              className={[
                "text-[11px] font-medium px-3 py-1 rounded-full border transition-colors",
                filter === null
                  ? "bg-rv-accent/12 text-rv-accent border-rv-accent/25"
                  : "border-rv-border text-rv-muted hover:text-rv-text",
              ].join(" ")}
            >
              All Staff
            </button>
            {housekeepers.map((s) => (
              <button
                key={s.id}
                onClick={() => setFilter((prev) => (prev === s.id ? null : s.id))}
                className={[
                  "text-[11px] font-medium px-3 py-1 rounded-full border transition-colors",
                  filter === s.id
                    ? "bg-rv-accent/12 text-rv-accent border-rv-accent/25"
                    : "border-rv-border text-rv-muted hover:text-rv-text",
                ].join(" ")}
              >
                {s.name.split(" ")[0]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Drag hint ────────────────────────────────────────────────────── */}
      <p className="text-[10px] text-rv-subtle mb-3">
        Drag tasks to reschedule · hover to reveal details
      </p>

      {/* ── Time grid ───────────────────────────────────────────────────── */}
      <div className="relative" style={{ height: gridH + 48 }}>

        {/* Hour grid lines + labels */}
        {hours.map((hour) => {
          const top    = (hour - START_HOUR) * 60 * MIN_PX;
          const isNoon = hour === 12;
          return (
            <div
              key={hour}
              className="absolute left-0 right-0 flex items-center pointer-events-none"
              style={{ top }}
            >
              <div className="shrink-0 text-right pr-3 select-none" style={{ width: LABEL_W }}>
                <span
                  className={[
                    "font-mono text-[10px]",
                    isNoon ? "font-bold text-rv-accent/60" : "text-rv-subtle",
                  ].join(" ")}
                >
                  {String(hour).padStart(2, "0")}:00
                </span>
              </div>
              <div
                className={["flex-1 h-px", isNoon ? "bg-rv-accent/20" : "bg-rv-border/50"].join(" ")}
              />
            </div>
          );
        })}

        {/* Now indicator — terracotta dot + line */}
        {nowY >= 0 && nowY <= gridH && (
          <div
            className="absolute right-0 flex items-center pointer-events-none z-20"
            style={{ top: nowY, left: LABEL_W + 4 }}
          >
            <div
              className="w-2 h-2 rounded-full shrink-0 -ml-1"
              style={{ background: "rgb(var(--rv-accent))" }}
            />
            <div className="flex-1 h-px" style={{ background: "rgba(198,93,59,0.45)" }} />
          </div>
        )}

        {/* Task blocks */}
        {visible.map((task) => (
          <TaskBlock
            key={task.id}
            task={task}
            staff={staff}
            isConflict={conflicts.has(task.id)}
            onUpdate={handleUpdate}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>
    </div>
  );
}
