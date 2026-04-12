import { useState } from "react";
import { NavLink } from "react-router-dom";

function ChevronIcon({ open }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 16 16" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      className={`transition-transform duration-200 ${open ? "rotate-0" : "-rotate-90"}`}
    >
      <polyline points="4 6 8 10 12 6" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="2" y1="5" x2="16" y2="5" />
      <line x1="2" y1="9" x2="16" y2="9" />
      <line x1="2" y1="13" x2="16" y2="13" />
    </svg>
  );
}

/**
 * Sidebar — collapsible portal navigation
 * Props:
 *   links       [{ to, label, icon? }]  nav items
 *   portalName  string                  shown as the sidebar heading
 */
export default function Sidebar({ links = [], portalName = "Portal" }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`flex flex-col border-r border-rv-border bg-rv-surface transition-all duration-200 ${
        collapsed ? "w-14" : "w-56"
      } min-h-screen shrink-0`}
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-rv-border px-3">
        {!collapsed && (
          <span className="truncate text-xs font-bold uppercase tracking-widest text-rv-muted">
            {portalName}
          </span>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-rv-muted transition hover:bg-rv-surface2 hover:text-rv-text"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <MenuIcon />
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-1 p-2">
        {links.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-rv-accent-soft text-rv-accent"
                  : "text-rv-muted hover:bg-rv-surface2 hover:text-rv-text"
              } ${collapsed ? "justify-center" : ""}`
            }
          >
            {item.icon && (
              <span className="shrink-0 text-base leading-none">{item.icon}</span>
            )}
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
