import { Outlet, useNavigate, NavLink } from "react-router-dom";

const NAV = [
  { to: "/superadmin/tenants", icon: "🏨", label: "Tenants" },
  { to: "/superadmin/analytics", icon: "📊", label: "Analytics" },
  { to: "/superadmin/onboard", icon: "➕", label: "Onboard Hotel" },
  { to: "/superadmin/plans", icon: "💎", label: "Plans" },
];

function SuperAdminLayout() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top header */}
      <header className="flex items-center justify-between bg-brand-primary px-6 py-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-sm font-bold text-white">
            R
          </div>
          <div>
            <p className="text-sm font-bold text-white">admin.reservio.com</p>
            <p className="text-xs text-white/60">Super Admin Console</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/guest/login")}
          className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/20"
        >
          <span>⎋</span> Logout
        </button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 min-h-screen bg-brand-primary/95 px-3 py-5 shadow-lg">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-white/40">
            Navigation
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

          <div className="mt-auto pt-8">
            <div className="rounded-lg bg-white/5 px-3 py-3">
              <p className="text-xs text-white/50">Logged in as</p>
              <p className="mt-0.5 text-sm font-semibold text-white">
                Super Admin
              </p>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default SuperAdminLayout;
