// TaskStack — Housekeeping task board (matches real HousekeepingTask schema)
// Fields: id, roomId, room{type}, priority, urgency(bool),
// assignedTo (userId|null), status ("PENDING"|"DONE"), createdAt

import { useState, useRef, useMemo } from "react";
import { markUrgent, completeTask, assignTask } from "../api/housekeeping";

// ── Shared section divider ────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-rv-subtle whitespace-nowrap">
        {children}
      </span>
      <div className="flex-1 h-px bg-rv-border" />
    </div>
  );
}

// ── Assignee dropdown ─────────────────────────────────────────────────────────
function AssignDropdown({ task, staff, onAssigned }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const ref = useRef(null);

  const current = staff.find((s) => s.id === task.assignedTo);
  const label = current
    ? (current.fullName ?? current.name ?? "Assigned")
    : "Unassigned";
  const initials = current
    ? (current.fullName ?? current.name ?? "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  async function select(staffId) {
    setSaving(true);
    setOpen(false);
    try {
      await assignTask(task.id, staffId);
      onAssigned(task.id, staffId);
    } catch { /* ignore */ }
    finally { setSaving(false); }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={saving}
        className="flex items-center gap-1.5 min-w-0 hover:opacity-80 transition-opacity disabled:opacity-50"
      >
        <div
          className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[8px] font-bold"
          style={{ background: "rgba(58,111,115,0.12)", color: "rgb(var(--rv-sea))" }}
        >
          {initials}
        </div>
        <span className="text-[11px] text-rv-muted truncate max-w-[90px]">{label}</span>
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-rv-subtle shrink-0">
          <path d="M1 2.5l3 3 3-3" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-40 min-w-[160px] rounded-xl border border-rv-border bg-rv-surface shadow-lg py-1 overflow-hidden">
          <button
            onClick={() => select(null)}
            className="w-full text-left px-3 py-2 text-[11px] text-rv-muted hover:bg-rv-surface2 transition-colors"
          >
            Unassigned
          </button>
          {staff
            .filter((s) => s.role === "HOUSEKEEPER" && s.active !== false)
            .map((s) => (
              <button
                key={s.id}
                onClick={() => select(s.id)}
                className={[
                  "w-full text-left px-3 py-2 text-[11px] hover:bg-rv-surface2 transition-colors",
                  s.id === task.assignedTo ? "text-rv-accent font-semibold" : "text-rv-text",
                ].join(" ")}
              >
                {s.fullName ?? s.name}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

// ── Single task card ──────────────────────────────────────────────────────────
function TaskCard({ task, staff, onDone, onUrgent, onAssigned }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // Room label: prefer type over raw cuid
  const roomLabel = task.room?.type ?? task.room?.roomNumber ?? task.roomId?.slice(-6).toUpperCase();

  async function handleDone() {
    setLoading(true);
    setErr(null);
    try {
      await completeTask(task.id);
      onDone(task.id);
    } catch (e) {
      setErr(e?.message ?? "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleUrgent() {
    setLoading(true);
    setErr(null);
    try {
      await markUrgent(task.id);
      onUrgent(task.id);
    } catch (e) {
      setErr(e?.message ?? "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={[
        "rounded-xl border bg-rv-surface px-4 py-3 flex flex-col gap-2",
        task.urgency ? "border-rv-danger/30 bg-rv-danger/4" : "border-rv-border",
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        {/* Urgency bar */}
        <div className={["w-1 self-stretch rounded-full shrink-0", task.urgency ? "bg-rv-danger" : "bg-rv-border2"].join(" ")} />

        {/* Room info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[13px] font-bold text-rv-text">{roomLabel}</span>
            {task.urgency && (
              <span className="text-[9px] font-bold uppercase tracking-wider text-rv-danger
                               bg-rv-danger/8 px-1.5 py-0.5 rounded-full border border-rv-danger/20">
                Urgent
              </span>
            )}
          </div>

          {/* Assignee dropdown */}
          <div className="mt-1">
            <AssignDropdown task={task} staff={staff} onAssigned={onAssigned} />
          </div>
        </div>

        {/* Priority */}
        <span className="text-[10px] text-rv-subtle shrink-0">P{task.priority}</span>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {!task.urgency && (
            <button
              onClick={handleUrgent}
              disabled={loading}
              className="text-[10px] font-semibold px-2.5 py-1 rounded-lg
                         border border-rv-danger/30 text-rv-danger bg-rv-danger/5
                         hover:bg-rv-danger/12 transition-colors disabled:opacity-50"
            >
              Urgent
            </button>
          )}
          <button
            onClick={handleDone}
            disabled={loading}
            className="text-[10px] font-semibold px-2.5 py-1 rounded-lg text-white
                       hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ background: "rgb(var(--rv-accent))" }}
          >
            {loading ? "…" : "Done"}
          </button>
        </div>
      </div>

      {err && (
        <p className="text-[10px] text-rv-danger pl-4">{err}</p>
      )}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function TaskStack({
  tasks: initialTasks,
  staff = [],
  title = "Housekeeping Schedule",
  showStaffFilter = false,
}) {
  const [tasks,  setTasks]  = useState(initialTasks ?? []);
  const [filter, setFilter] = useState(null);

  function handleDone(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function handleUrgent(id) {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, urgency: true } : t));
  }

  function handleAssigned(id, staffId) {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, assignedTo: staffId } : t));
  }

  const housekeepers = useMemo(
    () => staff.filter((s) => s.role === "HOUSEKEEPER" && s.active !== false),
    [staff],
  );

  const visible = filter
    ? tasks.filter((t) => t.assignedTo === filter)
    : tasks;

  const urgentTasks = visible.filter((t) => t.urgency);
  const normalTasks = visible.filter((t) => !t.urgency);

  const today = useMemo(
    () => new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
    [],
  );

  return (
    <div className="flex flex-col">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="shrink-0 pb-6">
        <h1 className="font-serif text-[22px] font-semibold text-rv-text leading-tight">{title}</h1>
        <p className="mt-0.5 text-[13px] text-rv-muted">{today}</p>

        {/* Stats */}
        <div className="flex items-center flex-wrap gap-5 mt-3">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rv-danger" />
            <span className="text-[12px] font-semibold text-rv-danger">{tasks.filter((t) => t.urgency).length}</span>
            <span className="text-[12px] text-rv-muted">urgent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rv-muted/50" />
            <span className="text-[12px] font-semibold text-rv-text">{tasks.length}</span>
            <span className="text-[12px] text-rv-muted">pending</span>
          </div>
        </div>

        {/* Staff filter pills */}
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
                {(s.fullName ?? s.name ?? "?").split(" ")[0]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Task list ───────────────────────────────────────────────────── */}
      {visible.length === 0 ? (
        <div className="py-12 text-center text-[13px] text-rv-subtle">No pending tasks</div>
      ) : (
        <div className="flex flex-col gap-3">
          {urgentTasks.length > 0 && (
            <>
              <SectionLabel>Urgent</SectionLabel>
              {urgentTasks.map((task) => (
                <TaskCard key={task.id} task={task} staff={staff} onDone={handleDone} onUrgent={handleUrgent} onAssigned={handleAssigned} />
              ))}
            </>
          )}
          {normalTasks.length > 0 && (
            <>
              {urgentTasks.length > 0 && <SectionLabel>Pending</SectionLabel>}
              {normalTasks.map((task) => (
                <TaskCard key={task.id} task={task} staff={staff} onDone={handleDone} onUrgent={handleUrgent} onAssigned={handleAssigned} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
