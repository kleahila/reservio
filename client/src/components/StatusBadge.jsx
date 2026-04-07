const STATUS_CLASS_MAP = {
  available: "bg-green-100 text-green-800",
  confirmed: "bg-green-100 text-green-800",
  active: "bg-green-100 text-green-800",
  occupied: "bg-blue-100 text-blue-800",
  checkedin: "bg-blue-100 text-blue-800",
  maintenance: "bg-orange-100 text-orange-800",
  suspended: "bg-orange-100 text-orange-800",
  pending: "bg-amber-100 text-amber-800",
  checkedout: "bg-slate-200 text-slate-700",
  inactive: "bg-slate-200 text-slate-700",
  locked: "bg-yellow-100 text-yellow-800",
  reserved: "bg-purple-100 text-purple-800",
  urgent: "bg-red-100 text-red-700",
};

function normalizeStatus(status) {
  return String(status || "")
    .toLowerCase()
    .replace(/[_\s-]/g, "");
}

function StatusBadge({ status }) {
  const key = normalizeStatus(status);
  const classes = STATUS_CLASS_MAP[key] || "bg-slate-100 text-slate-700";

  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${classes}`}
    >
      {status || "Unknown"}
    </span>
  );
}

export default StatusBadge;
