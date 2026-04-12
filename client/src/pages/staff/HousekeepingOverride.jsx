import { useState } from "react";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { mockTasks } from "../../data/mockTasks";

const URGENCY_ORDER = { high: 0, medium: 1, low: 2 };

export default function HousekeepingOverride() {
  const [tasks, setTasks] = useState(
    [...mockTasks].sort((a, b) => URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency]),
  );

  function cycleUrgency(id) {
    const order = ["low", "medium", "high"];
    setTasks((prev) =>
      [...prev.map((t) =>
        t.id === id
          ? { ...t, urgency: order[(order.indexOf(t.urgency) + 1) % order.length] }
          : t,
      )].sort((a, b) => URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency]),
    );
  }

  const URGENCY_BADGE = {
    high:   "bg-rv-danger-soft text-rv-danger border border-rv-danger/20",
    medium: "bg-rv-warning-soft text-rv-warning border border-rv-warning/20",
    low:    "bg-rv-success-soft text-rv-success border border-rv-success/20",
  };

  return (
    <div>
      <PageHeader
        title="Housekeeping Priority"
        subtitle="Override auto-assigned urgency. Drag or click to reprioritise."
      />

      <div className="overflow-hidden rounded-xl border border-rv-border bg-rv-surface">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="border-b border-rv-border">
            <tr className="text-xs font-semibold uppercase tracking-wider text-rv-muted">
              {["Room", "Floor", "Check-out", "Urgency", "Status", "Override"].map((h) => (
                <th key={h} className="px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-rv-border">
            {tasks.map((task) => (
              <tr key={task.id} className="transition hover:bg-rv-surface2">
                <td className="px-5 py-3 font-medium text-rv-text">{task.roomLabel}</td>
                <td className="px-5 py-3 text-rv-muted">Floor {task.floor}</td>
                <td className="px-5 py-3 text-rv-muted">
                  {new Date(task.checkOutTime).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${URGENCY_BADGE[task.urgency]}`}>
                    {task.urgency}
                  </span>
                </td>
                <td className="px-5 py-3"><StatusBadge status={task.status} /></td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => cycleUrgency(task.id)}
                    className="rounded-lg border border-rv-border2 px-3 py-1.5 text-xs font-medium text-rv-muted hover:border-rv-accent/30 hover:text-rv-accent"
                  >
                    Change
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
