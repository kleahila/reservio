import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ThemeToggle from "../components/ThemeToggle";

/**
 * PortalLayout — shared shell for admin / staff / housekeeper / superadmin portals
 * Props:
 *   portalName  string             sidebar heading
 *   links       [{ to, label }]    sidebar nav items
 *   headerTitle string             shown in the top bar (optional, defaults to portalName)
 */
export default function PortalLayout({ portalName, links, headerTitle }) {
  return (
    <div className="flex min-h-screen bg-rv-bg">
      <Sidebar portalName={portalName} links={links} />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center border-b border-rv-border bg-rv-surface px-6">
          <span className="text-sm font-semibold text-rv-text">
            {headerTitle ?? portalName}
          </span>
          <span className="ml-auto text-xs text-rv-muted">Reservio</span>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>

      <ThemeToggle />
    </div>
  );
}
