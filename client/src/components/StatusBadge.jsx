const STATUS_MAP = {
  // Success family
  available:   "bg-rv-success-soft text-rv-success border border-rv-success/20",
  confirmed:   "bg-rv-success-soft text-rv-success border border-rv-success/20",
  cleaned:     "bg-rv-success-soft text-rv-success border border-rv-success/20",
  active:      "bg-rv-success-soft text-rv-success border border-rv-success/20",
  approved:    "bg-rv-success-soft text-rv-success border border-rv-success/20",
  // Warning family
  pending:     "bg-rv-warning-soft text-rv-warning border border-rv-warning/20",
  locked:      "bg-rv-warning-soft text-rv-warning border border-rv-warning/20",
  cleaning:    "bg-rv-warning-soft text-rv-warning border border-rv-warning/20",
  inactive:    "bg-rv-warning-soft text-rv-warning border border-rv-warning/20",
  // Accent family
  occupied:    "bg-rv-accent-soft text-rv-accent border border-rv-accent/20",
  checkedin:   "bg-rv-accent-soft text-rv-accent border border-rv-accent/20",
  reserved:    "bg-rv-accent-soft text-rv-accent border border-rv-accent/20",
  premium:     "bg-rv-accent-soft text-rv-accent border border-rv-accent/20",
  // Danger family
  maintenance: "bg-rv-danger-soft text-rv-danger border border-rv-danger/20",
  suspended:   "bg-rv-danger-soft text-rv-danger border border-rv-danger/20",
  checkedout:  "bg-rv-danger-soft text-rv-danger border border-rv-danger/20",
  urgent:      "bg-rv-danger-soft text-rv-danger border border-rv-danger/20",
};

export default function StatusBadge({ status }) {
  const key = String(status ?? "").toLowerCase().replace(/[\s_-]/g, "");
  const cls = STATUS_MAP[key] ?? "bg-rv-surface2 text-rv-muted border border-rv-border";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {status ?? "Unknown"}
    </span>
  );
}
