import { Outlet, Link, NavLink } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

export default function GuestLayout() {
  return (
    <div className="min-h-screen bg-rv-bg">
      <header className="sticky top-0 z-40 border-b border-rv-border bg-rv-surface/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          <Link to="/" className="text-lg font-bold tracking-tight text-rv-text">
            Reservio
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            {[
              { to: "/rooms", label: "Rooms" },
              { to: "/parking", label: "Parking" },
              { to: "/marketplace", label: "Services" },
              { to: "/sunbeds", label: "Sunbeds" },
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 font-medium transition ${
                    isActive ? "bg-rv-accent-soft text-rv-accent" : "text-rv-muted hover:text-rv-text"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <NavLink
              to="/login"
              className="ml-2 rounded-lg bg-rv-accent px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-rv-accent/90"
            >
              Login
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6">
        <Outlet />
      </main>

      <footer className="border-t border-rv-border bg-rv-surface py-6 text-center text-xs text-rv-muted">
        &copy; {new Date().getFullYear()} Reservio &mdash; Hotel management, reimagined.
      </footer>

      <ThemeToggle />
    </div>
  );
}
