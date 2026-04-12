import { useState } from "react";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { mockTasks } from "../../data/mockTasks";

const URGENCY_ORDER = { high: 0, medium: 1, low: 2 };

const URGENCY_BADGE = {
  high:   "bg-rv-danger-soft text-rv-danger border border-rv-danger/20",
  medium: "bg-rv-warning-soft text-rv-warning border border-rv-warning/20",
  low:    "bg-rv-success-soft text-rv-success border border-rv-success/20",
};

export default function TaskBoard() {
  const [tasks, setTasks] = useState(
    [...mockTasks].sort((a, b) => URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency]),
  );
  const [filter, setFilter] = useState("All");

  const statuses = ["All", "Pending", "Cleaning", "Cleaned"];
  const visible = filter === "All" ? tasks : tasks.filter((t) => t.status === filter);

  function markStatus(id, status) {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status } : t));
  }

  return (
    <div>
      <PageHeader title="My Tasks" subtitle="Rooms sorted by urgency. Start with high priority items." />

      <div className="mb-4 flex flex-wrap gap-2">
        {statuses.map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              filter === s
                ? "bg-rv-accent text-white"
                : "border border-rv-border2 text-rv-muted hover:text-rv-text"
            }`}>
            {s}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((task) => (
          <div key={task.id}
            className={`rounded-xl border bg-rv-surface p-5 shadow-sm ${
              task.urgency === "high" ? "border-rv-danger/30"
              : task.urgency === "medium" ? "border-rv-warning/30"
              : "border-rv-border"
            }`}>
            <div className="mb-3 flex items-start justify-between gap-2">
              <h3 className="font-semibold text-rv-text">{task.roomLabel}</h3>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${URGENCY_BADGE[task.urgency]}`}>
                {task.urgency}
              </span>
            </div>
            <p className="mb-1 text-xs text-rv-muted">Floor {task.floor}</p>
            <p className="mb-3 text-xs text-rv-muted">
              Checkout: {new Date(task.checkOutTime).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
            {task.notes && (
              <p className="mb-3 rounded-lg bg-rv-surface2 px-3 py-2 text-xs text-rv-muted">{task.notes}</p>
            )}
            <div className="flex items-center justify-between">
              <StatusBadge status={task.status} />
              <div className="flex gap-2">
                {task.status === "Pending" && (
                  <button onClick={() => markStatus(task.id, "Cleaning")}
                    className="rounded-lg bg-rv-warning-soft px-3 py-1.5 text-xs font-semibold text-rv-warning hover:bg-rv-warning/20">
                    Start
                  </button>
                )}
                {task.status === "Cleaning" && (
                  <button onClick={() => markStatus(task.id, "Cleaned")}
                    className="rounded-lg bg-rv-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-rv-accent/90">
                    Done
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {visible.length === 0 && (
          <div className="col-span-full rounded-xl border border-rv-border bg-rv-surface py-12 text-center text-rv-muted">
            No tasks in this category.
          </div>
        )}
      </div>
    </div>
  );
}
