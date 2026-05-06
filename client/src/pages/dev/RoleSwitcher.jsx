import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ROLES = [
  { id: "guest",       label: "Guest",       color: "border-rv-success/40  bg-rv-success-soft  text-rv-success",  dest: "/" },
  { id: "staff",       label: "Staff",       color: "border-rv-accent/40   bg-rv-accent-soft   text-rv-accent",   dest: "/staff/dashboard" },
  { id: "housekeeper", label: "Housekeeper", color: "border-rv-warning/40  bg-rv-warning-soft  text-rv-warning",  dest: "/housekeeper/tasks" },
  { id: "admin",       label: "Admin",       color: "border-rv-accent/40   bg-rv-accent-soft   text-rv-accent",   dest: "/admin/rooms" },
  { id: "superadmin",  label: "Super Admin", color: "border-rv-danger/40   bg-rv-danger-soft   text-rv-danger",   dest: "/superadmin/tenants" },
];

export default function RoleSwitcher() {
  const navigate = useNavigate();
  const current = localStorage.getItem("rv-role") ?? "none";
  const [active, setActive] = useState(current);

  function switchTo(role) {
    localStorage.setItem("rv-role", role.id);
    setActive(role.id);
    navigate(role.dest);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-rv-bg px-4">
      <div className="w-full max-w-md">
        <div className="mb-2 rounded-xl border border-rv-warning/30 bg-rv-warning-soft px-4 py-3 text-center text-xs font-semibold text-rv-warning">
          Development only &mdash; not linked from UI
        </div>
        <div className="mt-4 mb-8 text-center">
          <h1 className="text-xl font-bold text-rv-text">Role Switcher</h1>
          <p className="mt-1 text-sm text-rv-muted">
            Current role: <span className="font-semibold text-rv-text">{active}</span>
          </p>
        </div>
        <div className="space-y-3">
          {ROLES.map((role) => (
            <button
              key={role.id}
              onClick={() => switchTo(role)}
              className={`w-full rounded-xl border-2 px-5 py-4 text-left font-semibold transition hover:opacity-90 ${role.color} ${
                active === role.id ? "ring-2 ring-current ring-offset-2" : ""
              }`}
            >
              <span className="flex items-center justify-between">
                {role.label}
                {active === role.id && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="2 8 6 12 14 4" />
                  </svg>
                )}
              </span>
              <span className="text-xs font-normal opacity-70">&rarr; {role.dest}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
