import { Outlet, NavLink } from "react-router-dom";

const NAV = [
  { to: "/admin/rooms", icon: "🛏️", label: "Rooms" },
  { to: "/admin/staff", icon: "👥", label: "Staff" },
  { to: "/admin/pricing", icon: "⚡", label: "Pricing" },
  { to: "/admin/analytics", icon: "📈", label: "Analytics" },
  { to: "/admin/parking", icon: "🚗", label: "Parking" },
];

function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top header */}
      <header className="flex items-center justify-between bg-brand-primary px-6 py-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-sm font-bold text-white">
            R
          </div>
          <div>
            <p className="text-sm font-bold text-white">Reservio Admin</p>
            <p className="text-xs text-white/60">Hotel Operations</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-green-400" />
          <span className="text-xs font-medium text-white">Grand Hotel Tirana</span>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 min-h-screen bg-brand-primary/95 px-3 py-5 shadow-lg">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-white/40">
            Operations
          </p>
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-white/20 text-white shadow-sm"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
